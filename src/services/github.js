/**
 * GitHub REST API Service
 * Handles user fetching, repository gathering, rate limiting, and caching.
 */

const { apiCache } = require('../utils/cache');

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Builds request headers for GitHub API
 * @returns {Record<string, string>}
 */
function getHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'GitRoast-App/1.0 (Hackathon Edition)'
  };

  const token = process.env.GITHUB_TOKEN;
  if (token && token.trim()) {
    headers['Authorization'] = `Bearer ${token.trim()}`;
  }

  return headers;
}

/**
 * Custom error class for GitHub API errors
 */
class GitHubError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = 'GitHubError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Fetches current rate limit status
 */
async function getRateLimitStatus() {
  try {
    const res = await fetch(`${GITHUB_API_BASE}/rate_limit`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      return { limit: 60, remaining: 0, reset: Math.floor(Date.now() / 1000) + 3600 };
    }
    const data = await res.json();
    return {
      limit: data.resources?.core?.limit || 60,
      remaining: data.resources?.core?.remaining || 0,
      reset: data.resources?.core?.reset || Math.floor(Date.now() / 1000)
    };
  } catch {
    return { limit: 60, remaining: 30, reset: Math.floor(Date.now() / 1000) };
  }
}

/**
 * Fetches GitHub user profile and repositories
 * @param {string} username
 * @returns {Promise<{ user: object, repos: object[], meta: object }>}
 */
async function fetchGitHubData(username) {
  const cacheKey = `gh_user_${username.toLowerCase()}`;
  const cached = apiCache.get(cacheKey);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const headers = getHeaders();

  // 1. Fetch user profile
  let userRes;
  try {
    userRes = await fetch(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`, {
      headers
    });
  } catch (err) {
    throw new GitHubError(
      'Unable to connect to GitHub. Please check your internet connection and try again.',
      503,
      { originalError: err.message }
    );
  }

  const remaining = userRes.headers.get('x-ratelimit-remaining');
  const resetEpoch = userRes.headers.get('x-ratelimit-reset');

  if (userRes.status === 404) {
    throw new GitHubError(
      `GitHub user "${username}" does not exist. Please check the spelling.`,
      404,
      { username }
    );
  }

  if (userRes.status === 403 || userRes.status === 429) {
    let resetMessage = 'Please try again in a few minutes.';
    if (resetEpoch) {
      const waitMinutes = Math.max(1, Math.ceil((parseInt(resetEpoch, 10) * 1000 - Date.now()) / 60000));
      resetMessage = `Rate limit resets in approximately ${waitMinutes} minute(s).`;
    }
    throw new GitHubError(
      `GitHub API rate limit reached. ${resetMessage} To increase limits, configure GITHUB_TOKEN in your environment.`,
      429,
      { resetEpoch, remaining }
    );
  }

  if (!userRes.ok) {
    throw new GitHubError(
      `GitHub returned an error (status ${userRes.status}). Please try again later.`,
      userRes.status
    );
  }

  const user = await userRes.json();

  // 2. Fetch public repositories (up to 100, sorted by recently updated)
  let repos = [];
  try {
    const reposRes = await fetch(
      `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
      { headers }
    );

    if (reposRes.ok) {
      repos = await reposRes.json();
    }
  } catch (err) {
    // If repos fail, continue with empty array rather than failing completely
    console.warn(`Could not fetch repos for ${username}:`, err.message);
  }

  // 3. Optional Profile README check (special repo named <username>/<username>)
  let hasProfileReadme = false;
  const profileRepo = repos.find(r => r.name.toLowerCase() === username.toLowerCase());
  if (profileRepo) {
    hasProfileReadme = true;
  }

  // 4. README checks for top key repositories (limit to top 6 to conserve API quota)
  // Sort repos by significance: stars * 3 + forks * 2 + (isFork ? 0 : 5)
  const sortedRepos = [...repos].sort((a, b) => {
    const scoreA = (a.stargazers_count || 0) * 3 + (a.forks_count || 0) * 2 + (a.fork ? 0 : 5);
    const scoreB = (b.stargazers_count || 0) * 3 + (b.forks_count || 0) * 2 + (b.fork ? 0 : 5);
    return scoreB - scoreA;
  });

  const topReposToCheck = sortedRepos.slice(0, 6);
  const remainingCalls = remaining ? parseInt(remaining, 10) : 60;

  // Check READMEs only if we have sufficient rate limit allowance (> 10 calls remaining)
  const readmeStatusMap = {};
  if (remainingCalls > 10) {
    await Promise.all(
      topReposToCheck.map(async (repo) => {
        try {
          const readmeRes = await fetch(
            `${GITHUB_API_BASE}/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo.name)}/readme`,
            { headers, method: 'HEAD' }
          );
          readmeStatusMap[repo.id] = readmeRes.status === 200;
        } catch {
          // Fallback inference: if repo has size > 10, assume possible readme
          readmeStatusMap[repo.id] = (repo.size > 20);
        }
      })
    );
  } else {
    // Graceful estimation based on repo size & description if quota is low
    topReposToCheck.forEach(repo => {
      readmeStatusMap[repo.id] = repo.size > 30;
    });
  }

  // Attach enriched properties to repositories
  const enrichedRepos = repos.map(repo => {
    const hasReadme = readmeStatusMap[repo.id] !== undefined
      ? readmeStatusMap[repo.id]
      : (repo.size > 20); // reasonable baseline inference for non-top repos

    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      htmlUrl: repo.html_url,
      description: repo.description ? repo.description.trim() : null,
      language: repo.language || null,
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      openIssues: repo.open_issues_count || 0,
      watchers: repo.watchers_count || 0,
      isFork: repo.fork,
      isArchived: repo.archived,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      homepage: repo.homepage ? repo.homepage.trim() : null,
      size: repo.size || 0,
      topics: Array.isArray(repo.topics) ? repo.topics : [],
      license: repo.license?.name || null,
      hasReadme
    };
  });

  const result = {
    user: {
      login: user.login,
      name: user.name || user.login,
      avatarUrl: user.avatar_url,
      htmlUrl: user.html_url,
      bio: user.bio ? user.bio.trim() : null,
      company: user.company ? user.company.trim() : null,
      blog: user.blog ? user.blog.trim() : null,
      location: user.location ? user.location.trim() : null,
      email: user.email || null,
      twitterUsername: user.twitter_username || null,
      publicRepos: user.public_repos || 0,
      publicGists: user.public_gists || 0,
      followers: user.followers || 0,
      following: user.following || 0,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      hasProfileReadme
    },
    repos: enrichedRepos,
    meta: {
      fetchedAt: new Date().toISOString(),
      reposCount: enrichedRepos.length
    }
  };

  // Cache result
  apiCache.set(cacheKey, result);

  return { ...result, fromCache: false };
}

module.exports = {
  fetchGitHubData,
  getRateLimitStatus,
  GitHubError
};


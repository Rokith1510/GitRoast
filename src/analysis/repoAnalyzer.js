/**
 * Repository Analyzer
 * Analyzes important repositories individually:
 * - Details (name, desc, language, stars, forks, dates, demo, readme, topics)
 * - Individual Project Score (0-100)
 * - Repository-specific roast
 * - Repository-specific rescue
 */

/**
 * Formats relative date string (e.g. "3 days ago 🔥", "8 months ago", "2 years ago 🪦")
 * @param {string} dateStr
 * @returns {string}
 */
function formatRelativeDate(dateStr) {
  if (!dateStr) return 'Never';
  const timestamp = new Date(dateStr).getTime();
  const diffDays = Math.max(0, Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24)));

  if (diffDays <= 7) return `${diffDays === 0 ? 'Today' : `${diffDays}d ago`} 🔥`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)}w ago`;
  if (diffDays <= 180) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays <= 365) return `${Math.floor(diffDays / 30)}mo ago ⏳`;
  const years = Math.floor(diffDays / 365);
  return `${years}y ago 🪦`;
}

/**
 * Calculates a repository-level health score from 0 to 100.
 * @param {object} repo
 * @returns {{ score: number, breakdown: string[] }}
 */
function scoreRepository(repo) {
  let score = 20; // baseline
  const breakdown = [];

  // 1. Documentation (README + Description) - up to 35 pts
  if (repo.hasReadme) {
    score += 20;
    breakdown.push('+20: README exists');
  } else {
    breakdown.push('-20: Missing README file');
  }

  if (repo.description && repo.description.length >= 10) {
    score += 15;
    breakdown.push('+15: Clear project description');
  } else if (repo.description) {
    score += 7;
    breakdown.push('+7: Short description');
  } else {
    breakdown.push('-15: No description provided');
  }

  // 2. Discoverability & Demo - up to 20 pts
  if (repo.homepage && repo.homepage.startsWith('http')) {
    score += 15;
    breakdown.push('+15: Live demo / homepage linked');
  } else {
    breakdown.push('-15: No live demonstration link');
  }

  if (repo.topics && repo.topics.length > 0) {
    score += 5;
    breakdown.push('+5: Topics/tags configured');
  }

  // 3. Maintenance & Activity - up to 15 pts
  const pushDate = repo.pushedAt ? new Date(repo.pushedAt).getTime() : 0;
  const daysSincePush = Math.floor((Date.now() - pushDate) / (1000 * 60 * 60 * 24));
  if (daysSincePush <= 60) {
    score += 15;
    breakdown.push('+15: Recently maintained (within 60d)');
  } else if (daysSincePush <= 180) {
    score += 8;
    breakdown.push('+8: Semi-recent updates');
  } else if (daysSincePush > 365) {
    breakdown.push('-10: Unmaintained for over a year');
  }

  // 4. Code & Open Source Standards - up to 10 pts
  if (repo.license) {
    score += 5;
    breakdown.push('+5: Open-source license present');
  }
  if (!repo.isFork) {
    score += 5;
    breakdown.push('+5: Original codebase');
  }

  return {
    score: Math.max(10, Math.min(100, score)),
    breakdown
  };
}

/**
 * Generates repository-specific roast and rescue feedback.
 * @param {object} repo
 * @param {number} repoScore
 * @returns {{ roast: string, rescue: string }}
 */
function generateRepoFeedback(repo, repoScore) {
  let roast = '';
  let rescue = '';

  const hasDesc = !!(repo.description && repo.description.trim());
  const hasDemo = !!(repo.homepage && repo.homepage.startsWith('http'));
  const hasReadme = !!repo.hasReadme;
  const pushDate = repo.pushedAt ? new Date(repo.pushedAt).getTime() : 0;
  const daysSincePush = Math.floor((Date.now() - pushDate) / (1000 * 60 * 60 * 24));

  // Determine Roast
  if (!hasReadme && !hasDesc) {
    roast = 'The ghost ship of repositories. No README, no description, and completely invisible intent. A visitor has no idea if this is an AI model or a homework calculator.';
  } else if (!hasReadme) {
    roast = 'You gave it a title and a description, but refused to leave any user manual. It\'s like building a car without a steering wheel or owner\'s guide.';
  } else if (!hasDemo && (repo.language === 'JavaScript' || repo.language === 'TypeScript' || repo.language === 'HTML' || repo.language === 'CSS')) {
    roast = `A frontend/fullstack project with zero live demo URL. You expect busy reviewers to clone, install node_modules, and run localhost just to see your UI?`;
  } else if (daysSincePush > 365) {
    const years = Math.max(1, Math.floor(daysSincePush / 365));
    roast = `Preserved in amber since ${years} year(s) ago. The dependencies in this package.json are currently eligible for antique status.`;
  } else if (repoScore >= 85) {
    roast = 'Honestly, this repository is actually clean. Our only complaint is that you haven\'t promoted it enough on Twitter and LinkedIn.';
  } else {
    roast = 'A promising project that stalled right before the finish line. Lacks the final 10% polish that makes a hiring manager hit "Star".';
  }

  // Determine Rescue
  if (!hasReadme) {
    rescue = 'Create a 4-section README.md: (1) Overview, (2) Key Features, (3) Getting Started (`npm run dev`), (4) Screenshot/demo.';
  } else if (!hasDemo) {
    rescue = 'Deploy a live preview to Vercel, Netlify, or GitHub Pages in under 5 minutes and paste the URL into the repository About box.';
  } else if (!hasDesc) {
    rescue = 'Add a concise 1-sentence description in the repo settings explaining the problem this project solves.';
  } else if (daysSincePush > 365) {
    rescue = 'Run dependency updates (`npm audit fix`), add a recent changelog entry, or officially mark it as archived if development ended.';
  } else if (!repo.license) {
    rescue = 'Add an MIT or Apache-2.0 LICENSE file so other developers and companies can legally fork or reference your code.';
  } else {
    rescue = 'Add animated GIF demonstrations or Mermaid architecture diagrams to make this repo an absolute flagship portfolio piece.';
  }

  return { roast, rescue };
}

/**
 * Analyzes important repositories from user's public repos list.
 * @param {object[]} repos
 * @returns {object[]} Analyzed repository list
 */
function analyzeRepositories(repos = []) {
  if (!Array.isArray(repos) || repos.length === 0) {
    return [];
  }

  // Filter and prioritize: original repos first, sorted by stars + activity
  const sorted = [...repos].sort((a, b) => {
    // Non-fork priority
    if (a.isFork !== b.isFork) return a.isFork ? 1 : -1;
    // Stars weight
    const starsA = (a.stars || 0) * 10;
    const starsB = (b.stars || 0) * 10;
    // Recency weight
    const dateA = a.pushedAt ? new Date(a.pushedAt).getTime() : 0;
    const dateB = b.pushedAt ? new Date(b.pushedAt).getTime() : 0;
    return (starsB + dateB / 10000000) - (starsA + dateA / 10000000);
  });

  // Pick top 6 key repos
  const topRepos = sorted.slice(0, 6);

  return topRepos.map(repo => {
    const { score, breakdown } = scoreRepository(repo);
    const { roast, rescue } = generateRepoFeedback(repo, score);

    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.fullName,
      htmlUrl: repo.htmlUrl,
      description: repo.description || 'No description provided.',
      hasCustomDescription: !!(repo.description && repo.description.trim()),
      language: repo.language || 'Plain Text / Other',
      stars: repo.stars,
      forks: repo.forks,
      isFork: repo.isFork,
      isArchived: repo.isArchived,
      updatedAtFormatted: formatRelativeDate(repo.pushedAt || repo.updatedAt),
      pushedAt: repo.pushedAt,
      hasReadme: repo.hasReadme,
      readmeStatus: repo.hasReadme ? 'Available ✅' : 'Missing ❌',
      hasDemo: !!(repo.homepage && repo.homepage.startsWith('http')),
      homepage: repo.homepage || null,
      topics: repo.topics || [],
      license: repo.license || 'None',
      projectScore: score,
      projectScoreBreakdown: breakdown,
      roast,
      rescue
    };
  });
}

module.exports = {
  analyzeRepositories,
  scoreRepository,
  formatRelativeDate,
  generateRepoFeedback
};

/**
 * Deterministic GitHub Health Scorer
 * 100-point transparent scoring model:
 * - Documentation: 25 pts
 * - Project Quality: 25 pts
 * - Activity: 20 pts
 * - Professional Presence: 15 pts
 * - Technical Diversity: 15 pts
 */

/**
 * Calculates deterministic GitHub Health Score with itemized deductions.
 * @param {object} user - GitHub user object
 * @param {object[]} repos - Enriched repositories array
 * @returns {object} Full scoring breakdown
 */
function calculateHealthScore(user, repos = []) {
  const totalRepos = repos.length;
  const nonForkRepos = repos.filter(r => !r.isFork);
  const totalNonForks = nonForkRepos.length;

  // ----------------------------------------------------
  // 1. Documentation (25 max)
  // ----------------------------------------------------
  let docScore = 0;
  const docDeductions = [];

  // A. Profile README (6 pts)
  if (user.hasProfileReadme) {
    docScore += 6;
  } else {
    docDeductions.push({
      item: 'Missing Profile README',
      points: 6,
      reason: 'No special profile README (<username>/<username>) found to introduce yourself and highlight your best work.',
      recoverable: 6
    });
  }

  // B. Repository README coverage (12 pts)
  if (totalNonForks === 0) {
    docDeductions.push({
      item: 'No Original Repositories with Documentation',
      points: 12,
      reason: 'You have no original repositories to evaluate README documentation.',
      recoverable: 12
    });
  } else {
    const reposWithReadme = nonForkRepos.filter(r => r.hasReadme).length;
    const readmeRatio = reposWithReadme / totalNonForks;
    const earnedReadmePts = Math.round(readmeRatio * 12);
    docScore += earnedReadmePts;

    const lostReadmePts = 12 - earnedReadmePts;
    if (lostReadmePts > 0) {
      const missingCount = totalNonForks - reposWithReadme;
      docDeductions.push({
        item: 'Missing Repository READMEs',
        points: lostReadmePts,
        reason: `${missingCount} of your ${totalNonForks} original repositories lack a README file or setup instructions.`,
        recoverable: lostReadmePts
      });
    }
  }

  // C. Documentation Depth (7 pts)
  if (totalNonForks > 0) {
    const wellDocumentedRepos = nonForkRepos.filter(r => r.hasReadme && r.description && r.size > 20).length;
    const depthRatio = wellDocumentedRepos / totalNonForks;
    const earnedDepthPts = Math.round(depthRatio * 7);
    docScore += earnedDepthPts;

    const lostDepthPts = 7 - earnedDepthPts;
    if (lostDepthPts > 0) {
      docDeductions.push({
        item: 'Shallow Project Documentation',
        points: lostDepthPts,
        reason: 'Most repositories lack comprehensive documentation depth, setup commands, or architecture overviews.',
        recoverable: lostDepthPts
      });
    }
  } else {
    docDeductions.push({
      item: 'No Project Documentation Depth',
      points: 7,
      reason: 'Cannot assess documentation depth without repositories.',
      recoverable: 7
    });
  }

  // ----------------------------------------------------
  // 2. Project Quality (25 max)
  // ----------------------------------------------------
  let qualityScore = 0;
  const qualityDeductions = [];

  // A. Repository Descriptions (9 pts)
  if (totalRepos === 0) {
    qualityDeductions.push({
      item: 'No Repositories',
      points: 9,
      reason: 'No public repositories found to evaluate project descriptions.',
      recoverable: 9
    });
  } else {
    const withDesc = repos.filter(r => r.description && r.description.length > 5).length;
    const descRatio = withDesc / totalRepos;
    const earnedDescPts = Math.round(descRatio * 9);
    qualityScore += earnedDescPts;

    const lostDescPts = 9 - earnedDescPts;
    if (lostDescPts > 0) {
      const missingDescCount = totalRepos - withDesc;
      qualityDeductions.push({
        item: 'Missing Repository Descriptions',
        points: lostDescPts,
        reason: `${missingDescCount} repository(ies) have no description. Visitors and recruiters cannot tell what your code does.`,
        recoverable: lostDescPts
      });
    }
  }

  // B. Live Demo / Homepage Links (6 pts)
  if (totalRepos > 0) {
    const withHomepage = repos.filter(r => r.homepage && r.homepage.startsWith('http')).length;
    if (withHomepage >= 2) {
      qualityScore += 6;
    } else if (withHomepage === 1) {
      qualityScore += 3;
      qualityDeductions.push({
        item: 'Scarce Live Demos',
        points: 3,
        reason: 'Only 1 repository has a live deployed demo link. Recruiters prefer clicking live URLs over cloning code locally.',
        recoverable: 3
      });
    } else {
      qualityDeductions.push({
        item: 'Zero Live Demo Links',
        points: 6,
        reason: 'No live demos or deployments found. None of your web/app repositories show a working preview URL.',
        recoverable: 6
      });
    }
  } else {
    qualityDeductions.push({
      item: 'No Live Demos',
      points: 6,
      reason: 'No public projects with live demonstration URLs.',
      recoverable: 6
    });
  }

  // C. Originality vs Fork Hoarding (5 pts)
  if (totalRepos > 0) {
    const forkRatio = repos.filter(r => r.isFork).length / totalRepos;
    if (forkRatio <= 0.25) {
      qualityScore += 5;
    } else if (forkRatio <= 0.5) {
      qualityScore += 3;
      qualityDeductions.push({
        item: 'High Fork Ratio',
        points: 2,
        reason: '25% - 50% of your public repositories are forks. It looks like you hoard repositories rather than build original code.',
        recoverable: 2
      });
    } else {
      qualityScore += 1;
      qualityDeductions.push({
        item: 'Excessive Fork Hoarding',
        points: 4,
        reason: 'Over 50% of your repositories are forks of other people\'s projects. Clean up or archive unused forks.',
        recoverable: 4
      });
    }
  } else {
    qualityDeductions.push({
      item: 'No Original Code Showcase',
      points: 5,
      reason: 'No original repositories found on profile.',
      recoverable: 5
    });
  }

  // D. Project Discoverability & Topics (3 pts)
  if (totalRepos > 0) {
    const withTopics = repos.filter(r => r.topics && r.topics.length > 0).length;
    if (withTopics >= 3) {
      qualityScore += 3;
    } else if (withTopics >= 1) {
      qualityScore += 1;
      qualityDeductions.push({
        item: 'Few Repository Topics',
        points: 2,
        reason: 'Most repositories lack tags/topics, hurting SEO and discoverability in GitHub search.',
        recoverable: 2
      });
    } else {
      qualityDeductions.push({
        item: 'Zero Repository Topics',
        points: 3,
        reason: 'No repositories use GitHub topics. Add tags like #react, #nodejs, or #api to categorize your work.',
        recoverable: 3
      });
    }
  } else {
    qualityDeductions.push({
      item: 'Missing Topics',
      points: 3,
      reason: 'No repository topics configured.',
      recoverable: 3
    });
  }

  // E. Open Source Licenses (2 pts)
  if (totalNonForks > 0) {
    const withLicense = nonForkRepos.filter(r => r.license).length;
    if (withLicense >= 1) {
      qualityScore += 2;
    } else {
      qualityDeductions.push({
        item: 'Missing Open Source Licenses',
        points: 2,
        reason: 'None of your original repositories specify an open source license (e.g. MIT, Apache-2.0).',
        recoverable: 2
      });
    }
  } else {
    qualityDeductions.push({
      item: 'Missing License',
      points: 2,
      reason: 'No licenses specified.',
      recoverable: 2
    });
  }

  // ----------------------------------------------------
  // 3. Activity (20 max)
  // ----------------------------------------------------
  let activityScore = 0;
  const activityDeductions = [];

  const now = Date.now();
  let latestPushDate = null;

  repos.forEach(r => {
    const pushTime = r.pushedAt ? new Date(r.pushedAt).getTime() : 0;
    if (!latestPushDate || pushTime > latestPushDate) {
      latestPushDate = pushTime;
    }
  });

  const daysSinceLatestPush = latestPushDate
    ? Math.max(0, Math.floor((now - latestPushDate) / (1000 * 60 * 60 * 24)))
    : 999;

  // A. Recency of code pushes (8 pts)
  if (daysSinceLatestPush <= 14) {
    activityScore += 8;
  } else if (daysSinceLatestPush <= 45) {
    activityScore += 6;
    activityDeductions.push({
      item: 'Moderate Inactivity',
      points: 2,
      reason: `Last push was ${daysSinceLatestPush} days ago. A steady commit pulse signals active building.`,
      recoverable: 2
    });
  } else if (daysSinceLatestPush <= 90) {
    activityScore += 4;
    activityDeductions.push({
      item: 'Stale Activity Pulse',
      points: 4,
      reason: `No commits in over ${Math.floor(daysSinceLatestPush / 30)} months. Your profile looks asleep.`,
      recoverable: 4
    });
  } else if (daysSinceLatestPush <= 180) {
    activityScore += 2;
    activityDeductions.push({
      item: 'Severe Inactivity',
      points: 6,
      reason: `Last commit was ${Math.floor(daysSinceLatestPush / 30)} months ago. It resembles an abandoned account.`,
      recoverable: 6
    });
  } else {
    activityDeductions.push({
      item: 'Digital Graveyard Syndrome',
      points: 8,
      reason: 'No public commits pushed in the last 6+ months. The account appears completely dormant.',
      recoverable: 8
    });
  }

  // B. Active Repositories in Past Year (7 pts)
  if (totalRepos > 0) {
    const oneYearAgo = now - 365 * 24 * 60 * 60 * 1000;
    const activeInPastYear = repos.filter(r => {
      const p = r.pushedAt ? new Date(r.pushedAt).getTime() : 0;
      return p > oneYearAgo;
    }).length;

    const activeRatio = activeInPastYear / Math.min(totalRepos, 10);
    const earnedFreshPts = Math.min(7, Math.round(activeRatio * 7));
    activityScore += earnedFreshPts;

    const lostFreshPts = 7 - earnedFreshPts;
    if (lostFreshPts > 0) {
      activityDeductions.push({
        item: 'Few Active Repositories This Year',
        points: lostFreshPts,
        reason: `Only ${activeInPastYear} repositories received updates within the past 12 months.`,
        recoverable: lostFreshPts
      });
    }
  } else {
    activityDeductions.push({
      item: 'No Repository Activity',
      points: 7,
      reason: 'No repositories updated in the past year.',
      recoverable: 7
    });
  }

  // C. Dormant Repository Cleanliness (5 pts)
  if (totalRepos > 0) {
    const twoYearsAgo = now - 2 * 365 * 24 * 60 * 60 * 1000;
    const dormantRepos = repos.filter(r => {
      const p = r.pushedAt ? new Date(r.pushedAt).getTime() : 0;
      return p < twoYearsAgo && !r.isArchived;
    }).length;

    const dormantRatio = dormantRepos / totalRepos;
    if (dormantRatio <= 0.2) {
      activityScore += 5;
    } else if (dormantRatio <= 0.5) {
      activityScore += 3;
      activityDeductions.push({
        item: 'Unmaintained Zombie Projects',
        points: 2,
        reason: `${dormantRepos} unarchived repositories haven't been touched in over 2 years. Archive or clean them up.`,
        recoverable: 2
      });
    } else {
      activityScore += 1;
      activityDeductions.push({
        item: 'High Concentration of Zombie Projects',
        points: 4,
        reason: `Over half of your repositories (${dormantRepos}) are dormant zombies abandoned for 2+ years without being officially archived.`,
        recoverable: 4
      });
    }
  } else {
    activityDeductions.push({
      item: 'No Active Repositories',
      points: 5,
      reason: 'No projects maintained.',
      recoverable: 5
    });
  }

  // ----------------------------------------------------
  // 4. Professional Presence (15 max)
  // ----------------------------------------------------
  let presenceScore = 0;
  const presenceDeductions = [];

  // A. Profile Bio (4 pts)
  if (user.bio && user.bio.length >= 10) {
    presenceScore += 4;
  } else if (user.bio && user.bio.length > 0) {
    presenceScore += 2;
    presenceDeductions.push({
      item: 'Brief Profile Bio',
      points: 2,
      reason: 'Bio is very short. Expand it to state your tech stack and what you\'re building.',
      recoverable: 2
    });
  } else {
    presenceDeductions.push({
      item: 'Completely Blank Bio',
      points: 4,
      reason: 'Your GitHub bio is completely empty. Tell visitors who you are and what you specialize in.',
      recoverable: 4
    });
  }

  // B. Portfolio or Blog Website (4 pts)
  if (user.blog && user.blog.trim().length > 3) {
    presenceScore += 4;
  } else {
    presenceDeductions.push({
      item: 'No Website / Portfolio Link',
      points: 4,
      reason: 'No personal website, portfolio, or LinkedIn link configured on your profile header.',
      recoverable: 4
    });
  }

  // C. Location & Company / Contact Context (3 pts)
  let contextPoints = 0;
  if (user.location) contextPoints += 1.5;
  if (user.company || user.twitterUsername || user.email) contextPoints += 1.5;
  presenceScore += Math.round(contextPoints);

  if (Math.round(contextPoints) < 3) {
    const lostContextPts = 3 - Math.round(contextPoints);
    presenceDeductions.push({
      item: 'Incomplete Profile Contact Details',
      points: lostContextPts,
      reason: 'Missing location, organization, or social handles. These add legitimacy for recruiters.',
      recoverable: lostContextPts
    });
  }

  // D. Profile Avatar (2 pts)
  // GitHub identicons usually have 'identicon' or 'gravatar' or default URLs
  const isDefaultAvatar = !user.avatarUrl || user.avatarUrl.includes('identicons') || user.avatarUrl.includes('github.com/images/error');
  if (!isDefaultAvatar) {
    presenceScore += 2;
  } else {
    presenceDeductions.push({
      item: 'Default Avatar Placeholder',
      points: 2,
      reason: 'Using a generic avatar placeholder instead of a professional headshot or custom developer avatar.',
      recoverable: 2
    });
  }

  // E. Followers / Social Signals (2 pts)
  if (user.followers >= 5) {
    presenceScore += 2;
  } else if (user.followers >= 1) {
    presenceScore += 1;
    presenceDeductions.push({
      item: 'Low Community Presence',
      points: 1,
      reason: 'Fewer than 5 followers. Star and contribute to other open source projects to gain community traction.',
      recoverable: 1
    });
  } else {
    presenceDeductions.push({
      item: 'Zero Followers / Peer Visibility',
      points: 2,
      reason: '0 followers. Engage with the developer community and share your work on social channels.',
      recoverable: 2
    });
  }

  // ----------------------------------------------------
  // 5. Technical Diversity (15 max)
  // ----------------------------------------------------
  let diversityScore = 0;
  const diversityDeductions = [];

  // Count distinct languages
  const languageCounts = {};
  nonForkRepos.forEach(r => {
    if (r.language) {
      languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
    }
  });

  const distinctLanguages = Object.keys(languageCounts);
  const totalLanguages = distinctLanguages.length;

  // A. Number of Languages (7 pts)
  if (totalLanguages >= 4) {
    diversityScore += 7;
  } else if (totalLanguages === 3) {
    diversityScore += 5;
    diversityDeductions.push({
      item: 'Moderate Language Range',
      points: 2,
      reason: `Found 3 languages (${distinctLanguages.join(', ')}). Exploring a backend or systems language would broaden versatility.`,
      recoverable: 2
    });
  } else if (totalLanguages === 2) {
    diversityScore += 3;
    diversityDeductions.push({
      item: 'Limited Language Breadth',
      points: 4,
      reason: `Only 2 languages detected (${distinctLanguages.join(', ')}). Add complementary tools (e.g. TypeScript, Python, Go).`,
      recoverable: 4
    });
  } else if (totalLanguages === 1) {
    diversityScore += 1;
    diversityDeductions.push({
      item: 'Mono-Language Profile',
      points: 6,
      reason: `100% of your repositories are in ${distinctLanguages[0]}. Demonstrating polyglot awareness helps showcase adaptability.`,
      recoverable: 6
    });
  } else {
    diversityDeductions.push({
      item: 'No Languages Detected',
      points: 7,
      reason: 'No recognized programming languages found in repositories.',
      recoverable: 7
    });
  }

  // B. Stack Balance & Variety (5 pts)
  if (totalLanguages > 1 && totalNonForks >= 3) {
    // Check if dominant language takes > 85% of repos
    const dominantCount = Math.max(...Object.values(languageCounts));
    const dominantRatio = dominantCount / totalNonForks;
    if (dominantRatio <= 0.7) {
      diversityScore += 5;
    } else {
      diversityScore += 3;
      diversityDeductions.push({
        item: 'Heavily Skewed Language Balance',
        points: 2,
        reason: 'One language dominates almost all projects. Build a project in an alternative stack to display depth.',
        recoverable: 2
      });
    }
  } else if (totalLanguages === 1) {
    diversityDeductions.push({
      item: 'Single Stack Concentration',
      points: 5,
      reason: 'Entire profile is centered on a single technology stack.',
      recoverable: 5
    });
  } else {
    diversityScore += 2;
  }

  // C. Project Complexity / Substantial Repos (3 pts)
  const substantialRepos = nonForkRepos.filter(r => r.size >= 100).length;
  if (substantialRepos >= 3) {
    diversityScore += 3;
  } else if (substantialRepos >= 1) {
    diversityScore += 2;
    diversityDeductions.push({
      item: 'Few Substantial Codebases',
      points: 1,
      reason: 'Most projects are very small code snippets or homework assignments. Showcase a multi-module application.',
      recoverable: 1
    });
  } else {
    diversityDeductions.push({
      item: 'Micro-Repository Dominance',
      points: 3,
      reason: 'No substantial multi-file or full-stack architectures detected. Projects appear to be toy experiments.',
      recoverable: 3
    });
  }

  // Ensure bounds
  docScore = Math.max(0, Math.min(25, docScore));
  qualityScore = Math.max(0, Math.min(25, qualityScore));
  activityScore = Math.max(0, Math.min(20, activityScore));
  presenceScore = Math.max(0, Math.min(15, presenceScore));
  diversityScore = Math.max(0, Math.min(15, diversityScore));

  const overallScore = docScore + qualityScore + activityScore + presenceScore + diversityScore;

  // Calculate potential score strictly from recoverable deductions
  const allDeductions = [
    ...docDeductions.map(d => ({ ...d, category: 'Documentation' })),
    ...qualityDeductions.map(d => ({ ...d, category: 'Project Quality' })),
    ...activityDeductions.map(d => ({ ...d, category: 'Activity' })),
    ...presenceDeductions.map(d => ({ ...d, category: 'Professional Presence' })),
    ...diversityDeductions.map(d => ({ ...d, category: 'Technical Diversity' }))
  ];

  // Realistic maximum achievable score improvement (sum of top recoverable items up to realistic cap)
  const totalRecoverable = allDeductions.reduce((acc, cur) => acc + (cur.recoverable || 0), 0);
  const potentialScore = Math.min(100, overallScore + totalRecoverable);
  const potentialImprovement = potentialScore - overallScore;

  // Assign Profile Level
  let profileLevel = 'Junior Ghost';
  let profileBadge = '👻';
  let profileSummary = 'Barebones profile with minimal public signals. High potential for massive gains!';

  if (overallScore >= 90) {
    profileLevel = 'Production Veteran';
    profileBadge = '👑';
    profileSummary = 'Pristine portfolio, thorough documentation, and relentless momentum. Recruiter magnet.';
  } else if (overallScore >= 80) {
    profileLevel = 'Open Source Artisan';
    profileBadge = '⚡';
    profileSummary = 'Impressive consistency, sharp documentation, and legitimate developer presence.';
  } else if (overallScore >= 70) {
    profileLevel = 'Craftsman in Hiding';
    profileBadge = '🛠️';
    profileSummary = 'Solid engineering fundamentals, but needs polish on live demos, READMEs, and showcase curation.';
  } else if (overallScore >= 55) {
    profileLevel = 'Tutorial Hoarder';
    profileBadge = '📦';
    profileSummary = 'Lots of started experiments and forks, but inconsistent documentation and missing live deployments.';
  } else if (overallScore >= 40) {
    profileLevel = 'README Phantom';
    profileBadge = '🌫️';
    profileSummary = 'Code is sitting in the repositories, but virtually zero documentation or explanation for visitors.';
  } else if (overallScore >= 25) {
    profileLevel = 'Digital Graveyard Keeper';
    profileBadge = '🪦';
    profileSummary = 'A collection of abandoned repositories and cold commit streaks. Time for a revival!';
  }

  return {
    overallScore,
    potentialScore,
    potentialImprovement,
    profileLevel,
    profileBadge,
    profileSummary,
    categories: {
      documentation: {
        score: docScore,
        max: 25,
        percentage: Math.round((docScore / 25) * 100),
        deductions: docDeductions
      },
      projectQuality: {
        score: qualityScore,
        max: 25,
        percentage: Math.round((qualityScore / 25) * 100),
        deductions: qualityDeductions
      },
      activity: {
        score: activityScore,
        max: 20,
        percentage: Math.round((activityScore / 20) * 100),
        deductions: activityDeductions
      },
      professionalPresence: {
        score: presenceScore,
        max: 15,
        percentage: Math.round((presenceScore / 15) * 100),
        deductions: presenceDeductions
      },
      technicalDiversity: {
        score: diversityScore,
        max: 15,
        percentage: Math.round((diversityScore / 15) * 100),
        deductions: diversityDeductions
      }
    },
    allDeductions,
    stats: {
      totalRepos,
      totalNonForks,
      totalForks: repos.filter(r => r.isFork).length,
      distinctLanguages,
      daysSinceLatestPush,
      hasBio: !!(user.bio && user.bio.trim()),
      hasBlog: !!(user.blog && user.blog.trim()),
      hasProfileReadme: user.hasProfileReadme
    }
  };
}

module.exports = {
  calculateHealthScore
};

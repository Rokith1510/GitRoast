/**
 * The Roast Engine
 * Philosophy: "Roast the profile, not the person."
 * Generates personalized, witty observations based on actual detected weaknesses.
 */

/**
 * Generates personalized roast observations based on real profile data and score breakdown.
 * @param {object} user - User profile data
 * @param {object[]} repos - Enriched repos
 * @param {object} scoreData - Scoring breakdown from scorer.js
 * @returns {object} Personalized roast package
 */
function generateRoast(user, repos = [], scoreData) {
  const totalRepos = repos.length;
  const nonForkRepos = repos.filter(r => !r.isFork);
  const totalNonForks = nonForkRepos.length;
  const forksCount = repos.filter(r => r.isFork).length;
  const reposWithoutReadme = nonForkRepos.filter(r => !r.hasReadme).length;
  const reposWithoutDesc = repos.filter(r => !r.description || r.description.trim().length <= 3).length;
  const daysSincePush = scoreData.stats?.daysSinceLatestPush ?? 999;
  const hasLiveDemo = repos.some(r => r.homepage && r.homepage.startsWith('http'));
  const languages = scoreData.stats?.distinctLanguages || [];

  const candidates = [];

  // 1. Missing READMEs
  if (reposWithoutReadme > 0 && totalNonForks > 0) {
    const ratio = reposWithoutReadme / totalNonForks;
    if (ratio >= 0.75) {
      candidates.push({
        id: 'missing-readmes-severe',
        tag: 'DOCUMENTATION ALLERGY',
        quote: 'Your repositories have acute documentation allergies.',
        punchline: `${reposWithoutReadme} of your ${totalNonForks} original repositories don't have a README. Visiting your GitHub feels like walking into an art museum where all the exhibits are wrapped in duct tape.`,
        severity: 'Nuclear'
      });
    } else if (ratio >= 0.4) {
      candidates.push({
        id: 'missing-readmes-moderate',
        tag: 'README PHOBIA',
        quote: 'You wrote the code and immediately fled the crime scene.',
        punchline: `Over ${Math.round(ratio * 100)}% of your codebases have zero explanation. If a recruiter opens your repo, their only installation instruction is prayer.`,
        severity: 'Extra Crispy'
      });
    }
  }

  // 2. Missing Descriptions
  if (reposWithoutDesc > 0) {
    const descRatio = reposWithoutDesc / Math.max(1, totalRepos);
    if (descRatio >= 0.5) {
      candidates.push({
        id: 'missing-descriptions',
        tag: 'CLASSIFIED INFORMATION',
        quote: 'Your projects are apparently classified government secrets.',
        punchline: `${reposWithoutDesc} of your ${totalRepos} repositories have no description whatsoever. We need security clearance just to guess what half of your folders do.`,
        severity: 'Extra Crispy'
      });
    } else if (reposWithoutDesc >= 2) {
      candidates.push({
        id: 'vague-descriptions',
        tag: 'MYSTERY REPOSITORIES',
        quote: 'Leaving repo descriptions empty isn\'t building suspense; it\'s building confusion.',
        punchline: `${reposWithoutDesc} repos have left the description blank. One sentence could save a dozen innocent developers from guessing.`,
        severity: 'Medium'
      });
    }
  }

  // 3. Stale / Inactive Repositories
  if (daysSincePush > 180) {
    const months = Math.floor(daysSincePush / 30);
    candidates.push({
      id: 'activity-graveyard',
      tag: 'DIGITAL GRAVEYARD',
      quote: 'Your GitHub isn\'t a portfolio. It\'s a digital graveyard.',
      punchline: `It has been over ${months} months since you pushed a public commit. At this rate, archaeologists will uncover your repositories before a recruiter does.`,
      severity: 'Nuclear'
    });
  } else if (daysSincePush > 60) {
    candidates.push({
      id: 'activity-coma',
      tag: 'HIBERNATION MODE',
      quote: 'Your commit streak is in a medically induced coma.',
      punchline: `Last code push was ${daysSincePush} days ago. Your contribution graph has more blank white tiles than an Apple Store floor.`,
      severity: 'Extra Crispy'
    });
  }

  // 4. No Live Demos or Portfolio Link
  if (!hasLiveDemo && (!user.blog || !user.blog.trim())) {
    candidates.push({
      id: 'no-portfolio-or-demo',
      tag: 'MISSING FRONT DOOR',
      quote: 'You built the projects but forgot to build the front door.',
      punchline: 'Zero live deployed demos and no portfolio link in your bio. You expect hiring managers to clone your repo, configure .env, run npm install, and debug dependencies just to see a button?',
      severity: 'Extra Crispy'
    });
  } else if (!hasLiveDemo && totalNonForks >= 2) {
    candidates.push({
      id: 'no-live-demo',
      tag: 'GHOST TOWN DEMOS',
      quote: 'It works on your machine... and literally nowhere else.',
      punchline: 'Not a single repository has a live deployed demo link. Vercel and Netlify have free tiers waiting for you with open arms.',
      severity: 'Medium'
    });
  }

  // 5. Fork Hoarding
  if (forksCount > 0 && totalRepos > 0) {
    const forkRatio = forksCount / totalRepos;
    if (forkRatio >= 0.5) {
      candidates.push({
        id: 'fork-hoarder',
        tag: 'CODE HOARDER',
        quote: 'You don\'t write repositories; you adopt them.',
        punchline: `${forksCount} of your ${totalRepos} public repositories (${Math.round(forkRatio * 100)}%) are forks. You\'re collecting open-source projects like Pokémon cards instead of shipping original code.`,
        severity: 'Extra Crispy'
      });
    }
  }

  // 6. Blank Bio & Socials
  if (!user.bio || user.bio.trim().length === 0) {
    candidates.push({
      id: 'blank-bio',
      tag: 'STEALTH DEVELOPER',
      quote: 'A bio so blank, tumbleweeds are paying rent on your profile.',
      punchline: 'You gave GitHub your username and decided your entire technical persona is self-evident. Even a single sentence would break the eerie silence.',
      severity: 'Medium'
    });
  }

  // 7. Missing Profile README
  if (!user.hasProfileReadme && totalNonForks >= 1) {
    candidates.push({
      id: 'no-profile-readme',
      tag: 'UNPINNED SHOWCASE',
      quote: 'No personal profile README. Are you in witness protection?',
      punchline: 'GitHub gave developers a custom landing page banner years ago, but your profile header is as barren as an empty bash prompt.',
      severity: 'Medium'
    });
  }

  // 8. Odd / Generic Repo Names
  const suspiciousNames = repos.filter(r => {
    const n = r.name.toLowerCase();
    return n.includes('test') || n.includes('temp') || n.includes('final') || n.includes('demo') || n === 'project' || n === 'my-app' || n === 'portfolio';
  });
  if (suspiciousNames.length >= 2) {
    const sampleNames = suspiciousNames.slice(0, 3).map(r => `"${r.name}"`).join(', ');
    candidates.push({
      id: 'questionable-naming',
      tag: 'NAMING CONVENTION CRISIS',
      quote: 'Git naming convention: "Whatever my keyboard hits first."',
      punchline: `Found repositories named ${sampleNames}. Even your future self will need a séance to remember which one had the working code.`,
      severity: 'Mild'
    });
  }

  // 9. Mono-Language vs Language Isolation
  if (languages.length === 1 && totalNonForks >= 3) {
    candidates.push({
      id: 'mono-language',
      tag: 'ONE-TRICK PONY',
      quote: `You and ${languages[0]} need to see other people.`,
      punchline: `Every single project is strictly written in ${languages[0]}. Expanding your horizons with another language would prove you aren't married to a single framework.`,
      severity: 'Mild'
    });
  }

  // 10. Fallback positive / light roast if profile is actually quite good
  if (candidates.length < 3) {
    if (scoreData.overallScore >= 80) {
      candidates.push({
        id: 'too-clean',
        tag: 'SUSPICIOUSLY CLEAN',
        quote: 'Your profile is almost too clean. Did you tidy up right before the roast?',
        punchline: 'You actually have READMEs and commit activity. Are you an actual developer, or did you write a script to simulate human productivity?',
        severity: 'Mild'
      });
      candidates.push({
        id: 'showcase-more',
        tag: 'HUMBLE BRAGGER',
        quote: 'You build great code, but your marketing department is asleep.',
        punchline: 'Add more live interactive demos, architecture diagrams, and social links so recruiters don\'t have to hunt for your brilliance.',
        severity: 'Mild'
      });
    } else {
      candidates.push({
        id: 'needs-momentum',
        tag: 'UNFINISHED BUSINESS',
        quote: 'A repository graveyard of half-finished weekend epiphanies.',
        punchline: 'Plenty of repositories started with grand ambitions, but only a handful reached the finish line. Pick your top 2 and give them the polish they deserve.',
        severity: 'Medium'
      });
    }
  }

  // Pick top 3 to 5 observations
  const observations = candidates.slice(0, 5);

  // Overall Headline Roast
  let headline = '';
  let roastVerdict = '';

  if (scoreData.overallScore < 35) {
    headline = 'Your GitHub isn\'t a portfolio—it\'s an abandoned construction site.';
    roastVerdict = 'Critical condition. Send immediate rescue units before the algorithms forget this account exists.';
  } else if (scoreData.overallScore < 55) {
    headline = 'Good code hiding behind witness protection documentation.';
    roastVerdict = 'You do the hard work of writing code, then completely sabotage yourself by refusing to document or deploy it.';
  } else if (scoreData.overallScore < 75) {
    headline = 'The classic "Diamond in the Rough" developer syndrome.';
    roastVerdict = 'There is real engineering skill here, but it\'s buried under neglected READMEs, unlinked demos, and dormant repos.';
  } else if (scoreData.overallScore < 90) {
    headline = 'Respectable developer with a few sloppy housekeeping habits.';
    roastVerdict = 'A solid foundation that just needs a few live demo links and a sharper profile showcase to stand out in the top 5%.';
  } else {
    headline = 'Hard to roast when you actually keep your house in order.';
    roastVerdict = 'Your profile is in great shape. Keep publishing live demos and mentoring the developers whose profiles are currently on fire.';
  }

  // Overall Severity
  let severityLevel = 'Medium';
  if (scoreData.overallScore < 40) severityLevel = 'Nuclear';
  else if (scoreData.overallScore < 65) severityLevel = 'Extra Crispy';
  else if (scoreData.overallScore < 80) severityLevel = 'Medium';
  else severityLevel = 'Mild';

  return {
    headline,
    roastVerdict,
    severityLevel,
    observationsCount: observations.length,
    observations
  };
}

module.exports = {
  generateRoast
};

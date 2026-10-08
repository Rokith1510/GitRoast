/**
 * The Rescue Engine
 * "Every criticism MUST have a corresponding solution."
 * Translates every detected deduction into concrete, actionable steps with priorities and score gains.
 */

/**
 * Generates an actionable Rescue Plan based on detected deductions.
 * @param {object} user - GitHub user object
 * @param {object[]} repos - Enriched repos
 * @param {object} scoreData - Scorer breakdown
 * @returns {object} Full rescue plan
 */
function generateRescuePlan(user, repos = [], scoreData) {
  const deductions = scoreData.allDeductions || [];
  const actionItems = [];

  deductions.forEach(d => {
    let priority = 'Medium';
    let whyItMatters = '';
    let action = '';
    let estimatedScoreImprovement = d.recoverable || d.points || 2;
    let timeToFix = '15 mins';

    switch (d.item) {
      case 'Missing Profile README':
        priority = 'High';
        timeToFix = '15 mins';
        whyItMatters = 'Your profile README is the first thing recruiters and collaborators see. Without it, you miss the chance to control your own narrative.';
        action = `Create a public repository named "${user.login}/${user.login}". Add a clean README.md with your current tech stack, key projects, and links to your portfolio and LinkedIn.`;
        break;

      case 'Missing Repository READMEs':
        priority = 'High';
        timeToFix = '30 mins';
        whyItMatters = 'Repositories without READMEs are invisible to hiring managers. Nobody has the time to reverse engineer your folder structure.';
        action = 'Add a concise README.md to your top 3 repos. Include: (1) One-line summary, (2) Problem solved, (3) Setup/installation command, (4) Screenshot or GIF.';
        break;

      case 'Shallow Project Documentation':
        priority = 'Medium';
        timeToFix = '25 mins';
        whyItMatters = 'Senior engineers write clear setup instructions, architecture notes, and API documentation.';
        action = 'Upgrade READMEs with badges, architectural diagrams (Mermaid or ASCII), tech stack badges, and troubleshooting tips.';
        break;

      case 'Missing Repository Descriptions':
        priority = 'High';
        timeToFix = '5 mins';
        whyItMatters = 'Repository descriptions show up in Google search and GitHub profile lists. Blank descriptions look like abandoned homework.';
        action = 'Click the gear icon on each repository and write a crisp 10-15 word description stating what the app does and the key technologies used.';
        break;

      case 'Zero Live Demo Links':
      case 'Scarce Live Demos':
        priority = 'High';
        timeToFix = '10 mins';
        whyItMatters = 'Recruiters don\'t download and run code locally. A live URL makes your work immediately verifiable and memorable.';
        action = 'Deploy your web applications on free hosting (Vercel, Render, Cloud Run, GitHub Pages). Paste the live URL into the repository\'s "About" homepage field.';
        break;

      case 'Digital Graveyard Syndrome':
      case 'Severe Inactivity':
      case 'Stale Activity Pulse':
        priority = 'High';
        timeToFix = '20 mins';
        whyItMatters = 'An active commit graph signals momentum, problem-solving habits, and reliability.';
        action = 'Push an update, refactor an old module, write unit tests, or open a pull request on an open-source project to revive your commit streak.';
        break;

      case 'Unmaintained Zombie Projects':
      case 'High Concentration of Zombie Projects':
        priority = 'Medium';
        timeToFix = '10 mins';
        whyItMatters = 'A cluttered profile with dozens of unfinished 3-year-old repos dilutes your best work and looks disorganized.';
        action = 'Go to repository settings and click "Archive this repository" for dead experiments, or make private any unpolished test repos.';
        break;

      case 'Excessive Fork Hoarding':
      case 'High Fork Ratio':
        priority = 'Medium';
        timeToFix = '10 mins';
        whyItMatters = 'A profile dominated by forks raises doubts about whether you can architect original solutions.';
        action = 'Delete or hide forks that you only used for reading code. If you contributed, pin the specific PR in your profile README instead.';
        break;

      case 'Completely Blank Bio':
      case 'Brief Profile Bio':
        priority = 'High';
        timeToFix = '3 mins';
        whyItMatters = 'A bio gives recruiters an instant elevator pitch of your engineering specialty and current focus.';
        action = 'Update your GitHub bio with your primary focus, e.g.: "Full-Stack Engineer building scalable distributed systems with Node.js & TypeScript | Open to opportunities."';
        break;

      case 'No Website / Portfolio Link':
        priority = 'High';
        timeToFix = '5 mins';
        whyItMatters = 'Hiring managers want to see your resume, case studies, or LinkedIn profile in one click.';
        action = 'Add your personal portfolio URL, LinkedIn profile, or Substack/blog link to your GitHub profile settings.';
        break;

      case 'Incomplete Profile Contact Details':
        priority = 'Low';
        timeToFix = '3 mins';
        whyItMatters = 'Missing location and public email slows down technical recruiters reaching out for local or remote roles.';
        action = 'Fill in your location (e.g. "San Francisco, CA / Remote") and public contact email in GitHub account settings.';
        break;

      case 'Default Avatar Placeholder':
        priority = 'Medium';
        timeToFix = '5 mins';
        whyItMatters = 'An identicon makes the account look anonymous, robotic, or secondary.';
        action = 'Upload a high-resolution, friendly headshot or custom developer avatar.';
        break;

      case 'Zero Repository Topics':
      case 'Few Repository Topics':
        priority = 'Low';
        timeToFix = '5 mins';
        whyItMatters = 'Topics help your repos appear in GitHub explore feeds and tag search results.';
        action = 'Add 3-5 relevant topics to your key repositories (e.g., #nodejs, #express, #api, #react, #docker).';
        break;

      case 'Missing Open Source Licenses':
        priority = 'Low';
        timeToFix = '5 mins';
        whyItMatters = 'Without an open-source license, other developers technically cannot legally use or contribute to your code.';
        action = 'Add an MIT or Apache-2.0 LICENSE file to your repositories using GitHub\'s "Add file > Create new file > LICENSE" template button.';
        break;

      case 'Mono-Language Profile':
      case 'Limited Language Breadth':
        priority = 'Medium';
        timeToFix = '1-2 days';
        whyItMatters = 'Engineers who show comfort across multiple paradigms (e.g., TypeScript + Python + Go) demonstrate adaptability.';
        action = 'Build a small side project, CLI tool, or automation script in a second language to showcase polyglot capabilities.';
        break;

      case 'Few Substantial Codebases':
      case 'Micro-Repository Dominance':
        priority = 'Medium';
        timeToFix = '1-2 days';
        whyItMatters = 'Hiring managers look for evidence you can manage complex state, testing, and production architectures.';
        action = 'Pick one flagship project and expand it: add unit tests, Docker containerization, CI/CD GitHub Actions, and environment config.';
        break;

      default:
        priority = d.points >= 5 ? 'High' : (d.points >= 3 ? 'Medium' : 'Low');
        whyItMatters = 'Addressing this weakness directly recovers points in your overall GitHub Health Score.';
        action = `Resolve: ${d.reason}`;
    }

    actionItems.push({
      id: `fix-${d.item.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      category: d.category || 'General',
      problem: d.item,
      deductionPoints: d.points,
      estimatedScoreImprovement,
      priority,
      timeToFix,
      whyItMatters,
      action
    });
  });

  // Group by priority
  const highPriority = actionItems.filter(a => a.priority === 'High');
  const mediumPriority = actionItems.filter(a => a.priority === 'Medium');
  const lowPriority = actionItems.filter(a => a.priority === 'Low');

  // Generate "Top 5 Fixes" sorted by impact and quickness
  // Priority order: High > Medium > Low, then by estimatedScoreImprovement desc
  const sortedForTop5 = [...actionItems].sort((a, b) => {
    const pWeight = { High: 3, Medium: 2, Low: 1 };
    if (pWeight[b.priority] !== pWeight[a.priority]) {
      return pWeight[b.priority] - pWeight[a.priority];
    }
    return b.estimatedScoreImprovement - a.estimatedScoreImprovement;
  });

  const top5Fixes = sortedForTop5.slice(0, 5).map((fix, idx) => ({
    rank: idx + 1,
    title: fix.problem,
    action: fix.action,
    whyItMatters: fix.whyItMatters,
    priority: fix.priority,
    estimatedScoreImprovement: fix.estimatedScoreImprovement,
    timeToFix: fix.timeToFix
  }));

  // Potential score calculations
  const currentScore = scoreData.overallScore;
  const potentialScore = scoreData.potentialScore;
  const potentialImprovement = scoreData.potentialImprovement;

  return {
    currentScore,
    potentialScore,
    potentialImprovement,
    totalActionsCount: actionItems.length,
    top5Fixes,
    highPriority,
    mediumPriority,
    lowPriority,
    allActions: actionItems
  };
}

module.exports = {
  generateRescuePlan
};


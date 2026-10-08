/**
 * Recruiter Mode Engine
 * Provides an objective, professional evaluation of a candidate's GitHub portfolio
 * without humor or satire. Tailored for hiring managers, technical leads, and recruiters.
 */

/**
 * Generates an objective professional candidate analysis.
 * @param {object} user - GitHub user object
 * @param {object[]} repos - Enriched repos
 * @param {object} scoreData - Scoring breakdown
 * @returns {object} Recruiter assessment
 */
function generateRecruiterReport(user, repos = [], scoreData) {
  const nonForkRepos = repos.filter(r => !r.isFork);
  const totalNonForks = nonForkRepos.length;
  const languages = scoreData.stats?.distinctLanguages || [];
  const daysSincePush = scoreData.stats?.daysSinceLatestPush ?? 999;
  const overallScore = scoreData.overallScore;

  // 1. Job Readiness Rating & Status
  let readinessLevel = 'Early Stage Candidate';
  let readinessBadge = '🟡 Entry / Early Stage';
  let readinessSummary = 'The profile demonstrates emerging development interest, but requires structural refinement to meet competitive industry screening standards.';

  if (overallScore >= 85) {
    readinessLevel = 'Senior / Staff Ready Showcase';
    readinessBadge = '🟢 Highly Competitive';
    readinessSummary = 'Strong evidence of production discipline: consistent commit cadence, comprehensive documentation, and polyglot versatility. Highly recommended for technical interview screens.';
  } else if (overallScore >= 70) {
    readinessLevel = 'Mid-Level Competitive';
    readinessBadge = '🟢 Interview Ready';
    readinessSummary = 'Candidate exhibits solid coding fundamentals and active projects. Minor gaps in live deployments and documentation depth, easily addressable during interview discussions.';
  } else if (overallScore >= 50) {
    readinessLevel = 'Junior / Associate Developer';
    readinessBadge = '🟡 Approaching Readiness';
    readinessSummary = 'Demonstrated ability to write code, but profile lacks live demos and detailed project documentation. Recruiters may struggle to assess code quality without interactive links.';
  }

  // 2. Technical Breadth Evaluation
  let breadthAssessment = '';
  if (languages.length >= 4) {
    breadthAssessment = `High versatility across multiple paradigms (${languages.slice(0, 4).join(', ')}). Demonstrates strong capability to transition between stacks.`;
  } else if (languages.length >= 2) {
    breadthAssessment = `Moderate technical breadth centered on ${languages.join(' and ')}. Adequate for focused roles in these stacks.`;
  } else if (languages.length === 1) {
    breadthAssessment = `Specialized focus in ${languages[0]}. Recommended to demonstrate familiarity with adjacent tooling, testing libraries, or API integration.`;
  } else {
    breadthAssessment = 'Limited repository language signals detected. Recommended to publish sample codebases with explicit language tagging.';
  }

  // 3. Project Quality Evaluation
  const reposWithDesc = nonForkRepos.filter(r => r.description && r.description.length > 5).length;
  const reposWithDemo = nonForkRepos.filter(r => r.homepage && r.homepage.startsWith('http')).length;
  let qualityAssessment = '';
  if (reposWithDemo >= 2 && reposWithDesc >= 3) {
    qualityAssessment = 'Strong project presentation. Deployed live URLs and descriptive overviews allow swift verification of functionality.';
  } else if (reposWithDesc >= 2) {
    qualityAssessment = `Projects are categorized, but only ${reposWithDemo} provide live demonstration links. Adding live previews will significantly improve resume-to-interview conversion.`;
  } else {
    qualityAssessment = 'Insufficient project context. Repositories lack descriptive summaries and deployment links, creating screening friction for technical evaluators.';
  }

  // 4. Documentation Evaluation
  const reposWithReadme = nonForkRepos.filter(r => r.hasReadme).length;
  let docAssessment = '';
  if (user.hasProfileReadme && reposWithReadme >= totalNonForks * 0.8) {
    docAssessment = 'Exemplary documentation hygiene. Profile README provides professional positioning and core repositories feature thorough installation guides.';
  } else if (reposWithReadme >= totalNonForks * 0.5) {
    docAssessment = 'Moderate documentation. Key projects have READMEs, but inconsistent setup instructions across repositories may hinder peer evaluation.';
  } else {
    docAssessment = 'Critical documentation gap. Majority of repositories lack README files. Onboarding clarity and installation instructions are vital indicators of collaborative teamwork.';
  }

  // 5. Activity & Momentum Evaluation
  let activityAssessment = '';
  if (daysSincePush <= 14) {
    activityAssessment = `Active commit pulse (last pushed ${daysSincePush === 0 ? 'today' : `${daysSincePush} days ago`}). Indicates sustained engineering engagement and active skill sharpening.`;
  } else if (daysSincePush <= 60) {
    activityAssessment = `Recent activity observed within ${daysSincePush} days. Acceptable maintenance cadence.`;
  } else {
    activityAssessment = `Inactivity detected (last push was ${daysSincePush} days ago). Candidate should consider publishing recent experiments or open source contributions to reflect current momentum.`;
  }

  // 6. Professional Presence Evaluation
  let presenceAssessment = '';
  const presenceFlags = [];
  if (user.bio) presenceFlags.push('Bio present');
  if (user.blog) presenceFlags.push('Portfolio/Blog linked');
  if (user.location) presenceFlags.push(`Location specified (${user.location})`);
  if (user.company) presenceFlags.push(`Affiliation noted (${user.company})`);

  if (presenceFlags.length >= 3) {
    presenceAssessment = `Strong digital branding (${presenceFlags.join(', ')}). Profile establishes clear credibility for recruiters searching for candidates.`;
  } else if (presenceFlags.length >= 1) {
    presenceAssessment = `Partial professional profile. (${presenceFlags.join(', ')}). Consider linking LinkedIn and an active portfolio URL.`;
  } else {
    presenceAssessment = 'Sparse professional branding. Missing bio, location, and portfolio link. Profile feels anonymous.';
  }

  // 7. Tactical Professional Recommendations
  const recommendations = [];

  if (!user.hasProfileReadme) {
    recommendations.push({
      area: 'Showcase Architecture',
      suggestion: 'Create a GitHub Profile README highlighting your core tech stack, top 2 flagship projects, and direct contact avenues.'
    });
  }

  if (reposWithDemo === 0 && totalNonForks > 0) {
    recommendations.push({
      area: 'Verifiable Proof of Work',
      suggestion: 'Deploy at least 2 web or API applications to cloud hosting (e.g., Google Cloud Run, Vercel, Render) and attach URLs to the repository headers.'
    });
  }

  if (reposWithReadme < totalNonForks) {
    recommendations.push({
      area: 'Engineering Communication',
      suggestion: 'Standardize README files across all visible repositories with: Problem, Architecture, Local Setup steps, and Testing commands.'
    });
  }

  if (daysSincePush > 45) {
    recommendations.push({
      area: 'Momentum & Recency',
      suggestion: 'Resume active public contributions. A green contribution streak creates immediate positive screening bias for hiring managers.'
    });
  }

  if (!user.blog || !user.blog.trim()) {
    recommendations.push({
      area: 'Portfolio Integration',
      suggestion: 'Add your LinkedIn or personal website link to the profile header to streamline background verification by technical recruiters.'
    });
  }

  if (recommendations.length < 3) {
    recommendations.push({
      area: 'Continuous Integration / CI/CD',
      suggestion: 'Introduce GitHub Actions workflows for automated testing and linting on your primary repositories to signal enterprise-level code discipline.'
    });
    recommendations.push({
      area: 'Open Source Engagement',
      suggestion: 'Contribute pull requests to established open-source libraries in your stack to demonstrate collaboration within large codebases.'
    });
  }

  return {
    readinessLevel,
    readinessBadge,
    readinessSummary,
    dimensions: {
      technicalBreadth: {
        title: 'Technical Breadth & Stack Versatility',
        score: scoreData.categories.technicalDiversity.score,
        maxScore: scoreData.categories.technicalDiversity.max,
        assessment: breadthAssessment,
        detectedLanguages: languages
      },
      projectQuality: {
        title: 'Project Engineering Quality',
        score: scoreData.categories.projectQuality.score,
        maxScore: scoreData.categories.projectQuality.max,
        assessment: qualityAssessment,
        liveDemosCount: reposWithDemo
      },
      documentation: {
        title: 'Technical Documentation & Communication',
        score: scoreData.categories.documentation.score,
        maxScore: scoreData.categories.documentation.max,
        assessment: docAssessment,
        documentedRatio: totalNonForks > 0 ? `${reposWithReadme}/${totalNonForks}` : '0/0'
      },
      activity: {
        title: 'Engineering Momentum & Activity',
        score: scoreData.categories.activity.score,
        maxScore: scoreData.categories.activity.max,
        assessment: activityAssessment,
        daysSincePush
      },
      professionalPresence: {
        title: 'Professional Presence & Brand Clarity',
        score: scoreData.categories.professionalPresence.score,
        maxScore: scoreData.categories.professionalPresence.max,
        assessment: presenceAssessment
      }
    },
    recommendations: recommendations.slice(0, 5)
  };
}

module.exports = {
  generateRecruiterReport
};


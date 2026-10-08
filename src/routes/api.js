/**
 * API Routes for GitRoast
 */

const express = require('express');
const router = express.Router();
const { validateGitHubUsername } = require('../utils/validator');
const { fetchGitHubData, getRateLimitStatus, GitHubError } = require('../services/github');
const { calculateHealthScore } = require('../analysis/scorer');
const { generateRoast } = require('../analysis/roaster');
const { generateRescuePlan } = require('../analysis/rescuer');
const { analyzeRepositories } = require('../analysis/repoAnalyzer');
const { generateRecruiterReport } = require('../analysis/recruiter');
const { generateAIRoastSnippet } = require('../services/ai');

/**
 * Health check endpoint for Google Cloud Run / monitoring
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'GitRoast',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime())
  });
});

/**
 * Rate limit inspection endpoint
 */
router.get('/rate-limit', async (req, res) => {
  try {
    const status = await getRateLimitStatus();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: 'Failed to check GitHub rate limits', message: err.message });
  }
});

/**
 * Main Roast & Rescue Analysis Endpoint
 * GET /api/roast/:username
 */
router.get('/roast/:username', async (req, res, next) => {
  try {
    const rawUsername = req.params.username;

    // 1. Validate Input
    const validation = validateGitHubUsername(rawUsername);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Username',
        message: validation.error
      });
    }

    const username = validation.sanitizedUsername;

    // 2. Fetch Real GitHub Data
    const { user, repos, meta, fromCache } = await fetchGitHubData(username);

    // 3. Compute Deterministic Health Score
    const scoreData = calculateHealthScore(user, repos);

    // 4. Generate Personalized Roast
    const roastData = generateRoast(user, repos, scoreData);

    // 5. Generate Actionable Rescue Plan
    const rescuePlan = generateRescuePlan(user, repos, scoreData);

    // 6. Analyze Key Repositories
    const analyzedRepos = analyzeRepositories(repos);

    // 7. Generate Recruiter Mode Assessment
    const recruiterReport = generateRecruiterReport(user, repos, scoreData);

    // 8. Optional AI Natural-Language Polish
    let aiRoastSnippet = null;
    try {
      const topFlawReasons = (scoreData.allDeductions || []).slice(0, 3).map(d => `${d.item}: ${d.reason}`);
      aiRoastSnippet = await generateAIRoastSnippet({
        username,
        score: scoreData.overallScore,
        profileLevel: scoreData.profileLevel,
        topFlaws: topFlawReasons
      });
    } catch {
      // Fallback is silent
    }

    // Return complete payload
    return res.json({
      success: true,
      user,
      meta: {
        ...meta,
        fromCache,
        aiEnhanced: !!aiRoastSnippet
      },
      score: {
        overall: scoreData.overallScore,
        potential: scoreData.potentialScore,
        improvement: scoreData.potentialImprovement,
        level: scoreData.profileLevel,
        badge: scoreData.profileBadge,
        summary: scoreData.profileSummary,
        categories: scoreData.categories,
        deductions: scoreData.allDeductions
      },
      roast: {
        ...roastData,
        aiSnippet: aiRoastSnippet
      },
      rescue: rescuePlan,
      projects: analyzedRepos,
      recruiter: recruiterReport
    });
  } catch (err) {
    if (err instanceof GitHubError) {
      return res.status(err.status || 500).json({
        success: false,
        error: err.name,
        message: err.message,
        details: err.details
      });
    }
    next(err);
  }
});

module.exports = router;

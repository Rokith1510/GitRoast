const { test, describe } = require('node:test');
const assert = require('node:assert');
const {
  analyzeRepositories,
  scoreRepository,
  formatRelativeDate,
  generateRepoFeedback
} = require('../src/analysis/repoAnalyzer');

describe('Repository Analysis Tests', () => {
  test('formats relative dates accurately with icons', () => {
    const today = new Date().toISOString();
    assert.match(formatRelativeDate(today), /Today|d ago|🔥/);

    const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString();
    assert.match(formatRelativeDate(twoYearsAgo), /2y ago 🪦/);

    assert.strictEqual(formatRelativeDate(null), 'Never');
  });

  test('scores individual repository between 10 and 100 deterministically', () => {
    const pristineRepo = {
      id: 1,
      name: 'super-app',
      hasReadme: true,
      description: 'Production-ready web application with auth and tests',
      homepage: 'https://superapp.com',
      topics: ['web', 'react'],
      pushedAt: new Date().toISOString(),
      license: 'MIT',
      isFork: false
    };

    const { score, breakdown } = scoreRepository(pristineRepo);
    assert.ok(score >= 80, `Expected score >= 80, got ${score}`);
    assert.ok(breakdown.length > 0);

    const abandonedRepo = {
      id: 2,
      name: 'test1',
      hasReadme: false,
      description: null,
      homepage: null,
      topics: [],
      pushedAt: '2020-01-01T00:00:00Z',
      license: null,
      isFork: false
    };

    const lowResult = scoreRepository(abandonedRepo);
    assert.ok(lowResult.score <= 30, `Expected low score <= 30, got ${lowResult.score}`);
  });

  test('generates repository-specific roast and rescue feedback', () => {
    const mysteriousRepo = {
      id: 3,
      name: 'mystery-box',
      hasReadme: false,
      description: null,
      language: 'JavaScript',
      homepage: null
    };

    const feedback = generateRepoFeedback(mysteriousRepo, 20);
    assert.ok(feedback.roast.length > 10, 'Should have repo roast');
    assert.ok(feedback.rescue.length > 10, 'Should have repo rescue');
    assert.match(feedback.roast, /ghost ship|no README/i);
    assert.match(feedback.rescue, /README/i);
  });

  test('filters and limits analyzed repositories to top 6', () => {
    const manyRepos = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `repo-${i + 1}`,
      stars: i,
      forks: i,
      isFork: false,
      hasReadme: i % 2 === 0,
      description: `Project ${i + 1}`,
      pushedAt: new Date().toISOString()
    }));

    const analyzed = analyzeRepositories(manyRepos);
    assert.strictEqual(analyzed.length, 6, 'Should limit to top 6 repositories');
    // Top repo should have the highest stars
    assert.strictEqual(analyzed[0].name, 'repo-15');
  });
});

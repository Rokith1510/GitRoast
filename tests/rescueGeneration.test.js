const { test, describe } = require('node:test');
const assert = require('node:assert');
const { calculateHealthScore } = require('../src/analysis/scorer');
const { generateRescuePlan } = require('../src/analysis/rescuer');

describe('Rescue Plan Engine Tests', () => {
  test('every criticism has a corresponding solution with required fields', () => {
    const user = {
      login: 'needs-help',
      bio: '',
      blog: '',
      location: null,
      followers: 0,
      hasProfileReadme: false
    };

    const repos = [
      { id: 1, name: 'repo-one', hasReadme: false, description: null, isFork: false, pushedAt: '2021-01-01T00:00:00Z' }
    ];

    const scoreData = calculateHealthScore(user, repos);
    const rescue = generateRescuePlan(user, repos, scoreData);

    assert.ok(rescue.allActions.length > 0, 'Should generate action items');

    rescue.allActions.forEach(item => {
      // Must contain Problem, Why it matters, Action to take, Priority, Estimated score improvement
      assert.ok(item.problem, 'Must have Problem');
      assert.ok(item.whyItMatters, 'Must have Why it matters');
      assert.ok(item.action, 'Must have Action to take');
      assert.ok(['High', 'Medium', 'Low'].includes(item.priority), `Invalid priority: ${item.priority}`);
      assert.ok(typeof item.estimatedScoreImprovement === 'number', 'Estimated improvement must be a number');
      assert.ok(item.estimatedScoreImprovement > 0, 'Improvement must be positive');
    });
  });

  test('generates Top 5 Fixes prioritized by leverage and impact', () => {
    const user = { login: 'fix-me', bio: '', hasProfileReadme: false };
    const repos = [
      { id: 1, name: 'r1', hasReadme: false, description: '', isFork: true },
      { id: 2, name: 'r2', hasReadme: false, description: '', isFork: true }
    ];

    const scoreData = calculateHealthScore(user, repos);
    const rescue = generateRescuePlan(user, repos, scoreData);

    assert.ok(rescue.top5Fixes.length <= 5, 'Top fixes should be at most 5');
    assert.ok(rescue.top5Fixes.length >= 3, 'Should have at least 3 top fixes for this profile');

    rescue.top5Fixes.forEach((fix, idx) => {
      assert.strictEqual(fix.rank, idx + 1);
      assert.ok(fix.title);
      assert.ok(fix.action);
      assert.ok(fix.whyItMatters);
      assert.ok(fix.estimatedScoreImprovement > 0);
    });
  });

  test('correctly categorizes High, Medium, and Low priorities', () => {
    const user = { login: 'dev', bio: 'Short bio' };
    const repos = [
      { id: 1, name: 'r1', hasReadme: false, description: null, isFork: false }
    ];

    const scoreData = calculateHealthScore(user, repos);
    const rescue = generateRescuePlan(user, repos, scoreData);

    assert.ok(Array.isArray(rescue.highPriority));
    assert.ok(Array.isArray(rescue.mediumPriority));
    assert.ok(Array.isArray(rescue.lowPriority));
    assert.strictEqual(
      rescue.highPriority.length + rescue.mediumPriority.length + rescue.lowPriority.length,
      rescue.totalActionsCount
    );
  });
});


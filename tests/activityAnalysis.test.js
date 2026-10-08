const { test, describe } = require('node:test');
const assert = require('node:assert');
const { calculateHealthScore } = require('../src/analysis/scorer');

describe('Activity and Momentum Analysis Tests', () => {
  test('recognizes active commit momentum within 14 days', () => {
    const user = { login: 'active-coder' };
    const now = new Date();
    const repos = [
      { id: 1, name: 'r1', pushedAt: now.toISOString(), isFork: false }
    ];

    const result = calculateHealthScore(user, repos);
    assert.strictEqual(result.stats.daysSinceLatestPush, 0);
    // Should get full recency points (8/8)
    const activityDeductions = result.categories.activity.deductions;
    const recencyDeduction = activityDeductions.find(d => d.item.includes('Inactivity') || d.item.includes('Graveyard'));
    assert.strictEqual(recencyDeduction, undefined, 'No recency deduction for active user');
  });

  test('penalizes severe inactivity when last push is over 6 months ago', () => {
    const user = { login: 'sleeping-coder' };
    const oldDate = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000); // 200 days ago
    const repos = [
      { id: 1, name: 'r1', pushedAt: oldDate.toISOString(), isFork: false }
    ];

    const result = calculateHealthScore(user, repos);
    assert.ok(result.stats.daysSinceLatestPush >= 199);
    const activityDeductions = result.categories.activity.deductions;
    const graveyardDeduction = activityDeductions.find(d => d.item === 'Digital Graveyard Syndrome');

    assert.ok(graveyardDeduction, 'Should flag Digital Graveyard Syndrome');
    assert.strictEqual(graveyardDeduction.points, 8);
  });

  test('flags zombie repositories untouched for over 2 years', () => {
    const user = { login: 'zombie-keeper' };
    const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000).toISOString();
    const repos = [
      { id: 1, name: 'zombie-1', pushedAt: threeYearsAgo, isArchived: false },
      { id: 2, name: 'zombie-2', pushedAt: threeYearsAgo, isArchived: false },
      { id: 3, name: 'fresh', pushedAt: new Date().toISOString(), isArchived: false }
    ];

    const result = calculateHealthScore(user, repos);
    const activityDeductions = result.categories.activity.deductions;
    const zombieDeduction = activityDeductions.find(d => d.item.includes('Zombie Projects'));

    assert.ok(zombieDeduction, 'Should identify unmaintained zombie projects');
  });
});

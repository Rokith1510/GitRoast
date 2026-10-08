const { test, describe } = require('node:test');
const assert = require('node:assert');
const { calculateHealthScore } = require('../src/analysis/scorer');

describe('Missing Repository Description Tests', () => {
  test('flags repositories with missing descriptions', () => {
    const user = { login: 'dev-without-desc' };
    const repos = [
      { id: 1, name: 'repo-one', description: null, isFork: false },
      { id: 2, name: 'repo-two', description: '   ', isFork: false },
      { id: 3, name: 'repo-three', description: 'Valid description of a cool web application', isFork: false }
    ];

    const scoreData = calculateHealthScore(user, repos);
    const deductions = scoreData.categories.projectQuality.deductions;
    const descDeduction = deductions.find(d => d.item === 'Missing Repository Descriptions');

    assert.ok(descDeduction, 'Should create deduction for missing descriptions');
    assert.ok(descDeduction.points > 0);
    assert.match(descDeduction.reason, /2 repository\(ies\) have no description/i);
  });

  test('awards full description points when all repositories have descriptions', () => {
    const user = { login: 'documented-dev' };
    const repos = [
      { id: 1, name: 'r1', description: 'Production API built with Express', isFork: false },
      { id: 2, name: 'r2', description: 'Real-time WebSocket chat client', isFork: false }
    ];

    const scoreData = calculateHealthScore(user, repos);
    const deductions = scoreData.categories.projectQuality.deductions;
    const descDeduction = deductions.find(d => d.item === 'Missing Repository Descriptions');

    assert.strictEqual(descDeduction, undefined, 'No deduction when all repos have descriptions');
  });
});


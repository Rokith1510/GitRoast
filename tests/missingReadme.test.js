const { test, describe } = require('node:test');
const assert = require('node:assert');
const { calculateHealthScore } = require('../src/analysis/scorer');

describe('Missing README Detection Tests', () => {
  test('flags missing profile README and deducts 6 points', () => {
    const userWithoutProfileReadme = {
      login: 'alice',
      hasProfileReadme: false,
      bio: 'Developer'
    };

    const repos = [
      { id: 1, name: 'proj1', isFork: false, hasReadme: true, description: 'Sample' }
    ];

    const result = calculateHealthScore(userWithoutProfileReadme, repos);
    const docDeductions = result.categories.documentation.deductions;
    const foundProfileReadmeDeduction = docDeductions.find(d => d.item === 'Missing Profile README');

    assert.ok(foundProfileReadmeDeduction, 'Should detect missing profile README');
    assert.strictEqual(foundProfileReadmeDeduction.points, 6);
  });

  test('penalizes repositories with missing README files proportionally', () => {
    const user = { login: 'bob', hasProfileReadme: true };
    // 4 repos, only 1 has README (25% coverage)
    const repos = [
      { id: 1, name: 'r1', isFork: false, hasReadme: true, description: 'desc' },
      { id: 2, name: 'r2', isFork: false, hasReadme: false, description: 'desc' },
      { id: 3, name: 'r3', isFork: false, hasReadme: false, description: 'desc' },
      { id: 4, name: 'r4', isFork: false, hasReadme: false, description: 'desc' }
    ];

    const result = calculateHealthScore(user, repos);
    const docDeductions = result.categories.documentation.deductions;
    const missingRepoReadmeDeduction = docDeductions.find(d => d.item === 'Missing Repository READMEs');

    assert.ok(missingRepoReadmeDeduction, 'Should find missing repository READMEs');
    assert.ok(missingRepoReadmeDeduction.points >= 8, 'Lost points should be substantial for 75% missing READMEs');
    assert.match(missingRepoReadmeDeduction.reason, /3 of your 4 original repositories lack a README/i);
  });

  test('does not deduct for missing repo README if all repos have README', () => {
    const user = { login: 'charlie', hasProfileReadme: true };
    const repos = [
      { id: 1, name: 'r1', isFork: false, hasReadme: true, description: 'desc', size: 100 },
      { id: 2, name: 'r2', isFork: false, hasReadme: true, description: 'desc', size: 100 }
    ];

    const result = calculateHealthScore(user, repos);
    const docDeductions = result.categories.documentation.deductions;
    const missingRepoReadme = docDeductions.find(d => d.item === 'Missing Repository READMEs');

    assert.strictEqual(missingRepoReadme, undefined, 'No deduction when all repos have README');
  });
});


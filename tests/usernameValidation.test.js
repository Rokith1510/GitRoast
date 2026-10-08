const { test, describe } = require('node:test');
const assert = require('node:assert');
const { validateGitHubUsername } = require('../src/utils/validator');

describe('GitHub Username Validation Tests', () => {
  test('accepts valid GitHub usernames', () => {
    const validNames = ['torvalds', 'gaearon', 'octocat', 'a-b-c', 'john-doe-123', 'A1'];
    validNames.forEach(name => {
      const result = validateGitHubUsername(name);
      assert.strictEqual(result.isValid, true, `Expected "${name}" to be valid`);
      assert.strictEqual(result.sanitizedUsername, name);
    });
  });

  test('cleans leading @ symbol if present', () => {
    const result = validateGitHubUsername('@torvalds');
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.sanitizedUsername, 'torvalds');
  });

  test('rejects empty or whitespace-only inputs', () => {
    assert.strictEqual(validateGitHubUsername('').isValid, false);
    assert.strictEqual(validateGitHubUsername('   ').isValid, false);
    assert.strictEqual(validateGitHubUsername(null).isValid, false);
    assert.strictEqual(validateGitHubUsername(undefined).isValid, false);
  });

  test('rejects usernames that start or end with a hyphen', () => {
    assert.strictEqual(validateGitHubUsername('-torvalds').isValid, false);
    assert.strictEqual(validateGitHubUsername('torvalds-').isValid, false);
  });

  test('rejects usernames with consecutive hyphens', () => {
    assert.strictEqual(validateGitHubUsername('tor--valds').isValid, false);
  });

  test('rejects usernames exceeding 39 characters', () => {
    const tooLong = 'a'.repeat(40);
    const result = validateGitHubUsername(tooLong);
    assert.strictEqual(result.isValid, false);
    assert.match(result.error, /exceed 39 characters/i);
  });

  test('rejects invalid special characters', () => {
    const invalidChars = ['user$name', 'john.doe', 'user!name', 'user/name', 'user_name'];
    invalidChars.forEach(name => {
      const result = validateGitHubUsername(name);
      assert.strictEqual(result.isValid, false, `Expected "${name}" to be invalid`);
    });
  });
});


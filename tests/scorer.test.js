const { test, describe } = require('node:test');
const assert = require('node:assert');
const { calculateHealthScore } = require('../src/analysis/scorer');

describe('Deterministic GitHub Health Scorer Tests', () => {
  const perfectUser = {
    login: 'star-dev',
    bio: 'Senior Full Stack Engineer building scalable web apps with Node & TypeScript.',
    blog: 'https://stardev.io',
    location: 'San Francisco, CA',
    company: 'Tech Corp',
    avatarUrl: 'https://avatars.githubusercontent.com/u/12345',
    followers: 25,
    hasProfileReadme: true
  };

  const perfectRepos = [
    {
      id: 1,
      name: 'star-dev',
      isFork: false,
      hasReadme: true,
      description: 'Config and profile showcase',
      homepage: 'https://stardev.io',
      language: 'Markdown',
      topics: ['profile'],
      size: 50,
      pushedAt: new Date().toISOString(),
      license: 'MIT'
    },
    {
      id: 2,
      name: 'app-engine',
      isFork: false,
      hasReadme: true,
      description: 'Distributed message broker in Go and Rust',
      homepage: 'https://app-engine.dev',
      language: 'Go',
      topics: ['broker', 'go'],
      size: 400,
      pushedAt: new Date().toISOString(),
      license: 'Apache-2.0'
    },
    {
      id: 3,
      name: 'frontend-portal',
      isFork: false,
      hasReadme: true,
      description: 'Accessible dashboard built with React and TypeScript',
      homepage: 'https://portal.dev',
      language: 'TypeScript',
      topics: ['react', 'dashboard'],
      size: 500,
      pushedAt: new Date().toISOString(),
      license: 'MIT'
    },
    {
      id: 4,
      name: 'data-pipelines',
      isFork: false,
      hasReadme: true,
      description: 'Stream processing pipelines in Python',
      homepage: 'https://pipeline.dev',
      language: 'Python',
      topics: ['python', 'streaming'],
      size: 300,
      pushedAt: new Date().toISOString(),
      license: 'MIT'
    }
  ];

  test('scores high-quality developer in top tier (85-100)', () => {
    const result = calculateHealthScore(perfectUser, perfectRepos);
    assert.ok(result.overallScore >= 85, `Expected score >= 85, got ${result.overallScore}`);
    assert.ok(result.overallScore <= 100);
    assert.strictEqual(result.categories.documentation.score <= 25, true);
    assert.strictEqual(result.categories.projectQuality.score <= 25, true);
    assert.strictEqual(result.categories.activity.score <= 20, true);
    assert.strictEqual(result.categories.professionalPresence.score <= 15, true);
    assert.strictEqual(result.categories.technicalDiversity.score <= 15, true);
  });

  test('handles completely empty profile gracefully without crashing', () => {
    const emptyUser = {
      login: 'ghost-user',
      bio: null,
      blog: null,
      location: null,
      company: null,
      avatarUrl: null,
      followers: 0,
      hasProfileReadme: false
    };

    const result = calculateHealthScore(emptyUser, []);
    assert.ok(result.overallScore >= 0 && result.overallScore <= 20);
    assert.strictEqual(result.profileLevel, 'Junior Ghost');
    assert.ok(result.potentialScore > result.overallScore);
    assert.strictEqual(result.potentialImprovement, result.potentialScore - result.overallScore);
    assert.ok(result.allDeductions.length > 0);
  });

  test('potential score mathematically matches recoverable points', () => {
    const messyUser = {
      login: 'messy-coder',
      bio: '',
      blog: '',
      followers: 0,
      hasProfileReadme: false
    };

    const messyRepos = [
      {
        id: 101,
        name: 'test-project',
        isFork: false,
        hasReadme: false,
        description: null,
        language: 'JavaScript',
        size: 15,
        pushedAt: '2022-01-01T00:00:00Z'
      }
    ];

    const result = calculateHealthScore(messyUser, messyRepos);
    assert.ok(result.potentialScore > result.overallScore);
    assert.strictEqual(result.potentialImprovement, result.potentialScore - result.overallScore);
    assert.ok(result.potentialScore <= 100);
  });
});

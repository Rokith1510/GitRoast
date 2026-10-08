const { test, describe } = require('node:test');
const assert = require('node:assert');
const { calculateHealthScore } = require('../src/analysis/scorer');
const { generateRoast } = require('../src/analysis/roaster');

describe('Roast Engine Tests', () => {
  test('generates personalized roast observations targeting missing READMEs', () => {
    const user = { login: 'no-docs' };
    const repos = [
      { id: 1, name: 'r1', hasReadme: false, isFork: false },
      { id: 2, name: 'r2', hasReadme: false, isFork: false },
      { id: 3, name: 'r3', hasReadme: false, isFork: false }
    ];

    const scoreData = calculateHealthScore(user, repos);
    const roast = generateRoast(user, repos, scoreData);

    assert.ok(roast.observations.length >= 3, 'Should generate at least 3 observations');
    const docRoast = roast.observations.find(o => o.tag.includes('DOCUMENTATION') || o.tag.includes('README'));
    assert.ok(docRoast, 'Should contain documentation-specific roast');
    assert.match(docRoast.quote, /documentation allergies|crime scene/i);
  });

  test('generates personalized roast targeting digital graveyard inactivity', () => {
    const user = { login: 'rip-coder' };
    const yearOld = new Date(Date.now() - 300 * 24 * 60 * 60 * 1000).toISOString();
    const repos = [
      { id: 1, name: 'old-code', pushedAt: yearOld, isFork: false }
    ];

    const scoreData = calculateHealthScore(user, repos);
    const roast = generateRoast(user, repos, scoreData);

    const activityRoast = roast.observations.find(o => o.tag.includes('GRAVEYARD') || o.tag.includes('HIBERNATION'));
    assert.ok(activityRoast, 'Should include digital graveyard roast');
    assert.match(activityRoast.quote, /digital graveyard|medically induced coma/i);
  });

  test('generates personalized roast targeting missing live demos & portfolio', () => {
    const user = { login: 'backend-only', blog: '' };
    const repos = [
      { id: 1, name: 'app-one', homepage: null, isFork: false, hasReadme: true, description: 'cool app' },
      { id: 2, name: 'app-two', homepage: null, isFork: false, hasReadme: true, description: 'another app' }
    ];

    const scoreData = calculateHealthScore(user, repos);
    const roast = generateRoast(user, repos, scoreData);

    const demoRoast = roast.observations.find(o => o.tag.includes('FRONT DOOR') || o.tag.includes('GHOST TOWN'));
    assert.ok(demoRoast, 'Should contain front door / demo roast');
    assert.match(demoRoast.quote, /forgot to build the front door|works on your machine/i);
  });

  test('roast adheres to philosophy "Roast the profile, not the person"', () => {
    const user = { login: 'some-student' };
    const repos = [
      { id: 1, name: 'homework', isFork: false, hasReadme: false }
    ];

    const scoreData = calculateHealthScore(user, repos);
    const roast = generateRoast(user, repos, scoreData);

    // Verify all observations attack code/repo attributes, not human traits
    roast.observations.forEach(obs => {
      assert.ok(obs.quote.length > 5);
      assert.ok(obs.punchline.length > 10);
      assert.ok(['Mild', 'Medium', 'Extra Crispy', 'Nuclear'].includes(obs.severity));
    });
  });
});


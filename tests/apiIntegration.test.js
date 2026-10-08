const { test, describe, before, after } = require('node:test');
const assert = require('node:assert');
const http = require('http');
const express = require('express');
const apiRoutes = require('../src/routes/api');

describe('API Route Integration Tests', () => {
  let server;
  let baseUrl;

  before(async () => {
    const app = express();
    app.use(express.json());
    app.use('/api', apiRoutes);

    await new Promise((resolve) => {
      // Pick random port for testing
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
  });

  test('GET /api/health returns 200 and system metadata', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
    assert.strictEqual(data.app, 'GitRoast');
    assert.ok(data.timestamp);
  });

  test('GET /api/roast/---invalid--- returns 400 with helpful error message', async () => {
    const res = await fetch(`${baseUrl}/api/roast/---invalid---`);
    assert.strictEqual(res.status, 400);
    const data = await res.json();
    assert.strictEqual(data.success, false);
    assert.strictEqual(data.error, 'Invalid Username');
    assert.ok(data.message.includes('Invalid GitHub username format'));
  });

  test('GET /api/rate-limit returns rate limit object', async () => {
    const res = await fetch(`${baseUrl}/api/rate-limit`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data.limit === 'number');
    assert.ok(typeof data.remaining === 'number');
  });
});

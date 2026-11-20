import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import app from '../src/index.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function withServer(run) {
  const server = app.listen(0);
  try { await run(`http://127.0.0.1:${server.address().port}`); }
  finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}

test('health endpoint responds without a database connection', async () => {
  await withServer(async (origin) => {
    const response = await fetch(`${origin}/api/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok', service: 'valverdes-api' });
  });
});

test('catalog importer preserves the 119 unique legacy catalog entries', async () => {
  const { readCatalog } = await import('../src/catalog.js');
  const catalog = readCatalog();
  assert.equal(catalog.length, 119);
  assert.ok(catalog.every((product) => fs.existsSync(path.join(root, product.image))));
});

test('auth endpoints validate registration and protect current-user lookup', async () => {
  await withServer(async (origin) => {
    const register = await fetch(`${origin}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({})
    });
    assert.equal(register.status, 400);
    const currentUser = await fetch(`${origin}/api/auth/me`);
    assert.equal(currentUser.status, 401);
  });
});

/** Kiểm thử interceptor: refresh đồng thời, chuẩn hóa lỗi và giữ đúng kiểu lưu phiên. */
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { setupServer } from 'msw/node';
import { http, HttpResponse, delay } from 'msw';
import axios from 'axios';

function storage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  };
}
globalThis.localStorage = storage();
globalThis.sessionStorage = storage();
globalThis.location = new URL('http://localhost');
globalThis.window = { location: { pathname: '/movies', search: '?genre=action', href: '' } };
axios.defaults.baseURL = 'http://localhost';
const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
const { default: client } = await vite.ssrLoadModule('/src/lib/httpClient.ts');
const tokens = await vite.ssrLoadModule('/src/lib/tokenStorage.ts');
client.defaults.baseURL = 'http://localhost/api/v1';
let refreshes = 0;
let failRefresh = false;
const server = setupServer(
  http.get('http://localhost/api/v1/protected', ({ request }) =>
    request.headers.get('authorization') === 'Bearer refreshed'
      ? HttpResponse.json({ ok: true })
      : HttpResponse.json(
          { status: 401, code: 'UNAUTHORIZED', message: 'common.sessionExpired' },
          { status: 401 },
        ),
  ),
  http.post('http://localhost/api/v1/auth/refresh', async () => {
    refreshes++;
    await delay(30);
    return failRefresh
      ? HttpResponse.json(
          { status: 401, code: 'INVALID_TOKEN', message: 'common.sessionExpired' },
          { status: 401 },
        )
      : HttpResponse.json({
          accessToken: 'refreshed',
          refreshToken: 'next-refresh',
          expiresIn: 3600,
        });
  }),
  http.post('http://localhost/api/v1/auth/login', () =>
    HttpResponse.json(
      { status: 401, code: 'AUTH_FAILED', message: 'errors.loginFailed' },
      { status: 401 },
    ),
  ),
);
server.listen({ onUnhandledFrame: 'error' });
let timer;
async function bounded(promise) {
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Request bị treo ở hàng đợi refresh')), 3000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
try {
  tokens.saveTokens('old', 'refresh', false);
  const responses = await bounded(
    Promise.all([client.get('/protected'), client.get('/protected'), client.get('/protected')]),
  );
  assert.ok(responses.every((response) => response.data.ok));
  assert.equal(refreshes, 1);
  assert.equal(tokens.remembersSession(), false);
  assert.equal(localStorage.getItem('tc_access_token'), null);
  assert.equal(sessionStorage.getItem('tc_access_token'), 'refreshed');
  tokens.saveTokens('old', 'refresh', true);
  sessionStorage.clear();
  localStorage.removeItem('tc_refresh_token');
  await assert.rejects(
    bounded(client.get('/protected')),
    (error) => error.status === 401 && error.code === 'UNAUTHORIZED',
  );
  assert.equal(refreshes, 1);
  tokens.saveTokens('old', 'refresh', false);
  assert.equal((await bounded(client.get('/protected'))).data.ok, true);
  assert.equal(refreshes, 2);
  await assert.rejects(client.post('/auth/login', {}), (error) => error.code === 'AUTH_FAILED');
  assert.equal(refreshes, 2);
  tokens.saveTokens('old', 'refresh', false);
  failRefresh = true;
  const failures = await bounded(
    Promise.allSettled([client.get('/protected'), client.get('/protected')]),
  );
  assert.ok(
    failures.every(
      (result) =>
        result.status === 'rejected' &&
        result.reason.status === 401 &&
        result.reason.code === 'UNAUTHORIZED',
    ),
  );
  assert.equal(tokens.getAccessToken(), null);
  assert.equal(globalThis.window.location.href, '/login?redirect=%2Fmovies%3Fgenre%3Daction');
  console.log(
    'PASS: refresh đồng thời một lần, không treo khi thiếu token, giữ lựa chọn lưu phiên, không refresh lỗi login và chuẩn hóa lỗi hàng đợi.',
  );
} finally {
  server.close();
  await vite.close();
}

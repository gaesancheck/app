import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
import { createServer } from 'node:http';

const PORT = Number(process.env.AUTH_PORT || 3000);
const HOST = process.env.AUTH_HOST || '0.0.0.0';
const API_BASE_URL = new URL(process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const APP_REDIRECT_URI = 'pawstep://login';
const APP_CODE_TTL_MS = 5 * 60 * 1000;
const GOOGLE_STATE_TTL_MS = 10 * 60 * 1000;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
const JWT_SECRET = process.env.JWT_SECRET || randomBytes(32).toString('hex');

const googleStates = new Map();
const appCodes = new Map();

if (!['http:', 'https:'].includes(API_BASE_URL.protocol) || API_BASE_URL.pathname !== '/' ||
    API_BASE_URL.search || API_BASE_URL.hash || API_BASE_URL.username || API_BASE_URL.password) {
  throw new Error('PUBLIC_BASE_URL must be an origin such as https://auth.example.com');
}

function json(response, status, value) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization',
  });
  response.end(JSON.stringify(value));
}

function redirect(response, location) {
  response.writeHead(302, { location, 'cache-control': 'no-store' });
  response.end();
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 16_384) throw new Error('Request body is too large');
  }
  if (!body) return {};
  const value = JSON.parse(body);
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Expected a JSON object');
  }
  return value;
}

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function createSession(user, keepMeLoggedIn) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: 'pawstep-temporary-auth',
    sub: `${user.provider}:${user.id}`,
    provider: user.provider,
    name: user.name || null,
    email: user.email || null,
    picture: user.picture || null,
    iat: now,
    ...(keepMeLoggedIn ? {} : { exp: now + SESSION_TTL_SECONDS }),
  };
  const unsigned = `${base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))}.${base64url(JSON.stringify(payload))}`;
  const signature = createHmac('sha256', JWT_SECRET).update(unsigned).digest('base64url');
  return {
    access_token: `${unsigned}.${signature}`,
    expires_in: keepMeLoggedIn ? -1 : SESSION_TTL_SECONDS,
  };
}

function makeAppRedirect(redirectUri, state, values = {}) {
  const target = new URL(redirectUri);
  target.searchParams.set('state', state);
  for (const [key, value] of Object.entries(values)) {
    if (value) target.searchParams.set(key, value);
  }
  return target.toString();
}

function validAppRedirect(value) {
  return value === APP_REDIRECT_URI;
}

function cleanExpiredRecords() {
  const now = Date.now();
  for (const [key, value] of googleStates) {
    if (value.expiresAt <= now) googleStates.delete(key);
  }
  for (const [key, value] of appCodes) {
    if (value.expiresAt <= now) appCodes.delete(key);
  }
}

async function googleAuthorize(request, response) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return json(response, 503, { message: 'Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local.' });
  }
  const params = new URL(request.url, API_BASE_URL);
  const appState = params.searchParams.get('state') || '';
  const redirectUri = params.searchParams.get('redirect_uri') || '';
  const challenge = params.searchParams.get('code_challenge') || '';
  const challengeMethod = params.searchParams.get('code_challenge_method') || '';
  if (!/^[a-f0-9]{64}$/i.test(appState) || !validAppRedirect(redirectUri) ||
      !/^[A-Za-z0-9_-]{43}$/.test(challenge) || challengeMethod !== 'S256') {
    return json(response, 400, { message: 'Invalid OAuth state, redirect URI, or PKCE challenge.' });
  }

  cleanExpiredRecords();
  const googleState = randomBytes(32).toString('hex');
  googleStates.set(googleState, {
    appState,
    redirectUri,
    challenge,
    keepMeLoggedIn: params.searchParams.get('keep_me_logged_in') === 'true',
    expiresAt: Date.now() + GOOGLE_STATE_TTL_MS,
  });

  const callbackUri = new URL('/v1/auth/oauth/google/callback', API_BASE_URL).toString();
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', callbackUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('state', googleState);
  authUrl.searchParams.set('prompt', 'select_account');
  redirect(response, authUrl.toString());
}

async function googleCallback(request, response) {
  const params = new URL(request.url, API_BASE_URL).searchParams;
  const googleState = params.get('state') || '';
  const state = googleStates.get(googleState);
  if (!state || state.expiresAt <= Date.now()) {
    return json(response, 400, { message: 'OAuth state expired. Start login again.' });
  }
  googleStates.delete(googleState);

  const providerError = params.get('error');
  if (providerError) {
    const error = providerError === 'access_denied' ? 'access_denied' : 'server_error';
    return redirect(response, makeAppRedirect(state.redirectUri, state.appState, { error }));
  }
  const providerCode = params.get('code');
  if (!providerCode || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return redirect(response, makeAppRedirect(state.redirectUri, state.appState, { error: 'server_error' }));
  }

  try {
    const callbackUri = new URL('/v1/auth/oauth/google/callback', API_BASE_URL).toString();
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: providerCode,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUri,
        grant_type: 'authorization_code',
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!tokenResponse.ok) throw new Error('Google token exchange failed');
    const token = await tokenResponse.json();
    if (typeof token.access_token !== 'string' || !token.access_token) {
      throw new Error('Google did not return an access token');
    }

    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { authorization: `Bearer ${token.access_token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!profileResponse.ok) throw new Error('Google profile request failed');
    const profile = await profileResponse.json();
    if (typeof profile.sub !== 'string' || !profile.sub) throw new Error('Google profile is incomplete');

    const appCode = randomBytes(32).toString('hex');
    appCodes.set(appCode, {
      state: state.appState,
      redirectUri: state.redirectUri,
      challenge: state.challenge,
      keepMeLoggedIn: state.keepMeLoggedIn,
      expiresAt: Date.now() + APP_CODE_TTL_MS,
      user: {
        provider: 'google',
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
      },
    });
    redirect(response, makeAppRedirect(state.redirectUri, state.appState, { code: appCode }));
  } catch (error) {
    console.error('Google OAuth callback failed:', error instanceof Error ? error.message : 'unknown error');
    redirect(response, makeAppRedirect(state.redirectUri, state.appState, { error: 'server_error' }));
  }
}

async function exchangeGoogle(request, response) {
  const body = await readJson(request);
  if (typeof body.code !== 'string' || typeof body.state !== 'string' ||
      typeof body.code_verifier !== 'string' || body.redirect_uri !== APP_REDIRECT_URI) {
    return json(response, 400, { message: 'Invalid Google code exchange request.' });
  }

  cleanExpiredRecords();
  const pending = appCodes.get(body.code);
  if (!pending || pending.expiresAt <= Date.now() || pending.state !== body.state ||
      pending.redirectUri !== body.redirect_uri || !/^[A-Za-z0-9._~-]{43,128}$/.test(body.code_verifier)) {
    return json(response, 401, { message: 'Google login code is invalid or expired.' });
  }
  const actualChallenge = createHash('sha256').update(body.code_verifier).digest('base64url');
  const expected = Buffer.from(pending.challenge);
  const actual = Buffer.from(actualChallenge);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return json(response, 401, { message: 'Google login verification failed.' });
  }
  appCodes.delete(body.code);
  json(response, 200, createSession(pending.user, pending.keepMeLoggedIn));
}

async function providerProfile(provider, accessToken) {
  const endpoint = provider === 'naver'
    ? 'https://openapi.naver.com/v1/nid/me'
    : 'https://kapi.kakao.com/v2/user/me';
  const result = await fetch(endpoint, {
    headers: { authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!result.ok) throw new Error(`${provider} token was rejected`);
  const data = await result.json();

  if (provider === 'naver') {
    const profile = data.response;
    if (data.resultcode !== '00' || !profile?.id) throw new Error('Naver profile is incomplete');
    return {
      provider,
      id: String(profile.id),
      name: profile.name || profile.nickname,
      email: profile.email,
      picture: profile.profile_image,
    };
  }

  if (!data.id) throw new Error('Kakao profile is incomplete');
  return {
    provider,
    id: String(data.id),
    name: data.kakao_account?.profile?.nickname,
    email: data.kakao_account?.email,
    picture: data.kakao_account?.profile?.profile_image_url,
  };
}

async function exchangeNative(provider, request, response) {
  const body = await readJson(request);
  if (typeof body.access_token !== 'string' || body.access_token.length < 10 || body.access_token.length > 8192 ||
      typeof body.keep_me_logged_in !== 'boolean') {
    return json(response, 400, { message: 'Invalid provider token exchange request.' });
  }
  try {
    const user = await providerProfile(provider, body.access_token);
    return json(response, 200, createSession(user, body.keep_me_logged_in));
  } catch (error) {
    console.error(`${provider} token verification failed:`, error instanceof Error ? error.message : 'unknown error');
    return json(response, 401, { message: `${provider} login verification failed.` });
  }
}

const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-allow-headers': 'content-type, authorization' });
    return response.end();
  }

  const url = new URL(request.url, API_BASE_URL);
  try {
    if (request.method === 'GET' && url.pathname === '/health') {
      return json(response, 200, { ok: true, googleConfigured: Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) });
    }
    if (request.method === 'GET' && url.pathname === '/v1/auth/oauth/google/authorize') {
      return await googleAuthorize(request, response);
    }
    if (request.method === 'GET' && url.pathname === '/v1/auth/oauth/google/callback') {
      return await googleCallback(request, response);
    }
    if (request.method === 'POST' && url.pathname === '/v1/auth/oauth/google/exchange') {
      return await exchangeGoogle(request, response);
    }
    const nativeMatch = url.pathname.match(/^\/v1\/auth\/oauth\/(naver|kakao)\/exchange$/);
    if (request.method === 'POST' && nativeMatch) {
      return await exchangeNative(nativeMatch[1], request, response);
    }
    return json(response, 404, { message: 'Not found' });
  } catch (error) {
    const message = error instanceof SyntaxError ? 'Malformed JSON body' : 'Temporary auth server error';
    return json(response, error instanceof SyntaxError ? 400 : 500, { message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Temporary OAuth server listening at http://${HOST}:${PORT}`);
  console.log(`Public OAuth callback base: ${API_BASE_URL.origin}`);
  console.log(`Google OAuth: ${GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET ? 'configured' : 'not configured'}`);
  if (!process.env.JWT_SECRET) console.log('JWT_SECRET not set; sessions will be invalidated when this process restarts.');
});

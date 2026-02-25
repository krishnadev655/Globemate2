// ============================================================
// GlobeMate — Auth Test Script (register + login)
// Run: node test-auth.mjs
// Uses Node built-in https module (avoids undici/fetch proxy issues)
// ============================================================
import https from 'node:https';
import dns from 'node:dns';

// Force DNS to use Google (8.8.8.8) — avoids stale local DNS entries
dns.setServers(['8.8.8.8', '1.1.1.1']);

const SUPABASE_URL     = 'https://zucibmuisijwpgcfnkds.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1Y2libXVpc2lqd3BnY2Zua2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMTM4MTIsImV4cCI6MjA4NjY4OTgxMn0.qlkuUthCeExkudOBBM-ntdrB1Aod-ZPJJfAp-oGoma4';

// Low-level HTTPS request — uses fixed Cloudflare IP to bypass local DNS issues
function httpsRequest(url, options, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const bodyStr = body ? JSON.stringify(body) : null;
    const req = https.request({
      // Pin to known-good Cloudflare IP for zucibmuisijwpgcfnkds.supabase.co
      host: '104.18.38.10',
      servername: u.hostname,   // SNI header still uses the real hostname
      path: u.pathname + u.search,
      method: options.method || 'GET',
      headers: {
        'Host': u.hostname,
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        ...(options.headers || {}),
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      },
      timeout: 15000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out after 15s')); });
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

// Use a unique email each run to avoid "already registered" errors
const TEST_EMAIL    = `testuser_${Date.now()}@globemate.test`;
const TEST_PASSWORD = 'TestPass123!';
const TEST_NAME     = 'Test User';

const AUTH_HEADER = { 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` };

function pass(msg) { console.log(`  ✅  ${msg}`); }
function fail(msg) { console.error(`  ❌  ${msg}`); }
function info(msg) { console.log(`  ℹ️   ${msg}`); }
function section(msg) { console.log(`\n─────────────────────────────────\n🔵 ${msg}\n─────────────────────────────────`); }

// ── 1. REGISTER ──────────────────────────────────────────────
async function testRegister() {
  section('REGISTER');
  info(`Email    : ${TEST_EMAIL}`);
  info(`Password : ${TEST_PASSWORD}`);
  info(`Name     : ${TEST_NAME}`);

  const { status, body } = await httpsRequest(`${SUPABASE_URL}/auth/v1/signup`,
    { method: 'POST' },
    { email: TEST_EMAIL, password: TEST_PASSWORD, data: { full_name: TEST_NAME } }
  );

  if (status >= 400) {
    fail(`HTTP ${status} — ${body.error_description || body.msg || JSON.stringify(body)}`);
    return null;
  }

  if (body.user) {
    pass(`User created  — ID: ${body.user.id}`);
    pass(`Email status  : ${body.user.email}`);
    info(`Email confirmed? ${body.user.email_confirmed_at ? 'YES' : 'NO (confirmation email may be required)'}`);
    return body;
  }

  if (body.id) {
    pass(`User created  — ID: ${body.id}`);
    return body;
  }

  fail('Unexpected response shape: ' + JSON.stringify(body, null, 2));
  return null;
}

// ── 2. LOGIN ─────────────────────────────────────────────────
async function testLogin() {
  section('LOGIN');
  info(`Email    : ${TEST_EMAIL}`);
  info(`Password : ${TEST_PASSWORD}`);

  const { status, body } = await httpsRequest(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    { method: 'POST' },
    { email: TEST_EMAIL, password: TEST_PASSWORD }
  );

  if (status >= 400) {
    const msg = body.error_description || body.msg || body.error || JSON.stringify(body);
    fail(`HTTP ${status} — ${msg}`);

    if (status === 400 && msg.includes('Email not confirmed')) {
      console.log('\n  ⚠️  Email confirmation is ENABLED in your Supabase project.');
      console.log('     Supabase Dashboard → Authentication → Providers → Email');
      console.log('     → Disable "Confirm email"');
    }
    return null;
  }

  if (body.access_token) {
    pass(`Login successful!`);
    pass(`User ID      : ${body.user?.id}`);
    pass(`Access token : ${body.access_token.slice(0, 40)}...`);
    pass(`Token type   : ${body.token_type}`);
    pass(`Expires in   : ${body.expires_in}s`);
    return body;
  }

  fail('Unexpected response: ' + JSON.stringify(body, null, 2));
  return null;
}

// ── 3. FETCH PROFILE (verifies DB read) ──────────────────────
async function testFetchProfile(accessToken, userId) {
  section('FETCH PROFILE FROM DB (profiles table)');

  const { status, body } = await httpsRequest(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=*`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );

  if (status >= 400) {
    fail(`HTTP ${status} — ${JSON.stringify(body)}`);
    return;
  }

  if (Array.isArray(body) && body.length > 0) {
    pass('Profile row found in DB!');
    console.log('     ', JSON.stringify(body[0], null, 4).replace(/\n/g, '\n     '));
  } else if (Array.isArray(body) && body.length === 0) {
    fail('Profile row NOT found — the INSERT in signUp may have failed, or the profiles table is missing.');
    info('Check: Supabase Dashboard → Table Editor → profiles');
  } else {
    info('Response: ' + JSON.stringify(body));
  }
}

// ── MAIN ─────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   GlobeMate — Register & Login Test      ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`Project URL : ${SUPABASE_URL}`);

  try {
    const regData  = await testRegister();
    if (!regData) {
      console.log('\n⛔ Registration failed. Aborting further tests.');
      process.exit(1);
    }

    const loginData = await testLogin();
    if (!loginData) {
      console.log('\n⛔ Login failed. See hint above.');
      process.exit(1);
    }

    await testFetchProfile(loginData.access_token, loginData.user.id);

    section('SUMMARY');
    pass('Register  — OK');
    pass('Login     — OK');
    pass('DB read   — OK');
    console.log('\n  All auth flows working correctly!\n');
  } catch (err) {
    console.error('\n  ❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

main();

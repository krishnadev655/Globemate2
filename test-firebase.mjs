// ============================================================
//  GlobeMate — Firebase Auth Test (REST API, no npm needed)
//  Uses Firebase Identity Toolkit REST API directly
//  Run: node test-firebase.mjs
// ============================================================

const API_KEY = 'AIzaSyCirIpD00mQImLtL_495iDiZFoezJ4K0a8';
const BASE    = `https://identitytoolkit.googleapis.com/v1/accounts`;

// Test credentials — uses a timestamp so every run is a fresh email
const TEST_EMAIL    = `testuser_${Date.now()}@globemate.test`;
const TEST_PASSWORD = 'TestPass@123';
const TEST_NAME     = 'GlobeMate Tester';

let passed = 0;
let failed = 0;

function log(label, ok, detail = '') {
  const icon = ok ? '✅' : '❌';
  console.log(`${icon}  ${label}${detail ? ' — ' + detail : ''}`);
  ok ? passed++ : failed++;
}

async function firebasePost(endpoint, body) {
  const res = await fetch(`${BASE}:${endpoint}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json();
  return { ok: res.ok, status: res.status, data: json };
}

// ── TEST 1: Register new user ─────────────────────────────
async function testRegister() {
  console.log('\n── Registration ──────────────────────────────────────');
  const { ok, data } = await firebasePost('signUp', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    returnSecureToken: true
  });

  log('Sign-up request succeeds (HTTP 200)', ok, ok ? '' : data?.error?.message);
  log('idToken received',   !!data.idToken,   data.idToken   ? 'present' : 'missing');
  log('localId (UID) received', !!data.localId, data.localId ?? 'missing');
  log('Email matches',      data.email === TEST_EMAIL, data.email);

  return data; // return for login test
}

// ── TEST 2: Login with same credentials ───────────────────
async function testLogin() {
  console.log('\n── Login ─────────────────────────────────────────────');
  const { ok, data } = await firebasePost('signInWithPassword', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    returnSecureToken: true
  });

  log('Sign-in request succeeds (HTTP 200)', ok, ok ? '' : data?.error?.message);
  log('idToken received',   !!data.idToken,   data.idToken   ? 'present' : 'missing');
  log('refreshToken received', !!data.refreshToken, data.refreshToken ? 'present' : 'missing');
  log('Email matches',      data.email === TEST_EMAIL, data.email);
  log('expiresIn present',  !!data.expiresIn, `${data.expiresIn}s`);
}

// ── TEST 3: Wrong password should fail ───────────────────
async function testWrongPassword() {
  console.log('\n── Wrong Password (should fail) ──────────────────────');
  const { ok, data } = await firebasePost('signInWithPassword', {
    email: TEST_EMAIL,
    password: 'WrongPass999!',
    returnSecureToken: true
  });

  log('Request correctly rejected (not 200)', !ok, `HTTP status / error: ${data?.error?.message}`);
  log('No idToken returned on bad password', !data.idToken);
}

// ── TEST 4: Duplicate email should fail ──────────────────
async function testDuplicateEmail() {
  console.log('\n── Duplicate Email (should fail) ─────────────────────');
  const { ok, data } = await firebasePost('signUp', {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    returnSecureToken: true
  });

  log('Duplicate sign-up correctly rejected', !ok, data?.error?.message);
}

// ── RUN ALL ───────────────────────────────────────────────
(async () => {
  console.log('🔥 GlobeMate Firebase Auth Test');
  console.log(`   Project : globemate-1e954`);
  console.log(`   Email   : ${TEST_EMAIL}`);

  try {
    await testRegister();
    await testLogin();
    await testWrongPassword();
    await testDuplicateEmail();
  } catch (err) {
    console.error('\n💥 Unexpected error:', err.message);
    failed++;
  }

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`   Results: ${passed} passed  |  ${failed} failed`);
  if (failed === 0) {
    console.log('   🎉 All tests passed — Firebase Auth is working!\n');
  } else {
    console.log('   ⚠️  Some tests failed — check errors above.\n');
  }
})();

import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../backend/src/config/db.js';
import { runSeed } from '../backend/src/seed/seed.js';
import apiRoutes from '../backend/src/routes/apiRoutes.js';

function post(url: string, body: any, token?: string): Promise<{ status: number; body: any }> {
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify(body)
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    return { status: res.status, body: data };
  });
}

function get(url: string, token?: string): Promise<{ status: number; body: any }> {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}));
    return { status: res.status, body: data };
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 BookYourDay - Authentication Suite Verification');
  console.log('====================================================\n');

  // Step 1: Connect to Database & Seed
  console.log('📦 Step 1: Connecting to isolated Test Database & Seeding...');
  let memServer: any = null;
  let connected = await connectDB();
  if (!connected) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memServer = await MongoMemoryServer.create();
    const memUri = memServer.getUri();
    await mongoose.connect(memUri, { dbName: 'book-your-day-test' });
    connected = true;
    console.log(`✅ Connected to test MongoMemoryServer at ${memUri}`);
  }
  await runSeed();
  console.log('✅ Database connected and seeded with demo accounts.\n');

  // Step 2: Launch Test Server
  const app = express();
  app.use(express.json());
  const resolvedApiRoutes = (apiRoutes as any).default || apiRoutes;
  app.use('/api', resolvedApiRoutes);

  const server = app.listen(0);
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api`;
  console.log(`🌐 Test API Server listening at ${baseUrl}\n`);

  let userToken = '';
  let partnerToken = '';
  let adminToken = '';

  try {
    // 1. Valid user login
    console.log('TEST 1: Valid User Login (Alex Mercer)');
    const res1 = await post(`${baseUrl}/auth/login`, {
      email: 'alex.mercer@example.com',
      password: 'password123'
    });

    if (res1.status === 200 && res1.body.success === true && res1.body.token && (res1.body.user?.name || res1.body.data?.name)) {
      userToken = res1.body.token;
      const userName = res1.body.user?.name || res1.body.data?.name;
      const userRole = res1.body.user?.role || res1.body.data?.role;
      console.log('  ✅ PASS: HTTP 200, Token issued, User:', userName, 'Role:', userRole);
      console.log('  Data envelope check: data.token exists:', Boolean(res1.body.data?.token), 'data.user exists:', Boolean(res1.body.data?.user));
    } else {
      console.error('  ❌ FAIL: Status:', res1.status, res1.body);
      process.exit(1);
    }

    // 2. Invalid password
    console.log('\nTEST 2: Invalid Password');
    const res2 = await post(`${baseUrl}/auth/login`, {
      email: 'alex.mercer@example.com',
      password: 'wrongpassword'
    });

    if (res2.status === 401 && res2.body.success === false && res2.body.error?.code === 'INVALID_CREDENTIALS') {
      console.log('  ✅ PASS: HTTP 401 correctly returned for invalid password:', res2.body.message);
    } else {
      console.error('  ❌ FAIL: Status:', res2.status, res2.body);
      process.exit(1);
    }

    // 3. Nonexistent email
    console.log('\nTEST 3: Nonexistent Email (Must return 401 and NOT auto-create user)');
    const res3 = await post(`${baseUrl}/auth/login`, {
      email: 'completely_nonexistent_user_987654@test.com',
      password: 'password123'
    });

    if (res3.status === 401 && res3.body.success === false && res3.body.error?.code === 'USER_NOT_FOUND') {
      console.log('  ✅ PASS: HTTP 401 correctly returned for nonexistent email:', res3.body.message);
    } else {
      console.error('  ❌ FAIL: Nonexistent email did not return 401! Status:', res3.status, res3.body);
      process.exit(1);
    }

    // 4. User demo login
    console.log('\nTEST 4: User Demo Login (alex.mercer@example.com)');
    const res4 = await post(`${baseUrl}/auth/login`, {
      email: 'alex.mercer@example.com',
      password: 'password123'
    });

    if (res4.status === 200 && (res4.body.user?.role === 'user' || res4.body.data?.role === 'user')) {
      console.log('  ✅ PASS: Demo User verified with role "user"');
    } else {
      console.error('  ❌ FAIL: Demo User failed:', res4.body);
      process.exit(1);
    }

    // 5. Partner demo login
    console.log('\nTEST 5: Partner Demo Login (partner@bookyourday.com)');
    const res5 = await post(`${baseUrl}/auth/login`, {
      email: 'partner@bookyourday.com',
      password: 'password123'
    });

    if (res5.status === 200 && (res5.body.user?.role === 'partner' || res5.body.data?.role === 'partner')) {
      partnerToken = res5.body.token;
      console.log('  ✅ PASS: Demo Partner verified with role "partner"');
    } else {
      console.error('  ❌ FAIL: Demo Partner failed:', res5.body);
      process.exit(1);
    }

    // 6. Admin demo login
    console.log('\nTEST 6: Admin Demo Login (admin@bookyourday.com)');
    const res6 = await post(`${baseUrl}/auth/login`, {
      email: 'admin@bookyourday.com',
      password: 'password123'
    });

    if (res6.status === 200 && (res6.body.user?.role === 'admin' || res6.body.data?.role === 'admin')) {
      adminToken = res6.body.token;
      console.log('  ✅ PASS: Demo Admin verified with role "admin"');
    } else {
      console.error('  ❌ FAIL: Demo Admin failed:', res6.body);
      process.exit(1);
    }

    // 7. Token persistence / protected route access
    console.log('\nTEST 7: Token Validation on Protected Route (GET /api/users/profile)');
    const res7 = await get(`${baseUrl}/users/profile`, userToken);

    if (res7.status === 200 && res7.body.success === true && res7.body.data?.email) {
      console.log('  ✅ PASS: Protected profile accessed with JWT. User:', res7.body.data.name, 'Email:', res7.body.data.email, 'Role:', res7.body.data.role);
    } else {
      console.error('  ❌ FAIL: Protected profile failed:', res7.status, res7.body);
      process.exit(1);
    }

    // 8. Logout / Subsequent protected route access without token
    console.log('\nTEST 8: Protected Route Access Without Token (Simulating Post-Logout)');
    const res8 = await get(`${baseUrl}/users/profile`);

    if (res8.status === 401 && res8.body.success === false) {
      console.log('  ✅ PASS: Access denied (HTTP 401) without token post-logout:', res8.body.message);
    } else {
      console.error('  ❌ FAIL: Protected route allowed access without token! Status:', res8.status);
      process.exit(1);
    }

    // 9. Protected route with corrupted "undefined" token
    console.log('\nTEST 9: Protected Route With Corrupted "undefined" Token');
    const res9 = await get(`${baseUrl}/users/profile`, 'undefined');

    if (res9.status === 401 && res9.body.success === false) {
      console.log('  ✅ PASS: Corrupted "undefined" token correctly rejected with HTTP 401');
    } else {
      console.error('  ❌ FAIL: Corrupted token not rejected! Status:', res9.status);
      process.exit(1);
    }

    // 10. Partner and Admin protected access
    console.log('\nTEST 10: Partner and Admin Token Validation');
    const partnerProfile = await get(`${baseUrl}/users/profile`, partnerToken);
    const adminProfile = await get(`${baseUrl}/users/profile`, adminToken);

    if (partnerProfile.status === 200 && partnerProfile.body.data?.role === 'partner' &&
        adminProfile.status === 200 && adminProfile.body.data?.role === 'admin') {
      console.log('  ✅ PASS: Partner & Admin role identities strictly preserved and verified.');
    } else {
      console.error('  ❌ FAIL: Partner or Admin profile verification failed');
      process.exit(1);
    }

    console.log('\n====================================================');
    console.log('🎉 ALL 10 AUTHENTICATION TESTS PASSED WITH 100% SUCCESS!');
    console.log('====================================================\n');
  } finally {
    server.close();
    if (memServer) {
      await mongoose.disconnect();
      await memServer.stop();
    }
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

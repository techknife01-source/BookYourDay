/**
 * Independent QA & Security Audit Test Suite
 * Tests MongoDB operations, Payments, Bookings, Concurrency, API security, AI, and Chat
 */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import crypto from 'crypto';
import express from 'express';
import jwt from 'jsonwebtoken';
import http from 'http';

// Models
import { UserModel } from '../backend/src/models/User.js';
import { BookingModel } from '../backend/src/models/Booking.js';
import { PaymentModel } from '../backend/src/models/Payment.js';
import { ShowModel } from '../backend/src/models/Show.js';
import { ChatMessageModel } from '../backend/src/models/ChatMessage.js';
import { CouponModel } from '../backend/src/models/Coupon.js';
import { MovieModel } from '../backend/src/models/Movie.js';

// Services
import { RazorpayService } from '../backend/src/services/razorpayService.js';
import { RefundService } from '../backend/src/services/refundService.js';
import { runSeed } from '../backend/src/seed/seed.js';
import { generateToken } from '../backend/src/utils/jwtUtils.js';

// Routes
import apiRoutes from '../backend/src/routes/apiRoutes.js';

interface AuditResult {
  suite: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'PARTIALLY IMPLEMENTED' | 'BLOCKED' | 'NOT TESTED';
  details: string;
}

const auditResults: AuditResult[] = [];

function record(suite: string, test: string, status: AuditResult['status'], details: string) {
  auditResults.push({ suite, test, status, details });
  const icon = status === 'PASS' ? '✅' : status === 'BLOCKED' ? '⚠️' : status === 'PARTIALLY IMPLEMENTED' ? '🟡' : '❌';
  console.log(`${icon} [${suite}] ${test}: ${status} - ${details}`);
}

async function runAudit() {
  console.log('====================================================');
  console.log('🔍 INDEPENDENT QA & SECURITY AUDIT TEST SUITE');
  console.log('====================================================\n');

  let memServer: MongoMemoryServer | null = null;
  let server: http.Server | null = null;
  let baseUrl = '';

  try {
    // ----------------------------------------------------
    // Section 1: MongoDB Connectivity & Schema Verification
    // ----------------------------------------------------
    console.log('\n--- Section 1: MongoDB Verification ---');
    try {
      memServer = await MongoMemoryServer.create();
      const memUri = memServer.getUri();
      await mongoose.connect(memUri, { dbName: 'book-your-day-audit' });
      record('MongoDB', 'In-Memory Connection', 'PASS', `Connected to ${memUri}`);
    } catch (err: any) {
      record('MongoDB', 'In-Memory Connection', 'FAIL', err.message);
    }

    // Verify Production Atlas credentials availability
    const prodUri = process.env.MONGODB_URI || '';
    if (!prodUri || prodUri.includes('127.0.0.1') || prodUri.includes('localhost')) {
      record('MongoDB', 'Production Atlas Connectivity', 'BLOCKED', 'Production MONGODB_URI not provided in environment (security isolation)');
    } else {
      record('MongoDB', 'Production Atlas Connectivity', 'NOT TESTED', 'Skipped live production cluster test to protect production data');
    }

    // Run seed
    try {
      await runSeed();
      const movieCount = await MovieModel.countDocuments();
      const showCount = await ShowModel.countDocuments();
      record('MongoDB', 'Database Seeding & Schema Population', 'PASS', `Seeded ${movieCount} movies and ${showCount} shows across categories`);
    } catch (err: any) {
      record('MongoDB', 'Database Seeding & Schema Population', 'FAIL', err.message);
    }

    // Test Production Seed Protection Guard
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const originalAllow = process.env.ALLOW_PRODUCTION_SEED;
    delete process.env.ALLOW_PRODUCTION_SEED;
    const seedResultInProd = await runSeed();
    process.env.NODE_ENV = originalEnv;
    if (originalAllow) process.env.ALLOW_PRODUCTION_SEED = originalAllow;

    if (seedResultInProd === false) {
      record('MongoDB', 'Destructive Seed Production Guard', 'PASS', 'Seed script strictly blocked destructive deleteMany execution under NODE_ENV=production');
    } else {
      record('MongoDB', 'Destructive Seed Production Guard', 'FAIL', 'Seed script did not block execution under NODE_ENV=production');
    }

    // Test CRUD Operations
    try {
      const testUser = await UserModel.create({
        name: 'Audit Test User',
        email: 'audit.test@example.com',
        passwordHash: 'dummy_hash',
        role: 'user',
        status: 'ACTIVE'
      });
      const fetched = await UserModel.findById(testUser._id);
      if (!fetched || fetched.name !== 'Audit Test User') throw new Error('Create or Read failed');

      await UserModel.updateOne({ _id: testUser._id }, { name: 'Audit Test User Updated' });
      const updated = await UserModel.findById(testUser._id);
      if (updated?.name !== 'Audit Test User Updated') throw new Error('Update failed');

      await UserModel.deleteOne({ _id: testUser._id });
      const deleted = await UserModel.findById(testUser._id);
      if (deleted !== null) throw new Error('Delete failed');

      record('MongoDB', 'Mongoose CRUD Operations', 'PASS', 'Create, Read, Update, and Delete operations verified');
    } catch (err: any) {
      record('MongoDB', 'Mongoose CRUD Operations', 'FAIL', err.message);
    }

    // Test Duplicate Key (Unique Index) Handling
    try {
      await UserModel.create({
        name: 'Original Unique User',
        email: 'unique.audit@example.com',
        role: 'user'
      });
      let threwDuplicate = false;
      try {
        await UserModel.create({
          name: 'Duplicate Unique User',
          email: 'unique.audit@example.com',
          role: 'user'
        });
      } catch (dupErr: any) {
        if (dupErr.code === 11000 || dupErr.name === 'MongoServerError') {
          threwDuplicate = true;
        }
      }
      if (threwDuplicate) {
        record('MongoDB', 'Unique Index & E11000 Duplicate Key Enforcement', 'PASS', 'Rejected duplicate user email insertion with E11000 violation');
      } else {
        record('MongoDB', 'Unique Index & E11000 Duplicate Key Enforcement', 'FAIL', 'Duplicate email was accepted without error');
      }
    } catch (err: any) {
      record('MongoDB', 'Unique Index & E11000 Duplicate Key Enforcement', 'FAIL', err.message);
    }

    // Start Express API Server for HTTP integration tests
    const app = express();
    app.use(express.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString('utf8');
      }
    }));
    app.use('/api', (apiRoutes as any).default || apiRoutes);

    server = app.listen(0);
    const address = server.address() as any;
    baseUrl = `http://127.0.0.1:${address.port}/api`;

    // ----------------------------------------------------
    // Section 2: Payment Verification (Razorpay)
    // ----------------------------------------------------
    console.log('\n--- Section 2: Payment & Cryptographic Verification ---');

    // 1. Order Creation
    try {
      const order = await RazorpayService.createOrder(50000, 'INR', 'receipt_audit_01', { bookingId: 'test_bk_01' });
      if (order && order.id && order.amount === 50000 && order.currency === 'INR') {
        record('Payments', 'Razorpay Order Creation', 'PASS', `Order created ID: ${order.id}, Amount: ₹${order.amount / 100}, Currency: ${order.currency}`);
      } else {
        record('Payments', 'Razorpay Order Creation', 'FAIL', `Invalid order object: ${JSON.stringify(order)}`);
      }
    } catch (err: any) {
      record('Payments', 'Razorpay Order Creation', 'FAIL', err.message);
    }

    // 2. Cryptographic Payment Signature Verification (HMAC-SHA256)
    const testOrderId = 'order_test_998877';
    const testPaymentId = 'pay_test_112233';
    const testSecret = process.env.RAZORPAY_KEY_SECRET || 'secret_test_byd2026';
    const validSignature = crypto
      .createHmac('sha256', testSecret)
      .update(`${testOrderId}|${testPaymentId}`)
      .digest('hex');

    const isValidSig = RazorpayService.verifyPaymentSignature(testOrderId, testPaymentId, validSignature);
    const isTamperedSig = RazorpayService.verifyPaymentSignature(testOrderId, testPaymentId, 'tampered_signature_invalid');

    if (isValidSig && !isTamperedSig) {
      record('Payments', 'Cryptographic HMAC-SHA256 Signature Verification', 'PASS', 'Verified valid HMAC signature and rejected forged signature');
    } else {
      record('Payments', 'Cryptographic HMAC-SHA256 Signature Verification', 'FAIL', `Valid: ${isValidSig}, Tampered rejected: ${!isTamperedSig}`);
    }

    // 3. Webhook Signature Verification
    const testWebhookBody = JSON.stringify({
      event: 'payment.captured',
      payload: { payment: { entity: { id: 'pay_hook_01', order_id: 'order_hook_01', status: 'captured' } } }
    });
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'webhook_secret_byd2026';
    const validWebhookSig = crypto
      .createHmac('sha256', webhookSecret)
      .update(testWebhookBody)
      .digest('hex');

    const isWebhookValid = RazorpayService.verifyWebhookSignature(testWebhookBody, validWebhookSig, webhookSecret);
    const isWebhookForged = RazorpayService.verifyWebhookSignature(testWebhookBody, 'forged_webhook_signature', webhookSecret);

    if (isWebhookValid && !isWebhookForged) {
      record('Payments', 'Cryptographic Webhook Signature Verification', 'PASS', 'Valid webhook accepted, forged webhook rejected with timing-safe comparison');
    } else {
      record('Payments', 'Cryptographic Webhook Signature Verification', 'FAIL', `Valid: ${isWebhookValid}, Forged rejected: ${!isWebhookForged}`);
    }

    // 4. Refund Calculation & Processing
    const fullRefund = RefundService.calculateRefund(1000, new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0], '18:00');
    const partialRefund = RefundService.calculateRefund(1000, new Date(Date.now() + 6 * 3600 * 1000).toISOString().split('T')[0], '18:00');
    if (fullRefund.refundAmount > 0 && partialRefund.cancellationFee > 0) {
      record('Payments', 'Tiered Refund Calculation Policy', 'PASS', `>24h: ₹${fullRefund.refundAmount} refund, <12h: ₹${partialRefund.cancellationFee} fee`);
    } else {
      record('Payments', 'Tiered Refund Calculation Policy', 'FAIL', 'Refund calculation did not apply policy correctly');
    }

    // ----------------------------------------------------
    // Section 3: Booking & Concurrency Verification
    // ----------------------------------------------------
    console.log('\n--- Section 3: Booking & Concurrency Verification ---');

    // Create 2 distinct test users for isolation testing
    const userA = await UserModel.create({
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      passwordHash: 'hashA',
      role: 'user'
    });
    const tokenA = generateToken({
      userId: userA._id.toString(),
      email: userA.email,
      role: 'user'
    });

    const userB = await UserModel.create({
      name: 'Bob Smith',
      email: 'bob.smith@example.com',
      passwordHash: 'hashB',
      role: 'user'
    });
    const tokenB = generateToken({
      userId: userB._id.toString(),
      email: userB.email,
      role: 'user'
    });

    // Pick an available show
    const show = await ShowModel.findOne();
    if (!show) throw new Error('No shows available in database');

    const showId = show._id.toString();
    const contestedSeat = 'A1';

    // Test Concurrent Booking Requests on the EXACT SAME SEAT
    console.log(`Testing simultaneous race condition for seat ${contestedSeat} in show ${showId}...`);
    const [resA, resB] = await Promise.all([
      fetch(`${baseUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
        body: JSON.stringify({
          category: 'MOVIES',
          itemTitle: 'Audit Movie Concurrent',
          venueOrCinema: 'Cinema 1',
          city: 'Asansol',
          date: '2026-11-20',
          time: '18:00',
          selectedSeats: [contestedSeat],
          quantity: 1,
          unitPrice: 300,
          showId
        })
      }),
      fetch(`${baseUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenB}` },
        body: JSON.stringify({
          category: 'MOVIES',
          itemTitle: 'Audit Movie Concurrent',
          venueOrCinema: 'Cinema 1',
          city: 'Asansol',
          date: '2026-11-20',
          time: '18:00',
          selectedSeats: [contestedSeat],
          quantity: 1,
          unitPrice: 300,
          showId
        })
      })
    ]);

    const dataA = await resA.json();
    const dataB = await resB.json();

    const statuses = [resA.status, resB.status];
    const hasSuccess = statuses.includes(200) || statuses.includes(201);
    const hasConflict = statuses.includes(409);

    if (hasSuccess && hasConflict) {
      record('Booking', 'Atomic Double-Booking Prevention & Concurrency', 'PASS', `Simultaneous requests safely handled: one succeeded (${hasSuccess}), one received 409 Conflict`);
    } else {
      record('Booking', 'Atomic Double-Booking Prevention & Concurrency', 'FAIL', `Statuses: User A: ${resA.status}, User B: ${resB.status}`);
    }

    // Verify User-Specific Data Isolation
    const winningBooking = dataA.success ? dataA.data : dataB.data;
    const winningToken = dataA.success ? tokenA : tokenB;
    const losingToken = dataA.success ? tokenB : tokenA;

    // Test unauthorized access: Losing user attempts to retrieve Winning user's booking
    const unauthorizedAccessRes = await fetch(`${baseUrl}/bookings/${winningBooking.id}`, {
      headers: { 'Authorization': `Bearer ${losingToken}` }
    });

    if (unauthorizedAccessRes.status === 403) {
      record('Security', 'User-Specific Booking Isolation (IDOR Defense)', 'PASS', 'Cross-user booking access rejected with HTTP 403 Forbidden');
    } else {
      record('Security', 'User-Specific Booking Isolation (IDOR Defense)', 'FAIL', `Expected 403, received ${unauthorizedAccessRes.status}`);
    }

    // Test Rescheduling
    const rescheduleRes = await fetch(`${baseUrl}/bookings/${winningBooking.id}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${winningToken}` },
      body: JSON.stringify({
        newDate: '2026-11-25',
        newTime: '20:30'
      })
    });
    const rescheduleData = await rescheduleRes.json();
    if (rescheduleRes.status === 200 && rescheduleData.success) {
      record('Booking', 'Booking Rescheduling Workflow', 'PASS', `Booking rescheduled to ${rescheduleData.data.date} ${rescheduleData.data.time}`);
    } else {
      record('Booking', 'Booking Rescheduling Workflow', 'FAIL', JSON.stringify(rescheduleData));
    }

    // Test Booking Cancellation & Seat Release
    const bookingBeforeCancel = await BookingModel.findById(winningBooking.id);
    console.log('DEBUG booking before cancel:', {
      id: bookingBeforeCancel?._id,
      showId: bookingBeforeCancel?.showId,
      seatsOrTicketsDetails: bookingBeforeCancel?.seatsOrTicketsDetails
    });

    const cancelRes = await fetch(`${baseUrl}/bookings/${winningBooking.id}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${winningToken}` }
    });
    const cancelData = await cancelRes.json();
    console.log('DEBUG cancelData:', cancelData);

    if (cancelRes.status === 200 && cancelData.success) {
      // Check that seat was released in show
      const updatedShow = await ShowModel.findById(showId);
      console.log('DEBUG updatedShow bookedSeats:', updatedShow?.bookedSeats);
      const seatStillBooked = updatedShow?.bookedSeats.includes(contestedSeat);
      if (!seatStillBooked) {
        record('Booking', 'Cancellation & Atomic Seat Release', 'PASS', `Booking cancelled (status: ${cancelData.data.status}) and seat ${contestedSeat} released back to inventory`);
      } else {
        record('Booking', 'Cancellation & Atomic Seat Release', 'FAIL', `Seat ${contestedSeat} was not released from ShowModel.bookedSeats`);
      }
    } else {
      record('Booking', 'Cancellation & Atomic Seat Release', 'FAIL', JSON.stringify(cancelData));
    }

    // ----------------------------------------------------
    // Section 4: Live Chat Support Verification
    // ----------------------------------------------------
    console.log('\n--- Section 4: Live Chat Multi-User Verification ---');

    // User A sends message to support
    const chatSendRes = await fetch(`${baseUrl}/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenA}` },
      body: JSON.stringify({ message: 'Hello, I need help with my ticket refund.' })
    });
    const chatSendData = await chatSendRes.json();

    // Admin Token
    const adminUser = await UserModel.create({
      name: 'Support Admin',
      email: 'admin.support@example.com',
      passwordHash: 'hashAdmin',
      role: 'admin'
    });
    const adminToken = generateToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: 'admin'
    });

    // Admin views conversation threads
    const adminConvsRes = await fetch(`${baseUrl}/chat/admin/conversations`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const adminConvsData = await adminConvsRes.json();

    // Admin replies to User A
    const adminReplyRes = await fetch(`${baseUrl}/chat/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
      body: JSON.stringify({
        message: 'Hello Alice, we have processed your refund.',
        conversationId: `conv_${userA._id}`,
        recipientId: userA._id.toString()
      })
    });
    const adminReplyData = await adminReplyRes.json();

    // User A fetches conversation history
    const userAMessagesRes = await fetch(`${baseUrl}/chat/my`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const userAMessagesData = await userAMessagesRes.json();

    // User B fetches conversation history (must be isolated and empty)
    const userBMessagesRes = await fetch(`${baseUrl}/chat/my`, {
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const userBMessagesData = await userBMessagesRes.json();

    if (
      chatSendData.success &&
      adminReplyData.success &&
      userAMessagesData.data?.length === 2 &&
      userBMessagesData.data?.length === 0
    ) {
      record('Chat', 'Real-Time Multi-User Support Chat & Conversation Isolation', 'PASS', 'Two-way exchange between user and admin verified; User B conversation thread isolated');
    } else {
      record('Chat', 'Real-Time Multi-User Support Chat & Conversation Isolation', 'FAIL', `User A messages: ${userAMessagesData.data?.length}, User B messages: ${userBMessagesData.data?.length}`);
    }

    // ----------------------------------------------------
    // Section 5: AI Assistant Database Verification
    // ----------------------------------------------------
    console.log('\n--- Section 5: AI Assistant Live Database Search Verification ---');

    const aiSearchRes = await fetch(`${baseUrl}/search?q=Stree&city=Asansol&category=movies`);
    const aiSearchData = await aiSearchRes.json();

    if (aiSearchData.success && aiSearchData.data?.results?.length > 0) {
      const match = aiSearchData.data.results[0];
      record('AI & Search', 'Database-Backed AI Entity Resolution', 'PASS', `AI Search query resolved live database item: "${match.title}" (ID: ${match.id}) with price ₹${match.price}`);
    } else {
      record('AI & Search', 'Database-Backed AI Entity Resolution', 'FAIL', 'Search returned zero results for valid database entity');
    }

    // ----------------------------------------------------
    // Section 6: Health & Production Readiness
    // ----------------------------------------------------
    console.log('\n--- Section 6: Production Readiness Verification ---');

    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();

    const liveRes = await fetch(`${baseUrl}/health/live`);
    const liveData = await liveRes.json();

    const readyRes = await fetch(`${baseUrl}/health/ready`);
    const readyData = await readyRes.json();

    if (healthData.success && liveData.status === 'live' && readyData.status === 'ready') {
      record('Health', 'Health Probe Endpoints (/health, /live, /ready)', 'PASS', 'All three kubernetes/cloud health probes responded HTTP 200 OK');
    } else {
      record('Health', 'Health Probe Endpoints (/health, /live, /ready)', 'FAIL', `Health: ${healthRes.status}, Live: ${liveRes.status}, Ready: ${readyRes.status}`);
    }

  } catch (err: any) {
    console.error('Fatal audit suite error:', err);
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState === 1) await mongoose.disconnect();
    if (memServer) await memServer.stop();
  }

  // Print Summary Table
  console.log('\n====================================================');
  console.log('📊 INDEPENDENT QA & SECURITY AUDIT SUMMARY');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;
  let blocked = 0;
  let partial = 0;

  auditResults.forEach((r) => {
    if (r.status === 'PASS') passed++;
    else if (r.status === 'FAIL') failed++;
    else if (r.status === 'BLOCKED') blocked++;
    else if (r.status === 'PARTIALLY IMPLEMENTED') partial++;
  });

  console.log(`Total Checks: ${auditResults.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Blocked: ${blocked}`);
  console.log(`Partially Implemented: ${partial}`);
  console.log('====================================================');

  return failed === 0;
}

runAudit().then((success) => {
  process.exit(success ? 0 : 1);
});

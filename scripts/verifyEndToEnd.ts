import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { connectDB } from '../backend/src/config/db.js';
import { runSeed } from '../backend/src/seed/seed.js';
import apiRoutes from '../backend/src/routes/apiRoutes.js';
import { UserModel } from '../backend/src/models/User.js';
import { MovieModel } from '../backend/src/models/Movie.js';
import { ShowModel } from '../backend/src/models/Show.js';

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE END-TO-END VERIFICATION');
  console.log('====================================================\n');

  // Step 1: Connect to Database & Seed
  console.log('📦 Step 1: Connecting to Database & Seeding...');
  let memServer: any = null;
  let connected = await connectDB();
  if (!connected) {
    console.log('ℹ️ [Test] Standalone local MongoDB not active. Launching isolated MongoMemoryServer for test execution...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memServer = await MongoMemoryServer.create();
    const memUri = memServer.getUri();
    await mongoose.connect(memUri, { dbName: 'book-your-day' });
    connected = true;
    console.log(`✅ [Test] Connected to isolated test MongoDB at ${memUri}`);
  }
  await runSeed();
  console.log('✅ Database connected and fully seeded.\n');

  // Create test express app
  const app = express();
  app.use(express.json());
  const resolvedApiRoutes = (apiRoutes as any).default || apiRoutes;
  app.use('/api', resolvedApiRoutes);

  const server = app.listen(0);
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api`;
  console.log(`🌐 Test API Server listening at ${baseUrl}\n`);

  let testToken = '';
  let testUserId = '';
  let sampleMovieId = '';
  let sampleShowId = '';
  let createdBookingId = '';
  let createdReviewId = '';

  try {
    // Step 2: Auth Registration
    console.log('👤 Step 2: Testing User Registration (/api/auth/register)...');
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sarah Connor',
        email: `sarah.connor.${Date.now()}@example.com`,
        password: 'password123',
        phone: '+91 9988776655',
        role: 'user'
      })
    });
    const regData = await regRes.json();
    const regToken = regData.token || regData.data?.token;
    const regUser = regData.user || regData.data?.user || regData.data;
    if (!regData.success || !regToken) {
      throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
    }
    console.log(`✅ Registration successful! User: ${regUser.name} (${regUser.email})`);

    // Step 3: Auth Login
    console.log('\n🔑 Step 3: Testing User Login (/api/auth/login)...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alex.mercer@example.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    const loginToken = loginData.token || loginData.data?.token;
    const loginUser = loginData.user || loginData.data?.user || loginData.data;
    if (!loginData.success || !loginToken) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
    }
    testToken = loginToken;
    testUserId = loginUser.id;
    console.log(`✅ Login successful! Logged in as: ${loginUser.name}, Token generated.`);

    // Step 4: Catalog & Search Discovery
    console.log('\n🔍 Step 4: Testing Catalog & Multi-Filter Search (/api/search)...');
    const searchRes = await fetch(`${baseUrl}/search?q=Echoes&city=Asansol&category=movies`);
    const searchData = await searchRes.json();
    if (!searchData.success || !searchData.data?.results) {
      throw new Error(`Search failed: ${JSON.stringify(searchData)}`);
    }
    console.log(`✅ Search returned ${searchData.data.results.length} results matching "Echoes" in Asansol.`);

    const moviesRes = await fetch(`${baseUrl}/catalog/movies`);
    const moviesData = await moviesRes.json();
    if (!moviesData.success || moviesData.data.length === 0) {
      throw new Error('Movies catalog empty');
    }
    sampleMovieId = moviesData.data[0].id;
    console.log(`✅ Movies catalog verified. Found ${moviesData.data.length} movies. Sample: "${moviesData.data[0].title}" (${sampleMovieId})`);

    // Step 5: Movie Shows & Seat Layout
    console.log('\n🎟️ Step 5: Testing Movie Shows & Real-Time Seats (/api/movies/:id/shows)...');
    const showsRes = await fetch(`${baseUrl}/movies/${sampleMovieId}/shows`);
    const showsData = await showsRes.json();
    if (!showsData.success || showsData.data.length === 0) {
      throw new Error(`Failed to fetch shows: ${JSON.stringify(showsData)}`);
    }
    const venueWithShows = showsData.data[0];
    sampleShowId = venueWithShows.shows[0].id;
    console.log(`✅ Found ${showsData.data.length} venues with shows for movie. Selected Show ID: ${sampleShowId} at "${venueWithShows.name}".`);

    const seatsRes = await fetch(`${baseUrl}/movies/shows/${sampleShowId}/seats`);
    const seatsData = await seatsRes.json();
    if (!seatsData.success || !Array.isArray(seatsData.data?.seats)) {
      throw new Error(`Failed to fetch seats: ${JSON.stringify(seatsData)}`);
    }
    console.log(`✅ Seat layout loaded with ${seatsData.data.seats.length} total seats for show.`);

    // Step 6: Coupon Validation
    console.log('\n🎁 Step 6: Testing Promo Coupon Validation (/api/coupons/validate)...');
    const couponRes = await fetch(`${baseUrl}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'FIRST50',
        bookingAmount: 500,
        category: 'movies'
      })
    });
    const couponData = await couponRes.json();
    if (!couponData.success || couponData.data?.discountAmount !== 100) {
      throw new Error(`Coupon validation failed: ${JSON.stringify(couponData)}`);
    }
    console.log(`✅ Coupon "FIRST50" validated! Applied flat ₹${couponData.data.discountAmount} discount.`);

    // Step 7: Create Booking
    console.log('\n📝 Step 7: Testing Booking Creation (/api/bookings)...');
    const bookingRes = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        category: 'movies',
        itemId: sampleMovieId,
        itemTitle: 'Echoes of Tomorrow',
        itemImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1',
        venueOrCinema: venueWithShows.name,
        city: 'Asansol',
        date: new Date().toISOString().split('T')[0],
        time: '19:30',
        seatsOrTicketsDetails: 'Seats B1, B2 (VIP)',
        quantity: 2,
        totalPrice: 640
      })
    });
    const bookingData = await bookingRes.json();
    if (!bookingData.success || !bookingData.data?.id) {
      throw new Error(`Booking creation failed: ${JSON.stringify(bookingData)}`);
    }
    createdBookingId = bookingData.data.id;
    console.log(`✅ Booking created! Booking #${bookingData.data.bookingNumber} (ID: ${createdBookingId})`);

    // Step 8: Payment Gateway Simulation
    console.log('\n💳 Step 8: Testing Payment Order Creation & Verification (/api/payments/razorpay)...');
    const orderRes = await fetch(`${baseUrl}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        bookingId: createdBookingId,
        amount: 640,
        currency: 'INR'
      })
    });
    if (!orderRes.ok) {
      const text = await orderRes.text();
      throw new Error(`Payment order creation HTTP ${orderRes.status}: ${text}`);
    }
    const orderData = await orderRes.json();
    if (!orderData.success || !orderData.data?.orderId) {
      throw new Error(`Payment order creation failed: ${JSON.stringify(orderData)}`);
    }
    console.log(`✅ Razorpay order created: ${orderData.data.orderId}`);

    const verifyRes = await fetch(`${baseUrl}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        bookingId: createdBookingId,
        razorpay_order_id: orderData.data.orderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'simulated_valid_signature'
      })
    });
    if (!verifyRes.ok) {
      const text = await verifyRes.text();
      throw new Error(`Payment verify HTTP ${verifyRes.status}: ${text}`);
    }
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      throw new Error(`Payment verification failed: ${JSON.stringify(verifyData)}`);
    }
    console.log('✅ Payment verified and booking marked as confirmed.');

    // Step 9: Customer Dashboard Bookings
    console.log('\n🎟️ Step 9: Testing Customer Booking Retrieval (/api/bookings/my)...');
    const myBookingsRes = await fetch(`${baseUrl}/bookings/my`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    const myBookingsData = await myBookingsRes.json();
    if (!myBookingsData.success || myBookingsData.data.length === 0) {
      throw new Error('Failed to retrieve user bookings');
    }
    console.log(`✅ Retrieved ${myBookingsData.data.length} customer bookings.`);

    // Step 10: Reschedule Booking
    console.log('\n📅 Step 10: Testing Booking Rescheduling (/api/bookings/:id/reschedule)...');
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 2);
    const newDateStr = tmrw.toISOString().split('T')[0];

    const rescheduleRes = await fetch(`${baseUrl}/bookings/${createdBookingId}/reschedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        newDate: newDateStr,
        newTime: '21:00'
      })
    });
    const rescheduleData = await rescheduleRes.json();
    if (!rescheduleData.success) {
      throw new Error(`Rescheduling failed: ${JSON.stringify(rescheduleData)}`);
    }
    console.log(`✅ Booking #${createdBookingId} successfully rescheduled to ${newDateStr} at 21:00.`);

    // Step 11: Review Submission
    console.log('\n⭐ Step 11: Testing Verified Booking Review Submission (/api/reviews)...');
    const reviewRes = await fetch(`${baseUrl}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        itemId: sampleMovieId,
        itemType: 'movie',
        rating: 5,
        title: 'Outstanding Cinema Experience',
        comment: 'Crystal-clear Dolby Atmos sound and extremely comfortable recliner seats.',
        photos: ['https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c']
      })
    });
    const reviewData = await reviewRes.json();
    if (!reviewData.success || !reviewData.data?._id) {
      throw new Error(`Review submission failed: ${JSON.stringify(reviewData)}`);
    }
    createdReviewId = reviewData.data._id;
    console.log(`✅ Verified review submitted with ID: ${createdReviewId}`);

    // Step 12: Helpful Vote on Review
    console.log('\n👍 Step 12: Testing Helpful Review Voting (/api/reviews/:id/helpful)...');
    const helpfulRes = await fetch(`${baseUrl}/reviews/${createdReviewId}/helpful`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    const helpfulData = await helpfulRes.json();
    if (!helpfulData.success) {
      throw new Error(`Helpful voting failed: ${JSON.stringify(helpfulData)}`);
    }
    console.log(`✅ Helpful vote recorded. Helpful count: ${helpfulData.data?.helpfulCount}`);

    // Step 13: Live Chat Support
    console.log('\n💬 Step 13: Testing Live Chat Support System (/api/chat)...');
    const sendChatRes = await fetch(`${baseUrl}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        message: 'Hello, I need help checking my movie tickets!'
      })
    });
    const sendChatData = await sendChatRes.json();
    if (!sendChatData.success) {
      throw new Error(`Chat sending failed: ${JSON.stringify(sendChatData)}`);
    }
    console.log('✅ Chat message delivered to support thread.');

    const myChatRes = await fetch(`${baseUrl}/chat/my`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    const myChatData = await myChatRes.json();
    if (!myChatData.success || myChatData.data.length === 0) {
      throw new Error('Chat history fetch failed');
    }
    console.log(`✅ Customer chat thread retrieved with ${myChatData.data.length} messages.`);

    // Step 14: In-App Notifications
    console.log('\n🔔 Step 14: Testing In-App Notification System (/api/notifications)...');
    const notifsRes = await fetch(`${baseUrl}/notifications`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    const notifsData = await notifsRes.json();
    if (!notifsData.success || notifsData.data.length === 0) {
      throw new Error('Notifications fetch failed');
    }
    console.log(`✅ Found ${notifsData.data.length} notifications for customer.`);

    const readAllRes = await fetch(`${baseUrl}/notifications/read-all`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    const readAllData = await readAllRes.json();
    if (!readAllData.success) {
      throw new Error('Failed to mark notifications as read');
    }
    console.log('✅ All customer notifications marked as read.');

    // Step 15: Admin Metrics & Booking Queries
    console.log('\n🛡️ Step 15: Testing Admin Overview & Auditing (/api/admin/metrics)...');
    // Generate admin token
    const adminUser = await UserModel.findOne({ role: 'admin' });
    const adminToken = jwt.sign(
      { id: adminUser?._id.toString(), email: adminUser?.email, role: 'admin' },
      process.env.JWT_SECRET || 'byd_jwt_production_secret_2026',
      { expiresIn: '1d' }
    );

    const metricsRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const metricsData = await metricsRes.json();
    if (!metricsData.success || (metricsData.data?.grossBookingValue === undefined && metricsData.data?.totalRevenue === undefined)) {
      throw new Error(`Admin metrics failed: ${JSON.stringify(metricsData)}`);
    }
    const rev = metricsData.data.grossBookingValue ?? metricsData.data.totalRevenue ?? 0;
    console.log(`✅ Admin Metrics retrieved: Revenue ₹${rev.toLocaleString()}, Bookings: ${metricsData.data.totalBookings}`);

    console.log('\n====================================================');
    console.log('🎉 ALL 15 END-TO-END VERIFICATION TESTS PASSED (100%)');
    console.log('====================================================');
    return true;
  } catch (error: any) {
    console.error('\n❌ End-to-End Verification failed with error:', error?.message);
    return false;
  } finally {
    if (server) server.close();
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
    if (memServer) {
      await memServer.stop();
    }
  }
}

runEndToEndVerification().then((ok) => {
  process.exit(ok ? 0 : 1);
});

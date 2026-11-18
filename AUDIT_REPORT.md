# BookYourDay — Comprehensive Codebase Audit Report

**Date:** November 18, 2026  
**Auditor:** Senior Full-Stack Software Engineer, Software Architect, QA & Security Engineer  
**Repository:** https://github.com/techknife01-source/BookYourDay  
**Audit Scope:** Full repository end-to-end (Frontend, Backend, Database, Security, Payments, Business Logic, Deployment)

---

## Executive Summary

A comprehensive architectural and code-level audit was conducted across all files, components, API endpoints, Mongoose schemas, and third-party integrations in **BookYourDay**. While the application features an extensive design foundation and TypeScript codebase, critical functional gaps, hardcoded mock data dependencies, synchronization flaws, broken search logic, security vulnerabilities, and missing core features were identified.

This document outlines every discovered defect, its underlying root cause, affected files, severity classification, recommended remediation, and testing requirements.

---

## Severity Classification
- **CRITICAL**: System outage, major security breach, data loss, broken payment/booking flow, or privilege escalation.
- **HIGH**: Feature completely broken or non-functional, mock data masking missing database integration, major data synchronization failure.
- **MEDIUM**: Suboptimal performance, missing filter categories, edge-case validation errors, responsive UI overflow.
- **LOW**: Cosmetic issues, minor typing warnings, missing helper tooltips.

---

## Detailed Audit Findings

### 1. Authentication, Authorization & User Management

#### Issue 1.1: Insecure Role Assignment & Passwordless Authentication
- **Problem Description:** In `authController.login`, any user logging in with an email containing `"admin"` automatically receives the `admin` role with full administrative privileges. Furthermore, there is no password authentication or password hashing verification whatsoever despite `passwordHash` being present in `UserSchema` and `bcryptjs` being installed. There is also no user registration endpoint (`/register`).
- **Root Cause:** Hardcoded heuristic role deduction: `const userRole = cleanEmail.includes('partner') ? 'partner' : cleanEmail.includes('admin') ? 'admin' : 'user';` without verifying password hash or cryptographic proof.
- **Affected Files:**
  - `backend/src/controllers/authController.ts`
  - `backend/src/routes/authRoutes.ts`
  - `backend/src/models/User.ts`
  - `src/api/authApi.ts`
- **Severity:** CRITICAL
- **Recommended Fix:** Implement standard bcrypt password hashing on registration and login. Restrict the `admin` role to verified administrative accounts (or environment-seeded admin credentials). Provide separate `/register` and `/login` endpoints with input validation.
- **Testing Requirements:** Test registering a new user, logging in with correct vs incorrect passwords, and verifying that ordinary emails with "admin" in their username do not obtain administrative privileges.

#### Issue 1.2: Missing Frontend Authentication UI (Login / Register Modal)
- **Problem Description:** The frontend navbar contains a profile avatar button and links, but no login/register trigger modal or logout button exists in the UI. Customers cannot register, sign in with their credentials, or log out cleanly.
- **Root Cause:** Authentication was simulated by hardcoding `BookingService.getUserProfile()` with mock user "Alex Mercer" and relying on raw token storage without an interactive auth modal.
- **Affected Files:**
  - `src/components/layout/Navbar.tsx`
  - `src/components/layout/MobileNav.tsx`
  - `src/App.tsx`
  - `src/services/bookingService.ts`
- **Severity:** HIGH
- **Recommended Fix:** Build an accessible, clean AuthModal (Login & Register tabs) accessible from the Navbar and whenever an unauthenticated customer initiates a protected action (booking, wishlist, reviews, profile).
- **Testing Requirements:** Verify user registration, login, token persistence in localStorage, user profile display in navbar, and logout functionality.

---

### 2. Search, Discovery & Filtering

#### Issue 2.1: Search Fails to Return Matching Items / Breaks with City & Price Filters
- **Problem Description:** Searching often yields 0 results when filters are applied. Movie searches fail when city filters are selected because `MovieModel` has no `city` field. Additionally, when query params such as `minPrice` or `maxPrice` are passed without numeric values or formatted via URLSearchParams, `NaN` is passed to MongoDB `$gte` queries, causing queries to fail or return empty arrays.
- **Root Cause:**
  1. `mQuery` on `MovieModel` does not account for `city` through venue/show joins or allow global movie discoverability.
  2. Hardcoded fallback filtering in `searchController.ts` assumes a static movie price of ₹250 (`if (minPrice !== undefined && 250 < minPrice) return []`).
  3. `NaN` validation is missing on parsed numeric query parameters.
- **Affected Files:**
  - `backend/src/controllers/searchController.ts`
  - `backend/src/controllers/catalogController.ts`
  - `src/api/searchApi.ts`
  - `src/pages/SearchResultsPage.tsx`
- **Severity:** CRITICAL
- **Recommended Fix:**
  1. Normalize search parameter parsing with strict `Number.isFinite()` guards.
  2. Link movie city discovery to venue shows or return cross-city movie titles with venue city badges.
  3. Replace hardcoded ₹250 checks with actual show pricing or default range query.
  4. Ensure debounced search input (300ms) on frontend `SearchResultsPage`.
- **Testing Requirements:** Execute search across all categories with combined filters (name, city, category, min/max price, rating, sorting). Verify non-empty, accurate results and valid pagination.

#### Issue 2.2: Hardcoded Fallback Overrides and Mock Search Results
- **Problem Description:** Both `searchController.ts` and `catalogController.ts` fall back to static in-memory arrays `FALLBACK_ITEMS` when DB results are empty, which conceals database query failures and provides stale mock items.
- **Root Cause:** Incomplete transition from prototype mock arrays to live database querying.
- **Affected Files:**
  - `backend/src/controllers/searchController.ts`
  - `backend/src/controllers/catalogController.ts`
- **Severity:** HIGH
- **Recommended Fix:** Query live MongoDB collections natively. When no items match, return proper empty states with suggestions rather than injecting hardcoded mock items.
- **Testing Requirements:** Seed new database records, query them, and verify that actual database data is returned.

---

### 3. Service Details Pages & Mock Data Dependencies

#### Issue 3.1: EventDetailsPage and SportsDetailsPage Rely Exclusively on Mock Data
- **Problem Description:** Navigating to `/event/:id` or `/sport/:id` reads from in-memory arrays `MOCK_EVENTS` and `MOCK_SPORTS`. If a user clicks an event or sports match from the search results or homepage with a valid MongoDB `_id`, the details page falls back to `MOCK_EVENTS[0]`, displaying the wrong event and incorrect pricing.
- **Root Cause:** Frontend details pages were not integrated with `catalogApi.getItemById()` or backend routes.
- **Affected Files:**
  - `src/pages/EventDetailsPage.tsx`
  - `src/pages/SportsDetailsPage.tsx`
- **Severity:** HIGH
- **Recommended Fix:** Update both details pages to fetch dynamic service data via `catalogApi.getItemById(category, id)` with loading skeletons and 404 handling.
- **Testing Requirements:** Open different event and sports cards by MongoDB ID; verify correct title, venue, price, date, and ticket tiers are displayed.

#### Issue 3.2: MovieDetailsPage Uses Hardcoded Cinemas and Static Seats
- **Problem Description:** `MovieDetailsPage.tsx` maps over `MOCK_CINEMAS` instead of fetching actual venues and shows from the database. Furthermore, `SeatSelector.tsx` uses `generateSeatGrid()` with hardcoded occupied seat IDs (`A3`, `A4`, `B6`, etc.), ignoring the database `ShowModel` and `SeatModel`.
- **Root Cause:** Missing backend endpoint `/api/movies/:id/shows` and lack of real-time showtime integration in frontend.
- **Affected Files:**
  - `backend/src/routes/movieRoutes.ts`
  - `backend/src/controllers/movieController.ts`
  - `src/pages/MovieDetailsPage.tsx`
  - `src/components/booking/SeatSelector.tsx`
  - `src/utils/pricing.ts`
- **Severity:** HIGH
- **Recommended Fix:** Implement `GET /api/movies/:id/shows` returning real venues and showtimes from MongoDB. Connect `SeatSelector` to fetch actual booked seats from `ShowModel.bookedSeats`.
- **Testing Requirements:** Book a seat in a movie show, re-open the seat selector, and confirm that the booked seat appears disabled/occupied.

---

### 4. Availability & Real-Time Booking

#### Issue 4.1: Direct Booking Creation Bypasses Payment & Verification
- **Problem Description:** `BookingController.createBooking` automatically marks bookings as `CONFIRMED` and generates a pseudo transaction ID (`TXN...`) without verifying online payment.
- **Root Cause:** Direct creation endpoint intended for prototypes was left exposed without distinguishing pending reservations from completed verified payments.
- **Affected Files:**
  - `backend/src/controllers/bookingController.ts`
  - `backend/src/routes/bookingRoutes.ts`
- **Severity:** CRITICAL
- **Recommended Fix:** Enforce a two-step flow: reservation / order creation (`status: 'PENDING'`) followed by backend payment verification via Razorpay HMAC signature (`status: 'CONFIRMED'`).
- **Testing Requirements:** Attempt booking without payment verification and verify status remains `PENDING` or is rejected.

#### Issue 4.2: Lack of Availability and Capacity Enforcement Across Categories
- **Problem Description:** While movie seats had partial atomic locking, Event ticket tiers, Attractions entry passes, and Dining table reservations did not decrement or validate capacity atomically in MongoDB during checkout.
- **Root Cause:** Missing atomic update operators (`$inc`, `$pull`, conditional checks) for non-movie categories in `bookingController.ts`.
- **Affected Files:**
  - `backend/src/controllers/bookingController.ts`
  - `backend/src/models/Event.ts`
  - `backend/src/models/SportsEvent.ts`
- **Severity:** HIGH
- **Recommended Fix:** Implement atomic decrement of `availableQuantity` on ticket tiers and enforce reservation limits during order creation and confirmation.
- **Testing Requirements:** Simulate concurrent booking of the last available ticket tier and verify that only one booking succeeds while the other receives an availability conflict error (HTTP 409).

---

### 5. Payment System & Webhooks

#### Issue 5.1: Razorpay Missing Test Environment Fallback
- **Problem Description:** When Razorpay credentials are not defined in `.env`, `PaymentController.createOrder` immediately fails with HTTP 400 (`RAZORPAY_NOT_CONFIGURED`), completely blocking the entire checkout and booking flow in local/test environments.
- **Root Cause:** Lack of test environment simulation or sandbox mode for developers and QA engineers to complete the end-to-end booking journey.
- **Affected Files:**
  - `backend/src/services/razorpayService.ts`
  - `backend/src/controllers/paymentController.ts`
  - `src/components/booking/CheckoutModal.tsx`
- **Severity:** HIGH
- **Recommended Fix:** Provide sandbox/test simulation in `RazorpayService` when test keys (`rzp_test_...`) or non-production test mode is active, while enforcing full HMAC verification in production.
- **Testing Requirements:** Complete checkout with test cards/simulation; verify order creation, payment signature verification, and booking confirmation.

---

### 6. Customer Booking Dashboard

#### Issue 6.1: "Past Activity" Tab Displays Upcoming Bookings; Rescheduling & Invoices Missing
- **Problem Description:** In `MyTicketsPage.tsx`, the "Past Activity" tab simply filters by `b.status === 'CONFIRMED'`, showing identical future bookings instead of past completed dates. Furthermore, there is no rescheduling functionality and no downloadable invoice generation.
- **Root Cause:** Filtering logic `if (activeTab === 'completed') return b.status === 'CONFIRMED'` lacks date comparison. Missing invoice generation service and reschedule modal.
- **Affected Files:**
  - `src/pages/MyTicketsPage.tsx`
  - `backend/src/controllers/bookingController.ts`
  - `src/components/booking/DigitalTicketModal.tsx`
- **Severity:** MEDIUM
- **Recommended Fix:**
  1. Filter completed bookings by comparing booking date with the current date.
  2. Implement rescheduling API endpoint and UI modal for eligible bookings.
  3. Add downloadable invoice generator (PDF/printable HTML receipt) with taxes, fees, and transaction details.
- **Testing Requirements:** Verify upcoming vs past bookings separation, test booking rescheduling, and verify invoice download.

---

### 7. Wishlist & Favorites

#### Issue 7.1: Service Cards Always Show False for Wishlist; Limited Categories
- **Problem Description:** `BookingService.isInWishlist()` always returns `false`. As a result, the heart icon on all movie, event, sports, and restaurant cards never reflects favorite status. Furthermore, `WishlistPage.tsx` only parses `MOVIE` and `EVENT`, omitting saved Attractions, Sports, Dining, and Experiences.
- **Root Cause:** Synchronous stub `static isInWishlist() { return false; }` in `bookingService.ts`, and strict category filtering in `WishlistPage.tsx`.
- **Affected Files:**
  - `src/services/bookingService.ts`
  - `src/pages/WishlistPage.tsx`
  - `src/components/cards/MovieCard.tsx`
  - `src/components/cards/EventCard.tsx`
  - `src/components/cards/SportsCard.tsx`
- **Severity:** HIGH
- **Recommended Fix:**
  1. Implement a reactive wishlist state in frontend synchronized with MongoDB `UserModel.wishlist`.
  2. Expand `WishlistPage.tsx` to display all bookable categories with remove/compare options.
  3. Implement item comparison modal for wishlisted items.
- **Testing Requirements:** Add items across all categories to wishlist, refresh page, verify heart icons stay filled, verify items show on `WishlistPage`, and compare items.

---

### 8. Reviews and Ratings

#### Issue 8.1: Complete Absence of Review APIs, Moderation & Submission Flow
- **Problem Description:** Although `ReviewModel.ts` exists, there are no API routes, no controller methods, no verified booking checks, and no frontend review submission or listing components.
- **Root Cause:** Unimplemented feature subsystem.
- **Affected Files:**
  - `backend/src/models/Review.ts`
  - `backend/src/routes/apiRoutes.ts`
  - `src/pages/MovieDetailsPage.tsx`
  - `src/pages/EventDetailsPage.tsx`
  - `src/pages/AdminDashboard.tsx`
- **Severity:** HIGH
- **Recommended Fix:**
  1. Build `reviewController.ts` and routes with CRUD operations, rating distribution calculation, and verified booking check (user must have a `CONFIRMED` booking for that service).
  2. Add review submission UI with star rating and helpful vote count on details pages.
  3. Add Review Moderation tab in `AdminDashboard.tsx`.
- **Testing Requirements:** Verify that only customers with completed bookings can submit verified reviews; verify rating aggregation and admin moderation (approve/reject/delete).

---

### 9. AI Booking Assistant

#### Issue 9.1: AI Planner Itinerary Tool vs Conversational Booking Assistant
- **Problem Description:** While `PlannerPage.tsx` builds day itineraries, there is no interactive conversational AI Booking Assistant capable of extracting budget, location, and date from natural language queries (e.g. "Find a birthday party venue under ₹10,000 near Chennai") and returning direct bookable service cards with booking links.
- **Root Cause:** Only day-planner multi-stop logic was implemented; interactive query assistant widget was missing.
- **Affected Files:**
  - `backend/src/controllers/plannerController.ts`
  - `backend/src/services/plannerAIService.ts`
  - `src/pages/PlannerPage.tsx`
- **Severity:** HIGH
- **Recommended Fix:** Enhance `plannerController.ts` with an AI assistant query endpoint that extracts intent, budget, category, and city, performs MongoDB candidate search, checks real availability, and returns structured recommendations with direct booking links. Provide an interactive chat assistant widget.
- **Testing Requirements:** Test queries ("Find hotels under ₹3,000 in Mumbai", "Find cricket events this weekend") and verify real DB items are returned with accurate prices and links.

---

### 10. Live Chat & Customer Support

#### Issue 10.1: Static Support Tickets Without Real-Time Messaging
- **Problem Description:** Existing support implementation in `SupportTicketModel.ts` only holds a single subject and description. There is no conversation messages schema, no customer-to-admin chat interface, no read/unread status, and no message history.
- **Root Cause:** Unimplemented real-time chat architecture.
- **Affected Files:**
  - `backend/src/models/SupportTicket.ts`
  - `backend/src/controllers/adminController.ts`
  - `src/pages/AdminDashboard.tsx`
- **Severity:** HIGH
- **Recommended Fix:** Introduce `ChatMessage` model and endpoints for customer-to-admin support threads. Build a floating live chat widget for customers and a live conversation management panel in the Admin Dashboard.
- **Testing Requirements:** Send support message from customer, view and reply from admin dashboard, and verify message timestamps and read indicators.

---

### 11. Notification System

#### Issue 11.1: Notifications Stored Exclusively in LocalStorage
- **Problem Description:** `NotificationService.ts` only logs to console and does not persist notifications in MongoDB `NotificationModel`. On frontend, `NotificationDrawer.tsx` reads from `localStorage['byd_notifs_v1']`, which is lost across devices and sessions.
- **Root Cause:** Disconnected MongoDB model and client-only storage.
- **Affected Files:**
  - `backend/src/services/notificationService.ts`
  - `backend/src/models/Notification.ts`
  - `backend/src/routes/apiRoutes.ts`
  - `src/components/common/NotificationDrawer.tsx`
- **Severity:** MEDIUM
- **Recommended Fix:** Create `/api/notifications` endpoints to fetch and mark notifications read. Persist all booking, payment, cancellation, and refund events in `NotificationModel`.
- **Testing Requirements:** Confirm a booking, open NotificationDrawer, verify notification is fetched from API, mark as read, and verify persistence across page reload.

---

### 12. Location Services & Map

#### Issue 12.1: Fake Auto-Detect Geolocation in LocationModal
- **Problem Description:** In `LocationModal.tsx`, clicking "Use Current Location" triggers a mock `setTimeout` that hardcodes `handleSelect('Asansol')` instead of requesting browser GPS permission via `navigator.geolocation`.
- **Root Cause:** Mock simulation leftover:
  ```ts
  const handleAutoDetect = () => {
    setIsDetecting(true);
    setTimeout(() => { setIsDetecting(false); handleSelect('Asansol'); }, 800);
  };
  ```
- **Affected Files:**
  - `src/components/common/LocationModal.tsx`
  - `src/data/mockData.ts`
- **Severity:** HIGH
- **Recommended Fix:** Implement authentic `navigator.geolocation.getCurrentPosition` with reverse-geocoding/nearest-city detection. Add 20+ major Indian cities to the city selector.
- **Testing Requirements:** Click "Use Current Location" with permission granted; verify accurate coordinates and city selection. Deny permission and verify graceful manual city fallback.

#### Issue 12.2: Missing Interactive Map and Radius Button Overflow in NearbyPage
- **Problem Description:** `NearbyPage.tsx` displays only a card list with no map markers or map view. On mobile screens, the 6 fixed radius buttons overflow outside the container.
- **Root Cause:** Unimplemented interactive map component and unscrollable flex container.
- **Affected Files:**
  - `src/pages/NearbyPage.tsx`
  - `src/services/nearbyService.ts`
- **Severity:** HIGH
- **Recommended Fix:** Implement an interactive map with service markers, info popups, navigation links, and synchronize it with list filters. Fix the radius selector layout with responsive wrapping/scroll.
- **Testing Requirements:** Open Nearby page on desktop and mobile viewports; verify all radius buttons fit, map markers render accurately, and clicking markers displays service cards.

---

### 13. Category Organization & Movie Languages

#### Issue 13.1: Missing Multi-Language Movies & Filters
- **Problem Description:** Seed data only has English and Hindi movies. Languages requested in Phase 13 (Bengali, Tamil, Telugu, Malayalam, Kannada) are missing or incomplete. `MoviesPage.tsx` language dropdown omits Bengali, Telugu, Malayalam, Kannada, and active tab switching ("Now Showing", "Coming Soon", "Top Rated") does nothing.
- **Root Cause:** Insufficient seed coverage and disconnected tab filter state.
- **Affected Files:**
  - `backend/src/seed/seed.ts`
  - `src/pages/MoviesPage.tsx`
  - `src/types.ts`
- **Severity:** MEDIUM
- **Recommended Fix:** Expand movie database seed with Bengali, Hindi, English, Tamil, Telugu, Malayalam, and Kannada titles. Update `MoviesPage.tsx` to filter by all supported languages and active status tabs.
- **Testing Requirements:** Filter movies by Bengali, Telugu, Tamil, Hindi; verify matching movies and showtimes appear.

#### Issue 13.2: Missing Categorization in Sports & Parks Pages
- **Problem Description:** `SportsPage.tsx` has no category tabs for Cricket, Football, Basketball, Tennis, Badminton, Other sports. `AttractionsPage.tsx` has no categorization for Water Parks, Zoo Parks, Amusement Parks, Theme Parks, Adventure Parks, Nature Parks.
- **Root Cause:** Monolithic unfiltered catalog fetches.
- **Affected Files:**
  - `src/pages/SportsPage.tsx`
  - `src/pages/AttractionsPage.tsx`
- **Severity:** MEDIUM
- **Recommended Fix:** Add category pill filters and subcategory routing to Sports and Parks pages, supported by backend catalog queries.
- **Testing Requirements:** Filter Sports by Cricket and Football; filter Attractions by Water Parks and Theme Parks.

---

### 14. Offers & Discounts

#### Issue 14.1: Offers Page Uses Static Mock Data & Missing Public Offers Endpoint
- **Problem Description:** `OffersPage.tsx` directly renders `MOCK_OFFERS`. Backend has `OfferModel` and `CouponModel`, but no `GET /api/coupons` or `GET /api/offers` public endpoint exists.
- **Root Cause:** Missing catalog route for offers/coupons.
- **Affected Files:**
  - `backend/src/routes/couponRoutes.ts`
  - `backend/src/controllers/couponController.ts`
  - `src/pages/OffersPage.tsx`
- **Severity:** MEDIUM
- **Recommended Fix:** Create `GET /api/coupons` and `GET /api/offers` public listing endpoints. Update `OffersPage.tsx` to fetch live offers from MongoDB.
- **Testing Requirements:** Add an offer via Admin Dashboard, navigate to Offers page, verify offer appears and coupon applies discount at checkout.

---

### 15. TypeScript Compilation & Build Warnings

#### Issue 15.1: Script Type Error in `scripts/verifyP8Script.ts`
- **Problem Description:** `tsc --noEmit` fails on `scripts/verifyP8Script.ts(51,30)` with `error TS2349: This expression is not callable` on Mongoose union model type.
- **Root Cause:** Incompatible union query signatures in TypeScript 5.8 with Mongoose 8.
- **Affected Files:**
  - `scripts/verifyP8Script.ts`
- **Severity:** LOW
- **Recommended Fix:** Cast union model to `(model as any).find({}).lean()`.
- **Testing Requirements:** Run `npx tsc --noEmit` and confirm 0 errors.

---

## Action Plan & Implementation Sequencing

1. **Phase 1 Deliverable:** Save `AUDIT_REPORT.md` (Completed).
2. **Phase 2 — Search & Discovery:** Fix `searchController.ts`, debouncing, multi-city querying, parameter sanitization, and `SearchResultsPage.tsx`.
3. **Phase 3 & 4 — Real-Time Availability & Online Payment:** Implement atomic inventory operations, two-step booking lifecycle, test environment Razorpay integration, HMAC verification, refund handling.
4. **Phase 5 — Customer Dashboard:** Enhance `MyTicketsPage.tsx` with date-based upcoming/completed filtering, rescheduling modal, refund tracking, and PDF/HTML invoices.
5. **Phase 6 — Wishlist & Favorites:** Real-time wishlist sync with MongoDB, favorite heart toggle on all cards, compare items modal.
6. **Phase 7 — Reviews & Ratings:** Build `Review` routes and controller, verified booking enforcement, review component, and admin moderation.
7. **Phase 8 & 9 — AI Booking Assistant & Recommendations:** Interactive natural-language assistant widget, recommendation engine for trending, popular, and personalized services.
8. **Phase 10 — Live Chat Support:** Chat model and endpoints, customer floating chat widget, admin conversation dashboard.
9. **Phase 11 — Notifications:** API-backed notifications, dispatching on all booking/payment events, read/unread sync.
10. **Phase 12 — Nearby Services & Interactive Map:** Interactive map with markers and service popups, true browser geolocation with manual fallback, responsive radius buttons.
11. **Phase 13 — Category Bug Fixes:** Multi-language movies (Bengali, Hindi, Tamil, Telugu, Malayalam, Kannada), sports categories, parks categories, live offers.
12. **Phase 14 & 15 — Admin & Security:** RBAC, secure bcrypt authentication, AuthModal, input validation.
13. **Phase 16 — UI/UX Polish:** Mobile responsiveness, active states, no dead buttons.
14. **Phase 17 & 18 — Verification & Reports:** Run end-to-end test suite, verify builds, generate `BUG_FIX_REPORT.md`, `IMPLEMENTATION_REPORT.md`, `TEST_REPORT.md`, and `DEPLOYMENT_CHECKLIST.md`.

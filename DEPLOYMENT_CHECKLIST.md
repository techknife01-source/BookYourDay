# BookYourDay — Production Deployment Checklist

**Date:** November 18, 2026  
**Target Environment:** Production (Multi-Tier Cloud / Containerized / PaaS)  
**Lead DevOps & Software Architect:** Senior Full-Stack Software Engineer, Software Architect, QA & Security Engineer  
**Repository:** https://github.com/techknife01-source/BookYourDay  

---

## 1. Pre-Deployment Environment Configuration

Ensure that all production secrets and URLs are provisioned securely in your hosting platform's secret manager (e.g., AWS Secrets Manager, Doppler, Vercel Environment Variables, Render Environment Groups). **Never commit raw production secrets to source control.**

### Backend Environment Variables (`backend/.env`)

```ini
# Server Configuration
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://bookyourday.com,https://admin.bookyourday.com

# Database Connection (MongoDB Atlas)
# Replace <username>, <password>, and <cluster-url> with your verified credentials
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>.mongodb.net/book-your-day?retryWrites=true&w=majority&appName=BookYourDay

# Authentication & Security
# Generate a cryptographically random 64-character secret: openssl rand -hex 32
JWT_SECRET=c8e7b93a21f456079d8e1234567890abcdef1234567890abcdef1234567890ab
JWT_EXPIRES_IN=7d

# Razorpay Payment Gateway (Production Live Keys)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Transactional Email Service (SendGrid / AWS SES / Postmark / SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="BookYourDay Support <no-reply@bookyourday.com>"

# AI Booking Assistant (Optional: Google Gemini API)
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Frontend Environment Variables (`.env.production`)

```ini
# API Gateway Target
VITE_API_URL=https://api.bookyourday.com/api

# Razorpay Client Key (Public Key Only)
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxx

# Production App Domain
VITE_APP_URL=https://bookyourday.com
```

---

## 2. Database Provisioning & MongoDB Atlas Setup

- [ ] **Provision Cluster:**
  - Create a MongoDB Atlas M10+ dedicated cluster (or serverless instance) in the primary cloud region (e.g., `ap-south-1` Mumbai for India).
- [ ] **Network Access:**
  - Whitelist backend application IP addresses (or configure AWS VPC Peering / Google Cloud Private Service Connect).
  - For dynamic container deployments (Render/Heroku/Vercel Serverless), ensure secure certificate-based TLS connection with IP whitelist configured as required.
- [ ] **Database User:**
  - Create a dedicated user with `readWrite` privileges specifically scoped to the `book-your-day` database.
- [ ] **Index Verification:**
  - Verify that indexes are created by running the backend initialization:
    - `ShowModel`: `{ movieId: 1, showDate: 1 }`, `{ venueId: 1 }`
    - `BookingModel`: `{ userId: 1, status: 1 }`, `{ bookingNumber: 1 }`
    - `PaymentModel`: `{ razorpayOrderId: 1 }`, `{ razorpayPaymentId: 1 }`
    - `UserModel`: `{ email: 1 }`
- [ ] **Initial Database Seeding:**
  - Run the seed script once to populate categories, venues, screens, cities, and initial listings:
    ```bash
    cd backend
    npm run seed
    ```

---

## 3. Razorpay Payment Gateway Configuration

- [ ] **Account Verification:**
  - Complete Business KYC verification on Razorpay Dashboard to activate Live Mode.
- [ ] **API Keys Generation:**
  - Generate Live API Key Pair (`RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`) in Razorpay Dashboard → Settings → API Keys.
- [ ] **Webhook Endpoint Registration:**
  - Navigate to Razorpay Dashboard → Settings → Webhooks.
  - Add Webhook URL: `https://api.bookyourday.com/api/payments/razorpay/webhook`.
  - Enter Secret: matching `RAZORPAY_WEBHOOK_SECRET`.
  - Subscribe to Active Events:
    - `payment.authorized`
    - `payment.captured`
    - `payment.failed`
    - `refund.created`
    - `refund.processed`
    - `order.paid`

---

## 4. Build & Hosting Architecture Options

### Option A: Decoupled Cloud Deployment (Recommended)
- **Frontend:** Hosted on **Vercel** / **Cloudflare Pages** / **AWS CloudFront + S3**
  - **Framework Preset:** Vite
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
  - **Single Page Application Rewrites:** Route all non-asset paths to `/index.html`.
- **Backend API:** Hosted on **Render** / **Railway** / **AWS ECS Fargate** / **Google Cloud Run**
  - **Root Directory:** `backend`
  - **Build Command:** `npm install && npm run build`
  - **Start Command:** `npm start` (or `node dist/server.js`)
  - **Health Check Path:** `/api/health`

### Option B: Monolithic Node.js Container Deployment (Docker)
- Build Docker container using Node 22+ Alpine base image.
- Execute frontend build and serve static assets via Express static middleware:
  ```dockerfile
  FROM node:22-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  RUN npm run build
  WORKDIR /app/backend
  COPY backend/package*.json ./
  RUN npm ci
  COPY backend/ .
  RUN npm run build

  FROM node:22-alpine AS runner
  WORKDIR /app
  COPY --from=builder /app/dist ./dist
  COPY --from=builder /app/backend/dist ./backend/dist
  COPY --from=builder /app/backend/node_modules ./backend/node_modules
  COPY --from=builder /app/backend/package.json ./backend/package.json
  EXPOSE 5000
  CMD ["node", "backend/dist/server.js"]
  ```

---

## 5. Security Hardening Checklist

- [ ] **SSL / TLS Termination:** Enforce HTTPS with TLS 1.3 across all subdomains.
- [ ] **HTTP Strict Transport Security (HSTS):** Enabled via Helmet with `max-age=31536000; includeSubDomains; preload`.
- [ ] **CORS Restrictions:** Verify `cors()` middleware explicitly whitelists only trusted production domains (`https://bookyourday.com`).
- [ ] **Content Security Policy (CSP):** Allow script execution only from self and trusted CDNs (e.g. `https://checkout.razorpay.com`).
- [ ] **Rate Limiting:** Protect authentication routes (`/api/auth/*`) and payment verification routes against brute force attacks.
- [ ] **Database Connection Security:** Ensure Mongoose connection uses SSL/TLS (`tls=true`) and secure credentials.
- [ ] **Zero Sensitive Storage:** Confirm zero storage of credit card numbers, CVVs, or unhashed passwords.

---

## 6. Monitoring, Logging & Health Checks

- [ ] **Health Check Probe:**
  - Probe `GET /api/health` every 30 seconds.
  - Returns `HTTP 200 { "status": "ok", "uptime": ..., "timestamp": ... }`.
- [ ] **Uptime & Ping Monitoring:**
  - Configure automated synthetic monitoring (e.g., Better Stack, UptimeRobot, or Pingdom) alerting on response latency >1,500ms or non-200 status.
- [ ] **Application Error Tracking:**
  - Integrate Sentry or Datadog APM for real-time unhandled rejection and exception tracking.
- [ ] **Database Backups:**
  - Configure MongoDB Atlas Continuous Cloud Backups with point-in-time recovery (PITR) enabled.

---

## 7. Post-Deployment Smoke Verification Procedure

Execute the following manual smoke tests immediately following initial production launch:

1. [ ] **Homepage & Discovery:** Load homepage, verify banners, categories, and trending carousels display without console errors.
2. [ ] **Search & Filtering:** Search for a movie or event in a selected city; apply price and rating filters; verify results populate.
3. [ ] **Authentication:** Register a new test user account; sign out; log in with new credentials; confirm user name appears in navbar.
4. [ ] **Show & Seat Selection:** Select a movie, pick a cinema venue, select an upcoming showtime, verify interactive seat layout loads.
5. [ ] **Booking & Coupon:** Select 2 seats, apply coupon code `FIRST50`, confirm ₹100 discount reflects in total calculation.
6. [ ] **Checkout:** Proceed to payment modal; initiate Razorpay checkout flow; complete test payment.
7. [ ] **Ticket Generation:** Confirm redirection to My Tickets page; verify ticket QR code, booking ID, venue address, and seat numbers display.
8. [ ] **Tax Invoice:** Click "Download Tax Invoice"; verify subtotal, GST (18%), and fee calculations render cleanly in the print view.
9. [ ] **Rescheduling:** Reschedule the confirmed booking to an alternate date; verify status updates immediately.
10. [ ] **Live Chat:** Open the floating Live Chat widget; send a support query; verify message persists.
11. [ ] **Customer Review:** Submit a 5-star verified booking review; verify review displays with Verified Booking badge.
12. [ ] **Admin Metrics:** Log in as administrator; inspect overview dashboard metrics; verify total revenue, bookings, and active tickets reflect the new transactions.

---

## 8. Rollback Strategy & Emergency Plan

- **Zero-Downtime Rollback:**
  - If a fatal regression occurs post-deployment, immediately trigger automated rollback to the previous green deployment tag on Vercel / Render.
- **Database Rollback:**
  - If schema migrations corrupt state, restore database to the pre-deployment point-in-time snapshot via MongoDB Atlas console.
- **Payment Circuit Breaker:**
  - If Razorpay gateway encounters an outage, set `PAYMENTS_PAUSED=true` in environment variables to temporarily display a maintenance banner on checkout while keeping catalog discovery fully operational.

# Book Your Day — Backend REST API

Standalone Express + Node.js backend application powering the Book Your Day ticketing platform.

## Architecture
- **Controllers**: Thin request handlers parsing input, calling services, and formatting JSON responses.
- **Models**: Mongoose schemas enforcing MongoDB data validation and structure.
- **Services**: Business logic modules (pricing engine, seat locks, refund rules).
- **Middleware**: JWT authentication, Zod input validation, and centralized error handling.

## API Base Endpoints
- `POST /api/auth/register` — User registration
- `POST /api/auth/login` — JWT Login
- `GET /api/movies` — List trending movies
- `GET /api/events` — List events by category
- `POST /api/bookings` — Create a new ticket booking
- `POST /api/seats/lock` — Temporary 10-min seat reservation lock
- `GET /api/partner/stats` — Partner dashboard revenue analytics

## Development Setup
```bash
npm install
npm run dev
```
Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.

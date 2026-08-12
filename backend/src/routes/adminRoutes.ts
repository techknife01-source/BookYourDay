import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/authMiddleware.js';
import { AdminController } from '../controllers/adminController.js';
import { PartnerController } from '../controllers/partnerController.js';

const router = Router();

// Protect all /api/admin routes with authentication and admin role
router.use(authenticate, requireRole(['admin']));

// Metrics & Analytics
router.get('/metrics', AdminController.getOverviewMetrics);

// Users Management
router.get('/users', AdminController.getUsers);
router.patch('/users/:userId/status', AdminController.updateUserStatus);

// Listing Moderation
router.get('/listings', AdminController.getListings);
router.patch('/listings/:category/:id/status', AdminController.updateListingStatus);

// Booking Operations
router.get('/bookings', AdminController.getBookings);
router.get('/bookings/:id', AdminController.getBookingById);

// Payment Operations
router.get('/payments', AdminController.getPayments);

// Ticket Operations
router.get('/tickets', AdminController.getTickets);

// Coupon & Offer Operations
router.get('/coupons', AdminController.getCoupons);
router.post('/coupons', AdminController.createCoupon);
router.put('/coupons/:id', AdminController.updateCoupon);
router.patch('/coupons/:id/status', AdminController.toggleCouponStatus);

// Global Admin Search
router.get('/search', AdminController.globalAdminSearch);

// Support Ticket Management
router.get('/support', AdminController.getSupportTickets);
router.patch('/support/:id', AdminController.updateSupportTicket);

// Travel Packages & Transfers Moderation
router.get('/travel/packages', AdminController.getAdminTravelPackages);
router.patch('/travel/packages/:id/status', AdminController.moderateTravelPackage);
router.get('/travel/transfers', AdminController.getAdminTransfers);
router.patch('/travel/transfers/:id/status', AdminController.moderateTransfer);

// Audit Logs
router.get('/audit-logs', PartnerController.getAuditLogs);

export default router;

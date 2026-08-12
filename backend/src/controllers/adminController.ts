import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { UserModel } from '../models/User.js';
import { PartnerModel } from '../models/Partner.js';
import { BookingModel } from '../models/Booking.js';
import { PaymentModel } from '../models/Payment.js';
import { TicketModel } from '../models/Ticket.js';
import { CouponModel } from '../models/Coupon.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { SupportTicketModel } from '../models/SupportTicket.js';
import { MovieModel } from '../models/Movie.js';
import { EventModel } from '../models/Event.js';
import { SportsEventModel } from '../models/SportsEvent.js';
import { AttractionModel } from '../models/Attraction.js';
import { RestaurantModel } from '../models/Restaurant.js';
import { ExperienceModel } from '../models/Experience.js';

import { TravelPackageModel } from '../models/TravelPackage.js';
import { TravelTransferModel } from '../models/TravelTransfer.js';

export class AdminController {
  /**
   * 1. Overview Metrics with Date Range Filtering
   */
  static async getOverviewMetrics(req: Request, res: Response) {
    try {
      const { range = '30d', startDate, endDate } = req.query;

      let dateFilter: any = {};
      const now = new Date();

      if (startDate && endDate) {
        dateFilter = { $gte: new Date(String(startDate)), $lte: new Date(String(endDate)) };
      } else if (range === 'today') {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        dateFilter = { $gte: startOfDay };
      } else if (range === '7d') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        dateFilter = { $gte: d };
      } else if (range === '30d') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        dateFilter = { $gte: d };
      } else if (range === '90d') {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        dateFilter = { $gte: d };
      }

      const bookingDateQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
      const paymentDateQuery = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

      const [
        totalUsers,
        totalPartners,
        pendingPartnerApplications,
        publishedMovies,
        publishedEvents,
        publishedSports,
        publishedAttractions,
        publishedRestaurants,
        publishedExperiences,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        grossBookingAgg,
        successfulPayments,
        failedPayments,
        refundAgg,
        activeTickets
      ] = await Promise.all([
        UserModel.countDocuments(),
        PartnerModel.countDocuments(),
        PartnerModel.countDocuments({ status: 'PENDING' }),
        MovieModel.countDocuments({ status: 'PUBLISHED' }),
        EventModel.countDocuments({ status: 'PUBLISHED' }),
        SportsEventModel.countDocuments({ status: 'PUBLISHED' }),
        AttractionModel.countDocuments({ status: 'PUBLISHED' }),
        RestaurantModel.countDocuments({ status: 'PUBLISHED' }),
        ExperienceModel.countDocuments({ status: 'PUBLISHED' }),
        BookingModel.countDocuments(bookingDateQuery),
        BookingModel.countDocuments({ ...bookingDateQuery, status: 'CONFIRMED' }),
        BookingModel.countDocuments({ ...bookingDateQuery, status: 'CANCELLED' }),
        BookingModel.aggregate([
          { $match: { ...bookingDateQuery, status: 'CONFIRMED' } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]),
        PaymentModel.countDocuments({ ...paymentDateQuery, status: 'SUCCESS' }),
        PaymentModel.countDocuments({ ...paymentDateQuery, status: 'FAILED' }),
        PaymentModel.aggregate([
          { $match: { ...paymentDateQuery, status: 'REFUNDED' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        TicketModel.countDocuments({ status: 'VALID' })
      ]);

      const publishedListings =
        publishedMovies +
        publishedEvents +
        publishedSports +
        publishedAttractions +
        publishedRestaurants +
        publishedExperiences;

      const grossBookingValue = grossBookingAgg[0]?.total || 0;
      const refundAmount = refundAgg[0]?.total || 0;

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalPartners,
          pendingPartnerApplications,
          publishedListings,
          totalBookings,
          confirmedBookings,
          cancelledBookings,
          grossBookingValue,
          successfulPayments,
          failedPayments,
          refundAmount,
          activeTickets,
          filterRange: range
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch overview metrics', error: err?.message });
    }
  }

  /**
   * 2. User Management
   */
  static async getUsers(req: Request, res: Response) {
    try {
      const { search, role, status, page = 1, limit = 20 } = req.query;
      const query: any = {};

      if (search) {
        const regex = new RegExp(String(search), 'i');
        query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
      }

      if (role) {
        query.role = role;
      }

      if (status) {
        query.status = status;
      }

      const p = Math.max(1, Number(page));
      const l = Math.min(100, Math.max(1, Number(limit)));
      const skip = (p - 1) * l;

      const [users, total] = await Promise.all([
        UserModel.find(query)
          .select('-passwordHash')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(l),
        UserModel.countDocuments(query)
      ]);

      return res.json({
        success: true,
        data: {
          users,
          pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch users', error: err?.message });
    }
  }

  static async updateUserStatus(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const { userId } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'SUSPENDED', 'DEACTIVATED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const prevStatus = user.status;
      user.status = status;
      await user.save();

      await AuditLogModel.create({
        actorUserId: authReq.user?.userId || 'admin',
        actorRole: 'admin',
        action: 'user_status_update',
        targetId: userId,
        targetType: 'User',
        details: { previousStatus: prevStatus, newStatus: status },
        timestamp: new Date()
      }).catch(() => null);

      return res.json({ success: true, message: `User status updated to ${status}`, data: { id: user._id, status } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update user status', error: err?.message });
    }
  }

  /**
   * 3. Listing Moderation
   */
  static async getListings(req: Request, res: Response) {
    try {
      const { category, search, status, partnerId, page = 1, limit = 20 } = req.query;

      const p = Math.max(1, Number(page));
      const l = Math.min(100, Math.max(1, Number(limit)));
      const skip = (p - 1) * l;

      const models: Record<string, { model: any; cat: string }> = {
        movie: { model: MovieModel, cat: 'movie' },
        event: { model: EventModel, cat: 'event' },
        sports: { model: SportsEventModel, cat: 'sports' },
        attraction: { model: AttractionModel, cat: 'attraction' },
        restaurant: { model: RestaurantModel, cat: 'restaurant' },
        experience: { model: ExperienceModel, cat: 'experience' }
      };

      const selectedCats = category && models[String(category).toLowerCase()]
        ? [models[String(category).toLowerCase()]]
        : Object.values(models);

      let allItems: any[] = [];

      for (const { model, cat } of selectedCats) {
        const query: any = {};
        if (status) query.status = status;
        if (partnerId) query.partnerId = partnerId;
        if (search) {
          const regex = new RegExp(String(search), 'i');
          query.$or = [{ title: regex }, { name: regex }, { city: regex }, { venueName: regex }];
        }

        const items = await model.find(query).lean();
        items.forEach((item: any) => {
          allItems.push({ ...item, category: cat });
        });
      }

      allItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      const total = allItems.length;
      const paginatedItems = allItems.slice(skip, skip + l);

      return res.json({
        success: true,
        data: {
          listings: paginatedItems,
          pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch listings', error: err?.message });
    }
  }

  static async updateListingStatus(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const { category, id } = req.params;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'PAUSED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid listing status' });
    }

    try {
      const modelMap: Record<string, any> = {
        MOVIE: MovieModel,
        EVENT: EventModel,
        SPORTS: SportsEventModel,
        ATTRACTION: AttractionModel,
        RESTAURANT: RestaurantModel,
        EXPERIENCE: ExperienceModel
      };

      const ModelClass = modelMap[String(category).toUpperCase()];
      if (!ModelClass) {
        return res.status(400).json({ success: false, message: 'Invalid domain category' });
      }

      const listing = await ModelClass.findById(id);
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }

      const previousStatus = listing.status;
      listing.status = status;
      await listing.save();

      await AuditLogModel.create({
        actorUserId: authReq.user?.userId || 'admin',
        actorRole: 'admin',
        action: 'listing_moderation',
        targetId: id,
        targetType: category,
        details: { previousStatus, newStatus: status },
        timestamp: new Date()
      }).catch(() => null);

      return res.json({ success: true, message: `Listing status updated to ${status}`, data: listing });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update listing status', error: err?.message });
    }
  }

  /**
   * 4. Booking Operations
   */
  static async getBookings(req: Request, res: Response) {
    try {
      const { bookingNumber, customer, partnerId, category, status, startDate, endDate, page = 1, limit = 20 } = req.query;

      const query: any = {};

      if (bookingNumber) {
        query.bookingNumber = new RegExp(String(bookingNumber), 'i');
      }

      if (customer) {
        const regex = new RegExp(String(customer), 'i');
        query.$or = [{ customerName: regex }, { customerEmail: regex }, { userId: customer }];
      }

      if (partnerId) {
        query.partnerId = partnerId;
      }

      if (category) {
        query.category = String(category).toLowerCase();
      }

      if (status) {
        query.status = status;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(String(startDate));
        if (endDate) query.createdAt.$lte = new Date(String(endDate));
      }

      const p = Math.max(1, Number(page));
      const l = Math.min(100, Math.max(1, Number(limit)));
      const skip = (p - 1) * l;

      const [bookings, total] = await Promise.all([
        BookingModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(l),
        BookingModel.countDocuments(query)
      ]);

      return res.json({
        success: true,
        data: {
          bookings,
          pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch bookings', error: err?.message });
    }
  }

  static async getBookingById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await BookingModel.findById(id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const [payment, ticket] = await Promise.all([
        PaymentModel.findOne({ bookingId: booking._id }).select('-razorpaySignature'),
        TicketModel.findOne({ bookingId: booking._id })
      ]);

      return res.json({
        success: true,
        data: {
          booking,
          payment,
          ticket
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch booking details', error: err?.message });
    }
  }

  /**
   * 5. Payment Operations
   */
  static async getPayments(req: Request, res: Response) {
    try {
      const { status, bookingId, userId, startDate, endDate, page = 1, limit = 20 } = req.query;

      const query: any = {};

      if (status) query.status = status;
      if (bookingId) query.bookingId = bookingId;
      if (userId) query.userId = userId;

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(String(startDate));
        if (endDate) query.createdAt.$lte = new Date(String(endDate));
      }

      const p = Math.max(1, Number(page));
      const l = Math.min(100, Math.max(1, Number(limit)));
      const skip = (p - 1) * l;

      const [payments, total] = await Promise.all([
        PaymentModel.find(query)
          .select('-razorpaySignature')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(l),
        PaymentModel.countDocuments(query)
      ]);

      return res.json({
        success: true,
        data: {
          payments,
          pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch payments', error: err?.message });
    }
  }

  /**
   * 6. Ticket Operations
   */
  static async getTickets(req: Request, res: Response) {
    try {
      const { ticketNumber, bookingNumber, userId, partnerId, category, status, page = 1, limit = 20 } = req.query;

      const query: any = {};

      if (ticketNumber) query.ticketNumber = new RegExp(String(ticketNumber), 'i');
      if (userId) query.userId = userId;
      if (status) query.status = status;

      if (bookingNumber) {
        const bookings = await BookingModel.find({ bookingNumber: new RegExp(String(bookingNumber), 'i') }).select('_id');
        const bookingIds = bookings.map(b => b._id);
        query.bookingId = { $in: bookingIds };
      }

      const p = Math.max(1, Number(page));
      const l = Math.min(100, Math.max(1, Number(limit)));
      const skip = (p - 1) * l;

      const [tickets, total] = await Promise.all([
        TicketModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(l),
        TicketModel.countDocuments(query)
      ]);

      return res.json({
        success: true,
        data: {
          tickets,
          pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch tickets', error: err?.message });
    }
  }

  /**
   * 7. Coupon & Offer Management
   */
  static async getCoupons(req: Request, res: Response) {
    try {
      const coupons = await CouponModel.find().sort({ validUntil: -1 });
      return res.json({ success: true, data: coupons });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch coupons', error: err?.message });
    }
  }

  static async createCoupon(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    try {
      const { code, description, discountType, discountValue, maxDiscountAmount, minBookingAmount, validUntil, isActive = true } = req.body;

      if (!code || !description || !discountType || discountValue === undefined || !validUntil) {
        return res.status(400).json({ success: false, message: 'Missing required coupon fields' });
      }

      if (!['PERCENTAGE', 'FLAT'].includes(discountType)) {
        return res.status(400).json({ success: false, message: 'discountType must be PERCENTAGE or FLAT' });
      }

      if (Number(discountValue) <= 0) {
        return res.status(400).json({ success: false, message: 'discountValue must be greater than 0' });
      }

      const coupon = await CouponModel.create({
        code: String(code).trim().toUpperCase(),
        description,
        discountType,
        discountValue: Number(discountValue),
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : undefined,
        minBookingAmount: minBookingAmount ? Number(minBookingAmount) : 0,
        validUntil: new Date(validUntil),
        isActive: Boolean(isActive)
      });

      await AuditLogModel.create({
        actorUserId: authReq.user?.userId || 'admin',
        actorRole: 'admin',
        action: 'coupon_creation',
        targetId: coupon._id.toString(),
        targetType: 'Coupon',
        details: { code: coupon.code, discountType, discountValue },
        timestamp: new Date()
      }).catch(() => null);

      return res.status(201).json({ success: true, message: 'Coupon created successfully', data: coupon });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to create coupon', error: err?.message });
    }
  }

  static async updateCoupon(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    try {
      const coupon = await CouponModel.findById(id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      Object.assign(coupon, req.body);
      if (req.body.code) coupon.code = String(req.body.code).trim().toUpperCase();
      await coupon.save();

      await AuditLogModel.create({
        actorUserId: authReq.user?.userId || 'admin',
        actorRole: 'admin',
        action: 'coupon_update',
        targetId: id,
        targetType: 'Coupon',
        details: { updatedFields: Object.keys(req.body) },
        timestamp: new Date()
      }).catch(() => null);

      return res.json({ success: true, message: 'Coupon updated successfully', data: coupon });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update coupon', error: err?.message });
    }
  }

  static async toggleCouponStatus(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    try {
      const coupon = await CouponModel.findById(id);
      if (!coupon) {
        return res.status(404).json({ success: false, message: 'Coupon not found' });
      }

      coupon.isActive = !coupon.isActive;
      await coupon.save();

      await AuditLogModel.create({
        actorUserId: authReq.user?.userId || 'admin',
        actorRole: 'admin',
        action: 'coupon_status_toggle',
        targetId: id,
        targetType: 'Coupon',
        details: { isActive: coupon.isActive },
        timestamp: new Date()
      }).catch(() => null);

      return res.json({ success: true, message: `Coupon is now ${coupon.isActive ? 'active' : 'inactive'}`, data: coupon });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to toggle coupon status', error: err?.message });
    }
  }

  /**
   * 8. Global Admin Search
   */
  static async globalAdminSearch(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q || String(q).trim().length === 0) {
        return res.json({
          success: true,
          data: { users: [], partners: [], listings: [], bookings: [], payments: [], tickets: [] }
        });
      }

      const regex = new RegExp(String(q).trim(), 'i');

      const [users, partners, bookings, payments, tickets, movies, events, sports, attractions, restaurants, experiences] = await Promise.all([
        UserModel.find({ $or: [{ name: regex }, { email: regex }, { phone: regex }] }).select('-passwordHash').limit(10),
        PartnerModel.find({ $or: [{ businessName: regex }, { email: regex }, { city: regex }] }).limit(10),
        BookingModel.find({ $or: [{ bookingNumber: regex }, { customerName: regex }, { itemTitle: regex }] }).limit(10),
        PaymentModel.find({ $or: [{ transactionId: regex }, { razorpayOrderId: regex }, { razorpayPaymentId: regex }] }).select('-razorpaySignature').limit(10),
        TicketModel.find({ $or: [{ ticketNumber: regex }, { itemTitle: regex }, { venueOrCinema: regex }] }).limit(10),
        MovieModel.find({ title: regex }).limit(5).lean(),
        EventModel.find({ title: regex }).limit(5).lean(),
        SportsEventModel.find({ title: regex }).limit(5).lean(),
        AttractionModel.find({ title: regex }).limit(5).lean(),
        RestaurantModel.find({ name: regex }).limit(5).lean(),
        ExperienceModel.find({ title: regex }).limit(5).lean()
      ]);

      const listings = [
        ...movies.map(m => ({ ...m, category: 'movie' })),
        ...events.map(e => ({ ...e, category: 'event' })),
        ...sports.map(s => ({ ...s, category: 'sports' })),
        ...attractions.map(a => ({ ...a, category: 'attraction' })),
        ...restaurants.map(r => ({ ...r, category: 'restaurant' })),
        ...experiences.map(x => ({ ...x, category: 'experience' }))
      ];

      return res.json({
        success: true,
        data: {
          users,
          partners,
          listings,
          bookings,
          payments,
          tickets
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Global admin search failed', error: err?.message });
    }
  }

  /**
   * 9. Support / Complaint Management
   */
  static async getSupportTickets(req: Request, res: Response) {
    try {
      const { status, priority, search, page = 1, limit = 20 } = req.query;

      const query: any = {};
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (search) {
        const regex = new RegExp(String(search), 'i');
        query.$or = [{ subject: regex }, { description: regex }];
      }

      const p = Math.max(1, Number(page));
      const l = Math.min(100, Math.max(1, Number(limit)));
      const skip = (p - 1) * l;

      const [tickets, total] = await Promise.all([
        SupportTicketModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(l),
        SupportTicketModel.countDocuments(query)
      ]);

      return res.json({
        success: true,
        data: {
          tickets,
          pagination: { page: p, limit: l, total, totalPages: Math.ceil(total / l) }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch support tickets', error: err?.message });
    }
  }

  static async updateSupportTicket(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { status, priority, assignedAdmin } = req.body;

    try {
      const ticket = await SupportTicketModel.findById(id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Support ticket not found' });
      }

      if (status) ticket.status = status;
      if (priority) ticket.priority = priority;
      if (assignedAdmin) ticket.assignedAdmin = assignedAdmin;
      ticket.updatedAt = new Date();

      await ticket.save();

      await AuditLogModel.create({
        actorUserId: authReq.user?.userId || 'admin',
        actorRole: 'admin',
        action: 'support_ticket_update',
        targetId: id,
        targetType: 'SupportTicket',
        details: { status, priority, assignedAdmin },
        timestamp: new Date()
      }).catch(() => null);

      return res.json({ success: true, message: 'Support ticket updated', data: ticket });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update support ticket', error: err?.message });
    }
  }

  /**
   * 10. Customer Support Endpoint (User submission)
   */
  static async submitSupportTicket(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { subject, description, bookingId, partnerId, priority = 'MEDIUM' } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ success: false, message: 'Subject and description are required' });
    }

    try {
      const ticket = await SupportTicketModel.create({
        userId,
        subject,
        description,
        bookingId,
        partnerId,
        priority,
        status: 'OPEN'
      });

      return res.status(201).json({ success: true, message: 'Support ticket created successfully', data: ticket });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to create support ticket', error: err?.message });
    }
  }

  static async getMySupportTickets(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      const tickets = await SupportTicketModel.find({ userId }).sort({ createdAt: -1 });
      return res.json({ success: true, data: tickets });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch support tickets', error: err?.message });
    }
  }

  /**
   * 11. Travel Packages Admin Moderation
   */
  static async getAdminTravelPackages(req: Request, res: Response) {
    try {
      const { status, partnerId, search } = req.query;
      const query: any = {};
      if (status) query.status = status;
      if (partnerId) query.partnerId = partnerId;
      if (search) {
        const regex = new RegExp(String(search), 'i');
        query.$or = [{ title: regex }, { origin: regex }, { destination: regex }];
      }

      const packages = await TravelPackageModel.find(query).sort({ createdAt: -1 });
      const enriched = packages.map((p) => ({ ...p.toObject(), id: p._id.toString() }));
      return res.json({ success: true, data: enriched });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch travel packages', error: err?.message });
    }
  }

  static async moderateTravelPackage(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['APPROVED', 'REJECTED', 'PUBLISHED', 'PAUSED', 'DRAFT', 'SUBMITTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
      const pkg = await TravelPackageModel.findById(id);
      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Travel package not found' });
      }

      pkg.status = status;
      await pkg.save();

      await AuditLogModel.create({
        actorUserId: authReq.user?.userId || 'admin',
        actorRole: 'admin',
        action: `TRAVEL_PACKAGE_${status}`,
        targetId: id,
        targetType: 'TRAVEL_PACKAGE',
        details: { status, rejectionReason },
        timestamp: new Date()
      }).catch(() => null);

      return res.json({
        success: true,
        message: `Travel package status updated to ${status}`,
        data: { ...pkg.toObject(), id: pkg._id.toString() }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to moderate travel package', error: err?.message });
    }
  }

  /**
   * 12. Travel Transfers Admin Moderation
   */
  static async getAdminTransfers(req: Request, res: Response) {
    try {
      const { status, partnerId, search } = req.query;
      const query: any = {};
      if (status) query.status = status;
      if (partnerId) query.partnerId = partnerId;
      if (search) {
        const regex = new RegExp(String(search), 'i');
        query.$or = [{ title: regex }, { origin: regex }, { destination: regex }, { vehicleType: regex }];
      }

      const transfers = await TravelTransferModel.find(query).sort({ createdAt: -1 });
      const enriched = transfers.map((t) => ({ ...t.toObject(), id: t._id.toString() }));
      return res.json({ success: true, data: enriched });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch travel transfers', error: err?.message });
    }
  }

  static async moderateTransfer(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['APPROVED', 'REJECTED', 'PUBLISHED', 'PAUSED', 'DRAFT', 'SUBMITTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    try {
      const tr = await TravelTransferModel.findById(id);
      if (!tr) {
        return res.status(404).json({ success: false, message: 'Transfer not found' });
      }

      tr.status = status;
      await tr.save();

      await AuditLogModel.create({
        actorUserId: authReq.user?.userId || 'admin',
        actorRole: 'admin',
        action: `TRAVEL_TRANSFER_${status}`,
        targetId: id,
        targetType: 'TRAVEL_TRANSFER',
        details: { status, rejectionReason },
        timestamp: new Date()
      }).catch(() => null);

      return res.json({
        success: true,
        message: `Transfer status updated to ${status}`,
        data: { ...tr.toObject(), id: tr._id.toString() }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to moderate transfer', error: err?.message });
    }
  }
}

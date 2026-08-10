import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { PartnerModel } from '../models/Partner.js';
import { UserModel } from '../models/User.js';
import { AuditLogModel } from '../models/AuditLog.js';
import { EventModel } from '../models/Event.js';
import { SportsEventModel } from '../models/SportsEvent.js';
import { AttractionModel } from '../models/Attraction.js';
import { RestaurantModel } from '../models/Restaurant.js';
import { ExperienceModel } from '../models/Experience.js';
import { MovieModel } from '../models/Movie.js';
import { ShowModel } from '../models/Show.js';
import { VenueModel } from '../models/Venue.js';
import { BookingModel } from '../models/Booking.js';
import { PaymentModel } from '../models/Payment.js';

export class PartnerController {
  /**
   * Submit partner onboarding application
   */
  static async applyPartner(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const {
      businessName,
      businessType,
      description,
      email,
      phone,
      address,
      city,
      state = 'West Bengal',
      country = 'India'
    } = req.body;

    if (!businessName || !businessType || !email || !city) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: businessName, businessType, email, city'
      });
    }

    try {
      let partner = await PartnerModel.findOne({ userId });
      if (partner) {
        partner.businessName = businessName;
        partner.businessType = businessType;
        if (description) partner.description = description;
        partner.email = email;
        if (phone) partner.phone = phone;
        if (address) partner.address = address;
        partner.city = city;
        partner.state = state;
        partner.country = country;
        partner.status = 'PENDING';
        partner.updatedAt = new Date();
        await partner.save();
      } else {
        partner = await PartnerModel.create({
          userId,
          businessName,
          businessType,
          description,
          email,
          phone,
          address,
          city,
          state,
          country,
          status: 'PENDING',
          verified: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      await UserModel.updateOne({ _id: userId }, { $set: { role: 'partner' } }).catch(() => null);

      await AuditLogModel.create({
        actorUserId: userId,
        actorRole: authReq.user?.role || 'partner',
        action: 'partner_application',
        targetId: partner._id.toString(),
        targetType: 'Partner',
        details: { businessName, businessType, status: partner.status },
        timestamp: new Date()
      }).catch(() => null);

      return res.status(201).json({
        success: true,
        message: 'Partner application submitted successfully and is pending admin approval.',
        data: partner
      });
    } catch (err: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to submit partner application',
        error: err?.message
      });
    }
  }

  /**
   * Get current partner profile
   */
  static async getPartnerProfile(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      const partner = await PartnerModel.findOne({ userId });
      if (!partner) {
        return res.status(404).json({
          success: false,
          message: 'Partner record not found for this user.'
        });
      }
      return res.json({ success: true, data: partner });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Server error', error: err?.message });
    }
  }

  /**
   * Get partner dashboard statistics based on actual verified database records
   */
  static async getDashboard(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      let partner = await PartnerModel.findOne({ userId });
      if (!partner && authReq.user?.role === 'admin' && req.query.partnerId) {
        partner = await PartnerModel.findById(req.query.partnerId as string);
      }

      if (!partner) {
        return res.status(404).json({
          success: false,
          message: 'Partner account not found'
        });
      }

      const partnerIdStr = partner._id.toString();

      // Find all listings owned by this partner across domains
      const [events, sports, attractions, restaurants, experiences, movies, shows] = await Promise.all([
        EventModel.find({ partnerId: partnerIdStr }),
        SportsEventModel.find({ partnerId: partnerIdStr }),
        AttractionModel.find({ partnerId: partnerIdStr }),
        RestaurantModel.find({ partnerId: partnerIdStr }),
        ExperienceModel.find({ partnerId: partnerIdStr }),
        MovieModel.find({ partnerId: partnerIdStr }),
        ShowModel.find({ partnerId: partnerIdStr })
      ]);

      const itemIds = [
        ...events.map(e => e._id.toString()),
        ...sports.map(s => s._id.toString()),
        ...attractions.map(a => a._id.toString()),
        ...restaurants.map(r => r._id.toString()),
        ...experiences.map(x => x._id.toString()),
        ...movies.map(m => m._id.toString()),
        ...shows.map(s => s._id.toString())
      ];

      // Find bookings belonging to partner
      const bookings = await BookingModel.find({
        $or: [
          { partnerId: partnerIdStr },
          { itemId: { $in: itemIds } },
          { showId: { $in: itemIds } }
        ]
      });

      const bookingIds = bookings.map(b => b._id.toString());
      const payments = await PaymentModel.find({ bookingId: { $in: bookingIds } });

      const successfulPayments = payments.filter(p => p.status === 'SUCCESS');
      const grossBookingValue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);

      const confirmedBookingsCount = bookings.filter(b => b.status === 'CONFIRMED').length;
      const cancelledBookingsCount = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REFUNDED').length;
      const refundedPayments = payments.filter(p => p.status === 'REFUNDED');
      const refundsAmount = refundedPayments.reduce((sum, p) => sum + p.amount, 0);

      const totalListings = events.length + sports.length + attractions.length + restaurants.length + experiences.length + movies.length + shows.length;

      return res.json({
        success: true,
        partner: {
          id: partner._id,
          businessName: partner.businessName,
          businessType: partner.businessType,
          city: partner.city,
          status: partner.status,
          verified: partner.verified
        },
        stats: {
          grossBookingValue,
          successfulBookingsCount: confirmedBookingsCount,
          cancelledBookingsCount,
          refundsCount: refundedPayments.length,
          refundsAmount,
          totalListingsCount: totalListings
        },
        recentListings: [
          ...events.map(e => ({ id: e._id, title: e.title, category: 'EVENT', status: e.status || 'PUBLISHED', price: e.startingPrice })),
          ...sports.map(s => ({ id: s._id, title: s.title, category: 'SPORTS', status: s.status || 'PUBLISHED', price: s.startingPrice })),
          ...attractions.map(a => ({ id: a._id, title: a.title, category: 'ATTRACTION', status: a.status || 'PUBLISHED', price: a.entryPrice })),
          ...restaurants.map(r => ({ id: r._id, title: r.name, category: 'RESTAURANT', status: r.status || 'PUBLISHED', price: r.costForTwo })),
          ...experiences.map(x => ({ id: x._id, title: x.title, category: 'EXPERIENCE', status: x.status || 'PUBLISHED', price: x.pricePerPerson })),
          ...movies.map(m => ({ id: m._id, title: m.title, category: 'MOVIE', status: m.status || 'PUBLISHED', price: 250 }))
        ].slice(0, 10)
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch partner dashboard', error: err?.message });
    }
  }

  /**
   * Get all partner listings across domain models
   */
  static async getListings(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      const partner = await PartnerModel.findOne({ userId });
      if (!partner) {
        return res.status(404).json({ success: false, message: 'Partner record not found' });
      }

      const partnerIdStr = partner._id.toString();

      const [events, sports, attractions, restaurants, experiences, movies, shows] = await Promise.all([
        EventModel.find({ partnerId: partnerIdStr }),
        SportsEventModel.find({ partnerId: partnerIdStr }),
        AttractionModel.find({ partnerId: partnerIdStr }),
        RestaurantModel.find({ partnerId: partnerIdStr }),
        ExperienceModel.find({ partnerId: partnerIdStr }),
        MovieModel.find({ partnerId: partnerIdStr }),
        ShowModel.find({ partnerId: partnerIdStr })
      ]);

      const items = [
        ...events.map(e => ({ ...e.toObject(), category: 'EVENT', id: e._id.toString() })),
        ...sports.map(s => ({ ...s.toObject(), category: 'SPORTS', id: s._id.toString() })),
        ...attractions.map(a => ({ ...a.toObject(), category: 'ATTRACTION', id: a._id.toString() })),
        ...restaurants.map(r => ({ ...r.toObject(), category: 'RESTAURANT', id: r._id.toString() })),
        ...experiences.map(x => ({ ...x.toObject(), category: 'EXPERIENCE', id: x._id.toString() })),
        ...movies.map(m => ({ ...m.toObject(), category: 'MOVIE', id: m._id.toString() })),
        ...shows.map(s => ({ ...s.toObject(), category: 'SHOW', id: s._id.toString() }))
      ];

      return res.json({ success: true, data: items });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch listings', error: err?.message });
    }
  }

  /**
   * Create a new partner listing
   */
  static async createListing(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      const partner = await PartnerModel.findOne({ userId });
      if (!partner) {
        return res.status(404).json({ success: false, message: 'Partner profile not found' });
      }

      if (partner.status !== 'APPROVED') {
        return res.status(403).json({
          success: false,
          message: `Partner account is currently ${partner.status}. Only APPROVED partners can publish bookable inventory.`
        });
      }

      const { category = 'EVENT', status = 'SUBMITTED', ...data } = req.body;
      const partnerIdStr = partner._id.toString();

      let createdListing: any;
      const catUpper = String(category).toUpperCase();

      if (catUpper === 'EVENT') {
        createdListing = await EventModel.create({
          title: data.title || 'New Partner Event',
          category: data.eventCategory || 'Concert',
          image: data.image || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600',
          backdrop: data.backdrop,
          date: data.date || 'SAT, 24 AUG 2026',
          time: data.time || '18:00',
          venue: data.venue || partner.businessName,
          city: data.city || partner.city,
          startingPrice: Number(data.startingPrice || data.price) || 500,
          organizer: partner.businessName,
          description: data.description || 'Partner hosted event',
          ticketTiers: data.ticketTiers || [{ id: 't1', name: 'Standard Ticket', price: Number(data.price || 500), description: 'General Entry', availableQuantity: 100 }],
          partnerId: partnerIdStr,
          status
        });
      } else if (catUpper === 'SPORTS') {
        createdListing = await SportsEventModel.create({
          title: data.title || 'New Sports Match',
          sportType: data.sportType || 'Cricket',
          teamsOrPlayers: data.teamsOrPlayers || ['Team A', 'Team B'],
          image: data.image || 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600',
          date: data.date || 'SUN, 30 AUG 2026',
          time: data.time || '19:00',
          venue: data.venue || partner.businessName,
          city: data.city || partner.city,
          startingPrice: Number(data.startingPrice || data.price) || 800,
          organizer: partner.businessName,
          description: data.description || 'Partner sports tournament',
          ticketTiers: data.ticketTiers || [{ id: 'st1', name: 'Match Ticket', price: Number(data.price || 800), description: 'Standard Seat', availableQuantity: 200 }],
          partnerId: partnerIdStr,
          status
        });
      } else if (catUpper === 'ATTRACTION') {
        createdListing = await AttractionModel.create({
          title: data.title || 'Partner Attraction Pass',
          category: data.attractionCategory || 'Theme Park',
          image: data.image || 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=600',
          city: data.city || partner.city,
          address: data.address || partner.address || 'Central City Road',
          timings: data.timings || '10:00 AM - 08:00 PM',
          entryPrice: Number(data.entryPrice || data.price) || 400,
          description: data.description || 'Entry pass for attraction',
          inclusions: data.inclusions || ['Full Access', 'Free Locker'],
          partnerId: partnerIdStr,
          status
        });
      } else if (catUpper === 'RESTAURANT') {
        createdListing = await RestaurantModel.create({
          name: data.title || data.name || partner.businessName,
          cuisine: data.cuisine || ['Multi-Cuisine'],
          image: data.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600',
          city: data.city || partner.city,
          locality: data.locality || partner.address || 'Main Road',
          costForTwo: Number(data.costForTwo || data.price) || 1200,
          discountOffer: data.discountOffer || 'Flat 15% OFF',
          isBookable: true,
          partnerId: partnerIdStr,
          status
        });
      } else if (catUpper === 'EXPERIENCE') {
        createdListing = await ExperienceModel.create({
          title: data.title || 'Exclusive Experience',
          type: data.type || 'Workshop',
          image: data.image || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600',
          city: data.city || partner.city,
          duration: data.duration || '2 Hours',
          pricePerPerson: Number(data.pricePerPerson || data.price) || 1500,
          description: data.description || 'Memorable experience',
          highlights: data.highlights || ['Guided Tour', 'Refreshments included'],
          partnerId: partnerIdStr,
          status
        });
      } else if (catUpper === 'MOVIE') {
        createdListing = await MovieModel.create({
          title: data.title || 'Partner Special Screening',
          poster: data.image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600',
          backdrop: data.backdrop || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200',
          duration: data.duration || '2h 15m',
          releaseDate: data.releaseDate || new Date().toISOString().split('T')[0],
          genre: data.genre || ['Drama'],
          language: data.language || ['English'],
          format: data.format || ['2D'],
          description: data.description || 'Special movie screening',
          cast: data.cast || [{ name: 'Lead Actor', role: 'Hero', avatar: '' }],
          director: data.director || partner.businessName,
          partnerId: partnerIdStr,
          status
        });
      } else if (catUpper === 'SHOW') {
        createdListing = await ShowModel.create({
          movieId: data.movieId,
          venueId: data.venueId,
          screenId: data.screenId,
          date: data.date || new Date().toISOString().split('T')[0],
          startTime: data.startTime || '19:00',
          priceCategories: data.priceCategories || [{ category: 'Standard', price: Number(data.price || 350) }],
          partnerId: partnerIdStr,
          status
        });
      } else {
        return res.status(400).json({ success: false, message: 'Unsupported category' });
      }

      partner.totalListings += 1;
      await partner.save();

      await AuditLogModel.create({
        actorUserId: userId,
        actorRole: 'partner',
        action: 'listing_creation',
        targetId: createdListing._id.toString(),
        targetType: catUpper,
        details: { category: catUpper, title: data.title, status },
        timestamp: new Date()
      }).catch(() => null);

      return res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        data: { ...createdListing.toObject(), id: createdListing._id.toString() }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to create listing', error: err?.message });
    }
  }

  /**
   * Update listing lifecycle status (DRAFT, SUBMITTED, PUBLISHED, PAUSED)
   */
  static async updateListingStatus(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const { category, id } = req.params;
    const { status } = req.body;

    if (!['DRAFT', 'SUBMITTED', 'APPROVED', 'PUBLISHED', 'PAUSED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid listing status' });
    }

    try {
      const partner = await PartnerModel.findOne({ userId });
      if (!partner) {
        return res.status(404).json({ success: false, message: 'Partner record not found' });
      }

      if (status === 'PUBLISHED' && partner.status !== 'APPROVED') {
        return res.status(403).json({
          success: false,
          message: 'Cannot publish listing because partner account is not APPROVED.'
        });
      }

      const partnerIdStr = partner._id.toString();
      const modelMap: Record<string, any> = {
        EVENT: EventModel,
        SPORTS: SportsEventModel,
        ATTRACTION: AttractionModel,
        RESTAURANT: RestaurantModel,
        EXPERIENCE: ExperienceModel,
        MOVIE: MovieModel,
        SHOW: ShowModel
      };

      const ModelClass = modelMap[String(category).toUpperCase()];
      if (!ModelClass) {
        return res.status(400).json({ success: false, message: 'Invalid domain category' });
      }

      const listing = await ModelClass.findById(id);
      if (!listing) {
        return res.status(404).json({ success: false, message: 'Listing not found' });
      }

      if (listing.partnerId && listing.partnerId.toString() !== partnerIdStr && authReq.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized access to this listing' });
      }

      listing.status = status;
      await listing.save();

      await AuditLogModel.create({
        actorUserId: userId,
        actorRole: authReq.user?.role || 'partner',
        action: 'listing_status_update',
        targetId: id,
        targetType: category,
        details: { newStatus: status },
        timestamp: new Date()
      }).catch(() => null);

      return res.json({ success: true, message: `Listing status updated to ${status}`, data: listing });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update listing status', error: err?.message });
    }
  }

  /**
   * Get bookings belonging to current partner's inventory
   */
  static async getPartnerBookings(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      const partner = await PartnerModel.findOne({ userId });
      if (!partner && authReq.user?.role !== 'admin') {
        return res.status(404).json({ success: false, message: 'Partner record not found' });
      }

      const partnerIdStr = partner ? partner._id.toString() : req.query.partnerId as string;

      const [events, sports, attractions, restaurants, experiences, movies, shows] = await Promise.all([
        EventModel.find({ partnerId: partnerIdStr }),
        SportsEventModel.find({ partnerId: partnerIdStr }),
        AttractionModel.find({ partnerId: partnerIdStr }),
        RestaurantModel.find({ partnerId: partnerIdStr }),
        ExperienceModel.find({ partnerId: partnerIdStr }),
        MovieModel.find({ partnerId: partnerIdStr }),
        ShowModel.find({ partnerId: partnerIdStr })
      ]);

      const itemIds = [
        ...events.map(e => e._id.toString()),
        ...sports.map(s => s._id.toString()),
        ...attractions.map(a => a._id.toString()),
        ...restaurants.map(r => r._id.toString()),
        ...experiences.map(x => x._id.toString()),
        ...movies.map(m => m._id.toString()),
        ...shows.map(s => s._id.toString())
      ];

      const bookings = await BookingModel.find({
        $or: [
          { partnerId: partnerIdStr },
          { itemId: { $in: itemIds } },
          { showId: { $in: itemIds } }
        ]
      }).sort({ createdAt: -1 });

      const sanitizedBookings = bookings.map(b => ({
        id: b._id.toString(),
        bookingNumber: b.bookingNumber,
        itemTitle: b.itemTitle,
        category: b.category,
        date: b.date,
        time: b.time,
        seatsOrTicketsDetails: b.seatsOrTicketsDetails,
        quantity: b.quantity,
        totalAmount: b.totalAmount,
        status: b.status,
        customerName: b.customerName,
        createdAt: b.createdAt
      }));

      return res.json({ success: true, data: sanitizedBookings });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch partner bookings', error: err?.message });
    }
  }

  /**
   * Get partner revenue report based on actual verified Payment records
   */
  static async getPartnerRevenue(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    try {
      const partner = await PartnerModel.findOne({ userId });
      if (!partner) {
        return res.status(404).json({ success: false, message: 'Partner record not found' });
      }

      const partnerIdStr = partner._id.toString();

      const [events, sports, attractions, restaurants, experiences, movies, shows] = await Promise.all([
        EventModel.find({ partnerId: partnerIdStr }),
        SportsEventModel.find({ partnerId: partnerIdStr }),
        AttractionModel.find({ partnerId: partnerIdStr }),
        RestaurantModel.find({ partnerId: partnerIdStr }),
        ExperienceModel.find({ partnerId: partnerIdStr }),
        MovieModel.find({ partnerId: partnerIdStr }),
        ShowModel.find({ partnerId: partnerIdStr })
      ]);

      const itemIds = [
        ...events.map(e => e._id.toString()),
        ...sports.map(s => s._id.toString()),
        ...attractions.map(a => a._id.toString()),
        ...restaurants.map(r => r._id.toString()),
        ...experiences.map(x => x._id.toString()),
        ...movies.map(m => m._id.toString()),
        ...shows.map(s => s._id.toString())
      ];

      const bookings = await BookingModel.find({
        $or: [
          { partnerId: partnerIdStr },
          { itemId: { $in: itemIds } },
          { showId: { $in: itemIds } }
        ]
      });

      const bookingIds = bookings.map(b => b._id.toString());
      const payments = await PaymentModel.find({ bookingId: { $in: bookingIds } });

      const successfulPayments = payments.filter(p => p.status === 'SUCCESS');
      const refundedPayments = payments.filter(p => p.status === 'REFUNDED');

      const grossBookingValue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalRefundsAmount = refundedPayments.reduce((sum, p) => sum + p.amount, 0);
      const netRevenue = grossBookingValue - totalRefundsAmount;

      return res.json({
        success: true,
        data: {
          grossBookingValue,
          successfulBookingsCount: successfulPayments.length,
          cancelledBookingsCount: bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REFUNDED').length,
          refundsCount: refundedPayments.length,
          refundsAmount: totalRefundsAmount,
          netRevenue
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to generate revenue report', error: err?.message });
    }
  }

  // ================= ADMIN PARTNER MANAGEMENT =================

  /**
   * Admin endpoint: List all partner applications
   */
  static async getAllPartners(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (authReq.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privilege required' });
    }

    const { status } = req.query;
    const query = status ? { status: String(status).toUpperCase() } : {};

    try {
      const partners = await PartnerModel.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, data: partners });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch partners', error: err?.message });
    }
  }

  /**
   * Admin endpoint: Approve, Reject, Suspend or Reactivate a partner
   */
  static async updatePartnerStatus(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (authReq.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin privilege required' });
    }

    const { partnerId } = req.params;
    const { status, rejectionReason } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid partner status' });
    }

    try {
      const partner = await PartnerModel.findById(partnerId);
      if (!partner) {
        return res.status(404).json({ success: false, message: 'Partner not found' });
      }

      partner.status = status as any;
      partner.verified = (status === 'APPROVED');
      if (rejectionReason) {
        partner.rejectionReason = rejectionReason;
      }
      partner.updatedAt = new Date();
      await partner.save();

      // If partner is suspended or rejected, pause their published listings
      if (status === 'SUSPENDED' || status === 'REJECTED') {
        const partnerIdStr = partner._id.toString();
        await Promise.all([
          EventModel.updateMany({ partnerId: partnerIdStr }, { $set: { status: 'PAUSED' } }),
          SportsEventModel.updateMany({ partnerId: partnerIdStr }, { $set: { status: 'PAUSED' } }),
          AttractionModel.updateMany({ partnerId: partnerIdStr }, { $set: { status: 'PAUSED' } }),
          RestaurantModel.updateMany({ partnerId: partnerIdStr }, { $set: { status: 'PAUSED' } }),
          ExperienceModel.updateMany({ partnerId: partnerIdStr }, { $set: { status: 'PAUSED' } }),
          MovieModel.updateMany({ partnerId: partnerIdStr }, { $set: { status: 'PAUSED' } }),
          ShowModel.updateMany({ partnerId: partnerIdStr }, { $set: { status: 'PAUSED' } })
        ]).catch(() => null);
      }

      await AuditLogModel.create({
        actorUserId: authReq.user.userId,
        actorRole: 'admin',
        action: `partner_${status.toLowerCase()}`,
        targetId: partnerId,
        targetType: 'Partner',
        details: { status, rejectionReason },
        timestamp: new Date()
      }).catch(() => null);

      return res.json({
        success: true,
        message: `Partner status updated to ${status}`,
        data: partner
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to update partner status', error: err?.message });
    }
  }
}

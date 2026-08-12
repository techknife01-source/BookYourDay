import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { TravelPackageModel } from '../models/TravelPackage.js';
import { TravelTransferModel } from '../models/TravelTransfer.js';
import { BookingModel } from '../models/Booking.js';
import { PartnerModel } from '../models/Partner.js';
import { PricingService } from '../services/pricingService.js';
import { RazorpayService } from '../services/razorpayService.js';
import { AuditLogModel } from '../models/AuditLog.js';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class TravelController {
  // ==========================================
  // PUBLIC TRAVEL PACKAGES
  // ==========================================
  static async getPackages(req: Request, res: Response) {
    try {
      const {
        q,
        destination,
        origin,
        minPrice,
        maxPrice,
        minRating,
        sort = 'price_low',
        page = 1,
        limit = 12
      } = req.query;

      const filter: any = { status: 'PUBLISHED' };

      if (destination) {
        filter.destination = { $regex: new RegExp(escapeRegex(destination as string), 'i') };
      }

      if (origin) {
        filter.origin = { $regex: new RegExp(escapeRegex(origin as string), 'i') };
      }

      if (q) {
        const regexQ = new RegExp(escapeRegex(q as string), 'i');
        filter.$or = [
          { title: regexQ },
          { description: regexQ },
          { origin: regexQ },
          { destination: regexQ },
          { inclusions: regexQ }
        ];
      }

      if (minRating) {
        filter.rating = { $gte: Number(minRating) };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.startingPrice = {};
        if (minPrice !== undefined) filter.startingPrice.$gte = Number(minPrice);
        if (maxPrice !== undefined) filter.startingPrice.$lte = Number(maxPrice);
      }

      const p = Math.max(1, Number(page));
      const l = Math.max(1, Math.min(50, Number(limit)));
      const skip = (p - 1) * l;

      let sortOption: any = { startingPrice: 1 };
      if (sort === 'price_high') sortOption = { startingPrice: -1 };
      if (sort === 'rating') sortOption = { rating: -1 };

      const packages = await TravelPackageModel.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(l)
        .catch(() => []);

      let total = await TravelPackageModel.countDocuments(filter).catch(() => 0);

      let items = packages.map((pkg) => ({
        id: pkg._id.toString(),
        _id: pkg._id.toString(),
        partnerId: pkg.partnerId,
        title: pkg.title,
        description: pkg.description,
        images: pkg.images,
        image: pkg.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80',
        origin: pkg.origin,
        destination: pkg.destination,
        durationDays: pkg.durationDays,
        durationNights: pkg.durationNights,
        startingPrice: pkg.startingPrice,
        pricePerAdult: pkg.pricePerAdult,
        pricePerChild: pkg.pricePerChild,
        currency: pkg.currency || 'INR',
        inclusions: pkg.inclusions,
        exclusions: pkg.exclusions,
        itinerary: pkg.itinerary,
        cancellationPolicy: pkg.cancellationPolicy,
        maxGuests: pkg.maxGuests,
        availableCapacity: pkg.availableCapacity,
        rating: pkg.rating,
        reviewCount: pkg.reviewCount,
        availableFrom: pkg.availableFrom,
        availableUntil: pkg.availableUntil,
        status: pkg.status
      }));

      if (items.length === 0) {
        items = FALLBACK_PACKAGES.filter(p => p.status === 'PUBLISHED') as any;
        total = items.length;
      }

      return res.status(200).json({
        success: true,
        data: {
          packages: items,
          pagination: {
            total,
            page: p,
            limit: l,
            totalPages: Math.ceil(total / l)
          }
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch travel packages'
      });
    }
  }

  static async getPackageById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Invalid travel package ID' });
      }

      let pkg: any = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        pkg = await TravelPackageModel.findById(id).catch(() => null);
      }

      if (!pkg) {
        pkg = FALLBACK_PACKAGES.find(p => p.id === id || p._id === id);
      }

      if (!pkg) {
        return res.status(404).json({ success: false, message: 'Travel package not found' });
      }

      // Customer visibility check
      const authReq = req as AuthRequest;
      let partnerIdStr = '';
      if (authReq.user?.role === 'partner' && authReq.user?.userId) {
        const partner = await PartnerModel.findOne({ userId: authReq.user.userId }).catch(() => null);
        if (partner) partnerIdStr = partner._id.toString();
      }

      const isOwnerOrAdmin =
        authReq.user?.role === 'admin' ||
        (authReq.user?.role === 'partner' && partnerIdStr && partnerIdStr === pkg.partnerId);

      if (pkg.status !== 'PUBLISHED' && !isOwnerOrAdmin) {
        return res.status(404).json({ success: false, message: 'Travel package not found or unavailable' });
      }

      const pkgData = typeof pkg.toObject === 'function' ? pkg.toObject() : pkg;

      return res.status(200).json({
        success: true,
        data: {
          ...pkgData,
          id: pkgData._id?.toString() || pkgData.id,
          _id: pkgData._id?.toString() || pkgData.id
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to fetch package details' });
    }
  }

  static async createPackageBooking(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const {
      packageId,
      departureDate,
      adults = 1,
      children = 0,
      couponCode,
      customerName = authReq.user?.email?.split('@')[0] || 'Traveller',
      customerEmail = authReq.user?.email || 'traveller@example.com',
      customerPhone = '+1 (555) 000-0000',
      idempotencyKey
    } = req.body;

    if (!packageId || !departureDate) {
      return res.status(400).json({ success: false, message: 'packageId and departureDate are required.' });
    }

    const depDate = new Date(departureDate);
    if (isNaN(depDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid departureDate format.' });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (depDate < now) {
      return res.status(400).json({ success: false, message: 'Departure date cannot be in the past.' });
    }

    const numAdults = Math.max(1, Number(adults));
    const numChildren = Math.max(0, Number(children));

    // Idempotency check
    const effectiveKey = idempotencyKey || req.headers['x-idempotency-key'];
    if (effectiveKey) {
      const existing = await BookingModel.findOne({ idempotencyKey: effectiveKey });
      if (existing) {
        const obj: any = existing.toObject ? existing.toObject() : existing;
        return res.status(200).json({
          success: true,
          message: 'Booking retrieved from idempotent request',
          data: { ...obj, id: obj._id ? obj._id.toString() : obj.id }
        });
      }
    }

    try {
      const pkg = await TravelPackageModel.findById(packageId);
      if (!pkg || pkg.status !== 'PUBLISHED') {
        return res.status(404).json({ success: false, message: 'Travel package unavailable.' });
      }

      // Check dates within available range
      if (depDate < new Date(pkg.availableFrom) || depDate > new Date(pkg.availableUntil)) {
        return res.status(400).json({
          success: false,
          message: `Departure date must be between ${pkg.availableFrom.toISOString().split('T')[0]} and ${pkg.availableUntil.toISOString().split('T')[0]}.`
        });
      }

      // Guest count capacity validation
      if (numAdults + numChildren > pkg.maxGuests) {
        return res.status(400).json({
          success: false,
          message: `Group size exceeds maximum allowed limit of ${pkg.maxGuests} guests per booking.`
        });
      }

      // Atomic inventory capacity reservation check
      const updatedPackage = await TravelPackageModel.findOneAndUpdate(
        {
          _id: packageId,
          status: 'PUBLISHED',
          availableCapacity: { $gte: 1 }
        },
        { $inc: { availableCapacity: -1 } },
        { new: true }
      );

      if (!updatedPackage) {
        return res.status(409).json({
          success: false,
          message: 'Package capacity exhausted or unavailable for the selected date.'
        });
      }

      // Calculate unit price based on adults and children
      const unitPrice = (pkg.pricePerAdult * numAdults) + (pkg.pricePerChild * numChildren);

      const pricing = await PricingService.calculatePriceAsync({
        unitPrice,
        quantity: 1,
        couponCode
      });

      const bookingNumber = `BYD-TRV-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins hold

      const seatsOrTicketsDetails = `${numAdults} Adult(s), ${numChildren} Child(ren) • Departure: ${depDate.toISOString().split('T')[0]}`;

      const newBooking = new BookingModel({
        bookingNumber,
        userId,
        category: 'TRAVEL',
        itemTitle: pkg.title,
        itemImage: pkg.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80',
        venueOrCinema: `${pkg.origin} to ${pkg.destination} (${pkg.durationDays}D/${pkg.durationNights}N)`,
        city: pkg.destination,
        date: depDate.toISOString().split('T')[0],
        time: '08:00',
        seatsOrTicketsDetails,
        quantity: 1,
        subtotal: pricing.subtotal,
        convenienceFee: pricing.convenienceFee,
        taxes: pricing.taxes,
        discount: pricing.discount,
        totalAmount: pricing.totalAmount,
        status: 'PAYMENT_PENDING',
        paymentMethod: 'UPI',
        expiresAt,
        qrCodeData: JSON.stringify({ bookingNumber, package: pkg.title, departure: depDate, guests: numAdults + numChildren }),
        customerName,
        customerEmail,
        customerPhone,
        itemId: packageId,
        partnerId: pkg.partnerId,
        idempotencyKey: effectiveKey
      });

      await newBooking.save();

      // Create Razorpay Order
      const razorpayOrder = await RazorpayService.createOrder(
        pricing.totalAmount,
        'INR',
        bookingNumber,
        {
          bookingId: newBooking._id.toString(),
          category: 'TRAVEL',
          userId,
          packageTitle: pkg.title
        }
      );

      newBooking.razorpayOrderId = razorpayOrder.id;
      await newBooking.save();

      return res.status(201).json({
        success: true,
        message: 'Travel package reservation initiated. Proceed with payment.',
        data: {
          booking: {
            ...newBooking.toObject(),
            id: newBooking._id.toString()
          },
          razorpay: {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKey123'
          },
          package: {
            title: pkg.title,
            origin: pkg.origin,
            destination: pkg.destination,
            cancellationPolicy: pkg.cancellationPolicy
          }
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to process travel package booking' });
    }
  }

  // ==========================================
  // PUBLIC TRANSFERS
  // ==========================================
  static async getTransfers(req: Request, res: Response) {
    try {
      const {
        q,
        origin,
        destination,
        vehicleType,
        minPrice,
        maxPrice,
        minRating,
        sort = 'price_low',
        page = 1,
        limit = 12
      } = req.query;

      const filter: any = { status: 'PUBLISHED' };

      if (origin) {
        filter.origin = { $regex: new RegExp(escapeRegex(origin as string), 'i') };
      }

      if (destination) {
        filter.destination = { $regex: new RegExp(escapeRegex(destination as string), 'i') };
      }

      if (vehicleType) {
        filter.vehicleType = { $regex: new RegExp(escapeRegex(vehicleType as string), 'i') };
      }

      if (q) {
        const regexQ = new RegExp(escapeRegex(q as string), 'i');
        filter.$or = [
          { title: regexQ },
          { description: regexQ },
          { origin: regexQ },
          { destination: regexQ },
          { vehicleType: regexQ }
        ];
      }

      if (minRating) {
        filter.rating = { $gte: Number(minRating) };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        filter.pricePerVehicle = {};
        if (minPrice !== undefined) filter.pricePerVehicle.$gte = Number(minPrice);
        if (maxPrice !== undefined) filter.pricePerVehicle.$lte = Number(maxPrice);
      }

      const p = Math.max(1, Number(page));
      const l = Math.max(1, Math.min(50, Number(limit)));
      const skip = (p - 1) * l;

      let sortOption: any = { pricePerVehicle: 1 };
      if (sort === 'price_high') sortOption = { pricePerVehicle: -1 };

      const transfers = await TravelTransferModel.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(l)
        .catch(() => []);

      let total = await TravelTransferModel.countDocuments(filter).catch(() => 0);

      let items = transfers.map((tr) => ({
        id: tr._id.toString(),
        _id: tr._id.toString(),
        partnerId: tr.partnerId,
        title: tr.title,
        origin: tr.origin,
        destination: tr.destination,
        vehicleType: tr.vehicleType,
        description: tr.description,
        images: tr.images,
        image: tr.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80',
        capacity: tr.capacity,
        pricePerVehicle: tr.pricePerVehicle,
        priceFrom: tr.pricePerVehicle,
        currency: tr.currency || 'INR',
        availableCapacity: tr.availableCapacity,
        rating: tr.rating,
        reviewCount: tr.reviewCount,
        cancellationPolicy: tr.cancellationPolicy,
        availableFrom: tr.availableFrom,
        availableUntil: tr.availableUntil,
        status: tr.status
      }));

      if (items.length === 0) {
        items = FALLBACK_TRANSFERS.filter(t => t.status === 'PUBLISHED') as any;
        total = items.length;
      }

      return res.status(200).json({
        success: true,
        data: {
          transfers: items,
          pagination: {
            total,
            page: p,
            limit: l,
            totalPages: Math.ceil(total / l)
          }
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to fetch transfers' });
    }
  }

  static async getTransferById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Invalid transfer ID' });
      }

      let tr: any = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        tr = await TravelTransferModel.findById(id).catch(() => null);
      }

      if (!tr) {
        tr = FALLBACK_TRANSFERS.find(t => t.id === id || t._id === id);
      }

      if (!tr) {
        return res.status(404).json({ success: false, message: 'Transfer not found' });
      }

      const authReq = req as AuthRequest;
      let partnerIdStr = '';
      if (authReq.user?.role === 'partner' && authReq.user?.userId) {
        const partner = await PartnerModel.findOne({ userId: authReq.user.userId }).catch(() => null);
        if (partner) partnerIdStr = partner._id.toString();
      }

      const isOwnerOrAdmin =
        authReq.user?.role === 'admin' ||
        (authReq.user?.role === 'partner' && partnerIdStr && partnerIdStr === tr.partnerId);

      if (tr.status !== 'PUBLISHED' && !isOwnerOrAdmin) {
        return res.status(404).json({ success: false, message: 'Transfer unavailable or not found' });
      }

      const trData = typeof tr.toObject === 'function' ? tr.toObject() : tr;

      return res.status(200).json({
        success: true,
        data: {
          ...trData,
          id: trData._id?.toString() || trData.id,
          _id: trData._id?.toString() || trData.id
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to fetch transfer details' });
    }
  }

  static async createTransferBooking(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const {
      transferId,
      pickupDate,
      pickupTime = '10:00',
      passengerCount = 1,
      pickupLocation,
      dropLocation,
      vehiclesCount = 1,
      couponCode,
      customerName = authReq.user?.email?.split('@')[0] || 'Passenger',
      customerEmail = authReq.user?.email || 'passenger@example.com',
      customerPhone = '+1 (555) 000-0000',
      idempotencyKey
    } = req.body;

    if (!transferId || !pickupDate || !pickupLocation || !dropLocation) {
      return res.status(400).json({
        success: false,
        message: 'transferId, pickupDate, pickupLocation, and dropLocation are required.'
      });
    }

    const pDate = new Date(pickupDate);
    if (isNaN(pDate.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid pickupDate format.' });
    }

    const numPassengers = Math.max(1, Number(passengerCount));
    const numVehicles = Math.max(1, Number(vehiclesCount));

    // Idempotency check
    const effectiveKey = idempotencyKey || req.headers['x-idempotency-key'];
    if (effectiveKey) {
      const existing = await BookingModel.findOne({ idempotencyKey: effectiveKey });
      if (existing) {
        const obj: any = existing.toObject ? existing.toObject() : existing;
        return res.status(200).json({
          success: true,
          message: 'Booking retrieved from idempotent request',
          data: { ...obj, id: obj._id ? obj._id.toString() : obj.id }
        });
      }
    }

    try {
      const tr = await TravelTransferModel.findById(transferId);
      if (!tr || tr.status !== 'PUBLISHED') {
        return res.status(404).json({ success: false, message: 'Transfer service unavailable.' });
      }

      // Validate passenger capacity per vehicle
      if (numPassengers > tr.capacity * numVehicles) {
        return res.status(400).json({
          success: false,
          message: `${numPassengers} passengers exceed capacity of ${numVehicles} vehicle(s) (Max ${tr.capacity} passengers per vehicle).`
        });
      }

      // Atomic vehicle capacity decrement
      const updatedTransfer = await TravelTransferModel.findOneAndUpdate(
        {
          _id: transferId,
          status: 'PUBLISHED',
          availableCapacity: { $gte: numVehicles }
        },
        { $inc: { availableCapacity: -numVehicles } },
        { new: true }
      );

      if (!updatedTransfer) {
        return res.status(409).json({
          success: false,
          message: 'Insufficient transfer vehicles available for selected slot.'
        });
      }

      const unitPrice = tr.pricePerVehicle;
      const pricing = await PricingService.calculatePriceAsync({
        unitPrice,
        quantity: numVehicles,
        couponCode
      });

      const bookingNumber = `BYD-TRF-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const seatsOrTicketsDetails = `${numPassengers} Passenger(s) • ${numVehicles} Vehicle(s) (${tr.vehicleType}) • ${pickupLocation} to ${dropLocation}`;

      const newBooking = new BookingModel({
        bookingNumber,
        userId,
        category: 'TRANSFER',
        itemTitle: `${tr.title} (${tr.vehicleType})`,
        itemImage: tr.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80',
        venueOrCinema: `${pickupLocation} → ${dropLocation}`,
        city: tr.destination,
        date: pDate.toISOString().split('T')[0],
        time: pickupTime,
        seatsOrTicketsDetails,
        quantity: numVehicles,
        subtotal: pricing.subtotal,
        convenienceFee: pricing.convenienceFee,
        taxes: pricing.taxes,
        discount: pricing.discount,
        totalAmount: pricing.totalAmount,
        status: 'PAYMENT_PENDING',
        paymentMethod: 'UPI',
        expiresAt,
        qrCodeData: JSON.stringify({ bookingNumber, transfer: tr.title, pickupLocation, dropLocation, pickupDate }),
        customerName,
        customerEmail,
        customerPhone,
        itemId: transferId,
        partnerId: tr.partnerId,
        idempotencyKey: effectiveKey
      });

      await newBooking.save();

      // Create Razorpay Order
      const razorpayOrder = await RazorpayService.createOrder(
        pricing.totalAmount,
        'INR',
        bookingNumber,
        {
          bookingId: newBooking._id.toString(),
          category: 'TRANSFER',
          userId,
          transferTitle: tr.title
        }
      );

      newBooking.razorpayOrderId = razorpayOrder.id;
      await newBooking.save();

      return res.status(201).json({
        success: true,
        message: 'Transfer reservation initiated. Proceed with payment.',
        data: {
          booking: {
            ...newBooking.toObject(),
            id: newBooking._id.toString()
          },
          razorpay: {
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKey123'
          },
          transfer: {
            title: tr.title,
            vehicleType: tr.vehicleType,
            cancellationPolicy: tr.cancellationPolicy
          }
        }
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to process transfer booking' });
    }
  }

  // ==========================================
  // PARTNER MANAGEMENT
  // ==========================================
  static async createPartnerPackage(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== 'partner' || !authReq.user.userId) {
      return res.status(403).json({ success: false, message: 'Partner authentication required.' });
    }

    const partner = await PartnerModel.findOne({ userId: authReq.user.userId });
    if (!partner) {
      return res.status(403).json({ success: false, message: 'Partner profile not found.' });
    }

    const {
      title,
      description,
      images,
      origin,
      destination,
      durationDays = 1,
      durationNights = 0,
      startingPrice,
      pricePerAdult,
      pricePerChild = 0,
      inclusions = [],
      exclusions = [],
      itinerary = [],
      cancellationPolicy = 'FREE_CANCELLATION',
      maxGuests = 10,
      totalCapacity = 50,
      availableFrom = new Date(),
      availableUntil = new Date(Date.now() + 180 * 86400000)
    } = req.body;

    if (!title || !description || !origin || !destination || (!startingPrice && !pricePerAdult)) {
      return res.status(400).json({
        success: false,
        message: 'title, description, origin, destination, and startingPrice/pricePerAdult are required.'
      });
    }

    try {
      const baseAdultPrice = Number(pricePerAdult || startingPrice);
      const pkg = new TravelPackageModel({
        partnerId: partner._id.toString(),
        title,
        description,
        images: images && images.length ? images : ['https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80'],
        origin,
        destination,
        durationDays: Number(durationDays),
        durationNights: Number(durationNights),
        startingPrice: baseAdultPrice,
        pricePerAdult: baseAdultPrice,
        pricePerChild: Number(pricePerChild),
        inclusions,
        exclusions,
        itinerary,
        cancellationPolicy,
        maxGuests: Number(maxGuests),
        totalCapacity: Number(totalCapacity),
        availableCapacity: Number(totalCapacity),
        availableFrom: new Date(availableFrom),
        availableUntil: new Date(availableUntil),
        status: 'SUBMITTED'
      });

      await pkg.save();

      await AuditLogModel.create({
        actorUserId: authReq.user.userId,
        actorRole: 'partner',
        action: 'TRAVEL_PACKAGE_CREATED',
        targetId: pkg._id.toString(),
        targetType: 'TRAVEL_PACKAGE',
        details: { title, origin, destination }
      });

      return res.status(201).json({
        success: true,
        message: 'Travel package created and submitted for admin review.',
        data: pkg
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to create travel package' });
    }
  }

  static async getPartnerPackages(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== 'partner' || !authReq.user.userId) {
      return res.status(403).json({ success: false, message: 'Partner authentication required.' });
    }

    const partner = await PartnerModel.findOne({ userId: authReq.user.userId });
    if (!partner) {
      return res.status(403).json({ success: false, message: 'Partner profile not found.' });
    }

    try {
      const packages = await TravelPackageModel.find({ partnerId: partner._id.toString() });
      const enriched = packages.map((p) => ({ ...p.toObject(), id: p._id.toString() }));
      return res.status(200).json({ success: true, data: enriched });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to fetch partner packages' });
    }
  }

  static async createPartnerTransfer(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== 'partner' || !authReq.user.userId) {
      return res.status(403).json({ success: false, message: 'Partner authentication required.' });
    }

    const partner = await PartnerModel.findOne({ userId: authReq.user.userId });
    if (!partner) {
      return res.status(403).json({ success: false, message: 'Partner profile not found.' });
    }

    const {
      title,
      origin,
      destination,
      vehicleType,
      description,
      images,
      capacity = 4,
      pricePerVehicle,
      totalCapacity = 20,
      cancellationPolicy = 'FREE_CANCELLATION',
      availableFrom = new Date(),
      availableUntil = new Date(Date.now() + 180 * 86400000)
    } = req.body;

    if (!title || !origin || !destination || !vehicleType || !pricePerVehicle) {
      return res.status(400).json({
        success: false,
        message: 'title, origin, destination, vehicleType, and pricePerVehicle are required.'
      });
    }

    try {
      const transfer = new TravelTransferModel({
        partnerId: partner._id.toString(),
        title,
        origin,
        destination,
        vehicleType,
        description: description || `${vehicleType} transfer from ${origin} to ${destination}`,
        images: images && images.length ? images : ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80'],
        capacity: Number(capacity),
        pricePerVehicle: Number(pricePerVehicle),
        totalCapacity: Number(totalCapacity),
        availableCapacity: Number(totalCapacity),
        cancellationPolicy,
        availableFrom: new Date(availableFrom),
        availableUntil: new Date(availableUntil),
        status: 'SUBMITTED'
      });

      await transfer.save();

      await AuditLogModel.create({
        actorUserId: authReq.user.userId,
        actorRole: 'partner',
        action: 'TRAVEL_TRANSFER_CREATED',
        targetId: transfer._id.toString(),
        targetType: 'TRAVEL_TRANSFER',
        details: { title, origin, destination, vehicleType }
      });

      return res.status(201).json({
        success: true,
        message: 'Travel transfer created and submitted for admin review.',
        data: transfer
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to create transfer' });
    }
  }

  static async getPartnerTransfers(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== 'partner' || !authReq.user.userId) {
      return res.status(403).json({ success: false, message: 'Partner authentication required.' });
    }

    const partner = await PartnerModel.findOne({ userId: authReq.user.userId });
    if (!partner) {
      return res.status(403).json({ success: false, message: 'Partner profile not found.' });
    }

    try {
      const transfers = await TravelTransferModel.find({ partnerId: partner._id.toString() });
      const enriched = transfers.map((t) => ({ ...t.toObject(), id: t._id.toString() }));
      return res.status(200).json({ success: true, data: enriched });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to fetch partner transfers' });
    }
  }
}

const FALLBACK_PACKAGES = [
  {
    id: 'pkg-darjeeling-001',
    _id: 'pkg-darjeeling-001',
    partnerId: 'partner-default',
    title: 'Darjeeling Himalayan Mist & Tea Estate Odyssey',
    description: '4-day luxury hill station experience through historic tea plantations, Tiger Hill sunrise views, and Toy Train heritage rides.',
    images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80'],
    image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
    origin: 'Asansol',
    destination: 'Darjeeling',
    durationDays: 4,
    durationNights: 3,
    startingPrice: 12500,
    pricePerAdult: 12500,
    pricePerChild: 6500,
    currency: 'INR',
    inclusions: ['Luxury Hotel Stay with Mountain Views', 'Daily Breakfast & Dinner', 'Toy Train Heritage Ride Ticket', 'Private SUV Sightseeing Transfer'],
    exclusions: ['Lunch', 'Personal shopping'],
    itinerary: [
      { day: 1, title: 'Arrival & Mall Road Stroll', destination: 'Darjeeling', activities: ['Check-in', 'Evening tea walk'], meals: ['Dinner'] },
      { day: 2, title: 'Tiger Hill Sunrise & Himalayan Mountaineering Institute', destination: 'Darjeeling', activities: ['Sunrise view', 'HMI museum'], meals: ['Breakfast', 'Dinner'] },
      { day: 3, title: 'Heritage Toy Train & Tea Estate Tour', destination: 'Darjeeling', activities: ['Happy Valley tea tour', 'Toy train ride'], meals: ['Breakfast', 'Dinner'] },
      { day: 4, title: 'Return Journey', destination: 'Asansol', activities: ['Check-out', 'Scenic drive return'], meals: ['Breakfast'] }
    ],
    cancellationPolicy: 'FREE_CANCELLATION',
    maxGuests: 10,
    availableCapacity: 20,
    rating: 4.9,
    reviewCount: 84,
    status: 'PUBLISHED'
  },
  {
    id: 'pkg-sundarbans-002',
    _id: 'pkg-sundarbans-002',
    partnerId: 'partner-default',
    title: 'Sundarbans Wilderness Cruise & Eco Tour',
    description: '3-day mangrove safari experience into the Royal Bengal Tiger habitat with riverboat cruising and folk music.',
    images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&auto=format&fit=crop&q=80'],
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&auto=format&fit=crop&q=80',
    origin: 'Asansol',
    destination: 'Sundarbans',
    durationDays: 3,
    durationNights: 2,
    startingPrice: 7800,
    pricePerAdult: 7800,
    pricePerChild: 4200,
    currency: 'INR',
    inclusions: ['Riverboat Safari Cruise', 'Forest Permit & Guide', 'All Meals Onboard', 'Eco Resort Stay'],
    exclusions: ['Camera fees'],
    itinerary: [
      { day: 1, title: 'Godkhali & Boat Boarding', destination: 'Sundarbans', activities: ['Cruising'], meals: ['Lunch', 'Dinner'] },
      { day: 2, title: 'Deep Forest Safari', destination: 'Sundarbans', activities: ['Canopy walk'], meals: ['Breakfast', 'Lunch', 'Dinner'] },
      { day: 3, title: 'Village Walk & Return', destination: 'Asansol', activities: ['Local craft demo'], meals: ['Breakfast', 'Lunch'] }
    ],
    cancellationPolicy: 'FREE_CANCELLATION',
    maxGuests: 12,
    availableCapacity: 40,
    rating: 4.8,
    reviewCount: 62,
    status: 'PUBLISHED'
  }
];

const FALLBACK_TRANSFERS = [
  {
    id: 'tr-airport-001',
    _id: 'tr-airport-001',
    partnerId: 'partner-default',
    title: 'Airport Express Sedan Transfer',
    origin: 'Asansol City Center',
    destination: 'Kolkata Airport (CCU)',
    vehicleType: 'Executive Sedan',
    description: 'Door-to-door comfortable sedan transfer between Asansol city and Durgapur/Kolkata airport.',
    images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80'],
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80',
    capacity: 4,
    pricePerVehicle: 3800,
    priceFrom: 3800,
    currency: 'INR',
    availableCapacity: 15,
    rating: 4.9,
    reviewCount: 112,
    cancellationPolicy: 'FREE_CANCELLATION',
    status: 'PUBLISHED'
  },
  {
    id: 'tr-suv-002',
    _id: 'tr-suv-002',
    partnerId: 'partner-default',
    title: 'Luxury SUV Station & Hotel Transfer',
    origin: 'Asansol Junction Railway Station',
    destination: 'Grand Hotel Asansol',
    vehicleType: 'Premium SUV',
    description: 'Spacious Innova Crysta SUV transfer ideal for families with luggage connecting railway stations to hotels.',
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80'],
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80',
    capacity: 6,
    pricePerVehicle: 1500,
    priceFrom: 1500,
    currency: 'INR',
    availableCapacity: 10,
    rating: 4.8,
    reviewCount: 75,
    cancellationPolicy: 'FREE_CANCELLATION',
    status: 'PUBLISHED'
  }
];

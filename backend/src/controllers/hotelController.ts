import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { HotelModel } from '../models/Hotel.js';
import { RoomTypeModel } from '../models/RoomType.js';
import { RoomInventoryModel } from '../models/RoomInventory.js';
import { HotelReservationModel } from '../models/HotelReservation.js';
import { BookingModel } from '../models/Booking.js';
import { PartnerModel } from '../models/Partner.js';
import { PricingService } from '../services/pricingService.js';
import { RazorpayService } from '../services/razorpayService.js';
import { AuditLogModel } from '../models/AuditLog.js';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class HotelController {
  // Public search and list hotels
  static async getHotels(req: Request, res: Response) {
    try {
      const {
        q,
        city,
        checkIn,
        checkOut,
        guests,
        rooms = 1,
        minPrice,
        maxPrice,
        minRating,
        sort = 'rating_desc',
        page = 1,
        limit = 12
      } = req.query;

      const filter: any = { status: 'PUBLISHED' };

      if (city) {
        filter.city = { $regex: new RegExp(escapeRegex(city as string), 'i') };
      }

      if (q) {
        const queryRegex = new RegExp(escapeRegex(q as string), 'i');
        filter.$or = [
          { name: queryRegex },
          { description: queryRegex },
          { city: queryRegex },
          { address: queryRegex }
        ];
      }

      if (minRating) {
        filter.rating = { $gte: Number(minRating) };
      }

      const p = Math.max(1, Number(page));
      const l = Math.max(1, Math.min(50, Number(limit)));
      const skip = (p - 1) * l;

      let sortOption: any = { rating: -1 };
      if (sort === 'rating_asc') sortOption = { rating: 1 };

      const hotels = await HotelModel.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(l);

      const total = await HotelModel.countDocuments(filter);

      // Enhance with room pricing & availability
      const hotelList = await Promise.all(
        hotels.map(async (h) => {
          const roomTypes = await RoomTypeModel.find({ hotelId: h._id.toString(), status: 'ACTIVE' });
          let minBasePrice = 1500;
          if (roomTypes.length > 0) {
            minBasePrice = Math.min(...roomTypes.map((r) => r.basePrice));
          }

          return {
            id: h._id.toString(),
            _id: h._id.toString(),
            partnerId: h.partnerId,
            name: h.name,
            description: h.description,
            images: h.images,
            image: h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
            address: h.address,
            city: h.city,
            state: h.state,
            country: h.country,
            latitude: h.latitude,
            longitude: h.longitude,
            rating: h.rating,
            reviewCount: h.reviewCount,
            amenities: h.amenities,
            checkInTime: h.checkInTime,
            checkOutTime: h.checkOutTime,
            cancellationPolicy: h.cancellationPolicy,
            priceFrom: minBasePrice,
            currency: 'INR',
            availability: 'AVAILABLE',
            status: h.status
          };
        })
      );

      // Apply price filter if requested
      let filteredList = hotelList;
      if (minPrice) {
        filteredList = filteredList.filter((item) => item.priceFrom >= Number(minPrice));
      }
      if (maxPrice) {
        filteredList = filteredList.filter((item) => item.priceFrom <= Number(maxPrice));
      }

      return res.status(200).json({
        success: true,
        data: {
          hotels: filteredList,
          pagination: {
            total: filteredList.length,
            page: p,
            limit: l,
            totalPages: Math.ceil(total / l)
          }
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch hotels'
      });
    }
  }

  // Get hotel details by ID with room availability check
  static async getHotelById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { checkIn, checkOut, adults = 2, children = 0, rooms = 1 } = req.query;

      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid hotel ID format'
        });
      }

      const hotel = await HotelModel.findById(id);
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: 'Hotel not found'
        });
      }

      // Customer visibility check: must be PUBLISHED unless partner or admin
      const authReq = req as AuthRequest;
      let partnerIdStr = '';
      if (authReq.user?.role === 'partner' && authReq.user?.userId) {
        const partner = await PartnerModel.findOne({ userId: authReq.user.userId });
        if (partner) partnerIdStr = partner._id.toString();
      }

      const isOwnerOrAdmin =
        authReq.user?.role === 'admin' ||
        (authReq.user?.role === 'partner' && partnerIdStr && partnerIdStr === hotel.partnerId);

      if (hotel.status !== 'PUBLISHED' && !isOwnerOrAdmin) {
        return res.status(404).json({
          success: false,
          message: 'Hotel not found or currently unavailable'
        });
      }

      const roomTypes = await RoomTypeModel.find({ hotelId: id, status: 'ACTIVE' });

      // Check dates availability if provided
      let checkInDate: Date | null = checkIn ? new Date(checkIn as string) : null;
      let checkOutDate: Date | null = checkOut ? new Date(checkOut as string) : null;

      let numberOfNights = 1;
      if (checkInDate && checkOutDate && !isNaN(checkInDate.getTime()) && !isNaN(checkOutDate.getTime())) {
        const diff = checkOutDate.getTime() - checkInDate.getTime();
        numberOfNights = Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
      } else {
        checkInDate = new Date();
        checkOutDate = new Date(Date.now() + 86400000);
      }

      // Check available room units per room type for dates
      const processedRoomTypes = await Promise.all(
        roomTypes.map(async (rt) => {
          const totalUnits = await RoomInventoryModel.find({
            hotelId: id,
            roomTypeId: rt._id.toString(),
            status: 'AVAILABLE'
          });

          // Check occupied units for checkIn < checkOut
          const occupiedReservations = await HotelReservationModel.find({
            inventoryId: { $in: totalUnits.map((u) => u._id.toString()) },
            status: { $in: ['CONFIRMED', 'PAYMENT_PENDING'] },
            $or: [
              { expiresAt: { $exists: false } },
              { expiresAt: { $gt: new Date() } }
            ],
            checkIn: { $lt: checkOutDate },
            checkOut: { $gt: checkInDate }
          });

          const occupiedIds = new Set(occupiedReservations.map((r) => r.inventoryId.toString()));
          const availableCount = totalUnits.filter((u) => !occupiedIds.has(u._id.toString())).length;

          const reqAdults = Number(adults);
          const reqChildren = Number(children);
          const reqRooms = Number(rooms);

          const maxAdultsPerRoom = rt.maxAdults || 2;
          const maxGuestsPerRoom = rt.maxGuests || 3;

          const fitsCapacity =
            reqAdults <= maxAdultsPerRoom * reqRooms &&
            reqAdults + reqChildren <= maxGuestsPerRoom * reqRooms;

          return {
            id: rt._id.toString(),
            _id: rt._id.toString(),
            hotelId: rt.hotelId,
            name: rt.name,
            description: rt.description,
            images: rt.images,
            maxAdults: rt.maxAdults,
            maxChildren: rt.maxChildren,
            maxGuests: rt.maxGuests,
            bedType: rt.bedType,
            amenities: rt.amenities,
            basePrice: rt.basePrice,
            currency: rt.currency,
            totalRooms: rt.totalRooms,
            availableRooms: availableCount,
            isBookable: availableCount >= reqRooms && fitsCapacity,
            fitsCapacity
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: {
          hotel: {
            id: hotel._id.toString(),
            _id: hotel._id.toString(),
            partnerId: hotel.partnerId,
            name: hotel.name,
            description: hotel.description,
            images: hotel.images,
            address: hotel.address,
            city: hotel.city,
            state: hotel.state,
            country: hotel.country,
            latitude: hotel.latitude,
            longitude: hotel.longitude,
            rating: hotel.rating,
            reviewCount: hotel.reviewCount,
            amenities: hotel.amenities,
            checkInTime: hotel.checkInTime,
            checkOutTime: hotel.checkOutTime,
            cancellationPolicy: hotel.cancellationPolicy,
            status: hotel.status
          },
          searchQuery: {
            checkIn: checkInDate.toISOString().split('T')[0],
            checkOut: checkOutDate.toISOString().split('T')[0],
            numberOfNights,
            adults: Number(adults),
            children: Number(children),
            rooms: Number(rooms)
          },
          roomTypes: processedRoomTypes
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || 'Failed to fetch hotel details'
      });
    }
  }

  // Create Hotel Booking & Reserve Inventory Atomically
  static async createHotelBooking(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const {
      hotelId,
      roomTypeId,
      checkIn,
      checkOut,
      adults = 2,
      children = 0,
      rooms = 1,
      couponCode,
      customerName = authReq.user?.email?.split('@')[0] || 'Guest',
      customerEmail = authReq.user?.email || 'guest@example.com',
      customerPhone = '+1 (555) 000-0000',
      idempotencyKey
    } = req.body;

    if (!hotelId || !roomTypeId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'hotelId, roomTypeId, checkIn, and checkOut are required fields.'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided for checkIn or checkOut.'
      });
    }

    // Server-side date range validation
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'checkOut date must be strictly after checkIn date.'
      });
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (checkInDate < now) {
      return res.status(400).json({
        success: false,
        message: 'checkIn date cannot be in the past.'
      });
    }

    // Server-side calculated nights count
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 3600 * 24)));

    const numRooms = Math.max(1, Number(rooms));
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
      // Fetch Hotel and RoomType
      const hotel = await HotelModel.findById(hotelId);
      if (!hotel || hotel.status !== 'PUBLISHED') {
        return res.status(404).json({
          success: false,
          message: 'Hotel is currently unavailable for booking.'
        });
      }

      const roomType = await RoomTypeModel.findById(roomTypeId);
      if (!roomType || roomType.status !== 'ACTIVE' || roomType.hotelId !== hotelId) {
        return res.status(404).json({
          success: false,
          message: 'Selected room type is invalid or inactive.'
        });
      }

      // Guest capacity server validation
      if (numAdults > (roomType.maxAdults || 2) * numRooms) {
        return res.status(400).json({
          success: false,
          message: `Selected room type accommodates max ${roomType.maxAdults} adults per room.`
        });
      }

      if (numAdults + numChildren > (roomType.maxGuests || 3) * numRooms) {
        return res.status(400).json({
          success: false,
          message: `Total guests exceed maximum capacity of ${roomType.maxGuests} guests per room.`
        });
      }

      // Atomic inventory overlap check & assignment
      const allInventoryUnits = await RoomInventoryModel.find({
        hotelId,
        roomTypeId,
        status: 'AVAILABLE'
      });

      if (allInventoryUnits.length < numRooms) {
        return res.status(409).json({
          success: false,
          message: 'Insufficient room inventory available for this room type.'
        });
      }

      // Query active reservations for date range overlap
      // Two reservations overlap if: checkIn < requestedCheckOut AND checkOut > requestedCheckIn
      const occupiedReservations = await HotelReservationModel.find({
        inventoryId: { $in: allInventoryUnits.map((u) => u._id.toString()) },
        status: { $in: ['CONFIRMED', 'PAYMENT_PENDING'] },
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: new Date() } }
        ],
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate }
      });

      const occupiedInventoryIds = new Set(occupiedReservations.map((r) => r.inventoryId.toString()));
      const availableUnits = allInventoryUnits.filter((u) => !occupiedInventoryIds.has(u._id.toString()));

      if (availableUnits.length < numRooms) {
        return res.status(409).json({
          success: false,
          message: 'Room conflict detected: The selected dates overlap with an existing reservation.'
        });
      }

      // Select room units to assign
      const assignedUnits = availableUnits.slice(0, numRooms);

      // Server-side Pricing Calculation
      const basePrice = roomType.basePrice;
      const pricing = await PricingService.calculatePriceAsync({
        unitPrice: basePrice * nights,
        quantity: numRooms,
        couponCode
      });

      const bookingNumber = `BYD-HTL-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiration for payment

      const seatsOrTicketsDetails = `${numRooms} Room(s) (${roomType.name}) • ${nights} Night(s) • ${checkInDate.toISOString().split('T')[0]} to ${checkOutDate.toISOString().split('T')[0]}`;

      // Create Booking record
      const newBooking = new BookingModel({
        bookingNumber,
        userId,
        category: 'HOTEL',
        itemTitle: `${hotel.name} - ${roomType.name}`,
        itemImage: roomType.images?.[0] || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
        venueOrCinema: hotel.name,
        city: hotel.city,
        date: checkInDate.toISOString().split('T')[0],
        time: hotel.checkInTime || '14:00',
        seatsOrTicketsDetails,
        quantity: numRooms,
        subtotal: pricing.subtotal,
        convenienceFee: pricing.convenienceFee,
        taxes: pricing.taxes,
        discount: pricing.discount,
        totalAmount: pricing.totalAmount,
        status: 'PAYMENT_PENDING',
        paymentMethod: 'UPI',
        expiresAt,
        qrCodeData: JSON.stringify({ bookingNumber, hotel: hotel.name, checkIn, checkOut, rooms: numRooms }),
        customerName,
        customerEmail,
        customerPhone,
        itemId: hotelId,
        partnerId: hotel.partnerId,
        idempotencyKey: effectiveKey
      });

      await newBooking.save();

      // Create HotelReservation records for each assigned room unit
      const reservationDocs = assignedUnits.map((unit) => ({
        bookingId: newBooking._id.toString(),
        hotelId,
        roomTypeId,
        inventoryId: unit._id.toString(),
        userId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        nights,
        rooms: 1,
        adults: numAdults,
        children: numChildren,
        totalPrice: pricing.totalAmount / numRooms,
        status: 'PAYMENT_PENDING',
        expiresAt
      }));

      await HotelReservationModel.insertMany(reservationDocs);

      // Create Razorpay Order
      const razorpayOrder = await RazorpayService.createOrder(
        pricing.totalAmount,
        'INR',
        bookingNumber,
        {
          bookingId: newBooking._id.toString(),
          category: 'HOTEL',
          userId,
          hotelName: hotel.name
        }
      );

      newBooking.razorpayOrderId = razorpayOrder.id;
      await newBooking.save();

      return res.status(201).json({
        success: true,
        message: 'Hotel reservation initiated. Proceed with payment.',
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
          hotel: {
            name: hotel.name,
            cancellationPolicy: hotel.cancellationPolicy,
            checkInTime: hotel.checkInTime,
            checkOutTime: hotel.checkOutTime
          }
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error?.message || 'Failed to process hotel booking request'
      });
    }
  }

  // PARTNER MANAGEMENT ENDPOINTS
  static async createHotelPartner(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== 'partner' || !authReq.user.userId) {
      return res.status(403).json({ success: false, message: 'Partner authentication required.' });
    }

    const partner = await PartnerModel.findOne({ userId: authReq.user.userId });
    if (!partner) {
      return res.status(403).json({ success: false, message: 'Partner profile not found.' });
    }

    const {
      name,
      description,
      images,
      address,
      city,
      state = 'West Bengal',
      country = 'India',
      latitude,
      longitude,
      amenities,
      checkInTime = '14:00',
      checkOutTime = '11:00',
      cancellationPolicy = 'FREE_CANCELLATION'
    } = req.body;

    if (!name || !description || !address || !city) {
      return res.status(400).json({ success: false, message: 'Name, description, address, and city are required.' });
    }

    try {
      const hotel = new HotelModel({
        partnerId: partner._id.toString(),
        name,
        description,
        images: images && images.length ? images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80'],
        address,
        city,
        state,
        country,
        latitude: latitude || 22.5726,
        longitude: longitude || 88.3639,
        amenities: amenities || ['WiFi', 'Air Conditioning', 'Breakfast', '24/7 Desk'],
        checkInTime,
        checkOutTime,
        cancellationPolicy,
        status: 'SUBMITTED' // Submitted for admin approval
      });

      await hotel.save();

      // Log Audit
      await AuditLogModel.create({
        actorUserId: authReq.user.userId,
        actorRole: 'partner',
        action: 'HOTEL_CREATED',
        targetId: hotel._id.toString(),
        targetType: 'HOTEL',
        details: { name, city }
      });

      return res.status(201).json({
        success: true,
        message: 'Hotel created and submitted for admin review.',
        data: hotel
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to create hotel' });
    }
  }

  static async getPartnerHotels(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== 'partner' || !authReq.user.userId) {
      return res.status(403).json({ success: false, message: 'Partner authentication required.' });
    }

    const partner = await PartnerModel.findOne({ userId: authReq.user.userId });
    if (!partner) {
      return res.status(403).json({ success: false, message: 'Partner profile not found.' });
    }

    try {
      const hotels = await HotelModel.find({ partnerId: partner._id.toString() });
      const enrichedHotels = await Promise.all(
        hotels.map(async (h) => {
          const roomTypes = await RoomTypeModel.find({ hotelId: h._id.toString() });
          return {
            ...h.toObject(),
            id: h._id.toString(),
            roomTypeCount: roomTypes.length
          };
        })
      );

      return res.status(200).json({ success: true, data: enrichedHotels });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to fetch partner hotels' });
    }
  }

  static async createRoomTypePartner(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== 'partner' || !authReq.user.userId) {
      return res.status(403).json({ success: false, message: 'Partner authentication required.' });
    }

    const partner = await PartnerModel.findOne({ userId: authReq.user.userId });
    if (!partner) {
      return res.status(403).json({ success: false, message: 'Partner profile not found.' });
    }

    const {
      hotelId,
      name,
      description,
      images,
      maxAdults = 2,
      maxChildren = 1,
      maxGuests = 3,
      bedType = '1 King Bed',
      amenities = [],
      basePrice,
      totalRooms = 5
    } = req.body;

    if (!hotelId || !name || !basePrice) {
      return res.status(400).json({ success: false, message: 'hotelId, name, and basePrice are required.' });
    }

    try {
      // Security check: verify hotel belongs to partner
      const hotel = await HotelModel.findById(hotelId);
      if (!hotel || hotel.partnerId !== partner._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized access to hotel.' });
      }

      const roomType = new RoomTypeModel({
        hotelId,
        name,
        description: description || name,
        images: images && images.length ? images : hotel.images,
        maxAdults: Number(maxAdults),
        maxChildren: Number(maxChildren),
        maxGuests: Number(maxGuests),
        bedType,
        amenities,
        basePrice: Number(basePrice),
        totalRooms: Number(totalRooms),
        status: 'ACTIVE'
      });

      await roomType.save();

      // Create physical room inventory units for this room type
      const inventoryUnits = [];
      for (let i = 1; i <= Number(totalRooms); i++) {
        inventoryUnits.push({
          hotelId,
          roomTypeId: roomType._id.toString(),
          roomNumberOrUnitId: `${name.substring(0, 3).toUpperCase()}-${100 + i}`,
          status: 'AVAILABLE'
        });
      }
      await RoomInventoryModel.insertMany(inventoryUnits);

      return res.status(201).json({
        success: true,
        message: 'Room type and physical inventory units initialized.',
        data: roomType
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to create room type' });
    }
  }

  static async getPartnerRoomTypes(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== 'partner' || !authReq.user.userId) {
      return res.status(403).json({ success: false, message: 'Partner authentication required.' });
    }

    const partner = await PartnerModel.findOne({ userId: authReq.user.userId });
    if (!partner) {
      return res.status(403).json({ success: false, message: 'Partner profile not found.' });
    }

    const { hotelId } = req.params;
    try {
      const hotel = await HotelModel.findById(hotelId);
      if (!hotel || hotel.partnerId !== partner._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized access.' });
      }

      const roomTypes = await RoomTypeModel.find({ hotelId });
      return res.status(200).json({ success: true, data: roomTypes });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to fetch room types' });
    }
  }

  // Get partner's hotel reservations
  static async getPartnerReservations(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    if (!authReq.user || authReq.user.role !== 'partner' || !authReq.user.userId) {
      return res.status(403).json({ success: false, message: 'Partner authentication required.' });
    }

    const partner = await PartnerModel.findOne({ userId: authReq.user.userId });
    if (!partner) {
      return res.status(403).json({ success: false, message: 'Partner profile not found.' });
    }

    try {
      const reservations = await HotelReservationModel.find()
        .sort({ createdAt: -1 })
        .limit(100);

      // Filter reservations belonging to partner's hotels
      const partnerHotels = await HotelModel.find({ partnerId: partner._id.toString() });
      const partnerHotelIds = new Set(partnerHotels.map((h) => h._id.toString()));

      const filtered = reservations.filter((r) => partnerHotelIds.has(r.hotelId));

      return res.status(200).json({ success: true, data: filtered });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error?.message || 'Failed to fetch reservations' });
    }
  }
}

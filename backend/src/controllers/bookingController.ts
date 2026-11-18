import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { BookingModel } from '../models/Booking.js';
import { TicketModel } from '../models/Ticket.js';
import { ShowModel } from '../models/Show.js';
import { PricingService } from '../services/pricingService.js';
import { RefundService } from '../services/refundService.js';
import { PaymentModel } from '../models/Payment.js';
import { RazorpayService } from '../services/razorpayService.js';
import { TravelPackageModel } from '../models/TravelPackage.js';
import { TravelTransferModel } from '../models/TravelTransfer.js';
import { NotificationService } from '../services/notificationService.js';

export class BookingController {
  static async createBooking(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    const {
      category = 'movies',
      itemTitle = 'Booked Experience',
      itemImage = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      venueOrCinema = 'Partner Venue',
      city = 'Asansol',
      date = new Date().toISOString().split('T')[0],
      time = '19:30',
      seatsOrTicketsDetails = '1 Ticket',
      quantity = 1,
      unitPrice = 450,
      couponCode,
      customerName = authReq.user?.email?.split('@')[0] || 'User',
      customerEmail = authReq.user?.email || 'user@example.com',
      customerPhone = '+1 (555) 000-0000',
      paymentMethod = 'UPI',
      showId,
      selectedSeats = [],
      idempotencyKey
    } = req.body;

    if (quantity <= 0) {
      return res.status(422).json({
        success: false,
        message: 'Invalid quantity'
      });
    }

    // Idempotency check 1: Request idempotency key
    const effectiveIdempotencyKey = idempotencyKey || req.headers['x-idempotency-key'];
    if (effectiveIdempotencyKey) {
      const existingByKey = await (BookingModel as any).findOne({ idempotencyKey: effectiveIdempotencyKey });
      if (existingByKey) {
        const obj = existingByKey.toObject ? existingByKey.toObject() : existingByKey;
        return res.status(200).json({
          success: true,
          message: 'Booking retrieved from idempotent request',
          data: { ...obj, id: obj._id ? obj._id.toString() : obj.id }
        });
      }
    }

    // Idempotency check 2: Recent duplicate check (within 5 seconds)
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const recentDuplicate = await (BookingModel as any).findOne({
      userId,
      itemTitle,
      date,
      time,
      quantity,
      createdAt: { $gte: fiveSecondsAgo }
    });
    if (recentDuplicate) {
      const obj = recentDuplicate.toObject ? recentDuplicate.toObject() : recentDuplicate;
      return res.status(200).json({
        success: true,
        message: 'Duplicate request detected within short window',
        data: { ...obj, id: obj._id ? obj._id.toString() : obj.id }
      });
    }

    let seatsToLock: string[] = Array.isArray(selectedSeats) ? selectedSeats : [];
    if (seatsToLock.length === 0 && typeof seatsOrTicketsDetails === 'string') {
      const matches = seatsOrTicketsDetails.match(/\b([A-Z]\d+)\b/g);
      if (matches && matches.length > 0) {
        seatsToLock = matches;
      }
    }

    let lockedSeatsInShow = false;

    try {
      // Atomic seat locking if showId and seats exist
      if (showId && seatsToLock.length > 0) {
        const showExists = await ShowModel.findById(showId);
        if (!showExists) {
          return res.status(404).json({
            success: false,
            message: 'Show or venue session not found'
          });
        }

        // Atomic conditional update: verify NONE of requested seats are in bookedSeats
        const updatedShow = await ShowModel.findOneAndUpdate(
          {
            _id: showId,
            bookedSeats: { $nin: seatsToLock }
          },
          {
            $addToSet: { bookedSeats: { $each: seatsToLock } }
          },
          { new: true }
        );

        if (!updatedShow) {
          return res.status(409).json({
            success: false,
            message: 'One or more selected seats are no longer available.',
            error: { code: 'SEAT_CONFLICT', details: `Seats ${seatsToLock.join(', ')} are already booked` }
          });
        }

        lockedSeatsInShow = true;
      }

      // Authoritative server-side price calculation
      const pricing = await PricingService.calculatePriceAsync({
        unitPrice: Number(unitPrice) || 450,
        quantity: Number(quantity) || 1,
        couponCode,
        isMemberPlus: true
      });

      const bookingNumber = `BYD-${Math.floor(100000 + Math.random() * 900000)}`;
      const qrCodeData = `https://bookyourday.com/ticket/${bookingNumber}`;

      const bookingData = {
        bookingNumber,
        userId,
        category,
        itemTitle,
        itemImage,
        venueOrCinema,
        city,
        date,
        time,
        seatsOrTicketsDetails,
        quantity,
        subtotal: pricing.subtotal,
        convenienceFee: pricing.convenienceFee,
        taxes: pricing.taxes,
        discount: pricing.discount,
        totalAmount: pricing.totalAmount,
        status: 'CONFIRMED' as const,
        paymentMethod,
        paymentTransactionId: `TXN${Date.now()}`,
        qrCodeData,
        customerName,
        customerEmail,
        customerPhone,
        showId,
        idempotencyKey: effectiveIdempotencyKey,
        createdAt: new Date()
      };

      const newBooking = await (BookingModel as any).create(bookingData);
      const bookingObj = newBooking.toObject ? newBooking.toObject() : newBooking;
      const bookingId = bookingObj._id ? bookingObj._id.toString() : bookingObj.id;

      // Digital Ticket Record
      const ticketData = {
        bookingId,
        ticketNumber: `TKT-${bookingNumber}`,
        userId,
        itemTitle,
        venueOrCinema,
        seatDetails: seatsOrTicketsDetails,
        qrCode: qrCodeData,
        validDate: date,
        validTime: time,
        status: 'VALID' as const,
        createdAt: new Date()
      };
      await (TicketModel as any).create(ticketData).catch((err: any) => {
        console.warn('Ticket record creation warning:', err);
      });

      NotificationService.sendNotification({
        event: 'BOOKING_CONFIRMED',
        recipientUserId: userId,
        recipientEmail: customerEmail,
        title: 'Booking Confirmed! 🎉',
        message: `Your booking for ${itemTitle} (#${bookingNumber}) is confirmed.`
      }).catch(console.error);

      return res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: {
          ...bookingObj,
          id: bookingId
        }
      });
    } catch (error: any) {
      // Rollback locked seats if creation failed
      if (showId && lockedSeatsInShow && seatsToLock.length > 0) {
        await ShowModel.updateOne(
          { _id: showId },
          { $pull: { bookedSeats: { $in: seatsToLock } } }
        ).catch(console.error);
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: { code: 'BOOKING_CREATE_ERROR', details: error?.message }
      });
    }
  }

  static async getUserBookings(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const email = authReq.user?.email;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    try {
      const queryOr: any[] = [{ userId }];
      if (email) queryOr.push({ customerEmail: email });

      const bookings = await (BookingModel as any).find({ $or: queryOr }).sort({ createdAt: -1 });

      const formatted = bookings.map((b: any) => {
        const obj = b.toObject ? b.toObject() : b;
        return {
          ...obj,
          id: obj._id ? obj._id.toString() : obj.id
        };
      });

      return res.json({ success: true, data: formatted });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch user bookings',
        error: { code: 'BOOKING_FETCH_ERROR', details: error?.message }
      });
    }
  }

  static async getBookingById(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const email = authReq.user?.email;
    const userRole = authReq.user?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    try {
      let booking = await (BookingModel as any).findById(id).catch(() => null);
      if (!booking) {
        booking = await (BookingModel as any).findOne({ bookingNumber: id }).catch(() => null);
      }

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
          error: { code: 'NOT_FOUND', details: `No booking found with ID ${id}` }
        });
      }

      const obj = booking.toObject ? booking.toObject() : booking;

      // Access authorization check: must belong to user or user must be admin
      const isOwner = obj.userId === userId || (email && obj.customerEmail === email);
      const isAdmin = userRole === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this booking'
        });
      }

      return res.json({
        success: true,
        data: {
          ...obj,
          id: obj._id ? obj._id.toString() : obj.id
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch booking',
        error: { code: 'BOOKING_FETCH_ERROR', details: error?.message }
      });
    }
  }

  static async cancelBooking(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const email = authReq.user?.email;
    const userRole = authReq.user?.role;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    try {
      let booking = await (BookingModel as any).findById(id).catch(() => null);
      if (!booking) {
        booking = await (BookingModel as any).findOne({ bookingNumber: id }).catch(() => null);
      }

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found',
          error: { code: 'NOT_FOUND', details: `No booking found with ID ${id}` }
        });
      }

      // Authorization check
      const isOwner = booking.userId === userId || (email && booking.customerEmail === email);
      const isAdmin = userRole === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You cannot cancel another user\'s booking'
        });
      }

      if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
        return res.status(400).json({
          success: false,
          message: 'Booking is already cancelled or refunded'
        });
      }

      const existingRefundPayment = await (PaymentModel as any).findOne({
        bookingId: booking._id,
        status: { $in: ['REFUND_PENDING', 'REFUNDED'] }
      }).catch(() => null);

      if (existingRefundPayment) {
        return res.status(400).json({
          success: false,
          message: 'A refund has already been initiated or processed for this booking'
        });
      }

      const refundInfo = RefundService.calculateRefund(booking.totalAmount, booking.date, booking.time);
      booking.status = refundInfo.refundAmount > 0 ? 'REFUNDED' : 'CANCELLED';
      await booking.save();

      // Trigger Razorpay refund if valid payment exists and refund amount > 0
      let refundStatus = 'NONE';
      try {
        const payment = await (PaymentModel as any).findOne({
          bookingId: booking._id,
          status: 'SUCCESS'
        });

        if (payment && payment.razorpayPaymentId && refundInfo.refundAmount > 0 && RazorpayService.isConfigured()) {
          payment.status = 'REFUND_PENDING';
          await payment.save();

          const refundPaise = Math.round(refundInfo.refundAmount * 100);
          const razorpayRefund = await RazorpayService.issueRefund(payment.razorpayPaymentId, refundPaise, {
            bookingId: booking._id.toString(),
            cancellationReason: 'User initiated cancellation'
          });

          payment.status = 'REFUNDED';
          payment.refundId = razorpayRefund.id;
          payment.updatedAt = new Date();
          await payment.save();
          refundStatus = 'REFUNDED';
        }
      } catch (refundError: any) {
        console.error('Razorpay refund processing error:', refundError);
        refundStatus = 'REFUND_FAILED';
      }

      // Release booked seats if present
      if (booking.showId) {
        let seatsToRelease: string[] = [];
        if (typeof booking.seatsOrTicketsDetails === 'string') {
          const matches = booking.seatsOrTicketsDetails.match(/\b([A-Z]\d+)\b/g);
          if (matches) seatsToRelease = matches;
        }
        if (seatsToRelease.length > 0) {
          await ShowModel.updateOne(
            { _id: booking.showId },
            { $pull: { bookedSeats: { $in: seatsToRelease } } }
          ).catch(console.error);
        }
      }

      // Release travel package capacity if category is TRAVEL
      if (booking.category === 'TRAVEL' && booking.itemId) {
        await TravelPackageModel.updateOne(
          { _id: booking.itemId },
          { $inc: { availableCapacity: 1 } }
        ).catch(console.error);
      }

      // Release travel transfer capacity if category is TRANSFER
      if (booking.category === 'TRANSFER' && booking.itemId) {
        const qty = Math.max(1, Number(booking.quantity) || 1);
        await TravelTransferModel.updateOne(
          { _id: booking.itemId },
          { $inc: { availableCapacity: qty } }
        ).catch(console.error);
      }

      // Update ticket status
      const bookingIdStr = booking._id ? booking._id.toString() : booking.id;
      await TicketModel.updateMany(
        { $or: [{ bookingId: booking._id }, { bookingId: bookingIdStr }, { bookingId: id }] },
        { status: 'CANCELLED' }
      ).catch(err => {
        console.warn('Ticket status update warning on cancel:', err);
      });

      NotificationService.sendNotification({
        event: 'BOOKING_CANCELLED',
        recipientUserId: booking.userId,
        recipientEmail: booking.customerEmail,
        title: 'Booking Cancelled',
        message: `Your booking for ${booking.itemTitle} was cancelled. Refund status: ${refundStatus}.`
      }).catch(console.error);

      return res.json({
        success: true,
        message: refundInfo.message,
        data: {
          id: bookingIdStr,
          bookingNumber: booking.bookingNumber,
          status: booking.status,
          refundInfo
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel booking',
        error: { code: 'BOOKING_CANCEL_ERROR', details: error?.message }
      });
    }
  }

  static async rescheduleBooking(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    const email = authReq.user?.email;
    const userRole = authReq.user?.role;
    const { id } = req.params;
    const { newDate, newTime, newSeats } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!newDate) {
      return res.status(400).json({ success: false, message: 'New date is required for rescheduling' });
    }

    try {
      let booking = await (BookingModel as any).findById(id).catch(() => null);
      if (!booking) {
        booking = await (BookingModel as any).findOne({ bookingNumber: id }).catch(() => null);
      }

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const isOwner = booking.userId === userId || (email && booking.customerEmail === email);
      const isAdmin = userRole === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Access denied to reschedule this booking' });
      }

      if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
        return res.status(400).json({ success: false, message: 'Cancelled bookings cannot be rescheduled' });
      }

      booking.date = newDate;
      if (newTime) booking.time = newTime;
      if (newSeats) booking.seatsOrTicketsDetails = newSeats;
      booking.updatedAt = new Date();
      await booking.save();

      // Update ticket
      await (TicketModel as any).updateMany(
        { bookingId: booking._id ? booking._id.toString() : id },
        { validDate: newDate, validTime: newTime || booking.time, seatDetails: booking.seatsOrTicketsDetails }
      );

      // Notification
      NotificationService.sendNotification({
        event: 'BOOKING_CONFIRMED',
        recipientUserId: userId,
        recipientEmail: booking.customerEmail,
        title: 'Booking Rescheduled! 📅',
        message: `Your booking for ${booking.itemTitle} was rescheduled to ${newDate} at ${booking.time}.`
      }).catch(console.error);

      return res.json({
        success: true,
        message: 'Booking rescheduled successfully!',
        data: {
          ...booking.toObject(),
          id: booking._id.toString()
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to reschedule booking', error: err?.message });
    }
  }
}

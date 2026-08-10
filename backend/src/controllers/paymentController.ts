import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { BookingModel } from '../models/Booking.js';
import { PaymentModel } from '../models/Payment.js';
import { TicketModel } from '../models/Ticket.js';
import { ShowModel } from '../models/Show.js';
import { WebhookEventModel } from '../models/WebhookEvent.js';
import { PricingService } from '../services/pricingService.js';
import { RazorpayService } from '../services/razorpayService.js';

export class PaymentController {
  /**
   * POST /api/payments/create-order
   * Authoritatively calculates amount on backend and creates a Razorpay Order
   */
  static async createOrder(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.'
      });
    }

    if (!RazorpayService.isConfigured()) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay payment gateway is not configured on the server.',
        error: {
          code: 'RAZORPAY_NOT_CONFIGURED',
          details: 'Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.'
        }
      });
    }

    const {
      bookingId,
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

    try {
      let booking: any = null;

      // Case 1: Existing booking passed
      if (bookingId) {
        booking = await (BookingModel as any).findById(bookingId).catch(() => null);

        if (!booking) {
          return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        if (booking.userId !== userId && authReq.user?.role !== 'admin') {
          return res.status(403).json({ success: false, message: 'Access denied to this booking' });
        }
      } else {
        // Case 2: Create new pending booking
        const effectiveIdempotencyKey = idempotencyKey || req.headers['x-idempotency-key'];
        if (effectiveIdempotencyKey) {
          booking = await (BookingModel as any).findOne({ idempotencyKey: effectiveIdempotencyKey }).catch(() => null);
        }

        if (!booking) {
          let seatsToLock: string[] = Array.isArray(selectedSeats) ? selectedSeats : [];
          if (seatsToLock.length === 0 && typeof seatsOrTicketsDetails === 'string') {
            const matches = seatsOrTicketsDetails.match(/\b([A-Z]\d+)\b/g);
            if (matches && matches.length > 0) seatsToLock = matches;
          }

          if (showId && seatsToLock.length > 0) {
            const updatedShow = await ShowModel.findOneAndUpdate(
              { _id: showId, bookedSeats: { $nin: seatsToLock } },
              { $addToSet: { bookedSeats: { $each: seatsToLock } } },
              { new: true }
            );

            if (!updatedShow) {
              return res.status(409).json({
                success: false,
                message: 'One or more selected seats are no longer available.',
                error: { code: 'SEAT_CONFLICT', details: `Seats ${seatsToLock.join(', ')} are already booked` }
              });
            }
          }

          const pricing = await PricingService.calculatePriceAsync({
            unitPrice: Number(unitPrice) || 450,
            quantity: Number(quantity) || 1,
            couponCode,
            isMemberPlus: true
          });

          const bookingNumber = `BYD-${Math.floor(100000 + Math.random() * 900000)}`;
          const qrCodeData = `https://bookyourday.com/ticket/${bookingNumber}`;
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

          booking = await (BookingModel as any).create({
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
            status: 'PAYMENT_PENDING',
            paymentMethod,
            paymentTransactionId: '',
            qrCodeData,
            customerName,
            customerEmail,
            customerPhone,
            showId,
            idempotencyKey: effectiveIdempotencyKey,
            expiresAt,
            createdAt: new Date()
          });
        }
      }

      const bookingIdStr = booking._id.toString();

      // Check if existing order for this booking can be reused (Idempotency)
      let existingPayment = await (PaymentModel as any).findOne({
        bookingId: booking._id,
        status: 'PENDING'
      }).catch(() => null);

      let orderId = existingPayment?.razorpayOrderId;
      const totalAmount = booking.totalAmount;
      const amountInPaise = Math.round(totalAmount * 100);

      if (!orderId) {
        const order = await RazorpayService.createOrder(
          amountInPaise,
          'INR',
          booking.bookingNumber,
          {
            bookingId: bookingIdStr,
            userId,
            itemTitle: booking.itemTitle
          }
        );
        orderId = order.id;

        await (PaymentModel as any).create({
          transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          bookingId: booking._id,
          userId,
          razorpayOrderId: orderId,
          amount: totalAmount,
          currency: 'INR',
          paymentMethod,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Save razorpayOrderId to booking
      booking.razorpayOrderId = orderId;
      await booking.save();

      return res.status(200).json({
        success: true,
        message: 'Razorpay payment order created successfully',
        data: {
          orderId,
          amount: amountInPaise,
          currency: 'INR',
          keyId: process.env.RAZORPAY_KEY_ID,
          bookingId: bookingIdStr,
          bookingNumber: booking.bookingNumber,
          totalAmount: booking.totalAmount
        }
      });
    } catch (error: any) {
      console.error('Payment order creation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order',
        error: { code: 'PAYMENT_ORDER_ERROR', details: error?.message }
      });
    }
  }

  /**
   * POST /api/payments/verify
   * Verifies HMAC signature on server before confirming booking
   */
  static async verifyPayment(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay verification parameters'
      });
    }

    try {
      let booking = await (BookingModel as any).findOne({
        $or: [{ razorpayOrderId: razorpay_order_id }, { _id: bookingId }]
      }).catch(() => null);

      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found for this order' });
      }

      let payment = await (PaymentModel as any).findOne({
        $or: [{ razorpayOrderId: razorpay_order_id }, { bookingId: booking._id }]
      }).catch(() => null);

      // Ensure order_id used for verification strictly comes from server-stored booking
      const serverStoredOrderId = booking.razorpayOrderId;
      if (!serverStoredOrderId) {
        return res.status(400).json({ success: false, message: 'No order ID associated with this booking' });
      }

      // Verify HMAC Signature using server-stored order ID
      const isValid = RazorpayService.verifyPaymentSignature(
        serverStoredOrderId,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValid) {
        if (payment) {
          payment.status = 'FAILED';
          payment.failureReason = 'Signature verification failed';
          payment.updatedAt = new Date();
          await payment.save().catch(() => null);
        }

        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid Razorpay signature',
          error: { code: 'INVALID_SIGNATURE' }
        });
      }

      // Update Payment Record
      if (!payment) {
        payment = new PaymentModel({
          transactionId: `TXN_${razorpay_payment_id}`,
          bookingId: booking._id,
          userId,
          razorpayOrderId: serverStoredOrderId,
          amount: booking.totalAmount,
          currency: 'INR',
          status: 'SUCCESS'
        });
      }

      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = 'SUCCESS';
      payment.updatedAt = new Date();
      await payment.save();

      // Update Booking Record
      booking.status = 'CONFIRMED';
      booking.paymentTransactionId = razorpay_payment_id;
      await booking.save();

      // Create Digital Ticket if not already created (Atomically check existence)
      const bookingIdStr = booking._id.toString();
      const existingTicket = await (TicketModel as any).findOne({ bookingId: booking._id }).catch(() => null);
      if (!existingTicket) {
        await (TicketModel as any).create({
          bookingId: booking._id,
          ticketNumber: `TKT-${booking.bookingNumber}`,
          userId,
          itemTitle: booking.itemTitle,
          venueOrCinema: booking.venueOrCinema,
          seatDetails: booking.seatsOrTicketsDetails,
          qrCode: booking.qrCodeData,
          validDate: booking.date,
          validTime: booking.time,
          status: 'VALID',
          createdAt: new Date()
        }).catch((err: any) => {
          if (err.code !== 11000) {
            console.warn('Ticket creation error:', err);
          }
        });
      }

      const bookingObj = booking.toObject ? booking.toObject() : booking;

      return res.status(200).json({
        success: true,
        message: 'Payment verified and booking confirmed successfully',
        data: {
          ...bookingObj,
          id: bookingIdStr
        }
      });
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify payment',
        error: { code: 'VERIFICATION_ERROR', details: error?.message }
      });
    }
  }

  /**
   * POST /api/payments/webhook
   * Idempotent webhook handler for Razorpay event notifications backed by WebhookEventModel
   */
  static async handleWebhook(req: Request, res: Response) {
    const signature = req.headers['x-razorpay-signature'] as string;
    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing x-razorpay-signature header' });
    }

    try {
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);
      const isValid = RazorpayService.verifyWebhookSignature(rawBody, signature);

      if (!isValid) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }

      const event = req.body?.event;
      const payload = req.body?.payload;
      const eventId = req.body?.event_id;

      if (!event || !payload) {
        return res.status(400).json({ success: false, message: 'Invalid webhook body payload' });
      }

      // Webhook Persistent Idempotency Check
      let webhookRecord: any = null;
      if (eventId) {
        try {
          webhookRecord = await (WebhookEventModel as any).create({
            eventId,
            eventType: event,
            status: 'RECEIVED'
          });
        } catch (dupErr: any) {
          if (dupErr.code === 11000) {
            const existing = await (WebhookEventModel as any).findOne({ eventId });
            if (existing && existing.status === 'PROCESSED') {
              console.log(`[Razorpay Webhook] Duplicate event ${eventId} already PROCESSED`);
              return res.status(200).json({ status: 'ok', message: 'Event already processed' });
            }
            if (existing && existing.status === 'RECEIVED') {
              console.log(`[Razorpay Webhook] Concurrent event ${eventId} in progress`);
              return res.status(200).json({ status: 'ok', message: 'Event processing in progress' });
            }
            webhookRecord = existing;
          } else {
            console.warn('[Razorpay Webhook] WebhookEvent DB record error:', dupErr?.message);
          }
        }
      }

      console.log(`[Razorpay Webhook] Received event: ${event} (ID: ${eventId})`);

      if (event === 'payment.captured') {
        const entity = payload.payment?.entity;
        const razorpayOrderId = entity?.order_id;
        const razorpayPaymentId = entity?.id;

        if (razorpayOrderId) {
          const booking = await (BookingModel as any).findOne({ razorpayOrderId });
          if (booking) {
            if (booking.status !== 'CONFIRMED') {
              booking.status = 'CONFIRMED';
              booking.paymentTransactionId = razorpayPaymentId || booking.paymentTransactionId;
              await booking.save();
            }

            // Create Ticket if missing
            const existingTicket = await (TicketModel as any).findOne({ bookingId: booking._id });
            if (!existingTicket) {
              await (TicketModel as any).create({
                bookingId: booking._id,
                ticketNumber: `TKT-${booking.bookingNumber}`,
                userId: booking.userId,
                itemTitle: booking.itemTitle,
                venueOrCinema: booking.venueOrCinema,
                seatDetails: booking.seatsOrTicketsDetails,
                qrCode: booking.qrCodeData,
                validDate: booking.date,
                validTime: booking.time,
                status: 'VALID',
                createdAt: new Date()
              }).catch((err: any) => {
                if (err.code !== 11000) console.warn('Webhook ticket error:', err);
              });
            }
          }

          const payment = await (PaymentModel as any).findOne({ razorpayOrderId });
          if (payment) {
            payment.status = 'SUCCESS';
            payment.razorpayPaymentId = razorpayPaymentId || payment.razorpayPaymentId;
            payment.updatedAt = new Date();
            await payment.save();
          }
        }
      } else if (event === 'payment.failed') {
        const entity = payload.payment?.entity;
        const razorpayOrderId = entity?.order_id;

        if (razorpayOrderId) {
          const payment = await (PaymentModel as any).findOne({ razorpayOrderId });
          if (payment) {
            payment.status = 'FAILED';
            payment.failureReason = entity?.error_description || 'Payment failed on gateway';
            payment.updatedAt = new Date();
            await payment.save();
          }
        }
      } else if (event === 'refund.processed' || event === 'refund.created') {
        const entity = payload.refund?.entity;
        const razorpayPaymentId = entity?.payment_id;

        if (razorpayPaymentId) {
          const payment = await (PaymentModel as any).findOne({ razorpayPaymentId });
          if (payment) {
            payment.status = 'REFUNDED';
            payment.refundId = entity?.id;
            payment.updatedAt = new Date();
            await payment.save();

            const booking = await (BookingModel as any).findById(payment.bookingId);
            if (booking) {
              booking.status = 'REFUNDED';
              await booking.save();
            }
          }
        }
      }

      if (webhookRecord) {
        webhookRecord.status = 'PROCESSED';
        webhookRecord.processedAt = new Date();
        await webhookRecord.save().catch(() => null);
      }

      return res.status(200).json({ status: 'ok' });
    } catch (error: any) {
      console.error('Webhook error:', error);
      return res.status(500).json({ success: false, message: 'Webhook processing failed', error: error?.message });
    }
  }

  /**
   * GET /api/payments/history
   * Fetch payment history for authenticated user
   */
  static async getPaymentHistory(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    }

    try {
      const payments = await (PaymentModel as any)
        .find({ userId })
        .populate('bookingId')
        .sort({ createdAt: -1 })
        .catch(() => []);

      const formatted = payments.map((p: any) => {
        const obj = p.toObject ? p.toObject() : p;
        return {
          ...obj,
          id: obj._id ? obj._id.toString() : obj.id || obj.transactionId
        };
      });

      return res.json({ success: true, data: formatted });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment history',
        error: { details: error?.message }
      });
    }
  }

  /**
   * POST /api/payments/cleanup-expired
   * Sweeps expired PENDING_PAYMENT bookings and releases seats
   */
  static async cleanupExpired(req: Request, res: Response) {
    const authReq = req as AuthRequest;
    const cronSecretHeader = req.headers['x-cron-secret'];
    const expectedSecret = process.env.CRON_SECRET || 'byd_internal_cron_secret_2026';

    const isInternalCron = cronSecretHeader && cronSecretHeader === expectedSecret;
    const isAdminUser = authReq.user && authReq.user.role === 'admin';

    if (!isInternalCron && !isAdminUser) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: System cleanup endpoint requires authorization'
      });
    }

    try {
      const now = new Date();
      const expiredBookings = await (BookingModel as any).find({
        status: 'PAYMENT_PENDING',
        expiresAt: { $lt: now }
      });

      let count = 0;
      for (const booking of expiredBookings) {
        // Atomic update ensures only one concurrent worker transitions status and releases seats
        const updatedBooking = await (BookingModel as any).findOneAndUpdate(
          { _id: booking._id, status: 'PAYMENT_PENDING', expiresAt: { $lt: now } },
          { $set: { status: 'EXPIRED' } },
          { new: true }
        );

        if (updatedBooking) {
          count++;

          // Release locked seats
          if (booking.showId && typeof booking.seatsOrTicketsDetails === 'string') {
            const matches = booking.seatsOrTicketsDetails.match(/\b([A-Z]\d+)\b/g);
            if (matches && matches.length > 0) {
              await ShowModel.updateOne(
                { _id: booking.showId },
                { $pull: { bookedSeats: { $in: matches } } }
              ).catch(console.error);
            }
          }
        }
      }

      return res.json({
        success: true,
        message: `Cleaned up ${count} expired pending bookings`,
        expiredCount: count
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: 'Cleanup failed', error: error?.message });
    }
  }
}


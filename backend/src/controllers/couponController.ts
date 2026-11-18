import { Request, Response } from 'express';
import { CouponModel } from '../models/Coupon.js';
import { OfferModel } from '../models/Offer.js';

export class CouponController {
  static async getOffers(req: Request, res: Response) {
    try {
      const offers = await (OfferModel as any).find({}).lean().catch(() => []);
      const coupons = await (CouponModel as any).find({ isActive: true }).lean().catch(() => []);

      const formatted = offers.map((o: any) => ({
        id: o._id ? o._id.toString() : o.id,
        title: o.title,
        bankPartner: o.bankPartner || 'Book Your Day',
        bannerImage: o.bannerImage,
        offerCode: o.offerCode || o.code,
        code: o.offerCode || o.code,
        description: o.description,
        discountSummary: o.discountSummary || 'Special Discount',
        categoryApplicable: o.categoryApplicable || 'All',
        validUntil: o.validUntil || '31 DEC 2026'
      }));

      // Merge coupons that might not be in offers
      for (const c of coupons) {
        if (!formatted.some((f: any) => f.code === c.code)) {
          formatted.push({
            id: c._id ? c._id.toString() : c.id,
            title: `${c.code} Discount`,
            bankPartner: 'Book Your Day Partner',
            bannerImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
            offerCode: c.code,
            code: c.code,
            description: c.description,
            discountSummary: `${c.discountValue}% OFF`,
            categoryApplicable: 'All',
            validUntil: c.validUntil ? new Date(c.validUntil).toLocaleDateString() : '31 DEC 2026'
          });
        }
      }

      return res.json({ success: true, data: formatted });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: 'Failed to fetch offers', error: err?.message });
    }
  }

  static async validateCoupon(req: Request, res: Response) {
    try {
      const { code, category, bookingAmount = 0 } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code is required'
        });
      }

      const cleanCode = code.trim().toUpperCase();
      let coupon = await CouponModel.findOne({ code: cleanCode, isActive: true });

      if (!coupon) {
        // Fallback check in OfferModel
        const offer = await OfferModel.findOne({ offerCode: cleanCode });
        if (offer) {
          const isCategoryMatch = !offer.categoryApplicable || 
            offer.categoryApplicable === 'All' || 
            (category && offer.categoryApplicable.toLowerCase() === category.toLowerCase());

          if (!isCategoryMatch) {
            return res.status(400).json({
              success: false,
              message: `Coupon is not applicable for ${category || 'this category'}`
            });
          }

          let discountAmount = 100;
          if (cleanCode === 'HDFC200') {
            discountAmount = Math.min(200, Math.round(bookingAmount * 0.15));
          } else if (cleanCode === 'DINE20') {
            discountAmount = Math.min(300, Math.round(bookingAmount * 0.20));
          } else if (cleanCode === 'FIRST50') {
            discountAmount = 100;
          }

          return res.json({
            success: true,
            data: {
              code: cleanCode,
              description: offer.description || offer.discountSummary,
              discountType: 'FLAT',
              discountValue: discountAmount,
              discountAmount
            }
          });
        }

        return res.status(404).json({
          success: false,
          message: 'Invalid or expired coupon code'
        });
      }

      // Validate expiration
      if (new Date(coupon.validUntil) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Coupon has expired'
        });
      }

      // Validate minimum booking amount
      if (bookingAmount > 0 && coupon.minBookingAmount && bookingAmount < coupon.minBookingAmount) {
        return res.status(400).json({
          success: false,
          message: `Minimum booking amount of ₹${coupon.minBookingAmount} required for this coupon`
        });
      }

      // Calculate discount
      let discountAmount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = Math.round((bookingAmount * coupon.discountValue) / 100);
        if (coupon.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      return res.json({
        success: true,
        data: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          discountAmount
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to validate coupon',
        error: { code: 'COUPON_VALIDATION_ERROR', details: error?.message }
      });
    }
  }
}

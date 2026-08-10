import { Request, Response } from 'express';
import { CouponModel } from '../models/Coupon.js';
import { OfferModel } from '../models/Offer.js';

export class CouponController {
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
        error: { code: 'COUPON_VALIDATE_ERROR', details: error?.message }
      });
    }
  }
}

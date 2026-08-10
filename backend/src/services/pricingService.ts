import { CouponModel } from '../models/Coupon.js';

export interface PriceBreakdownInput {
  unitPrice: number;
  quantity: number;
  couponCode?: string;
  isMemberPlus?: boolean;
}

export interface PriceBreakdownOutput {
  subtotal: number;
  convenienceFee: number;
  taxes: number;
  discount: number;
  totalAmount: number;
  appliedCoupon?: string;
}

export class PricingService {
  static calculatePrice(input: PriceBreakdownInput): PriceBreakdownOutput {
    const subtotal = input.unitPrice * input.quantity;
    
    // Convenience fee: ₹20 per unit, waived or discounted for Member Plus
    let baseConvenienceFee = input.quantity > 0 ? input.quantity * 20 : 0;
    if (input.isMemberPlus) {
      baseConvenienceFee = Math.round(baseConvenienceFee * 0.5); // 50% discount on convenience fee for Member Plus
    }

    const taxes = Math.round((subtotal + baseConvenienceFee) * 0.08); // 8% GST

    let discount = 0;
    let appliedCoupon = input.couponCode;

    if (input.couponCode) {
      const code = input.couponCode.toUpperCase().trim();
      if (code === 'HDFC200') {
        discount = Math.min(200, Math.round(subtotal * 0.15));
      } else if (code === 'FIRST50') {
        discount = 100;
      } else if (code === 'DINE20') {
        discount = 150;
      } else {
        appliedCoupon = undefined;
      }
    }

    const grandTotal = Math.max(0, subtotal + baseConvenienceFee + taxes - discount);

    return {
      subtotal,
      convenienceFee: baseConvenienceFee,
      taxes,
      discount,
      totalAmount: grandTotal,
      appliedCoupon,
    };
  }

  static async calculatePriceAsync(input: PriceBreakdownInput): Promise<PriceBreakdownOutput> {
    const subtotal = input.unitPrice * input.quantity;
    
    let baseConvenienceFee = input.quantity > 0 ? input.quantity * 20 : 0;
    if (input.isMemberPlus) {
      baseConvenienceFee = Math.round(baseConvenienceFee * 0.5);
    }

    const taxes = Math.round((subtotal + baseConvenienceFee) * 0.08);

    let discount = 0;
    let appliedCoupon = input.couponCode;

    if (input.couponCode) {
      const code = input.couponCode.toUpperCase().trim();
      try {
        const coupon = await CouponModel.findOne({ code, isActive: true });
        if (coupon && new Date(coupon.validUntil) >= new Date()) {
          if (!coupon.minBookingAmount || subtotal >= coupon.minBookingAmount) {
            if (coupon.discountType === 'PERCENTAGE') {
              discount = Math.round((subtotal * coupon.discountValue) / 100);
              if (coupon.maxDiscountAmount) {
                discount = Math.min(discount, coupon.maxDiscountAmount);
              }
            } else {
              discount = coupon.discountValue;
            }
          } else {
            appliedCoupon = undefined;
          }
        } else {
          // Sync fallback check for known codes
          const syncResult = this.calculatePrice(input);
          discount = syncResult.discount;
          appliedCoupon = syncResult.appliedCoupon;
        }
      } catch (err) {
        const syncResult = this.calculatePrice(input);
        discount = syncResult.discount;
        appliedCoupon = syncResult.appliedCoupon;
      }
    }

    const grandTotal = Math.max(0, subtotal + baseConvenienceFee + taxes - discount);

    return {
      subtotal,
      convenienceFee: baseConvenienceFee,
      taxes,
      discount,
      totalAmount: grandTotal,
      appliedCoupon,
    };
  }
}


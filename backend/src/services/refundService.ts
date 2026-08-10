export interface RefundCalculation {
  isEligible: boolean;
  refundPercentage: number;
  refundAmount: number;
  cancellationFee: number;
  message: string;
}

export class RefundService {
  /**
   * Calculates cancellation refund rules based on hours remaining before event/showtime.
   * > 24h: 90% refund (10% cancellation fee)
   * 4h - 24h: 50% refund
   * < 4h: Non-refundable
   */
  static calculateRefund(totalAmount: number, eventDateStr: string, eventTimeStr: string): RefundCalculation {
    try {
      const eventDateTime = new Date(`${eventDateStr} ${eventTimeStr}`);
      const now = new Date();
      const diffHours = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours >= 24) {
        const refundAmount = Math.round(totalAmount * 0.9);
        return {
          isEligible: true,
          refundPercentage: 90,
          refundAmount,
          cancellationFee: totalAmount - refundAmount,
          message: 'Full refund eligible (10% standard processing fee retained).'
        };
      } else if (diffHours >= 4) {
        const refundAmount = Math.round(totalAmount * 0.5);
        return {
          isEligible: true,
          refundPercentage: 50,
          refundAmount,
          cancellationFee: totalAmount - refundAmount,
          message: 'Partial 50% refund eligible within 24 hours of event.'
        };
      } else {
        return {
          isEligible: false,
          refundPercentage: 0,
          refundAmount: 0,
          cancellationFee: totalAmount,
          message: 'Cancellations within 4 hours of event start are non-refundable.'
        };
      }
    } catch {
      // Default standard fallback
      const refundAmount = Math.round(totalAmount * 0.9);
      return {
        isEligible: true,
        refundPercentage: 90,
        refundAmount,
        cancellationFee: totalAmount - refundAmount,
        message: 'Standard cancellation refund processed.'
      };
    }
  }
}

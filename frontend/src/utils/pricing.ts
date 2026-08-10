import { Seat } from '../types';

export interface PriceBreakdown {
  baseTotal: number;
  convenienceFee: number;
  taxes: number;
  discount: number;
  grandTotal: number;
  appliedCouponCode?: string;
}

export function calculatePrice(
  basePricePerUnit: number,
  quantity: number,
  couponDiscount: number = 0,
  appliedCode?: string
): PriceBreakdown {
  const baseTotal = basePricePerUnit * quantity;
  // Standard convenience fee: ₹20 per ticket/seat
  const convenienceFee = quantity > 0 ? quantity * 20 : 0;
  // 18% GST/Tax on convenience fee + subtotal
  const taxes = Math.round((baseTotal + convenienceFee) * 0.08);
  
  let discount = couponDiscount;
  if (discount > baseTotal + convenienceFee + taxes) {
    discount = baseTotal + convenienceFee + taxes;
  }

  const grandTotal = Math.max(0, baseTotal + convenienceFee + taxes - discount);

  return {
    baseTotal,
    convenienceFee,
    taxes,
    discount,
    grandTotal,
    appliedCouponCode: appliedCode
  };
}

/**
 * Generates a realistic 8-row x 12-column cinema seating grid with occupied & premium seats
 */
export function generateSeatGrid(baseTicketPrice: number): Seat[] {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const cols = 12;
  const seats: Seat[] = [];

  // Occupied random seed simulation for realism
  const occupiedSeatIds = new Set(['A3', 'A4', 'B6', 'B7', 'C1', 'C2', 'D5', 'D6', 'D7', 'E10', 'E11', 'F3', 'G8']);

  rows.forEach((row, rowIndex) => {
    let seatType: 'standard' | 'premium' | 'vip' | 'accessible' = 'standard';
    let seatPrice = baseTicketPrice;

    if (rowIndex >= 5) {
      seatType = 'premium';
      seatPrice = Math.round(baseTicketPrice * 1.3);
    } else if (rowIndex === 7) {
      seatType = 'vip';
      seatPrice = Math.round(baseTicketPrice * 1.6);
    } else if (rowIndex === 0) {
      seatType = 'accessible';
    }

    for (let col = 1; col <= cols; col++) {
      const seatId = `${row}${col}`;
      const isOccupied = occupiedSeatIds.has(seatId);

      seats.push({
        id: seatId,
        row,
        number: col,
        type: seatType,
        price: seatPrice,
        status: isOccupied ? 'occupied' : 'available'
      });
    }
  });

  return seats;
}

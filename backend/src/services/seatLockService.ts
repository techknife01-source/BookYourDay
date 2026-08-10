import { SeatLockModel } from '../models/SeatLock.js';

export class SeatLockService {
  static async lockSeats(showId: string, seatIds: string[], userId: string): Promise<boolean> {
    const lockDurationMinutes = 10;
    const expiresAt = new Date(Date.now() + lockDurationMinutes * 60 * 1000);

    try {
      const existingLocks = await (SeatLockModel as any).find({
        showId,
        seatId: { $in: seatIds },
        userId: { $ne: userId },
        expiresAt: { $gt: new Date() }
      });

      if (existingLocks.length > 0) {
        return false;
      }

      const lockOps = seatIds.map(seatId => ({
        updateOne: {
          filter: { showId, seatId },
          update: { showId, seatId, userId, lockedAt: new Date(), expiresAt },
          upsert: true
        }
      }));

      await (SeatLockModel as any).bulkWrite(lockOps);
      return true;
    } catch (err) {
      console.warn('SeatLock DB fallback:', err);
      return true;
    }
  }

  static async unlockSeats(showId: string, seatIds: string[], userId: string): Promise<void> {
    try {
      await (SeatLockModel as any).deleteMany({
        showId,
        seatId: { $in: seatIds },
        userId
      });
    } catch (err) {
      console.warn('Unlock seats fallback:', err);
    }
  }
}

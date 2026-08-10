import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { SeatLockService } from '../services/seatLockService.js';

export class SeatController {
  static async lockSeats(req: AuthRequest, res: Response) {
    const { showId, seatIds } = req.body;
    const userId = req.user?.userId || 'usr_101';

    if (!showId || !seatIds || !Array.isArray(seatIds)) {
      return res.status(400).json({ success: false, message: 'Invalid showId or seatIds array.' });
    }

    const locked = await SeatLockService.lockSeats(showId, seatIds, userId);
    if (!locked) {
      return res.status(409).json({ success: false, message: 'One or more selected seats were locked by another user.' });
    }

    return res.json({
      success: true,
      message: 'Seats locked successfully for 10 minutes.',
      showId,
      seatIds,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });
  }

  static async unlockSeats(req: AuthRequest, res: Response) {
    const { showId, seatIds } = req.body;
    const userId = req.user?.userId || 'usr_101';

    await SeatLockService.unlockSeats(showId, seatIds || [], userId);
    return res.json({ success: true, message: 'Seats released.' });
  }
}

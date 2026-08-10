import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';

export class PartnerController {
  static async getDashboard(req: AuthRequest, res: Response) {
    return res.json({
      success: true,
      partner: {
        businessName: 'Grand Cineplex & Events',
        category: 'Cinema Partner',
        city: 'Asansol',
        verified: true,
      },
      stats: {
        totalRevenue: 284500,
        ticketsSoldThisMonth: 1240,
        activeListingsCount: 14,
        averageOccupancyRate: '84%',
        monthlyGrowthPercentage: '+18.5%'
      },
      recentListings: [
        { id: 'l1', title: 'Grand Cineplex Dolby Atmos - Showtimes', status: 'Active', sales: '₹1,42,000', bookingsCount: 380 },
        { id: 'l2', title: 'Summer Music Live 2026', status: 'Active', sales: '₹92,500', bookingsCount: 120 }
      ]
    });
  }

  static async createListing(req: AuthRequest, res: Response) {
    const listingData = req.body;
    return res.status(201).json({
      success: true,
      message: 'Partner listing submitted for approval.',
      listing: {
        id: `lst_${Date.now()}`,
        ...listingData,
        status: 'PENDING_VERIFICATION',
        createdAt: new Date().toISOString()
      }
    });
  }
}

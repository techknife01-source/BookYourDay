import { Request, Response } from 'express';
import { EventModel } from '../models/Event.js';

export class EventController {
  static async getEvents(req: Request, res: Response) {
    const { category, city } = req.query;
    try {
      let query: any = {};
      if (category) query.category = new RegExp(String(category), 'i');
      if (city) query.city = new RegExp(String(city), 'i');

      const events = await (EventModel as any).find(query);
      const formatted = events.map((e: any) => {
        const obj = e.toObject ? e.toObject() : e;
        return {
          ...obj,
          id: obj._id ? obj._id.toString() : obj.id
        };
      });
      return res.json({ success: true, data: formatted });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch events',
        error: { code: 'EVENTS_FETCH_ERROR', details: error?.message }
      });
    }
  }

  static async getEventById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      let event = await (EventModel as any).findById(id).catch(() => null);
      if (!event) {
        event = await (EventModel as any).findOne({ _id: id }).catch(() => null);
      }

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
          error: { code: 'NOT_FOUND', details: `No event found with ID ${id}` }
        });
      }

      const obj = event.toObject ? event.toObject() : event;
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
        message: 'Failed to fetch event',
        error: { code: 'EVENT_FETCH_ERROR', details: error?.message }
      });
    }
  }
}

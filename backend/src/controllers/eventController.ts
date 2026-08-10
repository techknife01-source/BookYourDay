import { Request, Response } from 'express';
import { EventModel } from '../models/Event.js';

const MOCK_EVENTS_LIST = [
  {
    id: 'e1',
    title: 'Summer Indie Nights Live',
    category: 'Concert',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    date: 'SAT, 24 AUG 2026',
    time: '07:00 PM',
    venue: 'Brooklyn Amphitheatre',
    city: 'New York',
    startingPrice: 899,
    rating: 4.9,
    organizer: 'Sonic Pulse Live',
    description: 'An electrifying outdoor indie music festival.',
    ticketTiers: [
      { id: 't1', name: 'General Access', price: 899, description: 'Standard standing area', availableQuantity: 150 },
      { id: 't2', name: 'VIP Lounge Pass', price: 3499, description: 'Express queue + VIP deck', availableQuantity: 12 }
    ],
    isTrending: true
  },
  {
    id: 'e2',
    title: 'Comedy Underground Uncut',
    category: 'Comedy',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&auto=format&fit=crop&q=80',
    date: 'FRI, 18 AUG 2026',
    time: '08:30 PM',
    venue: 'The Laugh Factory Club',
    city: 'Asansol',
    startingPrice: 499,
    rating: 4.8,
    organizer: 'Chai & Jokes Productions',
    description: 'Prepare for 90 minutes of unscripted stand-up comedy.',
    ticketTiers: [
      { id: 't4', name: 'Regular Seat', price: 499, description: 'Row seat view', availableQuantity: 60 }
    ],
    isTrending: true
  }
];

export class EventController {
  static async getEvents(req: Request, res: Response) {
    const { category, city } = req.query;
    try {
      let query: any = {};
      if (category) query.category = category;
      if (city) query.city = city;

      const events = await (EventModel as any).find(query);
      if (events && events.length > 0) {
        return res.json({ success: true, data: events });
      }
    } catch {
      // Fallback
    }

    let filtered = MOCK_EVENTS_LIST;
    if (category) {
      filtered = filtered.filter(e => e.category.toLowerCase() === (category as string).toLowerCase());
    }
    return res.json({ success: true, data: filtered });
  }

  static async getEventById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const event = await (EventModel as any).findById(id);
      if (event) return res.json({ success: true, data: event });
    } catch {
      // Fallback
    }
    const found = MOCK_EVENTS_LIST.find(e => e.id === id) || MOCK_EVENTS_LIST[0];
    return res.json({ success: true, data: found });
  }
}

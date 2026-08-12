import { Request, Response } from 'express';
import { MovieModel } from '../models/Movie.js';
import { EventModel } from '../models/Event.js';
import { SportsEventModel } from '../models/SportsEvent.js';
import { AttractionModel } from '../models/Attraction.js';
import { RestaurantModel } from '../models/Restaurant.js';
import { ExperienceModel } from '../models/Experience.js';
import { HotelModel } from '../models/Hotel.js';
import { RoomTypeModel } from '../models/RoomType.js';
import { TravelPackageModel } from '../models/TravelPackage.js';
import { TravelTransferModel } from '../models/TravelTransfer.js';

export interface CatalogItem {
  id: string;
  category: 'MOVIE' | 'EVENT' | 'SPORTS' | 'ATTRACTION' | 'RESTAURANT' | 'EXPERIENCE' | 'HOTEL' | 'TRAVEL' | 'TRANSFER' | string;
  title: string;
  description: string;
  image: string;
  backdrop?: string;
  location?: string;
  city?: string;
  rating?: number;
  reviewCount?: number;
  priceFrom?: number;
  currency?: string;
  availability?: 'AVAILABLE' | 'FEW_LEFT' | 'LIMITED' | 'SOLD_OUT' | string;
  metadata: Record<string, any>;
  distanceKm?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  matchType?: 'GEO_MATCH' | 'CITY_MATCH' | string;
}

function normalizeMovie(m: any): CatalogItem {
  return {
    id: m._id ? m._id.toString() : m.id,
    category: 'MOVIE',
    title: m.title,
    description: m.description,
    image: m.poster,
    backdrop: m.backdrop,
    rating: m.rating,
    reviewCount: m.votesCount,
    priceFrom: 250,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: {
      genre: m.genre,
      language: m.language,
      duration: m.duration,
      releaseDate: m.releaseDate,
      format: m.format,
      cast: m.cast,
      director: m.director,
      isTrending: m.isTrending
    }
  };
}

function normalizeEvent(e: any): CatalogItem {
  return {
    id: e._id ? e._id.toString() : e.id,
    category: 'EVENT',
    title: e.title,
    description: e.description,
    image: e.image,
    backdrop: e.backdrop,
    location: e.venue,
    city: e.city,
    rating: e.rating,
    priceFrom: e.startingPrice,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: {
      eventCategory: e.category,
      date: e.date,
      time: e.time,
      organizer: e.organizer,
      ticketTiers: e.ticketTiers,
      isTrending: e.isTrending
    }
  };
}

function normalizeSports(s: any): CatalogItem {
  return {
    id: s._id ? s._id.toString() : s.id,
    category: 'SPORTS',
    title: s.title,
    description: s.description,
    image: s.image,
    backdrop: s.backdrop,
    location: s.venue,
    city: s.city,
    rating: s.rating,
    priceFrom: s.startingPrice,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: {
      sportType: s.sportType,
      teamsOrPlayers: s.teamsOrPlayers,
      date: s.date,
      time: s.time,
      organizer: s.organizer,
      ticketTiers: s.ticketTiers,
      isTrending: s.isTrending
    }
  };
}

function normalizeAttraction(a: any): CatalogItem {
  return {
    id: a._id ? a._id.toString() : a.id,
    category: 'ATTRACTION',
    title: a.title,
    description: a.description,
    image: a.image,
    location: a.address,
    city: a.city,
    rating: a.rating,
    priceFrom: a.entryPrice,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: {
      attractionCategory: a.category,
      timings: a.timings,
      inclusions: a.inclusions,
      isTrending: a.isTrending
    }
  };
}

function normalizeRestaurant(r: any): CatalogItem {
  return {
    id: r._id ? r._id.toString() : r.id,
    category: 'RESTAURANT',
    title: r.name,
    description: `${r.discountOffer || 'Gourmet Dining'} at ${r.locality}`,
    image: r.image,
    location: r.locality,
    city: r.city,
    rating: r.rating,
    priceFrom: r.costForTwo,
    currency: 'INR',
    availability: r.isBookable ? 'AVAILABLE' : 'SOLD_OUT',
    metadata: {
      cuisine: r.cuisine,
      locality: r.locality,
      discountOffer: r.discountOffer,
      costForTwo: r.costForTwo,
      isBookable: r.isBookable
    }
  };
}

function normalizeExperience(x: any): CatalogItem {
  return {
    id: x._id ? x._id.toString() : x.id,
    category: 'EXPERIENCE',
    title: x.title,
    description: x.description,
    image: x.image,
    city: x.city,
    rating: x.rating,
    priceFrom: x.pricePerPerson,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: {
      type: x.type,
      duration: x.duration,
      highlights: x.highlights,
      isPopular: x.isPopular
    }
  };
}

function normalizeTravelPackage(pkg: any): CatalogItem {
  return {
    id: pkg._id ? pkg._id.toString() : pkg.id,
    category: 'TRAVEL',
    title: pkg.title,
    description: pkg.description,
    image: pkg.images?.[0] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop&q=80',
    city: pkg.destination,
    location: `${pkg.origin} to ${pkg.destination}`,
    rating: pkg.rating || 4.8,
    reviewCount: pkg.reviewCount || 45,
    priceFrom: pkg.startingPrice,
    currency: 'INR',
    availability: pkg.availableCapacity > 0 ? 'AVAILABLE' : 'SOLD_OUT',
    metadata: {
      origin: pkg.origin,
      destination: pkg.destination,
      durationDays: pkg.durationDays,
      durationNights: pkg.durationNights,
      inclusions: pkg.inclusions,
      exclusions: pkg.exclusions,
      itinerary: pkg.itinerary,
      cancellationPolicy: pkg.cancellationPolicy,
      availableCapacity: pkg.availableCapacity
    }
  };
}

function normalizeTravelTransfer(tr: any): CatalogItem {
  return {
    id: tr._id ? tr._id.toString() : tr.id,
    category: 'TRANSFER',
    title: tr.title,
    description: tr.description,
    image: tr.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80',
    city: tr.destination,
    location: `${tr.origin} → ${tr.destination}`,
    rating: tr.rating || 4.7,
    reviewCount: tr.reviewCount || 30,
    priceFrom: tr.pricePerVehicle,
    currency: 'INR',
    availability: tr.availableCapacity > 0 ? 'AVAILABLE' : 'SOLD_OUT',
    metadata: {
      origin: tr.origin,
      destination: tr.destination,
      vehicleType: tr.vehicleType,
      capacity: tr.capacity,
      cancellationPolicy: tr.cancellationPolicy,
      availableCapacity: tr.availableCapacity
    }
  };
}

const FALLBACK_ITEMS: CatalogItem[] = [
  {
    id: 'm1',
    category: 'MOVIE',
    title: 'Echoes of Tomorrow',
    description: 'When humanity unlocks temporal memory transfer, a rogue agent must navigate quantum timelines to prevent the unraveling of reality.',
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    city: 'Asansol',
    rating: 4.9,
    reviewCount: 42800,
    priceFrom: 250,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: { genre: ['Sci-Fi', 'Action'], language: ['English', 'Hindi'], releaseDate: '2026-08-10', isTrending: true }
  },
  {
    id: 'm2',
    category: 'MOVIE',
    title: 'Midnight Run: Eclipse',
    description: 'A high-octane heist thriller taking place during a city-wide power outage.',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80',
    city: 'Asansol',
    rating: 4.7,
    reviewCount: 28400,
    priceFrom: 220,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: { genre: ['Action', 'Thriller'], language: ['English', 'Hindi'], releaseDate: '2026-08-02', isTrending: true }
  },
  {
    id: 'e1',
    category: 'EVENT',
    title: 'Summer Indie Nights Live',
    description: 'An electrifying outdoor indie music festival featuring live bands and food stalls.',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    location: 'Brooklyn Open Amphitheatre',
    city: 'Asansol',
    rating: 4.9,
    reviewCount: 1500,
    priceFrom: 899,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: { eventCategory: 'Concert', date: 'SAT, 24 AUG 2026', isTrending: true }
  },
  {
    id: 'sp1',
    category: 'SPORTS',
    title: 'Asia T20 Super Cup Final',
    description: 'The premier clash of Asian cricket titans live under stadium floodlights.',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
    location: 'Eden Gardens Stadium',
    city: 'Kolkata',
    rating: 4.9,
    reviewCount: 2200,
    priceFrom: 1200,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: { sportType: 'Cricket', date: 'SUN, 30 AUG 2026', isTrending: true }
  },
  {
    id: 'a1',
    category: 'ATTRACTION',
    title: 'Wonderland Aqua & Theme Park',
    description: 'Over 25 adrenaline-pumping rides, wave pools, and interactive children water zones.',
    image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=600&auto=format&fit=crop&q=80',
    location: 'NH-19 Bypass Road',
    city: 'Asansol',
    rating: 4.7,
    reviewCount: 3500,
    priceFrom: 650,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: { attractionCategory: 'Waterpark', isTrending: true }
  },
  {
    id: 'x1',
    category: 'EXPERIENCE',
    title: 'River Lakeside Sunset Glamping',
    description: 'Luxury outdoor tent stay with acoustic bonfire music, stargazing, and barbecue dinner.',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80',
    city: 'Asansol',
    rating: 4.8,
    reviewCount: 1800,
    priceFrom: 1850,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: { type: 'Camping' }
  },
  {
    id: 'r1',
    category: 'RESTAURANT',
    title: 'Spice & Sizzle Fine Dining',
    description: 'Flat 20% OFF on Gourmet Bill at Burnpur Road',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    location: 'Burnpur Road',
    city: 'Asansol',
    rating: 4.7,
    reviewCount: 950,
    priceFrom: 1200,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: { cuisine: ['North Indian', 'Mughlai'] }
  }
];

export class CatalogController {
  static async getCatalog(req: Request, res: Response) {
    const { category, city, search, trending } = req.query;

    try {
      const items: CatalogItem[] = [];

      const queryCity = city ? { city: new RegExp(String(city), 'i') } : {};
      const publishedFilter = { $or: [{ partnerId: { $exists: false } }, { partnerId: null }, { status: 'PUBLISHED' }] };

      if (!category || category === 'movie' || category === 'movies' || category === 'MOVIE') {
        const movies = await (MovieModel as any).find({ ...publishedFilter, ...(trending ? { isTrending: true } : {}) }).catch(() => []);
        movies.forEach((m: any) => items.push(normalizeMovie(m)));
      }

      if (!category || category === 'event' || category === 'events' || category === 'EVENT') {
        const events = await (EventModel as any).find({ ...queryCity, ...publishedFilter, ...(trending ? { isTrending: true } : {}) }).catch(() => []);
        events.forEach((e: any) => items.push(normalizeEvent(e)));
      }

      if (!category || category === 'sport' || category === 'sports' || category === 'SPORTS') {
        const sports = await (SportsEventModel as any).find({ ...queryCity, ...publishedFilter, ...(trending ? { isTrending: true } : {}) }).catch(() => []);
        sports.forEach((s: any) => items.push(normalizeSports(s)));
      }

      if (!category || category === 'attraction' || category === 'attractions' || category === 'ATTRACTION') {
        const attr = await (AttractionModel as any).find({ ...queryCity, ...publishedFilter, ...(trending ? { isTrending: true } : {}) }).catch(() => []);
        attr.forEach((a: any) => items.push(normalizeAttraction(a)));
      }

      if (!category || category === 'restaurant' || category === 'restaurants' || category === 'dining' || category === 'RESTAURANT') {
        const rest = await (RestaurantModel as any).find({ ...queryCity, ...publishedFilter }).catch(() => []);
        rest.forEach((r: any) => items.push(normalizeRestaurant(r)));
      }

      if (!category || category === 'experience' || category === 'experiences' || category === 'EXPERIENCE') {
        const exp = await (ExperienceModel as any).find({ ...queryCity, ...publishedFilter, ...(trending ? { isPopular: true } : {}) }).catch(() => []);
        exp.forEach((x: any) => items.push(normalizeExperience(x)));
      }

      let filtered = items;
      if (filtered.length === 0) {
        filtered = FALLBACK_ITEMS.filter((item) => {
          if (category && category !== 'ALL' && item.category !== String(category).toUpperCase() && !String(category).toUpperCase().includes(item.category)) {
            return false;
          }
          if (city && item.city && item.city.toLowerCase() !== String(city).toLowerCase()) {
            return false;
          }
          if (trending && !item.metadata?.isTrending) {
            return false;
          }
          return true;
        });
      }

      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(
          i => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s) || (i.city && i.city.toLowerCase().includes(s))
        );
      }

      return res.json({
        success: true,
        data: filtered,
        message: `Fetched ${filtered.length} catalog items`
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch catalog items',
        error: {
          code: 'CATALOG_ERROR',
          details: error?.message || 'Database fetch error'
        }
      });
    }
  }

  static async getByCategory(req: Request, res: Response) {
    const rawCategory = req.params.category.toLowerCase();
    const { city, search } = req.query;

    try {
      const items: CatalogItem[] = [];
      const queryCity = city ? { city: new RegExp(String(city), 'i') } : {};
      const publishedFilter = { $or: [{ partnerId: { $exists: false } }, { partnerId: null }, { status: 'PUBLISHED' }] };

      if (rawCategory === 'movie' || rawCategory === 'movies') {
        const movies = await (MovieModel as any).find({ ...queryCity, ...publishedFilter }).catch(() => []);
        movies.forEach((m: any) => items.push(normalizeMovie(m)));
      } else if (rawCategory === 'event' || rawCategory === 'events') {
        const events = await (EventModel as any).find({ ...queryCity, ...publishedFilter }).catch(() => []);
        events.forEach((e: any) => items.push(normalizeEvent(e)));
      } else if (rawCategory === 'sport' || rawCategory === 'sports') {
        const sports = await (SportsEventModel as any).find({ ...queryCity, ...publishedFilter }).catch(() => []);
        sports.forEach((s: any) => items.push(normalizeSports(s)));
      } else if (rawCategory === 'attraction' || rawCategory === 'attractions' || rawCategory === 'parks') {
        const attr = await (AttractionModel as any).find({ ...queryCity, ...publishedFilter }).catch(() => []);
        attr.forEach((a: any) => items.push(normalizeAttraction(a)));
      } else if (rawCategory === 'restaurant' || rawCategory === 'restaurants' || rawCategory === 'dining') {
        const rest = await (RestaurantModel as any).find({ ...queryCity, ...publishedFilter }).catch(() => []);
        rest.forEach((r: any) => items.push(normalizeRestaurant(r)));
      } else if (rawCategory === 'experience' || rawCategory === 'experiences' || rawCategory === 'play') {
        const exp = await (ExperienceModel as any).find({ ...queryCity, ...publishedFilter }).catch(() => []);
        exp.forEach((x: any) => items.push(normalizeExperience(x)));
      }

      let filtered = items;
      if (filtered.length === 0) {
        filtered = FALLBACK_ITEMS.filter((item) => {
          const cat = item.category.toLowerCase();
          if (rawCategory.includes(cat) || cat.includes(rawCategory) || (rawCategory === 'dining' && cat === 'restaurant') || (rawCategory === 'play' && cat === 'experience')) {
            if (city && item.city && item.city.toLowerCase() !== String(city).toLowerCase()) return false;
            return true;
          }
          return false;
        });
      }

      if (search) {
        const s = String(search).toLowerCase();
        filtered = filtered.filter(
          i => i.title.toLowerCase().includes(s) || i.description.toLowerCase().includes(s)
        );
      }

      return res.json({
        success: true,
        data: filtered,
        message: `Fetched ${filtered.length} items for category ${rawCategory}`
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch items for category ${req.params.category}`,
        error: {
          code: 'CATEGORY_FETCH_ERROR',
          details: error?.message || 'Database error'
        }
      });
    }
  }

  static async getItemById(req: Request, res: Response) {
    const rawCategory = req.params.category.toLowerCase();
    const { id } = req.params;

    try {
      let doc: any = null;
      let normalizer: ((d: any) => CatalogItem) | null = null;

      if (rawCategory === 'movie' || rawCategory === 'movies') {
        doc = await (MovieModel as any).findById(id).catch(() => null) || await (MovieModel as any).findOne({ _id: id }).catch(() => null);
        normalizer = normalizeMovie;
      } else if (rawCategory === 'event' || rawCategory === 'events') {
        doc = await (EventModel as any).findById(id).catch(() => null);
        normalizer = normalizeEvent;
      } else if (rawCategory === 'sport' || rawCategory === 'sports') {
        doc = await (SportsEventModel as any).findById(id).catch(() => null);
        normalizer = normalizeSports;
      } else if (rawCategory === 'attraction' || rawCategory === 'attractions' || rawCategory === 'parks') {
        doc = await (AttractionModel as any).findById(id).catch(() => null);
        normalizer = normalizeAttraction;
      } else if (rawCategory === 'restaurant' || rawCategory === 'restaurants' || rawCategory === 'dining') {
        doc = await (RestaurantModel as any).findById(id).catch(() => null);
        normalizer = normalizeRestaurant;
      } else if (rawCategory === 'experience' || rawCategory === 'experiences' || rawCategory === 'play') {
        doc = await (ExperienceModel as any).findById(id).catch(() => null);
        normalizer = normalizeExperience;
      }

      if (!doc && normalizer) {
        // Try searching across all categories if ID didn't match the requested category model
        const m = await (MovieModel as any).findById(id).catch(() => null);
        if (m) { doc = m; normalizer = normalizeMovie; }
        else {
          const e = await (EventModel as any).findById(id).catch(() => null);
          if (e) { doc = e; normalizer = normalizeEvent; }
          else {
            const s = await (SportsEventModel as any).findById(id).catch(() => null);
            if (s) { doc = s; normalizer = normalizeSports; }
            else {
              const a = await (AttractionModel as any).findById(id).catch(() => null);
              if (a) { doc = a; normalizer = normalizeAttraction; }
              else {
                const r = await (RestaurantModel as any).findById(id).catch(() => null);
                if (r) { doc = r; normalizer = normalizeRestaurant; }
                else {
                  const x = await (ExperienceModel as any).findById(id).catch(() => null);
                  if (x) { doc = x; normalizer = normalizeExperience; }
                }
              }
            }
          }
        }
      }

      if (!doc || !normalizer) {
        const fallbackMatch = FALLBACK_ITEMS.find((f) => f.id === id);
        if (fallbackMatch) {
          return res.json({
            success: true,
            data: fallbackMatch
          });
        }

        return res.status(404).json({
          success: false,
          message: 'Item not found',
          error: {
            code: 'NOT_FOUND',
            details: `No item found with ID ${id}`
          }
        });
      }

      // Check customer visibility: if partner item and not PUBLISHED, return 404
      if (doc.partnerId && doc.status && doc.status !== 'PUBLISHED') {
        return res.status(404).json({
          success: false,
          message: 'Item not available or not published',
          error: {
            code: 'NOT_FOUND',
            details: `Item ${id} is not published`
          }
        });
      }

      return res.json({
        success: true,
        data: normalizer(doc)
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch catalog item',
        error: {
          code: 'ITEM_FETCH_ERROR',
          details: error?.message || 'Database error'
        }
      });
    }
  }
}

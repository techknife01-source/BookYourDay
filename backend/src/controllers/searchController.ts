import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { MovieModel } from '../models/Movie.js';
import { EventModel } from '../models/Event.js';
import { SportsEventModel } from '../models/SportsEvent.js';
import { AttractionModel } from '../models/Attraction.js';
import { ExperienceModel } from '../models/Experience.js';
import { RestaurantModel } from '../models/Restaurant.js';
import { HotelModel } from '../models/Hotel.js';
import { RoomTypeModel } from '../models/RoomType.js';
import { TravelPackageModel } from '../models/TravelPackage.js';
import { TravelTransferModel } from '../models/TravelTransfer.js';
import { CatalogItem } from './catalogController.js';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeMovie(m: any): CatalogItem {
  return {
    id: m._id ? m._id.toString() : m.id,
    category: 'MOVIE',
    title: m.title,
    description: m.description,
    image: m.poster,
    backdrop: m.backdrop,
    rating: m.rating || 4.5,
    reviewCount: m.votesCount || 1000,
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
    rating: e.rating || 4.8,
    reviewCount: 1500,
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
    rating: s.rating || 4.8,
    reviewCount: 2200,
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
    rating: a.rating || 4.7,
    reviewCount: 3500,
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

function normalizeExperience(x: any): CatalogItem {
  return {
    id: x._id ? x._id.toString() : x.id,
    category: 'EXPERIENCE',
    title: x.title,
    description: x.description,
    image: x.image,
    city: x.city,
    location: x.city,
    rating: x.rating || 4.8,
    reviewCount: 1800,
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

function normalizeRestaurant(r: any): CatalogItem {
  return {
    id: r._id ? r._id.toString() : r.id,
    category: 'RESTAURANT',
    title: r.name,
    description: `${r.discountOffer || 'Gourmet Dining'} at ${r.locality}`,
    image: r.image,
    location: r.locality,
    city: r.city,
    rating: r.rating || 4.6,
    reviewCount: 950,
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

function normalizeHotel(h: any, minPrice = 1500): CatalogItem {
  return {
    id: h._id ? h._id.toString() : h.id,
    category: 'HOTEL',
    title: h.name,
    description: h.description,
    image: h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
    location: h.address,
    city: h.city,
    rating: h.rating || 4.8,
    reviewCount: h.reviewCount || 120,
    priceFrom: minPrice,
    currency: 'INR',
    availability: 'AVAILABLE',
    metadata: {
      amenities: h.amenities,
      cancellationPolicy: h.cancellationPolicy,
      checkInTime: h.checkInTime,
      checkOutTime: h.checkOutTime
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
    metadata: { genre: ['Sci-Fi', 'Action'], language: ['English', 'Hindi'], releaseDate: '2026-08-10' }
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
    metadata: { genre: ['Action', 'Thriller'], language: ['English', 'Hindi'], releaseDate: '2026-08-02' }
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
    metadata: { eventCategory: 'Concert', date: 'SAT, 24 AUG 2026' }
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
    metadata: { sportType: 'Cricket', date: 'SUN, 30 AUG 2026' }
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
    metadata: { attractionCategory: 'Waterpark' }
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

import { NearbyController } from './nearbyController.js';

export class SearchController {
  static async search(req: Request, res: Response) {
    try {
      if (req.query.lat || req.query.lng || req.query.latitude || req.query.longitude || req.query.radius) {
        return NearbyController.getNearby(req, res);
      }

      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }

      const q = req.query.q ? String(req.query.q).trim() : '';
      const rawCategory = req.query.category ? String(req.query.category).trim().toUpperCase() : '';
      const city = req.query.city ? String(req.query.city).trim() : '';
      const minPrice = req.query.minPrice !== undefined && req.query.minPrice !== '' ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice !== undefined && req.query.maxPrice !== '' ? Number(req.query.maxPrice) : undefined;
      const minRating = req.query.minRating !== undefined && req.query.minRating !== '' ? Number(req.query.minRating) : undefined;
      const date = req.query.date ? String(req.query.date).trim() : '';
      const sort = req.query.sort ? String(req.query.sort).trim().toLowerCase() : 'relevance';
      const page = Math.max(1, req.query.page ? parseInt(String(req.query.page), 10) || 1 : 1);
      const limit = Math.max(1, Math.min(100, req.query.limit ? parseInt(String(req.query.limit), 10) || 12 : 12));

      const queryMovies = !rawCategory || rawCategory === 'ALL' || rawCategory === 'MOVIE' || rawCategory === 'MOVIES';
      const queryEvents = !rawCategory || rawCategory === 'ALL' || rawCategory === 'EVENT' || rawCategory === 'EVENTS';
      const querySports = !rawCategory || rawCategory === 'ALL' || rawCategory === 'SPORTS' || rawCategory === 'SPORT';
      const queryAttractions = !rawCategory || rawCategory === 'ALL' || rawCategory === 'ATTRACTION' || rawCategory === 'ATTRACTIONS' || rawCategory === 'PARKS';
      const queryExperiences = !rawCategory || rawCategory === 'ALL' || rawCategory === 'EXPERIENCE' || rawCategory === 'EXPERIENCES' || rawCategory === 'PLAY';
      const queryRestaurants = !rawCategory || rawCategory === 'ALL' || rawCategory === 'RESTAURANT' || rawCategory === 'RESTAURANTS' || rawCategory === 'DINING';
      const queryHotels = !rawCategory || rawCategory === 'ALL' || rawCategory === 'HOTEL' || rawCategory === 'HOTELS' || rawCategory === 'STAYS';
      const queryTravel = !rawCategory || rawCategory === 'ALL' || rawCategory === 'TRAVEL' || rawCategory === 'PACKAGES' || rawCategory === 'TRAVEL_PACKAGES';
      const queryTransfers = !rawCategory || rawCategory === 'ALL' || rawCategory === 'TRANSFER' || rawCategory === 'TRANSFERS';

      const resultsPromises: Promise<CatalogItem[]>[] = [];

      const regexQ = q ? new RegExp(escapeRegex(q), 'i') : null;
      const regexCity = city ? new RegExp(escapeRegex(city), 'i') : null;
      const regexDate = date ? new RegExp(escapeRegex(date), 'i') : null;

      const publishedFilter = { $or: [{ partnerId: { $exists: false } }, { partnerId: null }, { status: 'PUBLISHED' }] };

      // 1. Movie Query
      if (queryMovies) {
        resultsPromises.push((async () => {
          if (minPrice !== undefined && 250 < minPrice) return [];
          if (maxPrice !== undefined && 250 > maxPrice) return [];

          const mQuery: any = { ...publishedFilter };
          if (regexQ) {
            mQuery.$or = [
              { title: regexQ },
              { description: regexQ },
              { genre: regexQ },
              { director: regexQ },
              { 'cast.name': regexQ },
              { language: regexQ }
            ];
          }
          if (minRating !== undefined) {
            mQuery.rating = { $gte: minRating };
          }

          const docs = await (MovieModel as any).find(mQuery).lean().maxTimeMS(5000).catch(() => []);
          return docs.map(normalizeMovie);
        })());
      }

      // 2. Event Query
      if (queryEvents) {
        resultsPromises.push((async () => {
          const eQuery: any = { ...publishedFilter };
          if (regexQ) {
            eQuery.$or = [
              { title: regexQ },
              { description: regexQ },
              { category: regexQ },
              { venue: regexQ },
              { city: regexQ },
              { organizer: regexQ }
            ];
          }
          if (regexCity) {
            eQuery.city = regexCity;
          }
          if (minRating !== undefined) {
            eQuery.rating = { $gte: minRating };
          }
          if (minPrice !== undefined || maxPrice !== undefined) {
            eQuery.startingPrice = {};
            if (minPrice !== undefined) eQuery.startingPrice.$gte = minPrice;
            if (maxPrice !== undefined) eQuery.startingPrice.$lte = maxPrice;
          }
          if (regexDate) {
            eQuery.date = regexDate;
          }

          const docs = await (EventModel as any).find(eQuery).lean().maxTimeMS(5000).catch(() => []);
          return docs.map(normalizeEvent);
        })());
      }

      // 3. Sports Query
      if (querySports) {
        resultsPromises.push((async () => {
          const sQuery: any = { ...publishedFilter };
          if (regexQ) {
            sQuery.$or = [
              { title: regexQ },
              { description: regexQ },
              { sportType: regexQ },
              { venue: regexQ },
              { city: regexQ },
              { teamsOrPlayers: regexQ }
            ];
          }
          if (regexCity) {
            sQuery.city = regexCity;
          }
          if (minRating !== undefined) {
            sQuery.rating = { $gte: minRating };
          }
          if (minPrice !== undefined || maxPrice !== undefined) {
            sQuery.startingPrice = {};
            if (minPrice !== undefined) sQuery.startingPrice.$gte = minPrice;
            if (maxPrice !== undefined) sQuery.startingPrice.$lte = maxPrice;
          }
          if (regexDate) {
            sQuery.date = regexDate;
          }

          const docs = await (SportsEventModel as any).find(sQuery).lean().maxTimeMS(5000).catch(() => []);
          return docs.map(normalizeSports);
        })());
      }

      // 4. Attraction Query
      if (queryAttractions) {
        resultsPromises.push((async () => {
          const aQuery: any = { ...publishedFilter };
          if (regexQ) {
            aQuery.$or = [
              { title: regexQ },
              { description: regexQ },
              { category: regexQ },
              { address: regexQ },
              { city: regexQ },
              { inclusions: regexQ }
            ];
          }
          if (regexCity) {
            aQuery.city = regexCity;
          }
          if (minRating !== undefined) {
            aQuery.rating = { $gte: minRating };
          }
          if (minPrice !== undefined || maxPrice !== undefined) {
            aQuery.entryPrice = {};
            if (minPrice !== undefined) aQuery.entryPrice.$gte = minPrice;
            if (maxPrice !== undefined) aQuery.entryPrice.$lte = maxPrice;
          }

          const docs = await (AttractionModel as any).find(aQuery).lean().maxTimeMS(5000).catch(() => []);
          return docs.map(normalizeAttraction);
        })());
      }

      // 5. Experience Query
      if (queryExperiences) {
        resultsPromises.push((async () => {
          const xQuery: any = { ...publishedFilter };
          if (regexQ) {
            xQuery.$or = [
              { title: regexQ },
              { description: regexQ },
              { type: regexQ },
              { city: regexQ },
              { highlights: regexQ }
            ];
          }
          if (regexCity) {
            xQuery.city = regexCity;
          }
          if (minRating !== undefined) {
            xQuery.rating = { $gte: minRating };
          }
          if (minPrice !== undefined || maxPrice !== undefined) {
            xQuery.pricePerPerson = {};
            if (minPrice !== undefined) xQuery.pricePerPerson.$gte = minPrice;
            if (maxPrice !== undefined) xQuery.pricePerPerson.$lte = maxPrice;
          }

          const docs = await (ExperienceModel as any).find(xQuery).lean().maxTimeMS(5000).catch(() => []);
          return docs.map(normalizeExperience);
        })());
      }

      // 6. Restaurant Query
      if (queryRestaurants) {
        resultsPromises.push((async () => {
          const rQuery: any = { ...publishedFilter };
          if (regexQ) {
            rQuery.$or = [
              { name: regexQ },
              { locality: regexQ },
              { city: regexQ },
              { cuisine: regexQ },
              { discountOffer: regexQ }
            ];
          }
          if (regexCity) {
            rQuery.city = regexCity;
          }
          if (minRating !== undefined) {
            rQuery.rating = { $gte: minRating };
          }
          if (minPrice !== undefined || maxPrice !== undefined) {
            rQuery.costForTwo = {};
            if (minPrice !== undefined) rQuery.costForTwo.$gte = minPrice;
            if (maxPrice !== undefined) rQuery.costForTwo.$lte = maxPrice;
          }

          const docs = await (RestaurantModel as any).find(rQuery).lean().maxTimeMS(5000).catch(() => []);
          return docs.map(normalizeRestaurant);
        })());
      }

      // 7. Hotel Query
      if (queryHotels) {
        resultsPromises.push((async () => {
          const hQuery: any = { status: 'PUBLISHED' };
          if (regexQ) {
            hQuery.$or = [
              { name: regexQ },
              { description: regexQ },
              { address: regexQ },
              { city: regexQ }
            ];
          }
          if (regexCity) {
            hQuery.city = regexCity;
          }
          if (minRating !== undefined) {
            hQuery.rating = { $gte: minRating };
          }

          const docs = await (HotelModel as any).find(hQuery).lean().maxTimeMS(5000).catch(() => []);
          return docs.map((h: any) => normalizeHotel(h, 2500));
        })());
      }

      // 8. Travel Package Query
      if (queryTravel) {
        resultsPromises.push((async () => {
          const tpQuery: any = { status: 'PUBLISHED' };
          if (regexQ) {
            tpQuery.$or = [
              { title: regexQ },
              { description: regexQ },
              { origin: regexQ },
              { destination: regexQ },
              { inclusions: regexQ }
            ];
          }
          if (regexCity) {
            tpQuery.$or = [
              { destination: regexCity },
              { origin: regexCity }
            ];
          }
          if (minRating !== undefined) {
            tpQuery.rating = { $gte: minRating };
          }
          if (minPrice !== undefined || maxPrice !== undefined) {
            tpQuery.startingPrice = {};
            if (minPrice !== undefined) tpQuery.startingPrice.$gte = minPrice;
            if (maxPrice !== undefined) tpQuery.startingPrice.$lte = maxPrice;
          }

          const docs = await (TravelPackageModel as any).find(tpQuery).lean().maxTimeMS(5000).catch(() => []);
          return docs.map(normalizeTravelPackage);
        })());
      }

      // 9. Travel Transfer Query
      if (queryTransfers) {
        resultsPromises.push((async () => {
          const ttQuery: any = { status: 'PUBLISHED' };
          if (regexQ) {
            ttQuery.$or = [
              { title: regexQ },
              { description: regexQ },
              { origin: regexQ },
              { destination: regexQ },
              { vehicleType: regexQ }
            ];
          }
          if (regexCity) {
            ttQuery.$or = [
              { destination: regexCity },
              { origin: regexCity }
            ];
          }
          if (minRating !== undefined) {
            ttQuery.rating = { $gte: minRating };
          }
          if (minPrice !== undefined || maxPrice !== undefined) {
            ttQuery.pricePerVehicle = {};
            if (minPrice !== undefined) ttQuery.pricePerVehicle.$gte = minPrice;
            if (maxPrice !== undefined) ttQuery.pricePerVehicle.$lte = maxPrice;
          }

          const docs = await (TravelTransferModel as any).find(ttQuery).lean().maxTimeMS(5000).catch(() => []);
          return docs.map(normalizeTravelTransfer);
        })());
      }

      const categoryArrays = await Promise.all(resultsPromises);
      let allItems: CatalogItem[] = categoryArrays.flat();

      if (allItems.length === 0) {
        allItems = FALLBACK_ITEMS.filter((item) => {
          if (rawCategory && rawCategory !== 'ALL' && item.category !== rawCategory && !rawCategory.includes(item.category)) {
            return false;
          }
          if (q) {
            const lowerQ = q.toLowerCase();
            const genreStr = item.metadata?.genre ? JSON.stringify(item.metadata.genre).toLowerCase() : '';
            const matches = item.title.toLowerCase().includes(lowerQ) ||
              item.description.toLowerCase().includes(lowerQ) ||
              item.category.toLowerCase().includes(lowerQ) ||
              genreStr.includes(lowerQ) ||
              (item.city && item.city.toLowerCase().includes(lowerQ)) ||
              (item.location && item.location.toLowerCase().includes(lowerQ));
            if (!matches) return false;
          }
          if (city) {
            if (item.city && item.city.toLowerCase() !== city.toLowerCase()) return false;
          }
          if (minRating !== undefined && item.rating && item.rating < minRating) return false;
          if (minPrice !== undefined && item.priceFrom && item.priceFrom < minPrice) return false;
          if (maxPrice !== undefined && item.priceFrom && item.priceFrom > maxPrice) return false;
          return true;
        });
      }

      // Sorting
      if (sort === 'price_low') {
        allItems.sort((a, b) => (a.priceFrom || 0) - (b.priceFrom || 0));
      } else if (sort === 'price_high') {
        allItems.sort((a, b) => (b.priceFrom || 0) - (a.priceFrom || 0));
      } else if (sort === 'rating') {
        allItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sort === 'newest') {
        allItems.sort((a, b) => {
          const dateA = a.metadata?.date || a.metadata?.releaseDate || '';
          const dateB = b.metadata?.date || b.metadata?.releaseDate || '';
          return dateB.localeCompare(dateA);
        });
      } else {
        // Default sort: 'relevance'
        if (q) {
          const lowerQ = q.toLowerCase();
          allItems.sort((a, b) => {
            const titleA = a.title.toLowerCase();
            const titleB = b.title.toLowerCase();
            const exactA = titleA === lowerQ;
            const exactB = titleB === lowerQ;
            if (exactA && !exactB) return -1;
            if (!exactA && exactB) return 1;

            const startsA = titleA.startsWith(lowerQ);
            const startsB = titleB.startsWith(lowerQ);
            if (startsA && !startsB) return -1;
            if (!startsA && startsB) return 1;

            const containsA = titleA.includes(lowerQ);
            const containsB = titleB.includes(lowerQ);
            if (containsA && !containsB) return -1;
            if (!containsA && containsB) return 1;

            return (b.rating || 0) - (a.rating || 0);
          });
        } else {
          allItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
      }

      // Pagination
      const total = allItems.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedResults = allItems.slice(startIndex, startIndex + limit);

      return res.json({
        success: true,
        data: {
          results: paginatedResults,
          pagination: {
            page,
            limit,
            total,
            totalPages
          }
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Unable to search right now. Please try again.',
        error: {
          code: 'SEARCH_ERROR',
          details: error?.message || 'Database search execution failed'
        }
      });
    }
  }
}

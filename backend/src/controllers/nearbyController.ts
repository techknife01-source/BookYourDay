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
import { TravelPackageModel } from '../models/TravelPackage.js';
import { TravelTransferModel } from '../models/TravelTransfer.js';
import { VenueModel } from '../models/Venue.js';
import { ShowModel } from '../models/Show.js';
import { CatalogItem } from './catalogController.js';

export function calculateDistanceKm(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null
): number | null {
  if (
    lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined ||
    lat1 === null || lon1 === null || lat2 === null || lon2 === null ||
    isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)
  ) {
    return null;
  }
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class NearbyController {
  static async getNearby(req: Request, res: Response) {
    try {
      if (mongoose.connection.readyState !== 1) {
        await connectDB();
      }

      // Parse parameters
      const latParam = req.query.lat ?? req.query.latitude;
      const lngParam = req.query.lng ?? req.query.longitude;
      const userLat = latParam !== undefined && latParam !== '' ? parseFloat(String(latParam)) : undefined;
      const userLng = lngParam !== undefined && lngParam !== '' ? parseFloat(String(lngParam)) : undefined;

      const hasCoords =
        userLat !== undefined &&
        userLng !== undefined &&
        !isNaN(userLat) &&
        !isNaN(userLng) &&
        userLat >= -90 &&
        userLat <= 90 &&
        userLng >= -180 &&
        userLng <= 180;

      const radiusKm = Math.max(0.1, Math.min(500, req.query.radius ? parseFloat(String(req.query.radius)) || 10 : 10));
      const q = req.query.q ? String(req.query.q).trim() : '';
      const city = req.query.city ? String(req.query.city).trim() : '';
      const rawCategory = req.query.category ? String(req.query.category).trim().toUpperCase() : 'ALL';
      const minPrice = req.query.minPrice !== undefined && req.query.minPrice !== '' ? Number(req.query.minPrice) : undefined;
      const maxPrice = req.query.maxPrice !== undefined && req.query.maxPrice !== '' ? Number(req.query.maxPrice) : undefined;
      const minRating = req.query.minRating !== undefined && req.query.minRating !== '' ? Number(req.query.minRating) : undefined;
      const availabilityFilter = req.query.availability ? String(req.query.availability).toUpperCase() : 'ALL';
      const sort = req.query.sort ? String(req.query.sort).trim().toLowerCase() : 'distance';
      const page = Math.max(1, req.query.page ? parseInt(String(req.query.page), 10) || 1 : 1);
      const limit = Math.max(1, Math.min(100, req.query.limit ? parseInt(String(req.query.limit), 10) || 12 : 12));

      // Category switches
      const queryMovies = rawCategory === 'ALL' || rawCategory === 'MOVIE' || rawCategory === 'MOVIES';
      const queryEvents = rawCategory === 'ALL' || rawCategory === 'EVENT' || rawCategory === 'EVENTS';
      const querySports = rawCategory === 'ALL' || rawCategory === 'SPORTS' || rawCategory === 'SPORT';
      const queryAttractions = rawCategory === 'ALL' || rawCategory === 'ATTRACTION' || rawCategory === 'ATTRACTIONS' || rawCategory === 'PARKS';
      const queryExperiences = rawCategory === 'ALL' || rawCategory === 'EXPERIENCE' || rawCategory === 'EXPERIENCES' || rawCategory === 'PLAY';
      const queryRestaurants = rawCategory === 'ALL' || rawCategory === 'RESTAURANT' || rawCategory === 'RESTAURANTS' || rawCategory === 'DINING';
      const queryHotels = rawCategory === 'ALL' || rawCategory === 'HOTEL' || rawCategory === 'HOTELS' || rawCategory === 'STAYS';
      const queryTravel = rawCategory === 'ALL' || rawCategory === 'TRAVEL' || rawCategory === 'PACKAGES' || rawCategory === 'TRAVEL_PACKAGES';
      const queryTransfers = rawCategory === 'ALL' || rawCategory === 'TRANSFER' || rawCategory === 'TRANSFERS';

      const regexQ = q ? new RegExp(escapeRegex(q), 'i') : null;
      const regexCity = city ? new RegExp(escapeRegex(city), 'i') : null;

      // Base published filter for partner models
      const publishedFilter = { $or: [{ partnerId: { $exists: false } }, { partnerId: null }, { status: 'PUBLISHED' }] };

      const resultsPromises: Promise<CatalogItem[]>[] = [];

      // 1. MOVIES NEARBY (via Venues)
      if (queryMovies) {
        resultsPromises.push((async () => {
          try {
            // Find venues matching geo or city
            const venueQuery: any = {};
            if (regexCity) venueQuery.city = regexCity;
            
            const venues = await VenueModel.find(venueQuery).lean().catch(() => []);
            if (venues.length === 0) return [];

            const venueMap = new Map<string, any>();
            venues.forEach((v) => venueMap.set(v._id.toString(), v));

            const shows = await ShowModel.find({ venueId: { $in: Array.from(venueMap.keys()) } }).lean().catch(() => []);
            if (shows.length === 0) return [];

            const movieIds = Array.from(new Set(shows.map((s) => s.movieId.toString())));
            const movieQuery: any = { _id: { $in: movieIds } };
            if (regexQ) {
              movieQuery.$or = [{ title: regexQ }, { description: regexQ }, { genre: regexQ }, { director: regexQ }];
            }

            const movies = await MovieModel.find(movieQuery).lean().catch(() => []);

            const movieResults: CatalogItem[] = [];
            for (const m of movies) {
              const mShows = shows.filter((s) => s.movieId.toString() === m._id.toString());
              let nearestVenue: any = null;
              let minVenueDistance: number | null = null;

              for (const show of mShows) {
                const venue = venueMap.get(show.venueId.toString());
                if (!venue) continue;
                const d = hasCoords ? calculateDistanceKm(userLat, userLng, venue.latitude || 23.6880, venue.longitude || 86.9661) : null;
                if (minVenueDistance === null || (d !== null && d < minVenueDistance)) {
                  minVenueDistance = d;
                  nearestVenue = venue;
                }
              }

              const vLat = nearestVenue?.latitude || 23.6880;
              const vLng = nearestVenue?.longitude || 86.9661;
              const dKm = hasCoords ? calculateDistanceKm(userLat, userLng, vLat, vLng) : null;
              const isGeoMatch = dKm !== null && dKm <= radiusKm;

              if (hasCoords && !isGeoMatch && !city) {
                // Skip if strictly outside radius when searching by lat/lng without city override
                continue;
              }

              movieResults.push({
                id: m._id.toString(),
                category: 'MOVIE',
                title: m.title,
                description: m.description,
                image: m.poster,
                backdrop: m.backdrop,
                city: nearestVenue?.city || m.city || 'Asansol',
                location: nearestVenue ? `${nearestVenue.name}, ${nearestVenue.city}` : 'Grand Cineplex',
                rating: m.rating || 4.9,
                reviewCount: m.votesCount || 1000,
                priceFrom: 250,
                currency: 'INR',
                availability: 'AVAILABLE',
                distanceKm: dKm,
                latitude: vLat,
                longitude: vLng,
                matchType: isGeoMatch ? 'GEO_MATCH' : 'CITY_MATCH',
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
              });
            }
            return movieResults;
          } catch {
            return [];
          }
        })());
      }

      // 2. EVENTS NEARBY
      if (queryEvents) {
        resultsPromises.push((async () => {
          const filter: any = { ...publishedFilter };
          if (regexQ) {
            filter.$or = [{ title: regexQ }, { description: regexQ }, { category: regexQ }, { venue: regexQ }];
          }
          if (regexCity) filter.city = regexCity;
          if (minRating !== undefined) filter.rating = { $gte: minRating };
          if (minPrice !== undefined || maxPrice !== undefined) {
            filter.startingPrice = {};
            if (minPrice !== undefined) filter.startingPrice.$gte = minPrice;
            if (maxPrice !== undefined) filter.startingPrice.$lte = maxPrice;
          }

          const docs = await EventModel.find(filter).lean().catch(() => []);
          const items: CatalogItem[] = [];

          for (const e of docs) {
            const eLat = e.latitude || 23.6900;
            const eLng = e.longitude || 86.9650;
            const dKm = hasCoords ? calculateDistanceKm(userLat, userLng, eLat, eLng) : null;
            const isGeoMatch = dKm !== null && dKm <= radiusKm;

            if (hasCoords && !isGeoMatch && !city) continue;

            items.push({
              id: e._id.toString(),
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
              distanceKm: dKm,
              latitude: eLat,
              longitude: eLng,
              matchType: isGeoMatch ? 'GEO_MATCH' : 'CITY_MATCH',
              metadata: {
                eventCategory: e.category,
                date: e.date,
                time: e.time,
                organizer: e.organizer,
                ticketTiers: e.ticketTiers,
                isTrending: e.isTrending
              }
            });
          }
          return items;
        })());
      }

      // 3. SPORTS NEARBY
      if (querySports) {
        resultsPromises.push((async () => {
          const filter: any = { ...publishedFilter };
          if (regexQ) {
            filter.$or = [{ title: regexQ }, { description: regexQ }, { sportType: regexQ }, { venue: regexQ }];
          }
          if (regexCity) filter.city = regexCity;
          if (minRating !== undefined) filter.rating = { $gte: minRating };
          if (minPrice !== undefined || maxPrice !== undefined) {
            filter.startingPrice = {};
            if (minPrice !== undefined) filter.startingPrice.$gte = minPrice;
            if (maxPrice !== undefined) filter.startingPrice.$lte = maxPrice;
          }

          const docs = await SportsEventModel.find(filter).lean().catch(() => []);
          const items: CatalogItem[] = [];

          for (const s of docs) {
            const sLat = s.latitude || 22.5646;
            const sLng = s.longitude || 88.3433;
            const dKm = hasCoords ? calculateDistanceKm(userLat, userLng, sLat, sLng) : null;
            const isGeoMatch = dKm !== null && dKm <= radiusKm;

            if (hasCoords && !isGeoMatch && !city) continue;

            items.push({
              id: s._id.toString(),
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
              distanceKm: dKm,
              latitude: sLat,
              longitude: sLng,
              matchType: isGeoMatch ? 'GEO_MATCH' : 'CITY_MATCH',
              metadata: {
                sportType: s.sportType,
                teamsOrPlayers: s.teamsOrPlayers,
                date: s.date,
                time: s.time,
                organizer: s.organizer,
                ticketTiers: s.ticketTiers,
                isTrending: s.isTrending
              }
            });
          }
          return items;
        })());
      }

      // 4. ATTRACTIONS NEARBY
      if (queryAttractions) {
        resultsPromises.push((async () => {
          const filter: any = { ...publishedFilter };
          if (regexQ) {
            filter.$or = [{ title: regexQ }, { description: regexQ }, { category: regexQ }, { address: regexQ }];
          }
          if (regexCity) filter.city = regexCity;
          if (minRating !== undefined) filter.rating = { $gte: minRating };
          if (minPrice !== undefined || maxPrice !== undefined) {
            filter.entryPrice = {};
            if (minPrice !== undefined) filter.entryPrice.$gte = minPrice;
            if (maxPrice !== undefined) filter.entryPrice.$lte = maxPrice;
          }

          const docs = await AttractionModel.find(filter).lean().catch(() => []);
          const items: CatalogItem[] = [];

          for (const a of docs) {
            const aLat = a.latitude || 23.6950;
            const aLng = a.longitude || 86.9720;
            const dKm = hasCoords ? calculateDistanceKm(userLat, userLng, aLat, aLng) : null;
            const isGeoMatch = dKm !== null && dKm <= radiusKm;

            if (hasCoords && !isGeoMatch && !city) continue;

            items.push({
              id: a._id.toString(),
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
              distanceKm: dKm,
              latitude: aLat,
              longitude: aLng,
              matchType: isGeoMatch ? 'GEO_MATCH' : 'CITY_MATCH',
              metadata: {
                attractionCategory: a.category,
                timings: a.timings,
                inclusions: a.inclusions,
                isTrending: a.isTrending
              }
            });
          }
          return items;
        })());
      }

      // 5. EXPERIENCES NEARBY
      if (queryExperiences) {
        resultsPromises.push((async () => {
          const filter: any = { ...publishedFilter };
          if (regexQ) {
            filter.$or = [{ title: regexQ }, { description: regexQ }, { type: regexQ }];
          }
          if (regexCity) filter.city = regexCity;
          if (minRating !== undefined) filter.rating = { $gte: minRating };
          if (minPrice !== undefined || maxPrice !== undefined) {
            filter.pricePerPerson = {};
            if (minPrice !== undefined) filter.pricePerPerson.$gte = minPrice;
            if (maxPrice !== undefined) filter.pricePerPerson.$lte = maxPrice;
          }

          const docs = await ExperienceModel.find(filter).lean().catch(() => []);
          const items: CatalogItem[] = [];

          for (const x of docs) {
            const xLat = x.latitude || 23.7020;
            const xLng = x.longitude || 86.9600;
            const dKm = hasCoords ? calculateDistanceKm(userLat, userLng, xLat, xLng) : null;
            const isGeoMatch = dKm !== null && dKm <= radiusKm;

            if (hasCoords && !isGeoMatch && !city) continue;

            items.push({
              id: x._id.toString(),
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
              distanceKm: dKm,
              latitude: xLat,
              longitude: xLng,
              matchType: isGeoMatch ? 'GEO_MATCH' : 'CITY_MATCH',
              metadata: {
                type: x.type,
                duration: x.duration,
                highlights: x.highlights,
                isPopular: x.isPopular
              }
            });
          }
          return items;
        })());
      }

      // 6. RESTAURANTS NEARBY (DINING)
      if (queryRestaurants) {
        resultsPromises.push((async () => {
          const filter: any = { ...publishedFilter };
          if (regexQ) {
            filter.$or = [{ name: regexQ }, { locality: regexQ }, { cuisine: regexQ }];
          }
          if (regexCity) filter.city = regexCity;
          if (minRating !== undefined) filter.rating = { $gte: minRating };
          if (minPrice !== undefined || maxPrice !== undefined) {
            filter.costForTwo = {};
            if (minPrice !== undefined) filter.costForTwo.$gte = minPrice;
            if (maxPrice !== undefined) filter.costForTwo.$lte = maxPrice;
          }

          const docs = await RestaurantModel.find(filter).lean().catch(() => []);
          const items: CatalogItem[] = [];

          for (const r of docs) {
            const rLat = r.latitude || 23.6820;
            const rLng = r.longitude || 86.9580;
            const dKm = hasCoords ? calculateDistanceKm(userLat, userLng, rLat, rLng) : null;
            const isGeoMatch = dKm !== null && dKm <= radiusKm;

            if (hasCoords && !isGeoMatch && !city) continue;

            items.push({
              id: r._id.toString(),
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
              distanceKm: dKm,
              latitude: rLat,
              longitude: rLng,
              matchType: isGeoMatch ? 'GEO_MATCH' : 'CITY_MATCH',
              metadata: {
                cuisine: r.cuisine,
                locality: r.locality,
                discountOffer: r.discountOffer,
                costForTwo: r.costForTwo,
                isBookable: r.isBookable
              }
            });
          }
          return items;
        })());
      }

      // 7. HOTELS NEARBY
      if (queryHotels) {
        resultsPromises.push((async () => {
          const filter: any = { status: 'PUBLISHED' };
          if (regexQ) {
            filter.$or = [{ name: regexQ }, { description: regexQ }, { address: regexQ }];
          }
          if (regexCity) filter.city = regexCity;
          if (minRating !== undefined) filter.rating = { $gte: minRating };

          const docs = await HotelModel.find(filter).lean().catch(() => []);
          const items: CatalogItem[] = [];

          for (const h of docs) {
            const hLat = h.latitude || 23.6889;
            const hLng = h.longitude || 86.9661;
            const dKm = hasCoords ? calculateDistanceKm(userLat, userLng, hLat, hLng) : null;
            const isGeoMatch = dKm !== null && dKm <= radiusKm;

            if (hasCoords && !isGeoMatch && !city) continue;

            const basePrice = 2200;
            if (minPrice !== undefined && basePrice < minPrice) continue;
            if (maxPrice !== undefined && basePrice > maxPrice) continue;

            items.push({
              id: h._id.toString(),
              category: 'HOTEL',
              title: h.name,
              description: h.description,
              image: h.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
              location: h.address,
              city: h.city,
              rating: h.rating || 4.8,
              reviewCount: h.reviewCount || 120,
              priceFrom: basePrice,
              currency: 'INR',
              availability: 'AVAILABLE',
              distanceKm: dKm,
              latitude: hLat,
              longitude: hLng,
              matchType: isGeoMatch ? 'GEO_MATCH' : 'CITY_MATCH',
              metadata: {
                amenities: h.amenities,
                cancellationPolicy: h.cancellationPolicy,
                checkInTime: h.checkInTime,
                checkOutTime: h.checkOutTime
              }
            });
          }
          return items;
        })());
      }

      // 8. TRAVEL PACKAGES NEARBY
      if (queryTravel) {
        resultsPromises.push((async () => {
          const filter: any = { status: 'PUBLISHED' };
          if (regexQ) {
            filter.$or = [{ title: regexQ }, { description: regexQ }, { origin: regexQ }, { destination: regexQ }];
          }
          if (regexCity) {
            filter.$or = [{ destination: regexCity }, { origin: regexCity }];
          }
          if (minRating !== undefined) filter.rating = { $gte: minRating };
          if (minPrice !== undefined || maxPrice !== undefined) {
            filter.startingPrice = {};
            if (minPrice !== undefined) filter.startingPrice.$gte = minPrice;
            if (maxPrice !== undefined) filter.startingPrice.$lte = maxPrice;
          }

          const docs = await TravelPackageModel.find(filter).lean().catch(() => []);
          const items: CatalogItem[] = [];

          for (const pkg of docs) {
            const pkgLat = (pkg as any).latitude || 27.0410;
            const pkgLng = (pkg as any).longitude || 88.2663;
            const dKm = hasCoords ? calculateDistanceKm(userLat, userLng, pkgLat, pkgLng) : null;
            const isGeoMatch = dKm !== null && dKm <= radiusKm;

            if (hasCoords && !isGeoMatch && !city) continue;

            items.push({
              id: pkg._id.toString(),
              category: 'TRAVEL',
              title: pkg.title,
              description: pkg.description,
              image: pkg.images?.[0] || 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
              city: pkg.destination,
              location: `${pkg.origin} to ${pkg.destination}`,
              rating: pkg.rating || 4.9,
              reviewCount: pkg.reviewCount || 84,
              priceFrom: pkg.startingPrice,
              currency: 'INR',
              availability: pkg.availableCapacity > 0 ? 'AVAILABLE' : 'SOLD_OUT',
              distanceKm: dKm,
              latitude: pkgLat,
              longitude: pkgLng,
              matchType: isGeoMatch ? 'GEO_MATCH' : 'CITY_MATCH',
              metadata: {
                origin: pkg.origin,
                destination: pkg.destination,
                durationDays: pkg.durationDays,
                durationNights: pkg.durationNights,
                inclusions: pkg.inclusions,
                cancellationPolicy: pkg.cancellationPolicy,
                availableCapacity: pkg.availableCapacity
              }
            });
          }
          return items;
        })());
      }

      // 9. TRAVEL TRANSFERS NEARBY
      if (queryTransfers) {
        resultsPromises.push((async () => {
          const filter: any = { status: 'PUBLISHED' };
          if (regexQ) {
            filter.$or = [{ title: regexQ }, { description: regexQ }, { origin: regexQ }, { destination: regexQ }];
          }
          if (regexCity) {
            filter.$or = [{ destination: regexCity }, { origin: regexCity }];
          }
          if (minRating !== undefined) filter.rating = { $gte: minRating };
          if (minPrice !== undefined || maxPrice !== undefined) {
            filter.pricePerVehicle = {};
            if (minPrice !== undefined) filter.pricePerVehicle.$gte = minPrice;
            if (maxPrice !== undefined) filter.pricePerVehicle.$lte = maxPrice;
          }

          const docs = await TravelTransferModel.find(filter).lean().catch(() => []);
          const items: CatalogItem[] = [];

          for (const tr of docs) {
            const trLat = (tr as any).latitude || 23.6880;
            const trLng = (tr as any).longitude || 86.9661;
            const dKm = hasCoords ? calculateDistanceKm(userLat, userLng, trLat, trLng) : null;
            const isGeoMatch = dKm !== null && dKm <= radiusKm;

            if (hasCoords && !isGeoMatch && !city) continue;

            items.push({
              id: tr._id.toString(),
              category: 'TRANSFER',
              title: tr.title,
              description: tr.description,
              image: tr.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80',
              city: tr.destination,
              location: `${tr.origin} → ${tr.destination}`,
              rating: tr.rating || 4.9,
              reviewCount: tr.reviewCount || 112,
              priceFrom: tr.pricePerVehicle,
              currency: 'INR',
              availability: tr.availableCapacity > 0 ? 'AVAILABLE' : 'SOLD_OUT',
              distanceKm: dKm,
              latitude: trLat,
              longitude: trLng,
              matchType: isGeoMatch ? 'GEO_MATCH' : 'CITY_MATCH',
              metadata: {
                origin: tr.origin,
                destination: tr.destination,
                vehicleType: tr.vehicleType,
                capacity: tr.capacity,
                cancellationPolicy: tr.cancellationPolicy,
                availableCapacity: tr.availableCapacity
              }
            });
          }
          return items;
        })());
      }

      const rawArrays = await Promise.all(resultsPromises);
      let allItems = rawArrays.flat();

      if (allItems.length === 0) {
        const fallbackRaw = [
          {
            id: 'm1',
            category: 'MOVIE',
            title: 'Echoes of Tomorrow',
            description: 'When humanity unlocks temporal memory transfer, a rogue agent must navigate quantum timelines.',
            image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
            backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
            location: 'Grand Cineplex Dolby Atmos, Asansol',
            city: 'Asansol',
            rating: 4.9,
            reviewCount: 42800,
            priceFrom: 250,
            currency: 'INR',
            availability: 'AVAILABLE',
            latitude: 23.6880,
            longitude: 86.9661,
            metadata: { genre: ['Sci-Fi', 'Action'], language: ['English', 'Hindi'], isTrending: true }
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
            latitude: 23.6900,
            longitude: 86.9650,
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
            latitude: 22.5646,
            longitude: 88.3433,
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
            latitude: 23.6950,
            longitude: 86.9720,
            metadata: { attractionCategory: 'Waterpark', isTrending: true }
          },
          {
            id: 'x1',
            category: 'EXPERIENCE',
            title: 'River Lakeside Sunset Glamping',
            description: 'Luxury outdoor tent stay with acoustic bonfire music, stargazing, and barbecue dinner.',
            image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80',
            location: 'Asansol Lakeside',
            city: 'Asansol',
            rating: 4.8,
            reviewCount: 1800,
            priceFrom: 1850,
            currency: 'INR',
            availability: 'AVAILABLE',
            latitude: 23.7020,
            longitude: 86.9600,
            metadata: { type: 'Camping', isPopular: true }
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
            latitude: 23.6820,
            longitude: 86.9580,
            metadata: { cuisine: ['North Indian', 'Mughlai'], locality: 'Burnpur Road', costForTwo: 1200, isBookable: true }
          },
          {
            id: 'h1',
            category: 'HOTEL',
            title: 'Grand Heritage Hotel & Spa',
            description: 'Luxury 5-star hotel offering plush suites, infinity pool, multi-cuisine dining, and rejuvenation spa.',
            image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
            location: '101 Heritage Boulevard',
            city: 'Asansol',
            rating: 4.8,
            reviewCount: 240,
            priceFrom: 3500,
            currency: 'INR',
            availability: 'AVAILABLE',
            latitude: 23.6889,
            longitude: 86.9661,
            metadata: { amenities: ['WiFi', 'Swimming Pool', 'Spa'] }
          },
          {
            id: 'pkg1',
            category: 'TRAVEL',
            title: 'Darjeeling & Gangtok Himalayan Escape',
            description: 'Breathtaking 5-day mountain journey through Darjeeling tea gardens and Gangtok alpine lakes.',
            image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
            location: 'Asansol to Darjeeling',
            city: 'Darjeeling',
            rating: 4.9,
            reviewCount: 84,
            priceFrom: 12500,
            currency: 'INR',
            availability: 'AVAILABLE',
            latitude: 27.0410,
            longitude: 88.2663,
            metadata: { origin: 'Asansol', destination: 'Darjeeling', durationDays: 5 }
          },
          {
            id: 'tr1',
            category: 'TRANSFER',
            title: 'Airport Express Sedan Transfer',
            description: 'Door-to-door comfortable sedan transfer between Asansol city and Durgapur/Kolkata airport.',
            image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80',
            location: 'Asansol City Center → Kolkata Airport',
            city: 'Asansol',
            rating: 4.9,
            reviewCount: 112,
            priceFrom: 3800,
            currency: 'INR',
            availability: 'AVAILABLE',
            latitude: 23.6880,
            longitude: 86.9661,
            metadata: { origin: 'Asansol City Center', destination: 'Kolkata Airport (CCU)', vehicleType: 'Executive Sedan' }
          }
        ];

        for (const item of fallbackRaw) {
          // Category check
          if (rawCategory !== 'ALL' && item.category !== rawCategory && !rawCategory.includes(item.category)) {
            continue;
          }
          // Search term check
          if (q) {
            const lowQ = q.toLowerCase();
            const textMatch = item.title.toLowerCase().includes(lowQ) ||
                              item.description.toLowerCase().includes(lowQ) ||
                              item.category.toLowerCase().includes(lowQ) ||
                              (item.location && item.location.toLowerCase().includes(lowQ));
            if (!textMatch) continue;
          }
          // City check
          if (city) {
            const lowCity = city.toLowerCase();
            const cityMatch = item.city.toLowerCase().includes(lowCity) || (item.location && item.location.toLowerCase().includes(lowCity));
            if (!cityMatch) continue;
          }
          // Rating check
          if (minRating !== undefined && item.rating < minRating) continue;
          // Price check
          if (minPrice !== undefined && item.priceFrom < minPrice) continue;
          if (maxPrice !== undefined && item.priceFrom > maxPrice) continue;

          // Geo Distance calculation
          const dKm = hasCoords ? calculateDistanceKm(userLat, userLng, item.latitude, item.longitude) : null;
          const isGeoMatch = dKm !== null && dKm <= radiusKm;

          if (hasCoords && !isGeoMatch && !city) continue;

          allItems.push({
            ...item,
            distanceKm: dKm,
            matchType: isGeoMatch ? 'GEO_MATCH' : 'CITY_MATCH'
          });
        }
      }

      // Availability filter check
      if (availabilityFilter === 'AVAILABLE' || availabilityFilter === 'AVAILABLE_ONLY') {
        allItems = allItems.filter((i) => i.availability === 'AVAILABLE' || i.availability === 'LIMITED');
      }

      // Sorting
      if (sort === 'distance') {
        allItems.sort((a, b) => {
          if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
          if (a.distanceKm !== null) return -1;
          if (b.distanceKm !== null) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
      } else if (sort === 'price_low') {
        allItems.sort((a, b) => (a.priceFrom || 0) - (b.priceFrom || 0));
      } else if (sort === 'price_high') {
        allItems.sort((a, b) => (b.priceFrom || 0) - (a.priceFrom || 0));
      } else if (sort === 'rating') {
        allItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else {
        // 'relevance'
        allItems.sort((a, b) => {
          if (a.matchType === 'GEO_MATCH' && b.matchType !== 'GEO_MATCH') return -1;
          if (a.matchType !== 'GEO_MATCH' && b.matchType === 'GEO_MATCH') return 1;
          if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
          return (b.rating || 0) - (a.rating || 0);
        });
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
          },
          searchParams: {
            lat: userLat ?? null,
            lng: userLng ?? null,
            radiusKm,
            city: city || null,
            category: rawCategory,
            hasCoords
          }
        }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Failed to perform nearby discovery.',
        error: {
          code: 'NEARBY_DISCOVERY_ERROR',
          details: error?.message || 'Database search failed'
        }
      });
    }
  }
}

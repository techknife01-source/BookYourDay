import { MovieModel } from '../models/Movie.js';
import { EventModel } from '../models/Event.js';
import { SportsEventModel } from '../models/SportsEvent.js';
import { AttractionModel } from '../models/Attraction.js';
import { ExperienceModel } from '../models/Experience.js';
import { RestaurantModel } from '../models/Restaurant.js';
import { HotelModel } from '../models/Hotel.js';
import { TravelPackageModel } from '../models/TravelPackage.js';
import { TravelTransferModel } from '../models/TravelTransfer.js';
import { CandidateItem, MarketplaceCategory, PlannerRequest } from '../types/plannerTypes.js';

export class CandidateRetrievalService {
  /**
   * Bounded Candidate Retrieval:
   * Fetch candidate inventory for the planner request from published records in DB.
   * Limits maximum total candidates to maxCandidates (default 40) to prevent sending huge payloads to AI.
   * Only returns public marketplace fields.
   */
  static async getCandidates(request: PlannerRequest, maxCandidates = 40): Promise<CandidateItem[]> {
    const { city, latitude, longitude, budget, categories } = request;
    const candidates: CandidateItem[] = [];

    // Category mapping helpers
    const requestedCategories = new Set(categories || ['RESTAURANT', 'ATTRACTION', 'EXPERIENCE', 'EVENT', 'MOVIE', 'SPORTS']);

    // Helper to query each model
    const fetchCategoryDocs = async (model: any, category: MarketplaceCategory, defaultPrice = 500) => {
      if (!requestedCategories.has(category)) return;

      try {
        const query: any = { isPublished: { $ne: false } };
        
        // Search by city regex if available
        if (city) {
          query.$or = [
            { city: new RegExp(city, 'i') },
            { location: new RegExp(city, 'i') },
            { address: new RegExp(city, 'i') }
          ];
        }

        let docs = await model.find(query).limit(10).lean();

        // If no items returned for specific city, grab published items generally as city candidates
        if (docs.length === 0) {
          docs = await model.find({ isPublished: { $ne: false } }).limit(5).lean();
        }

        for (const doc of docs as any[]) {
          const invId = doc._id ? doc._id.toString() : (doc.id || `inv-${category.toLowerCase()}-${Math.random().toString(36).substr(2, 6)}`);
          const itemPrice = typeof doc.priceFrom === 'number' ? doc.priceFrom : 
                            (typeof doc.price === 'number' ? doc.price : 
                            (doc.ticketPrice || defaultPrice));

          // Filter out candidates that severely exceed budget individually unless budget is 0
          if (budget > 0 && itemPrice > budget * 1.5) {
            continue;
          }

          let itemLat = doc.latitude;
          let itemLng = doc.longitude;
          if (doc.locationGeo?.coordinates) {
            itemLng = doc.locationGeo.coordinates[0];
            itemLat = doc.locationGeo.coordinates[1];
          }

          candidates.push({
            inventoryId: invId,
            category,
            title: doc.title || doc.name || `${category} Item`,
            description: (doc.description || doc.tagline || '').slice(0, 160),
            city: doc.city || city || 'Kolkata',
            location: doc.location || doc.address || doc.city || 'Central Location',
            latitude: typeof itemLat === 'number' ? itemLat : (latitude || 22.5726),
            longitude: typeof itemLng === 'number' ? itemLng : (longitude || 88.3639),
            priceFrom: itemPrice,
            currency: doc.currency || 'INR',
            rating: doc.rating || 4.5,
            reviewCount: doc.reviewCount || 100,
            availability: doc.availability === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'AVAILABLE',
            image: doc.image || doc.poster || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
            metadata: {
              genre: doc.genre,
              cuisine: doc.cuisine,
              eventCategory: doc.eventCategory || doc.type,
              sportType: doc.sportType,
              showtimes: doc.showtimes
            }
          });
        }
      } catch (err: any) {
        console.warn(`[CandidateRetrievalService] Error fetching ${category} candidates:`, err?.message);
      }
    };

    // Execute fetches in parallel across requested categories
    await Promise.all([
      fetchCategoryDocs(MovieModel, 'MOVIE', 250),
      fetchCategoryDocs(EventModel, 'EVENT', 800),
      fetchCategoryDocs(SportsEventModel, 'SPORTS', 1000),
      fetchCategoryDocs(AttractionModel, 'ATTRACTION', 350),
      fetchCategoryDocs(ExperienceModel, 'EXPERIENCE', 750),
      fetchCategoryDocs(RestaurantModel, 'RESTAURANT', 600),
      fetchCategoryDocs(HotelModel, 'HOTEL', 2500),
      fetchCategoryDocs(TravelPackageModel, 'TRAVEL', 5000),
      fetchCategoryDocs(TravelTransferModel, 'TRANSFER', 1500)
    ]);

    // If candidate set is empty, inject curated default marketplace items
    if (candidates.length === 0) {
      candidates.push(...this.getCuratedFallbackCandidates(city || 'Kolkata'));
    }

    return candidates.slice(0, maxCandidates);
  }

  /**
   * Curated default fallback candidates for when DB collections are sparse or offline
   */
  public static getCuratedFallbackCandidates(city: string): CandidateItem[] {
    const isKolkata = city.toLowerCase().includes('kolkata');
    return [
      {
        inventoryId: 'res-101',
        category: 'RESTAURANT',
        title: isKolkata ? 'Flurys Heritage Bakery & Breakfast' : 'Spice Garden Fine Dining',
        description: isKolkata ? 'Iconic Park Street English breakfast, fresh pastries, and legendary Darjeeling tea.' : 'Artisanal multi-cuisine breakfast and coffee.',
        city: city,
        location: isKolkata ? 'Park Street, Kolkata' : 'City Center',
        latitude: isKolkata ? 22.5532 : 23.6880,
        longitude: isKolkata ? 88.3531 : 86.9661,
        priceFrom: 600,
        currency: 'INR',
        rating: 4.8,
        availability: 'AVAILABLE',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
        metadata: { cuisine: ['Breakfast', 'Continental'] }
      },
      {
        inventoryId: 'att-101',
        category: 'ATTRACTION',
        title: isKolkata ? 'Victoria Memorial & Botanical Gardens' : 'Wonderland Theme Park',
        description: isKolkata ? 'Stunning marble palace monument with royal art galleries and lush gardens.' : 'Interactive rides, gardens, and heritage museum.',
        city: city,
        location: isKolkata ? 'Queens Way, Kolkata' : 'Bypass Road',
        latitude: isKolkata ? 22.5448 : 23.6950,
        longitude: isKolkata ? 88.3426 : 86.9720,
        priceFrom: 350,
        currency: 'INR',
        rating: 4.9,
        availability: 'AVAILABLE',
        image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=600&auto=format&fit=crop&q=80',
        metadata: { attractionCategory: 'Monument' }
      },
      {
        inventoryId: 'res-102',
        category: 'RESTAURANT',
        title: isKolkata ? 'Mocambo Heritage Dining' : 'Royal Feast Fine Dining',
        description: isKolkata ? 'Legendary Sizzlers, Devilled Crab, and Continental delicacies since 1956.' : 'Authentic North Indian and Mughlai feast.',
        city: city,
        location: isKolkata ? 'Park Street, Kolkata' : 'Burnpur Road',
        latitude: isKolkata ? 22.5539 : 23.6820,
        longitude: isKolkata ? 88.3524 : 86.9580,
        priceFrom: 700,
        currency: 'INR',
        rating: 4.7,
        availability: 'AVAILABLE',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        metadata: { cuisine: ['Continental', 'North Indian'] }
      },
      {
        inventoryId: 'exp-101',
        category: 'EXPERIENCE',
        title: isKolkata ? 'Hooghly River Sunset Heritage Cruise' : 'Lakeside Sunset Glamping & Bonfire',
        description: isKolkata ? 'Scenic 2-hour sunset cruise on Hooghly river with live Baul music and snacks.' : 'Outdoor camping, acoustic music, and barbecue dinner.',
        city: city,
        location: isKolkata ? 'Princep Ghat, Kolkata' : 'Lakeside Park',
        latitude: isKolkata ? 22.5562 : 23.7020,
        longitude: isKolkata ? 88.3370 : 86.9600,
        priceFrom: 800,
        currency: 'INR',
        rating: 4.8,
        availability: 'AVAILABLE',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80',
        metadata: { type: 'River Cruise' }
      },
      {
        inventoryId: 'evt-101',
        category: 'EVENT',
        title: isKolkata ? 'Kolkata Indie Music Festival Live' : 'Summer Indie Nights Live',
        description: isKolkata ? 'Open-air acoustic fusion concert featuring top indie bands.' : 'Outdoor live band festival and street food.',
        city: city,
        location: isKolkata ? 'Science City Grounds, Kolkata' : 'Open Amphitheatre',
        latitude: isKolkata ? 22.5398 : 23.6900,
        longitude: isKolkata ? 88.3952 : 86.9650,
        priceFrom: 450,
        currency: 'INR',
        rating: 4.9,
        availability: 'AVAILABLE',
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
        metadata: { eventCategory: 'Concert' }
      },
      {
        inventoryId: 'mov-101',
        category: 'MOVIE',
        title: 'Echoes of Tomorrow (IMAX 3D)',
        description: 'Blockbuster sci-fi action epic in Dolby Atmos IMAX.',
        city: city,
        location: isKolkata ? 'Quest Mall INOX IMAX, Kolkata' : 'Grand Cineplex',
        latitude: isKolkata ? 22.5385 : 23.6880,
        longitude: isKolkata ? 88.3645 : 86.9661,
        priceFrom: 350,
        currency: 'INR',
        rating: 4.9,
        availability: 'AVAILABLE',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
        metadata: { genre: ['Sci-Fi', 'Action'] }
      }
    ];
  }
}

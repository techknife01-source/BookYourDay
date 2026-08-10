import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { UserModel } from '../models/User.js';
import { VenueModel } from '../models/Venue.js';
import { MovieModel } from '../models/Movie.js';
import { ScreenModel } from '../models/Screen.js';
import { SeatModel } from '../models/Seat.js';
import { ShowModel } from '../models/Show.js';
import { EventModel } from '../models/Event.js';
import { SportsEventModel } from '../models/SportsEvent.js';
import { AttractionModel } from '../models/Attraction.js';
import { ExperienceModel } from '../models/Experience.js';
import { RestaurantModel } from '../models/Restaurant.js';
import { OfferModel } from '../models/Offer.js';
import { CouponModel } from '../models/Coupon.js';

export async function runSeed() {
  console.log('🌱 [Seed] Initializing seed script for Book Your Day database...');

  const connected = await connectDatabase();
  if (!connected && mongoose.connection.readyState !== 1) {
    console.warn('⚠️ [Seed] Database not connected. Please set a valid MONGODB_URI in backend/.env to persist seed data to MongoDB Atlas.');
    process.exit(0);
  }

  try {
    // 1. Clear existing collections for a clean seed
    console.log('🧹 [Seed] Clearing existing collections...');
    await Promise.all([
      UserModel.deleteMany({}),
      VenueModel.deleteMany({}),
      MovieModel.deleteMany({}),
      ScreenModel.deleteMany({}),
      SeatModel.deleteMany({}),
      ShowModel.deleteMany({}),
      EventModel.deleteMany({}),
      SportsEventModel.deleteMany({}),
      AttractionModel.deleteMany({}),
      ExperienceModel.deleteMany({}),
      RestaurantModel.deleteMany({}),
      OfferModel.deleteMany({}),
      CouponModel.deleteMany({}),
    ]);

    // 2. Seed Users
    console.log('👤 [Seed] Seeding Users...');
    const users = await UserModel.create([
      {
        name: 'Alex Mercer',
        email: 'alex.mercer@example.com',
        phone: '+1 (555) 234-5678',
        role: 'user',
        walletBalance: 450,
        isMemberPlus: true,
        savedCity: 'Asansol'
      },
      {
        name: 'Grand Cineplex Partner',
        email: 'partner@bookyourday.com',
        phone: '+91 9832100000',
        role: 'partner',
        walletBalance: 12500,
        isMemberPlus: false,
        savedCity: 'Asansol'
      },
      {
        name: 'System Admin',
        email: 'admin@bookyourday.com',
        phone: '+91 9000000000',
        role: 'admin',
        walletBalance: 0,
        isMemberPlus: true,
        savedCity: 'Mumbai'
      }
    ]);

    // 3. Seed Venues
    console.log('🏛️ [Seed] Seeding Venues...');
    const venue1 = await VenueModel.create({
      name: 'Grand Cineplex Dolby Atmos',
      address: 'GT Road, Galaxy Mall, 3rd Floor',
      city: 'Asansol',
      state: 'West Bengal',
      facilities: ['Dolby Atmos 7.1', 'Recliner Seats', 'Gourmet Food Court', 'Valet Parking'],
      totalScreens: 4
    });

    const venue2 = await VenueModel.create({
      name: 'PVR INOX City Square',
      address: 'Station Road Plaza',
      city: 'Asansol',
      state: 'West Bengal',
      facilities: ['IMAX 3D', '4DX', 'Gold Class Lounge'],
      totalScreens: 3
    });

    // 4. Seed Movies
    console.log('🎬 [Seed] Seeding Movies...');
    const movie1 = await MovieModel.create({
      title: 'Echoes of Tomorrow',
      poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
      backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      rating: 4.9,
      votesCount: 42800,
      genre: ['Sci-Fi', 'Action', 'Thriller'],
      language: ['English', 'Hindi', 'Tamil'],
      duration: '2h 45m',
      releaseDate: '10 Aug 2026',
      format: ['2D', '3D', 'IMAX 3D', '4DX'],
      description: 'When humanity unlocks temporal memory transfer, a rogue agent must navigate quantum timelines to prevent the unraveling of reality.',
      director: 'Christopher Nolan',
      cast: [
        { name: 'Cillian Murphy', role: 'Dr. Ethan Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
        { name: 'Florence Pugh', role: 'Captain Nora Lin', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' }
      ],
      isTrending: true
    });

    const movie2 = await MovieModel.create({
      title: 'Midnight Run: Eclipse',
      poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
      backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80',
      rating: 4.7,
      votesCount: 28400,
      genre: ['Action', 'Crime', 'Mystery'],
      language: ['English', 'Hindi'],
      duration: '2h 15m',
      releaseDate: '02 Aug 2026',
      format: ['2D', 'IMAX 2D', '4DX'],
      description: 'A high-octane heist thriller taking place during a city-wide power outage.',
      director: 'Denis Villeneuve',
      cast: [
        { name: 'Oscar Isaac', role: 'Leo Delgado', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' }
      ],
      isTrending: true
    });

    // 5. Seed Screens & Seats
    console.log('🖥️ [Seed] Seeding Screens & Seats...');
    const screen1 = await ScreenModel.create({
      venueId: venue1._id,
      name: 'Auditorium 1 - Dolby Atmos',
      format: ['2D', '3D', 'Dolby Atmos'],
      totalSeats: 24,
      seatLayoutRows: [
        { rowLabel: 'A', seatsCount: 8, category: 'RECLINER', price: 480 },
        { rowLabel: 'B', seatsCount: 8, category: 'VIP', price: 320 },
        { rowLabel: 'C', seatsCount: 8, category: 'EXECUTIVE', price: 240 }
      ]
    });

    // Create seat records for screen1
    const seatDocs = [];
    ['A', 'B', 'C'].forEach((rowLabel) => {
      for (let i = 1; i <= 8; i++) {
        seatDocs.push({
          screenId: screen1._id,
          seatNumber: `${rowLabel}${i}`,
          rowLabel,
          columnIndex: i,
          category: rowLabel === 'A' ? 'RECLINER' : rowLabel === 'B' ? 'VIP' : 'EXECUTIVE'
        });
      }
    });
    await SeatModel.insertMany(seatDocs);

    // 6. Seed Shows
    console.log('🍿 [Seed] Seeding Shows...');
    await ShowModel.create([
      {
        movieId: movie1._id,
        venueId: venue1._id,
        screenId: screen1._id,
        date: '2026-08-12',
        startTime: '17:15',
        endTime: '20:00',
        language: 'English',
        format: 'IMAX 3D',
        priceCategories: [
          { category: 'RECLINER', price: 480 },
          { category: 'VIP', price: 320 },
          { category: 'EXECUTIVE', price: 240 }
        ],
        bookedSeats: ['A3', 'A4']
      },
      {
        movieId: movie1._id,
        venueId: venue1._id,
        screenId: screen1._id,
        date: '2026-08-12',
        startTime: '20:30',
        endTime: '23:15',
        language: 'Hindi',
        format: 'Dolby Atmos',
        priceCategories: [
          { category: 'RECLINER', price: 450 },
          { category: 'VIP', price: 300 }
        ],
        bookedSeats: []
      }
    ]);

    // 7. Seed Events & SportsEvents
    console.log('🎤 [Seed] Seeding Events & Sports...');
    await EventModel.create({
      title: 'Summer Indie Nights Live',
      category: 'Concert',
      image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
      backdrop: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
      date: 'SAT, 24 AUG 2026',
      time: '07:00 PM',
      venue: 'Brooklyn Open Amphitheatre',
      city: 'Asansol',
      startingPrice: 899,
      rating: 4.9,
      organizer: 'Sonic Pulse Live',
      description: 'An electrifying outdoor indie music festival featuring live bands and food stalls.',
      ticketTiers: [
        { id: 't1', name: 'General Access', price: 899, description: 'Standard lawn access', availableQuantity: 150 },
        { id: 't2', name: 'VIP Deck Pass', price: 3499, description: 'Elevated view + 2 complimentary drinks', availableQuantity: 20 }
      ],
      isTrending: true
    });

    await SportsEventModel.create({
      title: 'Asia T20 Super Cup Final',
      sportType: 'Cricket',
      teamsOrPlayers: ['India', 'Australia'],
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
      date: 'SUN, 30 AUG 2026',
      time: '06:00 PM',
      venue: 'Eden Gardens Stadium',
      city: 'Kolkata',
      startingPrice: 1200,
      rating: 4.9,
      organizer: 'International Cricket Federation',
      description: 'The premier clash of Asian cricket titans live under stadium floodlights.',
      ticketTiers: [
        { id: 'st1', name: 'Upper Tier Stand', price: 1200, description: 'Clear elevated view', availableQuantity: 500 },
        { id: 'st2', name: 'Corporate Box', price: 8500, description: 'AC Box with dinner buffet', availableQuantity: 15 }
      ],
      isTrending: true
    });

    // 8. Seed Attractions, Experiences & Restaurants
    console.log('🎢 [Seed] Seeding Attractions, Experiences & Restaurants...');
    await AttractionModel.create({
      title: 'Wonderland Aqua & Theme Park',
      category: 'Waterpark',
      image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=600&auto=format&fit=crop&q=80',
      city: 'Asansol',
      address: 'NH-19 Bypass Road',
      timings: '10:00 AM - 06:30 PM',
      entryPrice: 650,
      rating: 4.7,
      description: 'Over 25 adrenaline-pumping rides, wave pools, and interactive children water zones.',
      inclusions: ['All Ride Access', 'Wave Pool Pass', 'Locker Room Access'],
      isTrending: true
    });

    await ExperienceModel.create({
      title: 'River Lakeside Sunset Glamping',
      type: 'Camping',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80',
      city: 'Asansol',
      duration: '1 Night / 2 Days',
      pricePerPerson: 1850,
      rating: 4.8,
      description: 'Luxury outdoor tent stay with acoustic bonfire music, stargazing, and barbecue dinner.',
      highlights: ['Luxury Waterproof Tents', 'Live Acoustic Guitarist', 'Barbecue Dinner included'],
      isPopular: true
    });

    await RestaurantModel.create({
      name: 'Spice & Sizzle Fine Dining',
      cuisine: ['North Indian', 'Mughlai', 'Continental'],
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
      city: 'Asansol',
      locality: 'Burnpur Road',
      costForTwo: 1200,
      discountOffer: 'Flat 20% OFF on Gourmet Bill',
      rating: 4.7,
      isBookable: true
    });

    // 9. Seed Offers & Coupons
    console.log('🎁 [Seed] Seeding Offers & Coupons...');
    await OfferModel.create([
      {
        title: 'HDFC Bank Weekend Movie Craze',
        bankPartner: 'HDFC Bank',
        bannerImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
        offerCode: 'HDFC200',
        description: 'Get 15% instant discount up to ₹200 on movie tickets using HDFC Credit Cards.',
        discountSummary: 'Save up to ₹200 on Movies',
        categoryApplicable: 'Movies',
        validUntil: '31 DEC 2026'
      },
      {
        title: 'First Booking Celebration',
        bankPartner: 'Book Your Day',
        bannerImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
        offerCode: 'FIRST50',
        description: 'Enjoy ₹100 flat off on your very first event or movie booking.',
        discountSummary: 'Flat ₹100 OFF',
        categoryApplicable: 'All',
        validUntil: '31 DEC 2026'
      }
    ]);

    await CouponModel.create({
      code: 'HDFC200',
      description: '15% instant discount up to ₹200',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      maxDiscountAmount: 200,
      minBookingAmount: 300,
      validUntil: new Date('2026-12-31'),
      isActive: true
    });

    console.log('✨ [Seed] Database successfully seeded with full production-ready mock dataset!');
  } catch (error) {
    console.error('❌ [Seed] Error during seeding:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 [Seed] Disconnected from MongoDB Atlas.');
    }
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed();
}

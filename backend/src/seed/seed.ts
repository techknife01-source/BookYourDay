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
import { HotelModel } from '../models/Hotel.js';
import { RoomTypeModel } from '../models/RoomType.js';
import { RoomInventoryModel } from '../models/RoomInventory.js';
import { TravelPackageModel } from '../models/TravelPackage.js';
import { TravelTransferModel } from '../models/TravelTransfer.js';

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
      HotelModel.deleteMany({}),
      RoomTypeModel.deleteMany({}),
      RoomInventoryModel.deleteMany({}),
      TravelPackageModel.deleteMany({}),
      TravelTransferModel.deleteMany({})
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
      totalScreens: 4,
      latitude: 23.6880,
      longitude: 86.9661,
      locationGeo: { type: 'Point', coordinates: [86.9661, 23.6880] }
    });

    const venue2 = await VenueModel.create({
      name: 'PVR INOX City Square',
      address: 'Station Road Plaza',
      city: 'Asansol',
      state: 'West Bengal',
      facilities: ['IMAX 3D', '4DX', 'Gold Class Lounge'],
      totalScreens: 3,
      latitude: 23.6850,
      longitude: 86.9680,
      locationGeo: { type: 'Point', coordinates: [86.9680, 23.6850] }
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
      venueId: venue1!._id,
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
    const seatDocs: Array<{
      screenId: mongoose.Types.ObjectId;
      seatNumber: string;
      rowLabel: string;
      columnIndex: number;
      category: 'EXECUTIVE' | 'VIP' | 'RECLINER';
    }> = [];
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
        venueId: venue1!._id,
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
        venueId: venue1!._id,
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
      isTrending: true,
      latitude: 23.6900,
      longitude: 86.9650,
      locationGeo: { type: 'Point', coordinates: [86.9650, 23.6900] }
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
      isTrending: true,
      latitude: 22.5646,
      longitude: 88.3433,
      locationGeo: { type: 'Point', coordinates: [88.3433, 22.5646] }
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
      isTrending: true,
      latitude: 23.6950,
      longitude: 86.9720,
      locationGeo: { type: 'Point', coordinates: [86.9720, 23.6950] }
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
      isPopular: true,
      latitude: 23.7020,
      longitude: 86.9600,
      locationGeo: { type: 'Point', coordinates: [86.9600, 23.7020] }
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
      isBookable: true,
      latitude: 23.6820,
      longitude: 86.9580,
      locationGeo: { type: 'Point', coordinates: [86.9580, 23.6820] }
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

    // 10. Seed Hotels & Room Types
    console.log('🏨 [Seed] Seeding Hotels & Room Types...');
    const partnerUser = users.find((u) => u.role === 'partner');
    const partnerId = partnerUser ? partnerUser._id.toString() : 'partner_seed_123';

    const hotel1 = await HotelModel.create({
      partnerId,
      name: 'The Grand Heritage Resort & Spa',
      description: 'Luxury 5-star hotel offering serene gardens, fine dining, swimming pool, spa, and ultra-comfortable rooms.',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&auto=format&fit=crop&q=80'
      ],
      address: '101 Heritage Boulevard, Near City Centre',
      city: 'Asansol',
      state: 'West Bengal',
      country: 'India',
      latitude: 23.6889,
      longitude: 86.9661,
      locationGeo: { type: 'Point', coordinates: [86.9661, 23.6889] },
      rating: 4.8,
      reviewCount: 240,
      amenities: ['WiFi', 'Swimming Pool', 'Spa & Wellness', 'Air Conditioning', 'Free Breakfast', '24/7 Room Service', 'Valet Parking'],
      checkInTime: '14:00',
      checkOutTime: '11:00',
      cancellationPolicy: 'FREE_CANCELLATION',
      status: 'PUBLISHED'
    });

    const roomType1 = await RoomTypeModel.create({
      hotelId: hotel1!._id.toString(),
      name: 'Executive Deluxe King Room',
      description: 'Spacious 350 sq ft room with King size bed, pool view, high-speed WiFi, and complimentary breakfast.',
      images: [
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=80'
      ],
      maxAdults: 2,
      maxChildren: 1,
      maxGuests: 3,
      bedType: '1 King Bed',
      amenities: ['King Bed', 'Pool View', 'Smart TV', 'Mini Bar', 'Air Conditioning', 'Ensuite Bathroom'],
      basePrice: 3500,
      totalRooms: 5,
      status: 'ACTIVE'
    });

    const roomType2 = await RoomTypeModel.create({
      hotelId: hotel1!._id.toString(),
      name: 'Presidential Luxury Suite',
      description: 'Exclusive 700 sq ft suite with private balcony, jacuzzi, lounge area, and dedicated butler service.',
      images: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&auto=format&fit=crop&q=80'
      ],
      maxAdults: 3,
      maxChildren: 2,
      maxGuests: 4,
      bedType: '1 Super King + Sofa Bed',
      amenities: ['Private Balcony', 'Jacuzzi', 'Butler Service', 'Living Room', 'Nespresso Machine'],
      basePrice: 7500,
      totalRooms: 3,
      status: 'ACTIVE'
    });

    // Seed room inventory units
    const invUnits = [];
    for (let i = 1; i <= 5; i++) {
      invUnits.push({
        hotelId: hotel1!._id.toString(),
        roomTypeId: roomType1._id.toString(),
        roomNumberOrUnitId: `DLX-20${i}`,
        status: 'AVAILABLE'
      });
    }
    for (let i = 1; i <= 3; i++) {
      invUnits.push({
        hotelId: hotel1!._id.toString(),
        roomTypeId: roomType2._id.toString(),
        roomNumberOrUnitId: `STE-50${i}`,
        status: 'AVAILABLE'
      });
    }
    await RoomInventoryModel.insertMany(invUnits);

    const hotel2 = await HotelModel.create({
      partnerId,
      name: 'Boutique Urban Stay',
      description: 'Chic modern boutique hotel located in the heart of the business district, ideal for travelers.',
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop&q=80'
      ],
      address: '42 Station Road, Commercial Hub',
      city: 'Asansol',
      state: 'West Bengal',
      country: 'India',
      latitude: 23.6840,
      longitude: 86.9630,
      locationGeo: { type: 'Point', coordinates: [86.9630, 23.6840] },
      rating: 4.5,
      reviewCount: 95,
      amenities: ['WiFi', 'Air Conditioning', 'Business Center', 'Café & Lounge'],
      checkInTime: '12:00',
      checkOutTime: '10:00',
      cancellationPolicy: 'FREE_CANCELLATION',
      status: 'PUBLISHED'
    });

    const roomType3 = await RoomTypeModel.create({
      hotelId: hotel2!._id.toString(),
      name: 'Urban Comfort Queen Room',
      description: 'Cozy modern room with Queen size bed, work desk, and high-speed internet.',
      images: [
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop&q=80'
      ],
      maxAdults: 2,
      maxChildren: 0,
      maxGuests: 2,
      bedType: '1 Queen Bed',
      amenities: ['Queen Bed', 'Work Desk', 'WiFi', 'Air Conditioning'],
      basePrice: 2200,
      totalRooms: 6,
      status: 'ACTIVE'
    });

    const invUnits2 = [];
    for (let i = 1; i <= 6; i++) {
      invUnits2.push({
        hotelId: hotel2!._id.toString(),
        roomTypeId: roomType3._id.toString(),
        roomNumberOrUnitId: `URB-10${i}`,
        status: 'AVAILABLE'
      });
    }
    await RoomInventoryModel.insertMany(invUnits2);

    // 10. Seed Travel Packages & Transfers
    console.log('✈️ [Seed] Seeding Travel Packages & Transfers...');
    await TravelPackageModel.create([
      {
        partnerId,
        title: 'Darjeeling & Gangtok Himalayan Escape',
        description: 'Breathtaking 5-day mountain journey through Darjeeling tea gardens, Tiger Hill sunrise, and Gangtok alpine lakes.',
        images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80'],
        origin: 'Asansol',
        destination: 'Darjeeling',
        durationDays: 5,
        durationNights: 4,
        startingPrice: 12500,
        pricePerAdult: 12500,
        pricePerChild: 6500,
        currency: 'INR',
        inclusions: ['3-Star Hotel Stay', 'Daily Breakfast & Dinner', 'Private Sightseeing Cab', 'Tiger Hill Sunrise Pass'],
        exclusions: ['Airfare/Train Tickets', 'Personal Expenses', 'Monastery Entry Fees'],
        itinerary: [
          { day: 1, title: 'Arrival & Transfer to Darjeeling', destination: 'Darjeeling', activities: ['Scenic drive through Mirik pine forests', 'Mall Road evening stroll'], meals: ['Dinner'], hotel: 'Mayfair Darjeeling', transport: 'Private SUV' },
          { day: 2, title: 'Tiger Hill & Sightseeing', destination: 'Darjeeling', activities: ['Sunrise at Tiger Hill', 'Batasia Loop', 'Ghoom Monastery', 'Happy Valley Tea Estate tour'], meals: ['Breakfast', 'Dinner'], hotel: 'Mayfair Darjeeling', transport: 'Private SUV' },
          { day: 3, title: 'Transfer to Gangtok', destination: 'Gangtok', activities: ['Drive along Teesta River', 'MG Marg evening exploration'], meals: ['Breakfast', 'Dinner'], hotel: 'Lemon Tree Gangtok', transport: 'Private SUV' },
          { day: 4, title: 'Tsomgo Lake & Baba Mandir', destination: 'Gangtok', activities: ['High-altitude glacial lake visit', 'Nathula Pass view'], meals: ['Breakfast', 'Dinner'], hotel: 'Lemon Tree Gangtok', transport: 'Private SUV' },
          { day: 5, title: 'Departure Transfer', destination: 'Asansol', activities: ['Souvenir shopping', 'Return transfer'], meals: ['Breakfast'], transport: 'Private SUV' }
        ],
        cancellationPolicy: 'FREE_CANCELLATION',
        maxGuests: 8,
        totalCapacity: 30,
        availableCapacity: 30,
        availableFrom: new Date('2026-01-01'),
        availableUntil: new Date('2026-12-31'),
        latitude: 27.0410,
        longitude: 88.2663,
        locationGeo: { type: 'Point', coordinates: [88.2663, 27.0410] },
        rating: 4.9,
        reviewCount: 84,
        status: 'PUBLISHED'
      },
      {
        partnerId,
        title: 'Sundarbans Wilderness Cruise & Eco Tour',
        description: '3-day mangrove safari experience into the Royal Bengal Tiger habitat with riverboat cruising and folk music.',
        images: ['https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&auto=format&fit=crop&q=80'],
        origin: 'Asansol',
        destination: 'Sundarbans',
        durationDays: 3,
        durationNights: 2,
        startingPrice: 7800,
        pricePerAdult: 7800,
        pricePerChild: 4200,
        currency: 'INR',
        inclusions: ['Riverboat Safari Cruise', 'Forest Permit & Guide', 'All Meals Onboard', 'Eco Resort Stay'],
        exclusions: ['Camera fees', 'Personal tips'],
        itinerary: [
          { day: 1, title: 'Journey to Godkhali & Boat Boarding', destination: 'Sundarbans', activities: ['Cruising to Sajnekhali Watch Tower', 'Mangrove interpretation center'], meals: ['Lunch', 'Dinner'], hotel: 'Sundarbans Eco Lodge', transport: 'Motorized Boat' },
          { day: 2, title: 'Deep Forest Safari', destination: 'Sundarbans', activities: ['Sudhanyakhali & Dobanki canopy walk', 'Spotting spotted deer and estuarine crocodiles'], meals: ['Breakfast', 'Lunch', 'Dinner'], hotel: 'Sundarbans Eco Lodge', transport: 'Safari Vessel' },
          { day: 3, title: 'Village Walk & Return Transfer', destination: 'Asansol', activities: ['Local craft demonstration', 'Return drive'], meals: ['Breakfast', 'Lunch'], transport: 'Private Cab' }
        ],
        cancellationPolicy: 'FREE_CANCELLATION',
        maxGuests: 12,
        totalCapacity: 40,
        availableCapacity: 40,
        availableFrom: new Date('2026-01-01'),
        availableUntil: new Date('2026-12-31'),
        latitude: 21.9497,
        longitude: 88.8833,
        locationGeo: { type: 'Point', coordinates: [88.8833, 21.9497] },
        rating: 4.8,
        reviewCount: 62,
        status: 'PUBLISHED'
      }
    ]);

    await TravelTransferModel.create([
      {
        partnerId,
        title: 'Airport Express Sedan Transfer',
        description: 'Door-to-door comfortable sedan transfer between Asansol city and Durgapur/Kolkata airport.',
        images: ['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&auto=format&fit=crop&q=80'],
        origin: 'Asansol City Center',
        destination: 'Kolkata Airport (CCU)',
        vehicleType: 'Executive Sedan',
        capacity: 4,
        pricePerVehicle: 3800,
        currency: 'INR',
        availableFrom: new Date('2026-01-01'),
        availableUntil: new Date('2026-12-31'),
        totalCapacity: 15,
        availableCapacity: 15,
        latitude: 23.6880,
        longitude: 86.9661,
        locationGeo: { type: 'Point', coordinates: [86.9661, 23.6880] },
        rating: 4.9,
        reviewCount: 112,
        cancellationPolicy: 'FREE_CANCELLATION',
        status: 'PUBLISHED'
      },
      {
        partnerId,
        title: 'Luxury SUV Station & Hotel Transfer',
        description: 'Spacious Innova Crysta SUV transfer ideal for families with luggage connecting railway stations to hotels.',
        images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80'],
        origin: 'Asansol Junction Railway Station',
        destination: 'Grand Hotel Asansol',
        vehicleType: 'Premium SUV',
        capacity: 6,
        pricePerVehicle: 1500,
        currency: 'INR',
        availableFrom: new Date('2026-01-01'),
        availableUntil: new Date('2026-12-31'),
        totalCapacity: 10,
        availableCapacity: 10,
        latitude: 23.6860,
        longitude: 86.9620,
        locationGeo: { type: 'Point', coordinates: [86.9620, 23.6860] },
        rating: 4.8,
        reviewCount: 75,
        cancellationPolicy: 'FREE_CANCELLATION',
        status: 'PUBLISHED'
      }
    ]);

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

if (process.argv[1] && (process.argv[1].includes('seed.ts') || process.argv[1].includes('seed.js'))) {
  runSeed();
}

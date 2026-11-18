import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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
import { ReviewModel } from '../models/Review.js';
import { NotificationModel } from '../models/Notification.js';

export async function runSeed() {
  console.log('🌱 [Seed] Initializing seed script for Book Your Day database...');

  if ((mongoose.connection.readyState as number) !== 1) {
    const connected = await connectDatabase();
    if (!connected && (mongoose.connection.readyState as number) !== 1) {
      console.warn('⚠️ [Seed] Database not connected. Please set a valid MONGODB_URI in backend/.env.');
      return false;
    }
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
      TravelTransferModel.deleteMany({}),
      ReviewModel.deleteMany({}),
      NotificationModel.deleteMany({})
    ]);

    // 2. Seed Users with hashed password ('password123')
    console.log('👤 [Seed] Seeding Users...');
    const defaultPasswordHash = await bcrypt.hash('password123', 10);
    const users = await UserModel.create([
      {
        name: 'Alex Mercer',
        email: 'alex.mercer@example.com',
        phone: '+91 9876543210',
        passwordHash: defaultPasswordHash,
        role: 'user',
        walletBalance: 2500,
        isMemberPlus: true,
        savedCity: 'Asansol'
      },
      {
        name: 'Grand Cineplex Partner',
        email: 'partner@bookyourday.com',
        phone: '+91 9832100000',
        passwordHash: defaultPasswordHash,
        role: 'partner',
        walletBalance: 12500,
        isMemberPlus: false,
        savedCity: 'Asansol'
      },
      {
        name: 'System Admin',
        email: 'admin@bookyourday.com',
        phone: '+91 9000000000',
        passwordHash: defaultPasswordHash,
        role: 'admin',
        walletBalance: 50000,
        isMemberPlus: true,
        savedCity: 'Mumbai'
      }
    ]);
    const normalUser = users[0];

    // 3. Seed Venues across Indian Cities
    console.log('🏛️ [Seed] Seeding Venues...');
    const venues = await VenueModel.create([
      {
        name: 'Grand Cineplex Dolby Atmos',
        address: 'GT Road, Galaxy Mall, 3rd Floor',
        city: 'Asansol',
        state: 'West Bengal',
        facilities: ['Dolby Atmos 7.1', 'Recliner Seats', 'Gourmet Food Court', 'Valet Parking'],
        totalScreens: 4,
        latitude: 23.6880,
        longitude: 86.9661,
        locationGeo: { type: 'Point', coordinates: [86.9661, 23.6880] }
      },
      {
        name: 'PVR INOX City Square',
        address: 'Station Road Plaza',
        city: 'Asansol',
        state: 'West Bengal',
        facilities: ['IMAX 3D', '4DX', 'Gold Class Lounge'],
        totalScreens: 3,
        latitude: 23.6850,
        longitude: 86.9680,
        locationGeo: { type: 'Point', coordinates: [86.9680, 23.6850] }
      },
      {
        name: 'PVR INOX South City',
        address: 'Prince Anwar Shah Road, South City Mall',
        city: 'Kolkata',
        state: 'West Bengal',
        facilities: ['IMAX with Laser', 'Dolby Atmos', 'Recliner Seats', 'Cafe'],
        totalScreens: 6,
        latitude: 22.5020,
        longitude: 88.3615,
        locationGeo: { type: 'Point', coordinates: [88.3615, 22.5020] }
      },
      {
        name: 'PVR Phoenix Palladium',
        address: '462 Senapati Bapat Marg, Lower Parel',
        city: 'Mumbai',
        state: 'Maharashtra',
        facilities: ['4DX', 'IMAX 3D', 'Gold Class', 'Dolby 7.1'],
        totalScreens: 7,
        latitude: 18.9953,
        longitude: 72.8242,
        locationGeo: { type: 'Point', coordinates: [72.8242, 18.9953] }
      },
      {
        name: 'PVR Select Citywalk',
        address: 'A-3 District Centre, Saket',
        city: 'Delhi',
        state: 'Delhi',
        facilities: ['IMAX', 'Gold Class', 'Food Lounge', 'Wheelchair Friendly'],
        totalScreens: 6,
        latitude: 28.5284,
        longitude: 77.2195,
        locationGeo: { type: 'Point', coordinates: [77.2195, 28.5284] }
      },
      {
        name: 'PVR Forum Koramangala',
        address: 'Hosur Road, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        facilities: ['IMAX', 'Dolby Atmos', 'Food Court', 'Gaming Zone'],
        totalScreens: 8,
        latitude: 12.9348,
        longitude: 77.6111,
        locationGeo: { type: 'Point', coordinates: [77.6111, 12.9348] }
      },
      {
        name: 'SPI Cinemas Sathyam',
        address: 'Thiru-vi-ka Road, Royapettah',
        city: 'Chennai',
        state: 'Tamil Nadu',
        facilities: ['RDX 4K', 'Dolby Atmos', 'Sathyam Popcorn', 'Seating Luxury'],
        totalScreens: 6,
        latitude: 13.0560,
        longitude: 80.2580,
        locationGeo: { type: 'Point', coordinates: [80.2580, 13.0560] }
      }
    ]);

    // 4. Seed Multi-Language Movies
    console.log('🎬 [Seed] Seeding Movies...');
    const movies = await MovieModel.create([
      {
        title: 'Echoes of Tomorrow',
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
        rating: 4.9,
        votesCount: 42800,
        genre: ['Sci-Fi', 'Action', 'Thriller'],
        language: ['English', 'Hindi', 'Tamil', 'Telugu'],
        duration: '2h 45m',
        releaseDate: '10 Aug 2026',
        format: ['2D', '3D', 'IMAX 3D', '4DX'],
        description: 'When humanity unlocks temporal memory transfer, a rogue agent must navigate quantum timelines to prevent reality from collapsing.',
        director: 'Christopher Nolan',
        cast: [
          { name: 'Cillian Murphy', role: 'Dr. Ethan Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
          { name: 'Florence Pugh', role: 'Captain Nora Lin', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80' }
        ],
        isTrending: true
      },
      {
        title: 'Pushpa 2: The Rule',
        poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
        backdrop: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1200&auto=format&fit=crop&q=80',
        rating: 4.8,
        votesCount: 88500,
        genre: ['Action', 'Drama', 'Thriller'],
        language: ['Telugu', 'Hindi', 'Tamil', 'Malayalam', 'Kannada', 'Bengali'],
        duration: '3h 10m',
        releaseDate: '15 Aug 2026',
        format: ['2D', '3D', 'IMAX 2D'],
        description: 'Pushpa Raj cements his rule over the red sandalwood syndicate while facing formidable state authorities and internal betrayals.',
        director: 'Sukumar',
        cast: [
          { name: 'Allu Arjun', role: 'Pushpa Raj', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
          { name: 'Rashmika Mandanna', role: 'Srivalli', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' }
        ],
        isTrending: true
      },
      {
        title: 'Projapoti Express',
        poster: 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600&auto=format&fit=crop&q=80',
        backdrop: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&auto=format&fit=crop&q=80',
        rating: 4.7,
        votesCount: 16200,
        genre: ['Drama', 'Family', 'Comedy'],
        language: ['Bengali'],
        duration: '2h 20m',
        releaseDate: '01 Aug 2026',
        format: ['2D'],
        description: 'An emotional and humorous journey of a father and son travelling across rural Bengal rediscovering family roots and ties.',
        director: 'Avijit Sen',
        cast: [
          { name: 'Mithun Chakraborty', role: 'Gour Chakraborty', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80' },
          { name: 'Dev', role: 'Joy', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80' }
        ],
        isTrending: true
      },
      {
        title: 'Stree 3: Return of Chanderi',
        poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
        rating: 4.8,
        votesCount: 52000,
        genre: ['Comedy', 'Horror'],
        language: ['Hindi'],
        duration: '2h 25m',
        releaseDate: '20 Aug 2026',
        format: ['2D', '4DX'],
        description: 'The ancient folklore takes a hilarious and terrifying new turn when an ancient companion awakens in the town of Chanderi.',
        director: 'Amar Kaushik',
        cast: [
          { name: 'Rajkummar Rao', role: 'Vicky', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' },
          { name: 'Shraddha Kapoor', role: 'The Mystery Woman', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80' }
        ],
        isTrending: true
      },
      {
        title: 'Thalapathy 69',
        poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&auto=format&fit=crop&q=80',
        backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80',
        rating: 4.9,
        votesCount: 94000,
        genre: ['Action', 'Thriller', 'Drama'],
        language: ['Tamil', 'Telugu', 'Hindi'],
        duration: '2h 50m',
        releaseDate: '05 Aug 2026',
        format: ['2D', 'IMAX 2D', 'Dolby Atmos'],
        description: 'A decorated commander emerges from retirement to dismantle a multinational syndicate threatening civilian safety.',
        director: 'H. Vinoth',
        cast: [
          { name: 'Vijay', role: 'Commander Vikram', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' }
        ],
        isTrending: true
      },
      {
        title: 'Manjummel Boys',
        poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
        backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200&auto=format&fit=crop&q=80',
        rating: 4.9,
        votesCount: 61000,
        genre: ['Adventure', 'Drama', 'Thriller'],
        language: ['Malayalam', 'Tamil', 'Telugu', 'Hindi'],
        duration: '2h 15m',
        releaseDate: '12 Aug 2026',
        format: ['2D'],
        description: 'A group of friends embark on an excursion to Guna Caves where courage, resilience, and camaraderie face the ultimate survival test.',
        director: 'Chidambaram',
        cast: [
          { name: 'Soubin Shahir', role: 'Kuttan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' }
        ],
        isTrending: true
      },
      {
        title: 'Kantara: Chapter 1',
        poster: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&auto=format&fit=crop&q=80',
        backdrop: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
        rating: 4.9,
        votesCount: 78000,
        genre: ['Action', 'Mythology', 'Drama'],
        language: ['Kannada', 'Hindi', 'Telugu', 'Tamil', 'Malayalam', 'Bengali'],
        duration: '2h 55m',
        releaseDate: '18 Aug 2026',
        format: ['2D', '3D', 'IMAX 3D'],
        description: 'The ancient origin story of the mystical deity, forest guardian lore, and the indigenous tribe defending sacred sanctums.',
        director: 'Rishab Shetty',
        cast: [
          { name: 'Rishab Shetty', role: 'Berme', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' }
        ],
        isTrending: true
      }
    ]);

    // 5. Seed Screens & Seats for each Venue
    console.log('🖥️ [Seed] Seeding Screens & Seats across Venues...');
    const createdScreens: any[] = [];
    for (const venue of venues) {
      const screen = await ScreenModel.create({
        venueId: venue._id,
        name: `Auditorium 1 - ${venue.facilities[0] || 'Dolby Atmos'}`,
        format: ['2D', '3D', 'Dolby Atmos'],
        totalSeats: 30,
        seatLayoutRows: [
          { rowLabel: 'A', seatsCount: 10, category: 'RECLINER', price: 480 },
          { rowLabel: 'B', seatsCount: 10, category: 'VIP', price: 320 },
          { rowLabel: 'C', seatsCount: 10, category: 'EXECUTIVE', price: 240 }
        ]
      });
      createdScreens.push({ screen, venue });

      const seatDocs: any[] = [];
      ['A', 'B', 'C'].forEach((rowLabel) => {
        for (let i = 1; i <= 10; i++) {
          seatDocs.push({
            screenId: screen._id,
            seatNumber: `${rowLabel}${i}`,
            rowLabel,
            columnIndex: i,
            category: rowLabel === 'A' ? 'RECLINER' : rowLabel === 'B' ? 'VIP' : 'EXECUTIVE'
          });
        }
      });
      await SeatModel.insertMany(seatDocs);
    }

    // 6. Generate Shows dynamically for Today + 7 days
    console.log('🍿 [Seed] Seeding Shows for next 7 days...');
    const today = new Date();
    const dates: string[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const showDocs: any[] = [];
    const showTimes = [
      { start: '10:30', end: '13:15' },
      { start: '14:15', end: '17:00' },
      { start: '18:00', end: '20:45' },
      { start: '21:30', end: '00:15' }
    ];

    for (const { screen, venue } of createdScreens) {
      for (const movie of movies) {
        for (const dateStr of dates) {
          // Add 2 shows per movie per day in each venue
          for (let sIdx = 0; sIdx < 2; sIdx++) {
            const timeSlot = showTimes[(movie.title.length + sIdx) % showTimes.length];
            showDocs.push({
              movieId: movie._id,
              venueId: venue._id,
              screenId: screen._id,
              date: dateStr,
              startTime: timeSlot.start,
              endTime: timeSlot.end,
              language: movie.language[0] || 'Hindi',
              format: movie.format[0] || '2D',
              priceCategories: [
                { category: 'RECLINER', price: 480 },
                { category: 'VIP', price: 320 },
                { category: 'EXECUTIVE', price: 240 }
              ],
              bookedSeats: ['A3', 'A4']
            });
          }
        }
      }
    }
    await ShowModel.insertMany(showDocs);
    console.log(`✅ [Seed] Created ${showDocs.length} shows across ${venues.length} venues.`);

    // 7. Seed Events
    console.log('🎤 [Seed] Seeding Events...');
    await EventModel.create([
      {
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
      },
      {
        title: 'Kolkata Fusion Music Carnival',
        category: 'Concert',
        image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
        backdrop: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
        date: 'SUN, 25 AUG 2026',
        time: '06:30 PM',
        venue: 'Science City Auditorium',
        city: 'Kolkata',
        startingPrice: 750,
        rating: 4.8,
        organizer: 'Bengal Arts Collective',
        description: 'Classical Indian raga meets modern progressive rock in an unforgettable fusion concert.',
        ticketTiers: [
          { id: 't1', name: 'Standard Seat', price: 750, description: 'Balcony seat', availableQuantity: 200 },
          { id: 't2', name: 'Prime Orchestral', price: 1800, description: 'Front rows with acoustic brilliance', availableQuantity: 50 }
        ],
        isTrending: true,
        latitude: 22.5400,
        longitude: 88.3950,
        locationGeo: { type: 'Point', coordinates: [88.3950, 22.5400] }
      },
      {
        title: 'Mumbai Comedy Festival - Headliners Tour',
        category: 'Comedy',
        image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&auto=format&fit=crop&q=80',
        backdrop: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
        date: 'FRI, 28 AUG 2026',
        time: '08:00 PM',
        venue: 'St. Andrew\'s Auditorium, Bandra',
        city: 'Mumbai',
        startingPrice: 699,
        rating: 4.9,
        organizer: 'Laughter Unlimited',
        description: 'India\'s funniest standup comics deliver 2 hours of unfiltered laughter and fresh jokes.',
        ticketTiers: [
          { id: 't1', name: 'Silver Pass', price: 699, description: 'Rear hall seating', availableQuantity: 120 },
          { id: 't2', name: 'Gold Front Row', price: 1499, description: 'Interact live with comics', availableQuantity: 30 }
        ],
        isTrending: true,
        latitude: 19.0550,
        longitude: 72.8290,
        locationGeo: { type: 'Point', coordinates: [72.8290, 19.0550] }
      }
    ]);

    // 8. Seed Sports categorized across types (Cricket, Football, Basketball, Tennis, Badminton, Other)
    console.log('⚽ [Seed] Seeding Sports Events across all categories...');
    await SportsEventModel.create([
      {
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
        description: 'The premier clash of international cricket titans live under stadium floodlights.',
        ticketTiers: [
          { id: 'st1', name: 'Upper Tier Stand', price: 1200, description: 'Clear elevated view', availableQuantity: 500 },
          { id: 'st2', name: 'Corporate Box', price: 8500, description: 'AC Box with dinner buffet', availableQuantity: 15 }
        ],
        isTrending: true,
        latitude: 22.5646,
        longitude: 88.3433,
        locationGeo: { type: 'Point', coordinates: [88.3433, 22.5646] }
      },
      {
        title: 'IPL Derby: Mumbai Indians vs Kolkata Knight Riders',
        sportType: 'Cricket',
        teamsOrPlayers: ['Mumbai Indians', 'Kolkata Knight Riders'],
        image: 'https://images.unsplash.com/photo-1531415074868-036b107e775a?w=600&auto=format&fit=crop&q=80',
        date: 'SAT, 05 SEP 2026',
        time: '07:30 PM',
        venue: 'Wankhede Stadium',
        city: 'Mumbai',
        startingPrice: 1500,
        rating: 4.9,
        organizer: 'Board of Control for Cricket',
        description: 'The marquee clash between two of cricket\'s most iconic franchises in a packed stadium atmosphere.',
        ticketTiers: [
          { id: 'st1', name: 'Sunil Gavaskar Pavilion', price: 1500, description: 'Behind the bowler view', availableQuantity: 300 },
          { id: 'st2', name: 'VIP Grandstand', price: 6500, description: 'Hospitality lounge pass', availableQuantity: 25 }
        ],
        isTrending: true,
        latitude: 18.9389,
        longitude: 72.8258,
        locationGeo: { type: 'Point', coordinates: [72.8258, 18.9389] }
      },
      {
        title: 'Kolkata Derby: Mohun Bagan vs East Bengal',
        sportType: 'Football',
        teamsOrPlayers: ['Mohun Bagan SG', 'East Bengal FC'],
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
        date: 'SAT, 12 SEP 2026',
        time: '07:00 PM',
        venue: 'Vivekananda Yuba Bharati Krirangan (Salt Lake)',
        city: 'Kolkata',
        startingPrice: 400,
        rating: 4.9,
        organizer: 'Indian Super League',
        description: 'The historic 100-year rivalry resumes in the grandest football amphitheatre of Asia.',
        ticketTiers: [
          { id: 'st1', name: 'East Stand Tier 2', price: 400, description: 'Passionate fan gallery', availableQuantity: 800 },
          { id: 'st2', name: 'VIP AC Lounge', price: 2500, description: 'Prime center line seat', availableQuantity: 40 }
        ],
        isTrending: true,
        latitude: 22.5697,
        longitude: 88.4069,
        locationGeo: { type: 'Point', coordinates: [88.4069, 22.5697] }
      },
      {
        title: 'National Basketball Superleague Semi-Final',
        sportType: 'Basketball',
        teamsOrPlayers: ['Bengaluru Behemoths', 'Delhi Dynamos'],
        image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&auto=format&fit=crop&q=80',
        date: 'FRI, 18 SEP 2026',
        time: '06:00 PM',
        venue: 'Kanteerava Indoor Stadium',
        city: 'Bengaluru',
        startingPrice: 500,
        rating: 4.7,
        organizer: 'Basketball Federation of India',
        description: 'High-flying slam dunks, rapid perimeter shooting, and top national basketball athletes.',
        ticketTiers: [
          { id: 'st1', name: 'Courtside Row 1', price: 3000, description: 'Right beside the court action', availableQuantity: 20 },
          { id: 'st2', name: 'General Bleachers', price: 500, description: 'Full view stadium tier', availableQuantity: 250 }
        ],
        isTrending: false,
        latitude: 12.9698,
        longitude: 77.5937,
        locationGeo: { type: 'Point', coordinates: [77.5937, 12.9698] }
      },
      {
        title: 'Bengaluru Open ATP Challenger Championship',
        sportType: 'Tennis',
        teamsOrPlayers: ['Top 32 ATP World Tour Players'],
        image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&auto=format&fit=crop&q=80',
        date: 'SUN, 20 SEP 2026',
        time: '03:00 PM',
        venue: 'KSLTA Tennis Stadium, Cubbon Park',
        city: 'Bengaluru',
        startingPrice: 600,
        rating: 4.8,
        organizer: 'Karnataka State Lawn Tennis Association',
        description: 'Elite international tennis stars compete in fast hard-court championship tennis.',
        ticketTiers: [
          { id: 'st1', name: 'Centre Court Season Pass', price: 1800, description: 'Access to all quarter, semi, and final matches', availableQuantity: 100 },
          { id: 'st2', name: 'Day Pass', price: 600, description: 'General seating for day matches', availableQuantity: 200 }
        ],
        isTrending: false,
        latitude: 12.9780,
        longitude: 77.5910,
        locationGeo: { type: 'Point', coordinates: [77.5910, 12.9780] }
      },
      {
        title: 'India Open BWF Super 750 Badminton Finals',
        sportType: 'Badminton',
        teamsOrPlayers: ['Lakshya Sen', 'Viktor Axelsen'],
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
        date: 'SUN, 27 SEP 2026',
        time: '04:00 PM',
        venue: 'K.D. Jadhav Indoor Hall, IG Stadium',
        city: 'Delhi',
        startingPrice: 800,
        rating: 4.9,
        organizer: 'Badminton Association of India',
        description: 'World-class badminton showdown featuring Olympic and World Championship medalists.',
        ticketTiers: [
          { id: 'st1', name: 'VIP Court View', price: 2500, description: 'Lower tier closest to main court', availableQuantity: 40 },
          { id: 'st2', name: 'General Upper Stand', price: 800, description: 'Elevated panorama of all courts', availableQuantity: 300 }
        ],
        isTrending: true,
        latitude: 28.6290,
        longitude: 77.2480,
        locationGeo: { type: 'Point', coordinates: [77.2480, 28.6290] }
      },
      {
        title: 'Pro Kabaddi Grand Final',
        sportType: 'Other',
        teamsOrPlayers: ['Bengal Warriors', 'Patna Pirates'],
        image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
        date: 'SAT, 03 OCT 2026',
        time: '07:30 PM',
        venue: 'Netaji Indoor Stadium',
        city: 'Kolkata',
        startingPrice: 500,
        rating: 4.8,
        organizer: 'Mashal Sports',
        description: 'High-intensity tackles and breathless raids in the championship match of India\'s indigenous sport.',
        ticketTiers: [
          { id: 'st1', name: 'Mat-Side VIP', price: 2200, description: 'Front-row ringside experience', availableQuantity: 35 },
          { id: 'st2', name: 'General Gallery', price: 500, description: 'Full view stadium tier', availableQuantity: 200 }
        ],
        isTrending: false,
        latitude: 22.5670,
        longitude: 88.3410,
        locationGeo: { type: 'Point', coordinates: [88.3410, 22.5670] }
      }
    ]);

    // 9. Seed Attractions categorized into Water Parks, Zoo Parks, Amusement Parks, Theme Parks, Adventure Parks, Nature Parks
    console.log('🎢 [Seed] Seeding Attractions across all park categories...');
    await AttractionModel.create([
      {
        title: 'Wonderland Aqua & Wave Waterpark',
        category: 'Water Parks',
        image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=600&auto=format&fit=crop&q=80',
        city: 'Asansol',
        address: 'NH-19 Bypass Road',
        timings: '10:00 AM - 06:30 PM',
        entryPrice: 650,
        rating: 4.7,
        description: 'Over 25 adrenaline-pumping water slides, massive wave pool, rain dance floor, and kid zones.',
        inclusions: ['All Ride Access', 'Wave Pool Pass', 'Locker Room Access'],
        isTrending: true,
        latitude: 23.6950,
        longitude: 86.9720,
        locationGeo: { type: 'Point', coordinates: [86.9720, 23.6950] }
      },
      {
        title: 'Aquatica Mega Water Park',
        category: 'Water Parks',
        image: 'https://images.unsplash.com/photo-1582650625119-3a31f8418365?w=600&auto=format&fit=crop&q=80',
        city: 'Kolkata',
        address: 'Kouchpukur, Rajarhat New Town',
        timings: '10:00 AM - 06:00 PM',
        entryPrice: 800,
        rating: 4.8,
        description: 'Eastern India\'s largest water resort with tornado slides, lazy river, and artificial surf waves.',
        inclusions: ['Unlimited Water Rides', 'Wave Pool', 'Costume Rental Option'],
        isTrending: true,
        latitude: 22.5780,
        longitude: 88.4680,
        locationGeo: { type: 'Point', coordinates: [88.4680, 22.5780] }
      },
      {
        title: 'Alipore Zoological & Botanical Sanctuary',
        category: 'Zoo Parks',
        image: 'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=600&auto=format&fit=crop&q=80',
        city: 'Kolkata',
        address: '17 Belvedere Road, Alipore',
        timings: '09:00 AM - 05:00 PM',
        entryPrice: 150,
        rating: 4.6,
        description: 'India\'s oldest formal zoo, home to Royal Bengal tigers, Asiatic lions, giant tortoises, and migratory bird wetlands.',
        inclusions: ['Sanctuary Entry', 'Reptile House Tour', 'Aquarium Access'],
        isTrending: true,
        latitude: 22.5350,
        longitude: 88.3320,
        locationGeo: { type: 'Point', coordinates: [88.3320, 22.5350] }
      },
      {
        title: 'National Zoological Safari Park',
        category: 'Zoo Parks',
        image: 'https://images.unsplash.com/photo-1575550959106-5a7defe28b56?w=600&auto=format&fit=crop&q=80',
        city: 'Delhi',
        address: 'Mathura Road, Near Purana Qila',
        timings: '09:00 AM - 04:30 PM',
        entryPrice: 200,
        rating: 4.7,
        description: 'Expansive naturalistic habitat housing white tigers, chimpanzees, rhinos, and over 130 rare species.',
        inclusions: ['Full Park Access', 'Battery-operated Shuttle Option'],
        isTrending: false,
        latitude: 28.6080,
        longitude: 77.2450,
        locationGeo: { type: 'Point', coordinates: [77.2450, 28.6080] }
      },
      {
        title: 'Nicco Theme & Amusement Park',
        category: 'Amusement Parks',
        image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=600&auto=format&fit=crop&q=80',
        city: 'Kolkata',
        address: 'Salt Lake Bypass, Sector IV',
        timings: '10:30 AM - 07:30 PM',
        entryPrice: 750,
        rating: 4.7,
        description: 'The Disneyland of West Bengal with rollercoasters, sky divers, pirate ships, and a cable car over lakes.',
        inclusions: ['Main Park Entry', 'Composite Ride Pass for 28 Rides'],
        isTrending: true,
        latitude: 22.5700,
        longitude: 88.4250,
        locationGeo: { type: 'Point', coordinates: [88.4250, 22.5700] }
      },
      {
        title: 'Imagicaa Grand Theme Park',
        category: 'Theme Parks',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
        city: 'Mumbai',
        address: '30/31 Sangdewadi, Khopoli-Pali Road',
        timings: '10:00 AM - 08:00 PM',
        entryPrice: 1499,
        rating: 4.9,
        description: 'World-class theme park with high-speed looping coasters, immersive dark rides, and 4D simulator attractions.',
        inclusions: ['Unlimited Theme Park Rides', 'Grand Musical Parade Entry'],
        isTrending: true,
        latitude: 18.7520,
        longitude: 73.2680,
        locationGeo: { type: 'Point', coordinates: [73.2680, 18.7520] }
      },
      {
        title: 'Della Adventure & Extreme Park',
        category: 'Adventure Parks',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&auto=format&fit=crop&q=80',
        city: 'Mumbai',
        address: 'Kunegaon, Lonavala',
        timings: '11:00 AM - 07:00 PM',
        entryPrice: 1750,
        rating: 4.8,
        description: 'India\'s largest adventure park featuring bungee jumping, swoop swings, paintball, dirt buggies, and zorbing.',
        inclusions: ['Adventure Day Pass', 'Safety Harness Gear', 'Trainer Briefing'],
        isTrending: true,
        latitude: 18.7750,
        longitude: 73.3880,
        locationGeo: { type: 'Point', coordinates: [73.3880, 18.7750] }
      },
      {
        title: 'Sundarbans Eco Bio-Reserve & Nature Park',
        category: 'Nature Parks',
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&auto=format&fit=crop&q=80',
        city: 'Kolkata',
        address: 'Canning Coastal Access, South 24 Parganas',
        timings: '08:00 AM - 05:00 PM',
        entryPrice: 450,
        rating: 4.9,
        description: 'Walk through mangrove boardwalks, butterfly conservatories, and crocodile breeding ponds.',
        inclusions: ['Guided Ecological Trail Walk', 'Watchtower Entry'],
        isTrending: true,
        latitude: 22.1000,
        longitude: 88.6000,
        locationGeo: { type: 'Point', coordinates: [88.6000, 22.1000] }
      }
    ]);

    // 10. Seed Experiences & Restaurants
    console.log('🏕️ [Seed] Seeding Experiences & Restaurants...');
    await ExperienceModel.create([
      {
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
      },
      {
        title: 'Ganges Heritage Sunset Yacht Cruise',
        type: 'Cruise',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=80',
        city: 'Kolkata',
        duration: '3 Hours',
        pricePerPerson: 1400,
        rating: 4.9,
        description: 'Sail beneath the majestic Howrah Bridge while enjoying traditional Bengali hi-tea and live Baul folk music.',
        highlights: ['Private Upper Deck', 'High Tea Buffet', 'Howrah Bridge Illumination View'],
        isPopular: true,
        latitude: 22.5850,
        longitude: 88.3450,
        locationGeo: { type: 'Point', coordinates: [88.3450, 22.5850] }
      }
    ]);

    await RestaurantModel.create([
      {
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
      },
      {
        name: 'Peter Cat Heritage Bistro',
        cuisine: ['Continental', 'North Indian', 'Sizzlers'],
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
        city: 'Kolkata',
        locality: 'Park Street',
        costForTwo: 1600,
        discountOffer: '15% Off with MemberPlus',
        rating: 4.9,
        isBookable: true,
        latitude: 22.5510,
        longitude: 88.3530,
        locationGeo: { type: 'Point', coordinates: [88.3530, 22.5510] }
      },
      {
        name: 'The Bombay Canteen',
        cuisine: ['Modern Indian', 'Regional', 'Cocktails'],
        image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&auto=format&fit=crop&q=80',
        city: 'Mumbai',
        locality: 'Lower Parel',
        costForTwo: 2400,
        discountOffer: 'Complimentary Dessert on Booking',
        rating: 4.8,
        isBookable: true,
        latitude: 18.9950,
        longitude: 72.8270,
        locationGeo: { type: 'Point', coordinates: [72.8270, 18.9950] }
      }
    ]);

    // 11. Seed Offers & Coupons
    console.log('🎁 [Seed] Seeding Offers & Coupons...');
    await OfferModel.create([
      {
        title: 'HDFC Bank Weekend Movie Craze',
        bankPartner: 'HDFC Bank',
        bannerImage: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
        offerCode: 'HDFC200',
        description: 'Get 15% instant discount up to ₹200 on movie tickets using HDFC Credit & Debit Cards.',
        discountSummary: 'Save up to ₹200 on Movies',
        categoryApplicable: 'Movies',
        validUntil: '31 DEC 2026'
      },
      {
        title: 'First Booking Celebration',
        bankPartner: 'Book Your Day',
        bannerImage: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
        offerCode: 'FIRST50',
        description: 'Enjoy ₹100 flat off on your very first event, attraction or movie booking.',
        discountSummary: 'Flat ₹100 OFF',
        categoryApplicable: 'All',
        validUntil: '31 DEC 2026'
      },
      {
        title: 'ICICI Bank Sports Bonanza',
        bankPartner: 'ICICI Bank',
        bannerImage: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
        offerCode: 'ICICISPORT',
        description: 'Flat 20% discount up to ₹500 on all stadium and sports passes with ICICI Netbanking.',
        discountSummary: 'Flat 20% OFF on Sports',
        categoryApplicable: 'Sports',
        validUntil: '31 DEC 2026'
      }
    ]);

    await CouponModel.create([
      {
        code: 'HDFC200',
        description: '15% instant discount up to ₹200',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        maxDiscountAmount: 200,
        minBookingAmount: 300,
        validUntil: new Date('2026-12-31'),
        isActive: true
      },
      {
        code: 'FIRST50',
        description: 'Flat ₹100 discount for new users',
        discountType: 'FLAT',
        discountValue: 100,
        maxDiscountAmount: 100,
        minBookingAmount: 200,
        validUntil: new Date('2026-12-31'),
        isActive: true
      },
      {
        code: 'ICICISPORT',
        description: '20% off up to ₹500 on Sports',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        maxDiscountAmount: 500,
        minBookingAmount: 500,
        validUntil: new Date('2026-12-31'),
        isActive: true
      }
    ]);

    // 12. Seed Hotels & Room Types
    console.log('🏨 [Seed] Seeding Hotels & Room Types...');
    const partnerUser = users.find((u) => u.role === 'partner');
    const partnerId = partnerUser ? partnerUser._id.toString() : 'partner_seed_123';

    const hotel1 = await HotelModel.create({
      partnerId,
      name: 'The Grand Heritage Resort & Spa',
      description: 'Luxury 5-star hotel offering serene gardens, fine dining, swimming pool, spa, and ultra-comfortable rooms.',
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80'
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
      images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=80'],
      maxAdults: 2,
      maxChildren: 1,
      maxGuests: 3,
      bedType: '1 King Bed',
      amenities: ['King Bed', 'Pool View', 'Smart TV', 'Mini Bar', 'Air Conditioning', 'Ensuite Bathroom'],
      basePrice: 3500,
      totalRooms: 5,
      status: 'ACTIVE'
    });

    const invUnits = [];
    for (let i = 1; i <= 5; i++) {
      invUnits.push({
        hotelId: hotel1!._id.toString(),
        roomTypeId: roomType1._id.toString(),
        roomNumberOrUnitId: `DLX-20${i}`,
        status: 'AVAILABLE'
      });
    }
    await RoomInventoryModel.insertMany(invUnits);

    // 13. Seed Travel Packages & Transfers
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
          { day: 1, title: 'Arrival & Transfer to Darjeeling', destination: 'Darjeeling', activities: ['Scenic drive', 'Mall Road evening stroll'], meals: ['Dinner'], transport: 'Private SUV' },
          { day: 2, title: 'Tiger Hill & Sightseeing', destination: 'Darjeeling', activities: ['Sunrise at Tiger Hill', 'Batasia Loop', 'Tea Estate tour'], meals: ['Breakfast', 'Dinner'], transport: 'Private SUV' }
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
      }
    ]);

    // 14. Seed Reviews for items
    console.log('⭐ [Seed] Seeding Reviews...');
    await ReviewModel.insertMany([
      {
        userId: normalUser._id,
        userName: normalUser.name,
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        itemId: movies[0]._id.toString(),
        itemType: 'movie',
        rating: 5,
        title: 'Mindbending sci-fi masterpiece!',
        comment: 'The visual effects and Dolby Atmos sound mixing were mind-blowing. Christopher Nolan does it again.',
        verifiedBooking: true,
        helpfulCount: 42,
        status: 'APPROVED'
      },
      {
        userId: normalUser._id,
        userName: normalUser.name,
        userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
        itemId: movies[1]._id.toString(),
        itemType: 'movie',
        rating: 5,
        title: 'Unstoppable energy and mass appeal!',
        comment: 'Allu Arjun rules the screen. BGM gave goosebumps throughout the second half!',
        verifiedBooking: true,
        helpfulCount: 88,
        status: 'APPROVED'
      }
    ]);

    // 15. Seed In-App Notifications for Alex
    console.log('🔔 [Seed] Seeding Notifications...');
    await NotificationModel.insertMany([
      {
        userId: normalUser._id,
        title: 'Welcome to BookYourDay!',
        message: 'Explore blockbuster movies, stadiums, attractions, and luxury hotels across your favourite cities.',
        type: 'OFFER',
        isRead: false,
        link: '/offers'
      },
      {
        userId: normalUser._id,
        title: 'MemberPlus Active 🌟',
        message: 'Your MemberPlus status is active! Enjoy zero convenience fees and priority customer support.',
        type: 'OFFER',
        isRead: true,
        link: '/profile'
      }
    ]);

    console.log('✨ [Seed] Database successfully seeded with full production dataset across all categories and cities!');
    return true;
  } catch (error) {
    console.error('❌ [Seed] Error during seeding:', error);
    return false;
  } finally {
    const isStandalone = process.argv[1] && (process.argv[1].includes('seed.ts') || process.argv[1].includes('seed.js'));
    if (isStandalone && mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 [Seed] Disconnected from MongoDB.');
    }
  }
}

if (process.argv[1] && (process.argv[1].includes('seed.ts') || process.argv[1].includes('seed.js'))) {
  runSeed();
}

import { Movie, Cinema, EventItem, SportsEvent, Attraction, Experience, Restaurant, Location, Offer, NotificationItem, UserProfile } from '../types';

export const CITIES: Location[] = [
  { id: '1', name: 'New York', state: 'NY', country: 'USA', isPopular: true },
  { id: '2', name: 'Mumbai', state: 'MH', country: 'India', isPopular: true },
  { id: '3', name: 'Asansol', state: 'WB', country: 'India', isPopular: true },
  { id: '4', name: 'Delhi NCR', state: 'DL', country: 'India', isPopular: true },
  { id: '5', name: 'London', state: 'ENG', country: 'UK', isPopular: true },
  { id: '6', name: 'Bangalore', state: 'KA', country: 'India', isPopular: true },
  { id: '7', name: 'Kolkata', state: 'WB', country: 'India', isPopular: true },
  { id: '8', name: 'Los Angeles', state: 'CA', country: 'USA', isPopular: true },
  { id: '9', name: 'Sydney', state: 'NSW', country: 'Australia', isPopular: false },
  { id: '10', name: 'Tokyo', state: 'TK', country: 'Japan', isPopular: false },
];

export const MOCK_MOVIES: Movie[] = [
  {
    id: 'm1',
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
    description: 'When humanity unlocks temporal memory transfer, a rouge agent must navigate quantum timelines to prevent the unraveling of the past before total reality collapse.',
    cast: [
      { name: 'Elena Vance', role: 'Dr. Astra Cole', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
      { name: 'Marcus Sterling', role: 'Agent Hayes', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' },
      { name: 'Kaelen Thorne', role: 'Director Vance', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' }
    ],
    director: 'Christopher Nolan',
    trailerUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    isTrending: true
  },
  {
    id: 'm2',
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
    description: 'A high-octane heist thriller taking place during a city-wide blackout, where a crew of elite drivers and hackers attempt the impossible.',
    cast: [
      { name: 'Ray Miller', role: 'Dom', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
      { name: 'Sarah Chen', role: 'Nyx', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80' }
    ],
    director: 'Denis Villeneuve',
    isTrending: true
  },
  {
    id: 'm3',
    title: 'The Last Horizon',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    rating: 4.8,
    votesCount: 31200,
    genre: ['Drama', 'Adventure', 'Sci-Fi'],
    language: ['English', 'Spanish'],
    duration: '2h 30m',
    releaseDate: '15 Aug 2026',
    format: ['2D', '3D', 'IMAX 3D'],
    description: 'An epic journey across unexplored solar systems as scientists push the boundaries of interstellar colonisation.',
    cast: [
      { name: 'David Ross', role: 'Capt. Jonathan', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80' }
    ],
    director: 'James Cameron',
    isTrending: true
  },
  {
    id: 'm4',
    title: 'Shadow Realm Chronicles',
    poster: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1514533450685-4493e01d1fdc?w=1200&auto=format&fit=crop&q=80',
    rating: 4.5,
    votesCount: 19500,
    genre: ['Fantasy', 'Adventure'],
    language: ['English', 'Hindi', 'Telugu'],
    duration: '2h 20m',
    releaseDate: '20 Aug 2026',
    format: ['2D', '3D'],
    description: 'An ancient magic awakens in a hidden world beneath forgotten ruins.',
    cast: [
      { name: 'Liam Sterling', role: 'Aron', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80' }
    ],
    director: 'Peter Jackson',
    isTrending: false
  }
];

export const MOCK_CINEMAS: Cinema[] = [
  {
    id: 'c1',
    name: 'Grand Cineplex Dolby Atmos',
    address: 'Grand Mall, City Centre, Sector 4',
    distanceKm: 1.8,
    city: 'Asansol',
    amenities: ['Dolby Atmos', 'Recliner Seats', 'Gourmet Food', 'Valet Parking'],
    shows: [
      { id: 's1', showtime: '10:30 AM', format: 'IMAX 3D', price: 420, availableSeatsCount: 68, totalSeatsCount: 120 },
      { id: 's2', showtime: '01:45 PM', format: '3D', price: 320, availableSeatsCount: 42, totalSeatsCount: 120 },
      { id: 's3', showtime: '05:15 PM', format: 'IMAX 3D', price: 480, availableSeatsCount: 15, totalSeatsCount: 120 },
      { id: 's4', showtime: '08:30 PM', format: '4DX', price: 550, availableSeatsCount: 8, totalSeatsCount: 120 },
      { id: 's5', showtime: '10:45 PM', format: '2D', price: 280, availableSeatsCount: 94, totalSeatsCount: 120 }
    ]
  },
  {
    id: 'c2',
    name: 'PVR INOX Luxe',
    address: 'Galaxy Square Plaza, Outer Ring Rd',
    distanceKm: 3.5,
    city: 'Asansol',
    amenities: ['Laser Projection', '4K UHD', 'Luxe Lounge', 'Seat Service'],
    shows: [
      { id: 's6', showtime: '11:15 AM', format: '3D', price: 350, availableSeatsCount: 52, totalSeatsCount: 100 },
      { id: 's7', showtime: '02:30 PM', format: 'IMAX 3D', price: 490, availableSeatsCount: 22, totalSeatsCount: 100 },
      { id: 's8', showtime: '06:00 PM', format: 'IMAX 3D', price: 520, availableSeatsCount: 5, totalSeatsCount: 100 },
      { id: 's9', showtime: '09:15 PM', format: '3D', price: 380, availableSeatsCount: 38, totalSeatsCount: 100 }
    ]
  },
  {
    id: 'c3',
    name: 'Cinepolis Megaplex',
    address: 'Central Park West Avenue',
    distanceKm: 5.2,
    city: 'New York',
    amenities: ['VIP Lounge', 'RealD 3D', 'Dolby Atmos'],
    shows: [
      { id: 's10', showtime: '12:00 PM', format: '2D', price: 250, availableSeatsCount: 80, totalSeatsCount: 120 },
      { id: 's11', showtime: '04:00 PM', format: '3D', price: 350, availableSeatsCount: 30, totalSeatsCount: 120 },
      { id: 's12', showtime: '07:30 PM', format: 'IMAX 3D', price: 460, availableSeatsCount: 12, totalSeatsCount: 120 }
    ]
  }
];

export const MOCK_EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: 'Summer Indie Nights Live',
    category: 'Concert',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&auto=format&fit=crop&q=80',
    date: 'SAT, 24 AUG 2026',
    time: '07:00 PM',
    venue: 'Brooklyn Amphitheatre / Stadium Grounds',
    city: 'New York',
    startingPrice: 899,
    rating: 4.9,
    organizer: 'Sonic Pulse Live',
    description: 'An electrifying outdoor indie music festival featuring 6 breakthrough indie bands, live acoustic jams, local craft beverage stalls, and interactive visual light installations.',
    ticketTiers: [
      { id: 't1', name: 'General Access', price: 899, description: 'Standard standing area entrance', availableQuantity: 150 },
      { id: 't2', name: 'Front Fan Pit', price: 1799, description: 'Dedicated front stage enclosure + free poster', availableQuantity: 45 },
      { id: 't3', name: 'VIP Lounge Pass', price: 3499, description: 'Express queue entry + VIP deck + unlimited complimentary mocktails', availableQuantity: 12 }
    ],
    isTrending: true
  },
  {
    id: 'e2',
    title: 'Comedy Underground Uncut',
    category: 'Comedy',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    date: 'FRI, 18 AUG 2026',
    time: '08:30 PM',
    venue: 'The Laugh Factory Club',
    city: 'Asansol',
    startingPrice: 499,
    rating: 4.8,
    organizer: 'Chai & Jokes Productions',
    description: 'Prepare for 90 minutes of unscripted, raw stand-up comedy featuring top touring comedians and hilarious crowd work.',
    ticketTiers: [
      { id: 't4', name: 'Regular Seat', price: 499, description: 'Row seat view', availableQuantity: 60 },
      { id: 't5', name: 'Front Row VIP', price: 999, description: 'Front row seats with drink included', availableQuantity: 10 }
    ],
    isTrending: true
  },
  {
    id: 'e3',
    title: 'Symphony of Lights & Strings',
    category: 'Theatre',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&auto=format&fit=crop&q=80',
    backdrop: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200&auto=format&fit=crop&q=80',
    date: 'SUN, 30 AUG 2026',
    time: '06:00 PM',
    venue: 'Royal Opera House',
    city: 'Mumbai',
    startingPrice: 1200,
    rating: 4.95,
    organizer: 'National Symphony Trust',
    description: 'A breathtaking orchestral fusion of classical strings, cinema scores, and mesmerizing LED projection mapping.',
    ticketTiers: [
      { id: 't6', name: 'Balcony', price: 1200, description: 'Upper tier view', availableQuantity: 80 },
      { id: 't7', name: 'Orchestra Platinum', price: 2800, description: 'Prime center seats', availableQuantity: 25 }
    ],
    isTrending: false
  }
];

export const MOCK_SPORTS: SportsEvent[] = [
  {
    id: 'sp1',
    title: 'ICC T20 Championship: Mumbai Strikers vs Delhi Titans',
    teams: [
      { name: 'Mumbai Strikers', logo: '⚽' },
      { name: 'Delhi Titans', logo: '🛡️' }
    ],
    tournament: 'Premier League 2026',
    sport: 'Cricket',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop&q=80',
    date: 'SUN, 23 AUG 2026',
    time: '07:30 PM',
    venue: 'Wankhede Cricket Stadium',
    city: 'Mumbai',
    startingPrice: 1250,
    stands: [
      { id: 'st1', name: 'North Stand (General)', price: 1250, seatsAvailable: 340 },
      { id: 'st2', name: 'East Pavilion (Premium)', price: 2800, seatsAvailable: 110 },
      { id: 'st3', name: 'Corporate Box Suite', price: 7500, seatsAvailable: 18 }
    ],
    isTrending: true
  },
  {
    id: 'sp2',
    title: 'Super Derby: NYC United vs London FC',
    teams: [
      { name: 'NYC United', logo: '🦁' },
      { name: 'London FC', logo: '🦅' }
    ],
    tournament: 'Global Champions Trophy',
    sport: 'Football',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    date: 'SAT, 29 AUG 2026',
    time: '08:00 PM',
    venue: 'MetLife Arena',
    city: 'New York',
    startingPrice: 1800,
    stands: [
      { id: 'st4', name: 'Lower Tier East', price: 1800, seatsAvailable: 120 },
      { id: 'st5', name: 'VIP Pitchside', price: 4500, seatsAvailable: 12 }
    ],
    isTrending: true
  }
];

export const MOCK_ATTRACTIONS: Attraction[] = [
  {
    id: 'a1',
    title: 'Universal Wonders & Theme Park',
    category: 'Theme Park',
    image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=600&auto=format&fit=crop&q=80',
    city: 'New York',
    rating: 4.8,
    reviewsCount: 14200,
    adultPrice: 1499,
    childPrice: 999,
    openingHours: '09:00 AM - 09:00 PM Daily',
    description: 'Experience 45+ world-class rollercoasters, 4D immersive dark rides, water splash zones, and live stunt shows for the entire family.',
    highlights: ['Instant E-Pass Entry', 'Free Express Fast-Track Pass Option', '3D Motion Simulators'],
    isTrending: true
  },
  {
    id: 'a2',
    title: 'Aquatica Kingdom & Coral Reef Observatory',
    category: 'Water Park',
    image: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?w=600&auto=format&fit=crop&q=80',
    city: 'Asansol',
    rating: 4.7,
    reviewsCount: 8900,
    adultPrice: 799,
    childPrice: 499,
    openingHours: '10:00 AM - 06:30 PM',
    description: 'Giant wave pool, 12 high-speed water chutes, lazy river float, and underwater marine tunnel.',
    highlights: ['Locker Facility', 'Wave Pool Party at 4 PM', 'Kid Splash Zone'],
    isTrending: true
  }
];

export const MOCK_EXPERIENCES: Experience[] = [
  {
    id: 'ex1',
    title: 'VR Cyberpunk Arena & Hologram Battles',
    category: 'VR Gaming',
    image: 'https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=600&auto=format&fit=crop&q=80',
    city: 'Asansol',
    rating: 4.9,
    pricePerPerson: 699,
    duration: '60 Minutes',
    address: 'Level 3, Infinity Tech Hub, City Centre',
    timeSlots: [
      { time: '02:00 PM', availableCapacity: 8, maxCapacity: 10 },
      { time: '03:30 PM', availableCapacity: 4, maxCapacity: 10 },
      { time: '05:00 PM', availableCapacity: 2, maxCapacity: 10 },
      { time: '06:30 PM', availableCapacity: 9, maxCapacity: 10 },
      { time: '08:00 PM', availableCapacity: 0, maxCapacity: 10 }
    ],
    isTrending: true
  },
  {
    id: 'ex2',
    title: 'Escape Room: The Vault Heist 2026',
    category: 'Escape Room',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    city: 'New York',
    rating: 4.85,
    pricePerPerson: 850,
    duration: '75 Minutes',
    address: '42 Wall Street, Manhattan',
    timeSlots: [
      { time: '04:00 PM', availableCapacity: 6, maxCapacity: 8 },
      { time: '05:45 PM', availableCapacity: 3, maxCapacity: 8 },
      { time: '07:30 PM', availableCapacity: 1, maxCapacity: 8 }
    ],
    isTrending: true
  }
];

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: 'The Courtyard Grill & Lounge',
    cuisine: ['French', 'European', 'Continental'],
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    city: 'Asansol',
    address: '14 Boulevard Garden, City Centre',
    rating: 4.9,
    priceForTwo: 2200,
    priceRange: '$$$',
    openingHours: '12:00 PM - 11:30 PM',
    availableSlots: ['07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM'],
    description: 'Fine dining al-fresco experience with live jazz piano, artisanal wood-fired specialties, and curated wines.',
    menuHighlights: ['Truffle Butter Tagliatelle', 'Pan-seared Salmon', 'Chocolate Fondant'],
    isTrending: true
  },
  {
    id: 'r2',
    name: 'Terrace 9 Rooftop Bistro',
    cuisine: ['North Indian', 'Asian', 'Cocktails'],
    image: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&auto=format&fit=crop&q=80',
    city: 'New York',
    address: 'Skyline Tower, 9th Floor, Downtown',
    rating: 4.8,
    priceForTwo: 1800,
    priceRange: '$$$',
    openingHours: '04:00 PM - 01:00 AM',
    availableSlots: ['06:30 PM', '07:15 PM', '08:00 PM', '09:30 PM'],
    description: 'Panoramic skyline view, craft cocktail bar, and modern fusion gastronomy.',
    menuHighlights: ['Smoked Butter Chicken Slider', 'Sushi Platter', 'Berry Sparkler'],
    isTrending: true
  }
];

export const MOCK_OFFERS: Offer[] = [
  {
    id: 'off1',
    title: 'HDFC Bank Weekend Super Saver',
    code: 'HDFC200',
    description: 'Get 15% Instant Discount up to ₹200 on HDFC Credit Cards for Movie & Event tickets.',
    category: 'movies',
    discountPercentage: 15,
    maxDiscount: 200,
    minAmount: 500,
    validUntil: '31 AUG 2026',
    bankName: 'HDFC Bank',
    bannerBg: 'from-blue-900 to-slate-900'
  },
  {
    id: 'off2',
    title: 'BOOK YOUR DAY First Booking Offer',
    code: 'FIRST50',
    description: 'Flat ₹100 Cashback on your very first booking across any category.',
    category: 'all',
    flatDiscount: 100,
    minAmount: 300,
    validUntil: '31 DEC 2026',
    bannerBg: 'from-rose-900 to-indigo-900'
  },
  {
    id: 'off3',
    title: 'Dining Delights Special',
    code: 'DINE20',
    description: 'Get ₹150 off on table reservation deposit & complimentary dessert.',
    category: 'dining',
    flatDiscount: 150,
    minAmount: 1000,
    validUntil: '15 SEP 2026',
    bannerBg: 'from-emerald-900 to-slate-900'
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'usr_101',
  name: 'Alex Mercer',
  email: 'alex.mercer@example.com',
  phone: '+1 (555) 234-5678',
  walletBalance: 450,
  isMemberPlus: true,
  memberPlusExpiry: '15 JUL 2027',
  savedCity: 'Asansol'
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Booking Confirmed!',
    message: 'Your ticket for Echoes of Tomorrow (Seats D12, D13) is confirmed.',
    timestamp: '2 hours ago',
    type: 'booking',
    isRead: false
  },
  {
    id: 'n2',
    title: 'Exclusive Offer unlocked',
    message: 'Use code FIRST50 for ₹100 off on your next event booking.',
    timestamp: '1 day ago',
    type: 'offer',
    isRead: false
  }
];

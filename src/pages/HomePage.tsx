import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Film, Music, Trophy, Compass, Sparkles, Utensils, ArrowRight, ShieldCheck, Ticket, Award, Zap, Loader2 } from 'lucide-react';
import { catalogApi } from '../api/catalogApi';
import { MovieCard } from '../components/cards/MovieCard';
import { EventCard } from '../components/cards/EventCard';
import { SportsCard } from '../components/cards/SportsCard';
import { AttractionCard } from '../components/cards/AttractionCard';
import { ExperienceCard } from '../components/cards/ExperienceCard';
import { RestaurantCard } from '../components/cards/RestaurantCard';
import { Movie, EventItem, SportsEvent, Attraction, Experience, Restaurant } from '../types';

interface HomePageProps {
  currentCity: string;
  onOpenSearchModal: () => void;
  onOpenLocationModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentCity,
  onOpenSearchModal,
  onOpenLocationModal
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [sports, setSports] = useState<SportsEvent[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function loadCatalog() {
      setLoading(true);
      try {
        const items = await catalogApi.getCatalog({ city: currentCity });

        if (!mounted) return;

        const movList: Movie[] = [];
        const evtList: EventItem[] = [];
        const spList: SportsEvent[] = [];
        const expList: Experience[] = [];
        const restList: Restaurant[] = [];

        items.forEach((item) => {
          if (item.category === 'MOVIE') {
            movList.push({
              id: item.id,
              title: item.title,
              poster: item.image,
              backdrop: item.backdrop || item.image,
              rating: item.rating || 4.8,
              votesCount: item.reviewCount || 12000,
              genre: item.metadata?.genre || ['Action', 'Drama'],
              language: item.metadata?.language || ['English', 'Hindi'],
              duration: item.metadata?.duration || '2h 15m',
              releaseDate: item.metadata?.releaseDate || '2026',
              format: item.metadata?.format || ['2D', '3D', 'IMAX 3D'],
              description: item.description,
              cast: item.metadata?.cast || [{ name: 'Lead Actor', role: 'Main', avatar: '' }],
              director: item.metadata?.director || 'Director',
              isTrending: item.metadata?.isTrending
            });
          } else if (item.category === 'EVENT') {
            evtList.push({
              id: item.id,
              title: item.title,
              category: item.metadata?.eventCategory || 'Concert',
              image: item.image,
              backdrop: item.backdrop || item.image,
              date: item.metadata?.date || '15 Aug 2026',
              time: item.metadata?.time || '07:00 PM',
              venue: item.location || 'City Arena',
              city: item.city || currentCity,
              startingPrice: item.priceFrom || 499,
              rating: item.rating || 4.7,
              organizer: item.metadata?.organizer || 'Live Events',
              description: item.description,
              ticketTiers: item.metadata?.ticketTiers || [{ id: 't1', name: 'General', price: item.priceFrom || 499, description: 'Standard Entry', availableQuantity: 50 }],
              isTrending: item.metadata?.isTrending
            });
          } else if (item.category === 'SPORTS') {
            spList.push({
              id: item.id,
              title: item.title,
              teams: item.metadata?.teamsOrPlayers || [{ name: 'Team A', logo: '' }, { name: 'Team B', logo: '' }],
              tournament: item.metadata?.sportType || 'League',
              sport: item.metadata?.sportType || 'Cricket',
              image: item.image,
              date: item.metadata?.date || '20 Aug 2026',
              time: item.metadata?.time || '07:30 PM',
              venue: item.location || 'Stadium',
              city: item.city || currentCity,
              startingPrice: item.priceFrom || 750,
              stands: [{ id: 'std1', name: 'West Stand', price: item.priceFrom || 750, seatsAvailable: 100 }],
              isTrending: item.metadata?.isTrending
            });
          } else if (item.category === 'EXPERIENCE') {
            expList.push({
              id: item.id,
              title: item.title,
              category: item.metadata?.type || 'Adventure',
              image: item.image,
              city: item.city || currentCity,
              rating: item.rating || 4.9,
              pricePerPerson: item.priceFrom || 899,
              duration: item.metadata?.duration || '1 Hour',
              address: item.location || 'City Arena',
              timeSlots: [{ time: '11:00 AM', availableCapacity: 10, maxCapacity: 10 }],
              isTrending: true
            });
          } else if (item.category === 'RESTAURANT') {
            restList.push({
              id: item.id,
              name: item.title,
              cuisine: item.metadata?.cuisine || ['Multicuisine'],
              image: item.image,
              city: item.city || currentCity,
              address: item.location || 'Locality',
              rating: item.rating || 4.6,
              priceForTwo: item.priceFrom || 1200,
              priceRange: '$$',
              openingHours: '12:00 PM - 11:00 PM',
              availableSlots: ['07:00 PM', '08:00 PM', '09:00 PM'],
              description: item.description,
              menuHighlights: ['Chef Special'],
              isTrending: true
            });
          }
        });

        setMovies(movList.slice(0, 4));
        setEvents(evtList.slice(0, 3));
        setSports(spList.slice(0, 2));
        setExperiences(expList.slice(0, 2));
        setRestaurants(restList.slice(0, 2));
      } catch (err) {
        console.error('HomePage catalog load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCatalog();

    return () => {
      mounted = false;
    };
  }, [currentCity]);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 flex flex-col items-center px-4 overflow-hidden text-center">
        {/* Ambient Glow Aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-rose-900/15 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="space-y-3 mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-xs font-bold text-rose-400">
            <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>AUTHENTIC MARKETPLACE DATA SOURCE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
            What are you booking today?
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Everything worth booking, in one place.
          </p>
        </div>

        {/* Universal Search Box */}
        <div className="w-full max-w-2xl relative mb-10">
          <div
            onClick={onOpenSearchModal}
            className="flex items-center bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-2 shadow-2xl cursor-pointer hover:border-rose-500/40 transition-all group"
          >
            <div className="flex-1 flex items-center px-4 gap-3 text-slate-400 text-sm">
              <Search className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
              <span className="truncate">Search movies, concerts, matches, escape rooms, tables...</span>
            </div>
            <button className="bg-rose-600 hover:bg-rose-500 text-white font-black py-3 px-6 sm:px-8 rounded-xl transition-all shadow-lg shadow-rose-900/30 text-xs sm:text-sm">
              Discover
            </button>
          </div>
        </div>

        {/* Location Indicator & Category Shortcuts */}
        <div className="flex flex-col items-center gap-6">
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full text-xs font-bold text-slate-300 transition-all"
          >
            <span className="text-rose-500">📍</span>
            <span>SHOWS NEAR <span className="text-white uppercase">{currentCity}</span></span>
            <span className="text-slate-500 text-[10px] ml-1">(Change)</span>
          </button>

          <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
            {[
              { label: 'Movies', emoji: '🎬', path: '/movies' },
              { label: 'Events', emoji: '🎭', path: '/events' },
              { label: 'Sports', emoji: '⚽', path: '/sports' },
              { label: 'Parks', emoji: '🎡', path: '/attractions' },
              { label: 'Play', emoji: '🎳', path: '/experiences' },
              { label: 'Dining', emoji: '🍽️', path: '/dining' }
            ].map((cat) => (
              <Link
                key={cat.label}
                to={cat.path}
                className="group flex flex-col items-center gap-2"
              >
                <div className="w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 group-hover:border-rose-500 transition-all shadow-lg group-hover:scale-105">
                  <span className="text-2xl">{cat.emoji}</span>
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-white tracking-wider uppercase">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Marketplace Catalog...</span>
        </div>
      )}

      {/* Movies Near You Section */}
      {!loading && movies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-7 bg-rose-600 rounded-full" />
              <h2 className="text-xl sm:text-2xl font-black text-white">Movies Near You</h2>
            </div>
            <Link
              to="/movies"
              className="text-rose-500 text-xs font-extrabold uppercase tracking-widest hover:text-rose-400 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Events Happening This Week */}
      {!loading && events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-7 bg-teal-500 rounded-full" />
              <h2 className="text-xl sm:text-2xl font-black text-white">Events & Concerts</h2>
            </div>
            <Link
              to="/events"
              className="text-teal-400 text-xs font-extrabold uppercase tracking-widest hover:text-teal-300 flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} eventItem={event} />
            ))}
          </div>
        </section>
      )}

      {/* Offers Banner Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-rose-900/40 via-indigo-900/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <span className="bg-rose-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
              PROMO CODE: FIRST50
            </span>
            <h3 className="text-2xl font-black text-white">Get ₹100 Cashback on Your First Booking!</h3>
            <p className="text-slate-300 text-xs sm:text-sm">
              Applicable on Movies, Events, Sports, Experiences, Attractions & Dining.
            </p>
          </div>
          <Link
            to="/offers"
            className="py-3 px-6 bg-white text-slate-950 hover:bg-slate-200 font-black text-xs uppercase tracking-wider rounded-xl shrink-0 transition-all shadow-xl"
          >
            Claim Offers
          </Link>
        </div>
      </section>

      {/* Sports & Experiences Split Grid */}
      {!loading && (sports.length > 0 || experiences.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sports */}
          {sports.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-indigo-500 rounded-full" />
                  Popular Sports Matches
                </h2>
                <Link to="/sports" className="text-indigo-400 text-xs font-bold hover:text-indigo-300">
                  View All &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sports.map((sp) => (
                  <SportsCard key={sp.id} sportsEvent={sp} />
                ))}
              </div>
            </div>
          )}

          {/* Experiences */}
          {experiences.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-amber-500 rounded-full" />
                  Experiences Near You
                </h2>
                <Link to="/experiences" className="text-amber-400 text-xs font-bold hover:text-amber-300">
                  View All &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {experiences.map((ex) => (
                  <ExperienceCard key={ex.id} experience={ex} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Dining & Attractions */}
      {!loading && restaurants.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-7 bg-emerald-500 rounded-full" />
              <h2 className="text-xl sm:text-2xl font-black text-white">Restaurants You Can Book</h2>
            </div>
            <Link to="/dining" className="text-emerald-400 text-xs font-bold hover:text-emerald-300">
              View All &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </section>
      )}

      {/* Why Book Your Day Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">WHY CHOOSE US</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              The Gold Standard in Entertainment Booking
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <Ticket className="w-6 h-6 text-rose-500" />
              <h4 className="font-bold text-sm text-white">Instant QR Passes</h4>
              <p className="text-xs text-slate-400">Zero wait times. Directly scan your phone at the entry gate.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <ShieldCheck className="w-6 h-6 text-indigo-400" />
              <h4 className="font-bold text-sm text-white">100% Guaranteed Seats</h4>
              <p className="text-xs text-slate-400">Real-time live seat locks with zero double-booking risk.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <Zap className="w-6 h-6 text-amber-400" />
              <h4 className="font-bold text-sm text-white">Exclusive Offers</h4>
              <p className="text-xs text-slate-400">Save up to 20% on tickets with partner bank cards & coupons.</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <Award className="w-6 h-6 text-emerald-400" />
              <h4 className="font-bold text-sm text-white">Verified Venues</h4>
              <p className="text-xs text-slate-400">Partnered directly with premier cinemas, arenas & restaurants.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

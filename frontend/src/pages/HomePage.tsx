import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Film, Music, Trophy, Compass, Sparkles, Utensils, ArrowRight, ShieldCheck, Ticket, Award, Zap } from 'lucide-react';
import {
  MOCK_MOVIES,
  MOCK_EVENTS,
  MOCK_SPORTS,
  MOCK_ATTRACTIONS,
  MOCK_EXPERIENCES,
  MOCK_RESTAURANTS,
  MOCK_OFFERS
} from '../data/mockData';
import { MovieCard } from '../components/cards/MovieCard';
import { EventCard } from '../components/cards/EventCard';
import { SportsCard } from '../components/cards/SportsCard';
import { AttractionCard } from '../components/cards/AttractionCard';
import { ExperienceCard } from '../components/cards/ExperienceCard';
import { RestaurantCard } from '../components/cards/RestaurantCard';
import { OfferCard } from '../components/cards/OfferCard';

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
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 flex flex-col items-center px-4 overflow-hidden text-center">
        {/* Ambient Glow Aura */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[380px] bg-rose-900/15 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="space-y-3 mb-8 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-xs font-bold text-rose-400">
            <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>TICKETING & RESERVATION REVOLUTION</span>
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
              { label: 'Movies', icon: Film, emoji: '🎬', path: '/movies' },
              { label: 'Events', icon: Music, emoji: '🎭', path: '/events' },
              { label: 'Sports', icon: Trophy, emoji: '⚽', path: '/sports' },
              { label: 'Parks', icon: Compass, emoji: '🎡', path: '/attractions' },
              { label: 'Play', icon: Sparkles, emoji: '🎳', path: '/experiences' },
              { label: 'Dining', icon: Utensils, emoji: '🍽️', path: '/dining' }
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

      {/* Movies Near You Section */}
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
          {MOCK_MOVIES.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>

      {/* Events Happening This Week */}
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
          {MOCK_EVENTS.map((event) => (
            <EventCard key={event.id} eventItem={event} />
          ))}
        </div>
      </section>

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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sports */}
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
            {MOCK_SPORTS.map((sp) => (
              <SportsCard key={sp.id} sportsEvent={sp} />
            ))}
          </div>
        </div>

        {/* Experiences */}
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
            {MOCK_EXPERIENCES.map((ex) => (
              <ExperienceCard key={ex.id} experience={ex} />
            ))}
          </div>
        </div>
      </section>

      {/* Dining & Attractions */}
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
          {MOCK_RESTAURANTS.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </section>

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

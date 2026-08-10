import React, { useState } from 'react';
import { Heart, Film, Music, Trophy, Compass, Sparkles, Utensils } from 'lucide-react';
import { BookingService } from '../services/bookingService';
import { MOCK_MOVIES, MOCK_EVENTS, MOCK_SPORTS, MOCK_ATTRACTIONS, MOCK_EXPERIENCES, MOCK_RESTAURANTS } from '../data/mockData';
import { MovieCard } from '../components/cards/MovieCard';
import { EventCard } from '../components/cards/EventCard';
import { SportsCard } from '../components/cards/SportsCard';
import { AttractionCard } from '../components/cards/AttractionCard';
import { ExperienceCard } from '../components/cards/ExperienceCard';
import { RestaurantCard } from '../components/cards/RestaurantCard';

export const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState(() => BookingService.getWishlist());

  const wishlistedMovies = MOCK_MOVIES.filter((m) => wishlistItems.some((w) => w.id === m.id));
  const wishlistedEvents = MOCK_EVENTS.filter((e) => wishlistItems.some((w) => w.id === e.id));
  const wishlistedSports = MOCK_SPORTS.filter((s) => wishlistItems.some((w) => w.id === s.id));
  const wishlistedAttractions = MOCK_ATTRACTIONS.filter((a) => wishlistItems.some((w) => w.id === a.id));
  const wishlistedExperiences = MOCK_EXPERIENCES.filter((ex) => wishlistItems.some((w) => w.id === ex.id));
  const wishlistedRestaurants = MOCK_RESTAURANTS.filter((r) => wishlistItems.some((w) => w.id === r.id));

  const totalCount =
    wishlistedMovies.length +
    wishlistedEvents.length +
    wishlistedSports.length +
    wishlistedAttractions.length +
    wishlistedExperiences.length +
    wishlistedRestaurants.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
          <Heart className="w-3.5 h-3.5 fill-rose-500" />
          <span>YOUR SAVED ITEMS ({totalCount})</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Wishlist</h1>
        <p className="text-slate-400 text-sm">Keep track of movies, events and shows you plan to book</p>
      </div>

      {totalCount === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
          <Heart className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the heart icon on any movie, event, match or restaurant card to save it here for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {wishlistedMovies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-rose-500" />
                Movies ({wishlistedMovies.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistedMovies.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </div>
          )}

          {wishlistedEvents.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-teal-400" />
                Events ({wishlistedEvents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {wishlistedEvents.map((e) => (
                  <EventCard key={e.id} eventItem={e} />
                ))}
              </div>
            </div>
          )}

          {wishlistedSports.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-indigo-400" />
                Sports ({wishlistedSports.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {wishlistedSports.map((sp) => (
                  <SportsCard key={sp.id} sportsEvent={sp} />
                ))}
              </div>
            </div>
          )}

          {wishlistedAttractions.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Attractions ({wishlistedAttractions.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {wishlistedAttractions.map((a) => (
                  <AttractionCard key={a.id} attraction={a} />
                ))}
              </div>
            </div>
          )}

          {wishlistedExperiences.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Experiences ({wishlistedExperiences.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {wishlistedExperiences.map((ex) => (
                  <ExperienceCard key={ex.id} experience={ex} />
                ))}
              </div>
            </div>
          )}

          {wishlistedRestaurants.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-400" />
                Restaurants ({wishlistedRestaurants.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {wishlistedRestaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

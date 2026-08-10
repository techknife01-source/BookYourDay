import React, { useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { BookingService } from '../services/bookingService';
import { catalogApi } from '../api/catalogApi';
import { MovieCard } from '../components/cards/MovieCard';
import { EventCard } from '../components/cards/EventCard';
import { Movie, EventItem } from '../types';

export const WishlistPage: React.FC = () => {
  const [wishlistItems, setWishlistItems] = useState<{ id: string; category: string }[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function loadWishlistData() {
      setLoading(true);
      try {
        const list = await BookingService.getWishlistAsync();
        if (!mounted) return;
        setWishlistItems(list);

        if (list.length > 0) {
          const catalogItems = await catalogApi.getCatalog();
          if (!mounted) return;

          const movList: Movie[] = [];
          const evtList: EventItem[] = [];

          catalogItems.forEach((item) => {
            if (list.some((w) => w.id === item.id || w.id === `${item.id}:${item.category.toLowerCase()}`)) {
              if (item.category === 'MOVIE') {
                movList.push({
                  id: item.id,
                  title: item.title,
                  poster: item.image,
                  backdrop: item.backdrop || item.image,
                  rating: item.rating || 4.8,
                  votesCount: item.reviewCount || 10000,
                  genre: item.metadata?.genre || ['Drama'],
                  language: item.metadata?.language || ['English'],
                  duration: item.metadata?.duration || '2h',
                  releaseDate: item.metadata?.releaseDate || '2026',
                  format: item.metadata?.format || ['2D'],
                  description: item.description,
                  cast: item.metadata?.cast || [],
                  director: item.metadata?.director || 'Director'
                });
              } else if (item.category === 'EVENT') {
                evtList.push({
                  id: item.id,
                  title: item.title,
                  category: item.metadata?.eventCategory || 'Concert',
                  image: item.image,
                  backdrop: item.backdrop || item.image,
                  date: item.metadata?.date || 'Upcoming',
                  time: item.metadata?.time || '07:00 PM',
                  venue: item.location || 'Venue',
                  city: item.city || 'Asansol',
                  startingPrice: item.priceFrom || 499,
                  rating: item.rating || 4.5,
                  organizer: item.metadata?.organizer || 'Organizer',
                  description: item.description,
                  ticketTiers: item.metadata?.ticketTiers || []
                });
              }
            }
          });

          setMovies(movList);
          setEvents(evtList);
        }
      } catch (err) {
        console.error('Wishlist load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadWishlistData();

    return () => { mounted = false; };
  }, []);

  const totalCount = movies.length + events.length;

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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Your Wishlist...</span>
        </div>
      ) : totalCount === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-3">
          <Heart className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Click the heart icon on any movie or event card to save it here for quick access.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {movies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white">Saved Movies ({movies.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {movies.map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </div>
          )}

          {events.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white">Saved Events ({events.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {events.map((e) => (
                  <EventCard key={e.id} eventItem={e} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

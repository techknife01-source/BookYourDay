import React, { useEffect, useState } from 'react';
import { Heart, Loader2, ArrowRightLeft, X, Check, Star, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookingService } from '../services/bookingService';
import { catalogApi } from '../api/catalogApi';
import { MovieCard } from '../components/cards/MovieCard';
import { EventCard } from '../components/cards/EventCard';
import { Movie, EventItem, CatalogItem } from '../types';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState<{ id: string; category: string }[]>([]);
  const [allSavedItems, setAllSavedItems] = useState<CatalogItem[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [otherItems, setOtherItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Comparison State
  const [compareMode, setCompareMode] = useState<boolean>(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);

  const loadWishlistData = async () => {
    setLoading(true);
    try {
      const list = await BookingService.getWishlistAsync();
      setWishlistItems(list);

      if (list.length > 0) {
        const catalogItems = await catalogApi.getCatalog();
        const savedCatalog = catalogItems.filter((item) =>
          list.some((w) => w.id === item.id || w.id === `${item.id}:${item.category.toLowerCase()}`)
        );

        setAllSavedItems(savedCatalog);

        const movList: Movie[] = [];
        const evtList: EventItem[] = [];
        const othList: CatalogItem[] = [];

        savedCatalog.forEach((item) => {
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
          } else {
            othList.push(item);
          }
        });

        setMovies(movList);
        setEvents(evtList);
        setOtherItems(othList);
      } else {
        setAllSavedItems([]);
        setMovies([]);
        setEvents([]);
        setOtherItems([]);
      }
    } catch (err) {
      console.error('Wishlist load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlistData();
  }, []);

  const totalCount = allSavedItems.length;

  const toggleSelectForCompare = (itemId: string) => {
    if (selectedForCompare.includes(itemId)) {
      setSelectedForCompare((prev) => prev.filter((id) => id !== itemId));
    } else {
      if (selectedForCompare.length >= 3) {
        alert('You can compare a maximum of 3 items at a time.');
        return;
      }
      setSelectedForCompare((prev) => [...prev, itemId]);
    }
  };

  const comparedItems = allSavedItems.filter((item) => selectedForCompare.includes(item.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
            <Heart className="w-3.5 h-3.5 fill-rose-500" />
            <span>SAVED EXPERIENCES ({totalCount})</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">My Wishlist</h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Keep track of movies, stadium events, attractions, and resorts you want to book
          </p>
        </div>

        {totalCount > 1 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCompareMode(!compareMode);
                setSelectedForCompare([]);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                compareMode
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{compareMode ? 'Exit Compare Mode' : 'Compare Saved Items'}</span>
            </button>

            {compareMode && (
              <button
                disabled={selectedForCompare.length < 2}
                onClick={() => setCompareModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all"
              >
                Compare ({selectedForCompare.length})
              </button>
            )}
          </div>
        )}
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
            Click the heart icon on any movie, event, stadium pass, or theme park card to save it here for quick access.
          </p>
          <button
            onClick={() => navigate('/movies')}
            className="mt-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            Explore Experiences
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Movies Section */}
          {movies.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-5 bg-rose-600 rounded-full" />
                Saved Movies ({movies.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {movies.map((m) => (
                  <div key={m.id} className="relative">
                    {compareMode && (
                      <button
                        onClick={() => toggleSelectForCompare(m.id)}
                        className={`absolute top-3 left-3 z-20 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                          selectedForCompare.includes(m.id)
                            ? 'bg-rose-600 border-rose-500 text-white'
                            : 'bg-black/70 border-white/40 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </button>
                    )}
                    <MovieCard movie={m} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Section */}
          {events.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-5 bg-teal-600 rounded-full" />
                Saved Events & Concerts ({events.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {events.map((e) => (
                  <div key={e.id} className="relative">
                    {compareMode && (
                      <button
                        onClick={() => toggleSelectForCompare(e.id)}
                        className={`absolute top-3 left-3 z-20 w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                          selectedForCompare.includes(e.id)
                            ? 'bg-teal-600 border-teal-500 text-white'
                            : 'bg-black/70 border-white/40 text-transparent'
                        }`}
                      >
                        <Check className="w-4 h-4 text-white" />
                      </button>
                    )}
                    <EventCard eventItem={e} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Categories (Attractions, Sports, Dining) */}
          {otherItems.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span className="w-2.5 h-5 bg-amber-500 rounded-full" />
                Other Saved Activities ({otherItems.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-40 object-cover rounded-xl"
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {item.category}
                        </span>
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {item.rating || 4.7}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base">{item.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{item.city}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-sm font-black text-rose-400">
                        {item.priceFrom ? `From ₹${item.priceFrom}` : 'Bookable'}
                      </span>
                      <button
                        onClick={() => navigate(`/${item.category.toLowerCase()}s/${item.id}`)}
                        className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Comparison Modal */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCompareModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-rose-500" />
                Service Comparison
              </h3>
              <p className="text-xs text-slate-400 mt-1">Side-by-side specification and pricing comparison</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comparedItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-36 object-cover rounded-xl"
                    />
                    <div>
                      <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-white text-base">{item.title}</h4>
                    </div>

                    <div className="space-y-2 text-xs border-t border-slate-800 pt-3 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Rating:</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          {item.rating || 4.8} / 5
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">City:</span>
                        <span className="text-white font-medium">{item.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Starting Price:</span>
                        <span className="text-emerald-400 font-bold">
                          {item.priceFrom ? `₹${item.priceFrom}` : '₹250'}
                        </span>
                      </div>
                      {item.metadata?.genre && (
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-semibold">Genre:</span>
                          <span className="text-slate-300">{item.metadata.genre.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setCompareModalOpen(false);
                      navigate(`/${item.category.toLowerCase()}s/${item.id}`);
                    }}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Book Experience
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Search, Film, Music, Trophy, Compass, Sparkles, Utensils, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOCK_MOVIES, MOCK_EVENTS, MOCK_SPORTS, MOCK_ATTRACTIONS, MOCK_EXPERIENCES, MOCK_RESTAURANTS } from '../../data/mockData';
import { CategoryType } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType | 'all'>('all');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  const filteredMovies = MOCK_MOVIES.filter((m) =>
    m.title.toLowerCase().includes(query.toLowerCase()) ||
    m.genre.some((g) => g.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredEvents = MOCK_EVENTS.filter((e) =>
    e.title.toLowerCase().includes(query.toLowerCase()) ||
    e.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredSports = MOCK_SPORTS.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.sport.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAttractions = MOCK_ATTRACTIONS.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredExperiences = MOCK_EXPERIENCES.filter((ex) =>
    ex.title.toLowerCase().includes(query.toLowerCase()) ||
    ex.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredRestaurants = MOCK_RESTAURANTS.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()) ||
    r.cuisine.some((c) => c.toLowerCase().includes(query.toLowerCase()))
  );

  const hasQuery = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Search Bar Input */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3 bg-slate-900/50">
          <Search className="w-5 h-5 text-rose-500 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, concerts, matches, escape rooms, tables..."
            className="w-full bg-transparent border-none text-white text-base focus:outline-none placeholder-slate-500"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-5 py-3 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-950/40">
          {[
            { id: 'all', label: 'All Results' },
            { id: 'movies', label: 'Movies', icon: Film },
            { id: 'events', label: 'Events', icon: Music },
            { id: 'sports', label: 'Sports', icon: Trophy },
            { id: 'attractions', label: 'Parks', icon: Compass },
            { id: 'experiences', label: 'Play', icon: Sparkles },
            { id: 'dining', label: 'Dining', icon: Utensils }
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/30'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Results Container */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!hasQuery && (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Trending Searches
              </span>
              <div className="flex flex-wrap gap-2">
                {['Echoes of Tomorrow', 'Summer Indie Nights', 'VR Cyberpunk Arena', 'Wankhede Cricket', 'The Courtyard Grill'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3 text-rose-500" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasQuery && (
            <div className="space-y-6">
              {/* Movies */}
              {(activeCategory === 'all' || activeCategory === 'movies') && filteredMovies.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Movies ({filteredMovies.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredMovies.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => handleSelect(`/movies/${m.id}`)}
                        className="p-3 bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center gap-3 cursor-pointer group transition-all"
                      >
                        <img src={m.poster} alt={m.title} className="w-12 h-16 object-cover rounded-xl shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-white truncate group-hover:text-rose-400 transition-colors">
                            {m.title}
                          </h5>
                          <p className="text-xs text-slate-400 truncate">{m.genre.join(' • ')}</p>
                          <span className="text-[10px] text-emerald-400 font-semibold">{m.rating} ★</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {(activeCategory === 'all' || activeCategory === 'events') && filteredEvents.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Events ({filteredEvents.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredEvents.map((e) => (
                      <div
                        key={e.id}
                        onClick={() => handleSelect(`/events/${e.id}`)}
                        className="p-3 bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center gap-3 cursor-pointer group transition-all"
                      >
                        <img src={e.image} alt={e.title} className="w-12 h-16 object-cover rounded-xl shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-white truncate group-hover:text-teal-400 transition-colors">
                            {e.title}
                          </h5>
                          <p className="text-xs text-slate-400 truncate">{e.venue}</p>
                          <span className="text-[10px] text-amber-400 font-semibold">From ₹{e.startingPrice}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sports */}
              {(activeCategory === 'all' || activeCategory === 'sports') && filteredSports.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Sports Matches ({filteredSports.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredSports.map((sp) => (
                      <div
                        key={sp.id}
                        onClick={() => handleSelect(`/sports/${sp.id}`)}
                        className="p-3 bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center gap-3 cursor-pointer group transition-all"
                      >
                        <img src={sp.image} alt={sp.title} className="w-12 h-16 object-cover rounded-xl shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-white truncate group-hover:text-indigo-400 transition-colors">
                            {sp.title}
                          </h5>
                          <p className="text-xs text-slate-400 truncate">{sp.venue}</p>
                          <span className="text-[10px] text-rose-400 font-semibold">From ₹{sp.startingPrice}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experiences */}
              {(activeCategory === 'all' || activeCategory === 'experiences') && filteredExperiences.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Experiences ({filteredExperiences.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredExperiences.map((ex) => (
                      <div
                        key={ex.id}
                        onClick={() => handleSelect(`/experiences/${ex.id}`)}
                        className="p-3 bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center gap-3 cursor-pointer group transition-all"
                      >
                        <img src={ex.image} alt={ex.title} className="w-12 h-16 object-cover rounded-xl shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-white truncate group-hover:text-amber-400 transition-colors">
                            {ex.title}
                          </h5>
                          <p className="text-xs text-slate-400 truncate">{ex.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dining */}
              {(activeCategory === 'all' || activeCategory === 'dining') && filteredRestaurants.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    Restaurants ({filteredRestaurants.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredRestaurants.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleSelect(`/dining/${r.id}`)}
                        className="p-3 bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center gap-3 cursor-pointer group transition-all"
                      >
                        <img src={r.image} alt={r.name} className="w-12 h-16 object-cover rounded-xl shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-sm text-white truncate group-hover:text-emerald-400 transition-colors">
                            {r.name}
                          </h5>
                          <p className="text-xs text-slate-400 truncate">{r.cuisine.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

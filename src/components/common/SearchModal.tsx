import React, { useState, useEffect } from 'react';
import { Search, Film, Music, Trophy, Compass, Sparkles, Utensils, X, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchApi } from '../../api/searchApi';
import { SearchResultItem } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [totalCount, setTotalCount] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();

    const handler = setTimeout(async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await searchApi.search({
          q: trimmed,
          category: activeCategory,
          limit: 12
        });
        setResults(data.results);
        setTotalCount(data.pagination.total);
      } catch (err) {
        console.error('Search modal query error:', err);
        setError(true);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query, activeCategory, isOpen]);

  if (!isOpen) return null;

  const handleSelect = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleViewAll = () => {
    onClose();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (activeCategory && activeCategory !== 'all') params.set('category', activeCategory);
    navigate(`/search?${params.toString()}`);
  };

  const getItemRoute = (item: SearchResultItem): string => {
    switch (item.category) {
      case 'MOVIE':
        return `/movie/${item.id}`;
      case 'EVENT':
        return `/event/${item.id}`;
      case 'SPORTS':
        return `/sport/${item.id}`;
      case 'ATTRACTION':
        return `/attractions`;
      case 'EXPERIENCE':
        return `/experiences`;
      case 'RESTAURANT':
        return `/dining`;
      default:
        return '/';
    }
  };

  const categoryBadge = (cat: string) => {
    switch (cat) {
      case 'MOVIE':
        return <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">MOVIE</span>;
      case 'EVENT':
        return <span className="bg-teal-500/20 text-teal-400 border border-teal-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">EVENT</span>;
      case 'SPORTS':
        return <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">SPORTS</span>;
      case 'ATTRACTION':
        return <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">PARKS</span>;
      case 'EXPERIENCE':
        return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">PLAY</span>;
      case 'RESTAURANT':
        return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-md">DINING</span>;
      default:
        return null;
    }
  };

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
            { id: 'MOVIE', label: 'Movies', icon: Film },
            { id: 'EVENT', label: 'Events', icon: Music },
            { id: 'SPORTS', label: 'Sports', icon: Trophy },
            { id: 'ATTRACTION', label: 'Parks', icon: Compass },
            { id: 'EXPERIENCE', label: 'Play', icon: Sparkles },
            { id: 'RESTAURANT', label: 'Dining', icon: Utensils }
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
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
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
              <Loader2 className="w-7 h-7 text-rose-500 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-wider">Searching BookYourDay...</span>
            </div>
          )}

          {error && !loading && (
            <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-sm font-bold text-rose-200">Unable to search right now. Please try again.</p>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="p-10 text-center bg-slate-900/30 border border-slate-800/80 rounded-2xl space-y-2">
              <p className="text-base font-bold text-slate-200">No activities found</p>
              <p className="text-xs text-slate-400">Try adjusting your keywords or switching category filters.</p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Found {totalCount} Activity{totalCount === 1 ? '' : 'ies'}
                </span>
                <button
                  onClick={handleViewAll}
                  className="text-xs text-rose-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>View All & Filters</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.map((item) => (
                  <div
                    key={`${item.category}-${item.id}`}
                    onClick={() => handleSelect(getItemRoute(item))}
                    className="p-3 bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center gap-3 cursor-pointer group transition-all"
                  >
                    <img src={item.image} alt={item.title} className="w-14 h-16 object-cover rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        {categoryBadge(item.category)}
                        {item.rating && (
                          <span className="text-[10px] text-amber-400 font-bold">
                            ★ {item.rating}
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-sm text-white truncate group-hover:text-rose-400 transition-colors">
                        {item.title}
                      </h5>
                      <p className="text-xs text-slate-400 truncate">
                        {item.location || item.city || item.description}
                      </p>
                      {item.priceFrom && (
                        <span className="text-[11px] font-extrabold text-emerald-400 block">
                          From ₹{item.priceFrom}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 shrink-0" />
                  </div>
                ))}
              </div>

              {totalCount > results.length && (
                <div className="pt-2 text-center">
                  <button
                    onClick={handleViewAll}
                    className="px-5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-rose-400 hover:text-white transition-all"
                  >
                    See all {totalCount} results on Search Page &rarr;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

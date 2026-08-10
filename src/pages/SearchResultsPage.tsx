import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Search, Film, Music, Trophy, Compass, Sparkles, Utensils, 
  Filter, SlidersHorizontal, MapPin, Calendar, Star, DollarSign, 
  RotateCcw, ChevronLeft, ChevronRight, Loader2, AlertCircle, ArrowRight
} from 'lucide-react';
import { searchApi } from '../api/searchApi';
import { SearchResultItem, SearchPagination } from '../types';

const POPULAR_CITIES = [
  'All Cities', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 
  'Chennai', 'Kolkata', 'Pune', 'Asansol', 'Goa', 'Jaipur', 'Ahmedabad'
];

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL state
  const qParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const cityParam = searchParams.get('city') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const minRatingParam = searchParams.get('minRating') || '';
  const dateParam = searchParams.get('date') || '';
  const sortParam = searchParams.get('sort') || 'relevance';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  // Local form state
  const [searchInput, setSearchInput] = useState(qParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [minRating, setMinRating] = useState(minRatingParam);
  const [date, setDate] = useState(dateParam);
  const [sort, setSort] = useState(sortParam);
  const [currentPage, setCurrentPage] = useState(pageParam);

  // API State
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [pagination, setPagination] = useState<SearchPagination>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Keep local inputs in sync with URL when URL changes directly
  useEffect(() => {
    setSearchInput(qParam);
    setSelectedCategory(categoryParam);
    setSelectedCity(cityParam);
    setMinPrice(minPriceParam);
    setMaxPrice(maxPriceParam);
    setMinRating(minRatingParam);
    setDate(dateParam);
    setSort(sortParam);
    setCurrentPage(pageParam);
  }, [qParam, categoryParam, cityParam, minPriceParam, maxPriceParam, minRatingParam, dateParam, sortParam, pageParam]);

  // Fetch search results
  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await searchApi.search({
        q: qParam,
        category: categoryParam,
        city: cityParam,
        minPrice: minPriceParam ? Number(minPriceParam) : undefined,
        maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
        minRating: minRatingParam ? Number(minRatingParam) : undefined,
        date: dateParam,
        sort: sortParam as any,
        page: pageParam,
        limit: 12
      });
      setResults(data.results);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch search results:', err);
      setError(true);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [qParam, categoryParam, cityParam, minPriceParam, maxPriceParam, minRatingParam, dateParam, sortParam, pageParam]);

  useEffect(() => {
    fetchSearchResults();
  }, [fetchSearchResults]);

  // Update URL search parameters
  const updateUrlParams = (updates: Record<string, string | number | undefined>) => {
    const newParams = new URLSearchParams(searchParams);
    
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === 'all' || val === 'All Cities') {
        newParams.delete(key);
      } else {
        newParams.set(key, String(val));
      }
    });

    // Reset to page 1 unless page itself was updated
    if (!('page' in updates)) {
      newParams.set('page', '1');
    }

    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({
      q: searchInput,
      category: selectedCategory,
      city: selectedCity,
      minPrice,
      maxPrice,
      minRating,
      date,
      sort
    });
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    updateUrlParams({ category: cat });
  };

  const handleCityChange = (c: string) => {
    setSelectedCity(c === 'All Cities' ? '' : c);
    updateUrlParams({ city: c === 'All Cities' ? '' : c });
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    updateUrlParams({ sort: newSort });
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSelectedCategory('all');
    setSelectedCity('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setDate('');
    setSort('relevance');
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        return <span className="bg-rose-500/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm">MOVIE</span>;
      case 'EVENT':
        return <span className="bg-teal-500/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm">EVENT</span>;
      case 'SPORTS':
        return <span className="bg-indigo-500/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm">SPORTS</span>;
      case 'ATTRACTION':
        return <span className="bg-cyan-500/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm">PARKS</span>;
      case 'EXPERIENCE':
        return <span className="bg-amber-500/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm">PLAY</span>;
      case 'RESTAURANT':
        return <span className="bg-emerald-500/90 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-sm">DINING</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pt-6 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
              <Search className="w-7 h-7 text-rose-500" />
              <span>Universal Discovery Engine</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Search across movies, events, sports, parks, experiences, and fine dining.
            </p>
          </div>

          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold transition-all"
          >
            <SlidersHorizontal className="w-4 h-4 text-rose-400" />
            <span>Filters & Refine</span>
          </button>
        </div>

        {/* Global Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, artist, venue, cuisine, category..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 text-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>
          <button
            type="submit"
            className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-8 py-3.5 rounded-2xl transition-all shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 shrink-0 text-sm"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2">
          {[
            { id: 'all', label: 'All Marketplace', icon: Search },
            { id: 'MOVIE', label: 'Movies', icon: Film },
            { id: 'EVENT', label: 'Events', icon: Music },
            { id: 'SPORTS', label: 'Sports', icon: Trophy },
            { id: 'ATTRACTION', label: 'Parks', icon: Compass },
            { id: 'EXPERIENCE', label: 'Play', icon: Sparkles },
            { id: 'RESTAURANT', label: 'Dining', icon: Utensils }
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory.toUpperCase() === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/40'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Layout (Sidebar Filters + Results Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filter Sidebar (Desktop + Mobile overlay) */}
        <div className={`md:block space-y-6 bg-slate-900/60 border border-slate-800 rounded-3xl p-6 h-fit ${showMobileFilters ? 'block' : 'hidden'}`}>
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Filter className="w-4 h-4 text-rose-500" />
              <span>Filter Results</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Location / City</span>
            </label>
            <select
              value={selectedCity || 'All Cities'}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              {POPULAR_CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Price Range (₹)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Minimum Rating</span>
            </label>
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                updateUrlParams({ minRating: e.target.value });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5★ & Above</option>
              <option value="4.0">4.0★ & Above</option>
              <option value="3.5">3.5★ & Above</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Specific Date</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                updateUrlParams({ date: e.target.value });
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Apply Filters Action */}
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5 text-rose-400" />
            <span>Apply Filters</span>
          </button>
        </div>

        {/* Results Column */}
        <div className="md:col-span-3 space-y-6">
          {/* Controls bar: Results Count & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4">
            <div>
              <p className="text-sm font-bold text-slate-200">
                {loading ? (
                  <span>Searching activities...</span>
                ) : (
                  <span>
                    Found <strong className="text-rose-400">{pagination.total}</strong> activity{pagination.total === 1 ? '' : 'ies'}
                    {qParam && <span> for &ldquo;<span className="text-white">{qParam}</span>&rdquo;</span>}
                  </span>
                )}
              </p>
              {pagination.total > 0 && !loading && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 shrink-0">Sort By:</span>
              <select
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-rose-500 font-medium"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800/50 rounded-3xl space-y-4">
              <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
              <div className="text-center">
                <h4 className="font-extrabold text-white text-base">Searching BookYourDay...</h4>
                <p className="text-xs text-slate-400 mt-1">Checking live MongoDB inventory across all categories</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-10 text-center bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-rose-200">Unable to search right now. Please try again.</h3>
                <p className="text-xs text-rose-300/80">We experienced a temporary issue contacting the search engine.</p>
              </div>
              <button
                onClick={fetchSearchResults}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-rose-900/30"
              >
                Retry Search
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && results.length === 0 && (
            <div className="p-12 text-center bg-slate-900/30 border border-slate-800 rounded-3xl space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8 text-slate-500" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-xl text-white">No activities found</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  We couldn&apos;t find any activities matching your exact keywords or filters. Try adjusting your search or clearing active filters.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-rose-400 font-bold rounded-xl text-xs transition-all inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item) => (
                <div
                  key={`${item.category}-${item.id}`}
                  onClick={() => navigate(getItemRoute(item))}
                  className="group bg-slate-900/60 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-950/20"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      {categoryBadge(item.category)}
                    </div>
                    {item.rating && (
                      <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700 text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{item.rating}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-base text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 truncate max-w-[60%]">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="truncate">{item.city || item.location || 'Multiple Venues'}</span>
                      </div>

                      {item.priceFrom !== undefined && (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">Starts at</span>
                          <span className="text-sm font-black text-emerald-400">₹{item.priceFrom}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && !error && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-2xl p-4 pt-4">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs font-bold text-slate-400">
                Page <span className="text-white">{pagination.page}</span> of <span className="text-white">{pagination.totalPages}</span>
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-bold text-white transition-all flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

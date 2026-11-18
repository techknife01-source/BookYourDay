import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Search,
  Compass,
  Star,
  ArrowUpDown,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Film,
  Calendar,
  Trophy,
  Ticket,
  Utensils,
  Hotel as HotelIcon,
  Plane,
  Car,
  AlertCircle,
  LayoutGrid,
  Map as MapIcon,
  ExternalLink,
  X
} from 'lucide-react';
import { CatalogItem } from '../types';
import { NearbyService } from '../services/nearbyService';

interface NearbyPageProps {
  currentCity: string;
  onOpenLocationModal: () => void;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All Near Me', icon: Compass },
  { id: 'MOVIES', label: 'Movies', icon: Film },
  { id: 'EVENTS', label: 'Events', icon: Calendar },
  { id: 'SPORTS', label: 'Sports', icon: Trophy },
  { id: 'ATTRACTIONS', label: 'Parks & Attractions', icon: Ticket },
  { id: 'EXPERIENCES', label: 'Play & Experiences', icon: Compass },
  { id: 'DINING', label: 'Dining & Cafes', icon: Utensils },
  { id: 'HOTELS', label: 'Hotels & Stays', icon: HotelIcon },
  { id: 'TRAVEL', label: 'Travel Packages', icon: Plane },
  { id: 'TRANSFERS', label: 'Transfers', icon: Car }
];

const RADIUS_OPTIONS = [1, 3, 5, 10, 25, 50];

export const NearbyPage: React.FC<NearbyPageProps> = ({ currentCity, onOpenLocationModal }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(() => {
    const saved = localStorage.getItem('byd_user_coords');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return { lat: 23.6880, lng: 86.9661 }; // Default Asansol center
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [radius, setRadius] = useState<number>(Number(searchParams.get('radius')) || 10);
  const [sort, setSort] = useState(searchParams.get('sort') || 'distance');
  const [minRating, setMinRating] = useState<number>(Number(searchParams.get('minRating')) || 0);
  const [availability, setAvailability] = useState(searchParams.get('availability') || 'ALL');
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);

  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Map & Grid View Modes
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedMapItem, setSelectedMapItem] = useState<CatalogItem | null>(null);

  // Geolocation detection
  const handleDetectLocation = () => {
    setIsDetecting(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserCoords(coords);
        localStorage.setItem('byd_user_coords', JSON.stringify(coords));
        setIsDetecting(false);
        setPage(1);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGeoError('Location permission denied or unavailable. Showing results near default city.');
        setIsDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Fetch Nearby
  const loadNearbyData = async () => {
    setLoading(true);
    const res = await NearbyService.fetchNearby({
      lat: userCoords?.lat,
      lng: userCoords?.lng,
      radius,
      city: currentCity,
      q,
      category,
      minRating: minRating > 0 ? minRating : undefined,
      availability: availability !== 'ALL' ? availability : undefined,
      sort,
      page,
      limit: 12
    });

    if (res.success && res.data) {
      setItems(res.data.results || []);
      setPagination(res.data.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 });
      if (res.data.results && res.data.results.length > 0 && !selectedMapItem) {
        setSelectedMapItem(res.data.results[0]);
      }
    } else {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNearbyData();
  }, [userCoords, currentCity, category, radius, sort, minRating, availability, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadNearbyData();
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'MOVIE':
        return { label: 'Movie', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'EVENT':
        return { label: 'Event', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'SPORTS':
        return { label: 'Sports', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'ATTRACTION':
        return { label: 'Attraction', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'EXPERIENCE':
        return { label: 'Experience', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
      case 'RESTAURANT':
        return { label: 'Dining', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30' };
      case 'HOTEL':
        return { label: 'Hotel', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' };
      case 'TRAVEL':
        return { label: 'Travel', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'TRANSFER':
        return { label: 'Transfer', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      default:
        return { label: cat, color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const handleItemClick = (item: CatalogItem) => {
    switch (item.category.toUpperCase()) {
      case 'MOVIE':
        navigate(`/movies/${item.id}`);
        break;
      case 'EVENT':
        navigate(`/events/${item.id}`);
        break;
      case 'SPORTS':
        navigate(`/sports/${item.id}`);
        break;
      case 'ATTRACTION':
        navigate('/attractions');
        break;
      case 'EXPERIENCE':
        navigate('/experiences');
        break;
      case 'RESTAURANT':
        navigate('/dining');
        break;
      case 'HOTEL':
        navigate('/hotels');
        break;
      case 'TRAVEL':
      case 'TRANSFER':
        navigate('/travel');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-16">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-b from-[#0b1329] via-[#080e21] to-[#020617] border-b border-slate-800/80 pt-8 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-rose-500 uppercase tracking-widest mb-1.5">
                <Compass className="w-4 h-4 animate-spin-slow" />
                <span>Location-Aware Discovery Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                What can I do near me?
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-xl">
                Discover live movies, concerts, sports matches, theme parks, glamping, dining, and staycations happening around you.
              </p>
            </div>

            {/* Location Switcher Box */}
            <div className="bg-[#0f172a]/90 border border-slate-800 p-3.5 rounded-2xl flex flex-wrap items-center gap-3 shadow-lg">
              <button
                onClick={handleDetectLocation}
                disabled={isDetecting}
                className="flex items-center gap-2 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-900/30 transition-all disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 ${isDetecting ? 'animate-spin' : ''}`} />
                <span>{isDetecting ? 'Locating...' : 'Use Current GPS'}</span>
              </button>

              <button
                onClick={onOpenLocationModal}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-200 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>City: <strong className="text-white">{currentCity}</strong></span>
              </button>

              {userCoords && (
                <span className="text-[10px] text-slate-400 font-mono hidden lg:inline">
                  📍 {userCoords.lat.toFixed(3)}, {userCoords.lng.toFixed(3)}
                </span>
              )}
            </div>
          </div>

          {geoError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{geoError}</span>
            </div>
          )}

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative max-w-3xl">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search movies, events, sports, restaurants, parks near you..."
              className="w-full bg-[#0f172a] border border-slate-800 focus:border-rose-500/50 rounded-2xl pl-12 pr-28 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Search
            </button>
          </form>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.id);
                    setPage(1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-900/30'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Radius, View Toggle & Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0f172a]/60 border border-slate-800/80 rounded-2xl">
          {/* Radius Selector with wrapping fix */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <Compass className="w-3.5 h-3.5 text-rose-500" />
              Radius:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRadius(r);
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    radius === r
                      ? 'bg-rose-600 text-white font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle (Grid vs Interactive Map) */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'map'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>
          </div>

          {/* Sort & Rating Controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {/* Sort */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Sort:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="distance" className="bg-slate-900">Nearest Distance</option>
                <option value="relevance" className="bg-slate-900">Relevance</option>
                <option value="rating" className="bg-slate-900">Highest Rating</option>
                <option value="price_low" className="bg-slate-900">Price: Low to High</option>
                <option value="price_high" className="bg-slate-900">Price: High to Low</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Rating:</span>
              <select
                value={minRating}
                onChange={(e) => {
                  setMinRating(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value={0} className="bg-slate-900">All Ratings</option>
                <option value={4.0} className="bg-slate-900">4.0+ Stars</option>
                <option value={4.5} className="bg-slate-900">4.5+ Stars</option>
                <option value={4.8} className="bg-slate-900">4.8+ Top Rated</option>
              </select>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setQ('');
                setCategory('ALL');
                setRadius(10);
                setSort('distance');
                setMinRating(0);
                setAvailability('ALL');
                setPage(1);
              }}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <div>
            Showing <strong className="text-white">{items.length}</strong> items found within{' '}
            <span className="text-rose-400 font-bold">{radius} km</span> of{' '}
            <span className="text-white font-bold">{currentCity}</span>
          </div>
          {loading && <span className="text-rose-400 animate-pulse">Updating results...</span>}
        </div>

        {/* INTERACTIVE MAP VIEW */}
        {viewMode === 'map' && (
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <MapIcon className="w-4 h-4 text-rose-500" />
                <span>Geographic Map View • {items.length} Pins Loaded</span>
              </span>
              <span className="text-slate-400">Click any marker pin on the map to inspect details</span>
            </div>

            <div className="relative w-full h-[500px] bg-[#020617] overflow-hidden flex items-center justify-center p-6">
              {/* Map Canvas Background Grid */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:24px_24px]" />
              <div className="absolute w-72 h-72 rounded-full border border-rose-500/20 animate-pulse" />
              <div className="absolute w-96 h-96 rounded-full border border-slate-800/50" />

              {/* Center User Location Pin */}
              <div className="absolute flex flex-col items-center z-20 pointer-events-none">
                <div className="w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-lg animate-ping" />
                <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full mt-1">
                  You are here ({currentCity})
                </span>
              </div>

              {/* Interactive Service Markers */}
              {items.map((item, index) => {
                // Distribute marker coordinates radially based on index and distance
                const angle = (index * (360 / Math.max(items.length, 1))) * (Math.PI / 180);
                const distOffset = 60 + ((index * 37) % 150);
                const x = Math.cos(angle) * distOffset;
                const y = Math.sin(angle) * distOffset;

                const isSelected = selectedMapItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                    className="absolute z-30 transition-transform duration-300"
                  >
                    <button
                      onClick={() => setSelectedMapItem(item)}
                      className={`p-2 rounded-2xl border flex items-center gap-1.5 shadow-xl transition-all ${
                        isSelected
                          ? 'bg-rose-600 border-white text-white scale-125 z-40 ring-4 ring-rose-500/30'
                          : 'bg-slate-900 border-slate-700 text-slate-200 hover:scale-110 hover:border-rose-400'
                      }`}
                    >
                      <MapPin className="w-4 h-4 text-rose-400" />
                      <span className="text-[10px] font-bold max-w-[90px] truncate">{item.title}</span>
                    </button>
                  </div>
                );
              })}

              {/* Selected Marker Detail Card Float */}
              {selectedMapItem && (
                <div className="absolute bottom-6 left-6 z-40 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-3xl p-4 shadow-2xl space-y-3 animate-fadeIn text-slate-200">
                  <div className="flex items-start justify-between gap-3">
                    <img
                      src={selectedMapItem.image}
                      alt={selectedMapItem.title}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-slate-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-rose-400 uppercase">{selectedMapItem.category}</span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {selectedMapItem.rating}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white truncate mt-0.5">{selectedMapItem.title}</h4>
                      <p className="text-xs text-slate-400 truncate">{selectedMapItem.location || currentCity}</p>
                    </div>
                    <button
                      onClick={() => setSelectedMapItem(null)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="font-black text-white">
                      ₹{selectedMapItem.priceFrom || 250}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMapItem.latitude || 23.688},${selectedMapItem.longitude || 86.966}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1"
                        title="Get Turn-by-Turn Directions"
                      >
                        <Navigation className="w-3 h-3 text-cyan-400" />
                        <span>Navigate</span>
                      </a>
                      <button
                        onClick={() => handleItemClick(selectedMapItem)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Grid View */}
        {viewMode === 'grid' && (
          loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-slate-900/50 border border-slate-800 rounded-2xl h-80 animate-pulse"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            /* Empty State */
            <div className="py-16 px-4 text-center bg-[#0f172a]/40 border border-slate-800/80 rounded-3xl space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-rose-600/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 mx-auto">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">No items found within {radius} km</h3>
              <p className="text-xs text-slate-400">
                We couldn't find any live inventory matching your criteria in this exact radius. Try expanding your search radius or switching categories.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setRadius(25)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors shadow-md"
                >
                  Expand Radius to 25 km
                </button>
                <button
                  onClick={() => setCategory('ALL')}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors"
                >
                  Show All Categories
                </button>
              </div>
            </div>
          ) : (
            /* Inventory Items Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => {
                const badge = getCategoryBadge(item.category);
                const isAvailable = item.availability === 'AVAILABLE' || item.availability === 'LIMITED';

                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="group bg-[#0b1329] border border-slate-800/90 hover:border-rose-500/40 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-rose-950/20 transition-all duration-300 flex flex-col cursor-pointer"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1329] via-transparent to-transparent opacity-80" />

                      {/* Category Badge */}
                      <span
                        className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${badge.color}`}
                      >
                        {badge.label}
                      </span>

                      {/* Distance Tag */}
                      {item.distanceKm !== undefined && item.distanceKm !== null && (
                        <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold text-white flex items-center gap-1 shadow-md">
                          <MapPin className="w-3 h-3 text-rose-500" />
                          <span>{item.distanceKm} km away</span>
                        </span>
                      )}

                      {/* Rating Badge */}
                      {item.rating && (
                        <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-amber-500/30 px-2 py-1 rounded-lg text-[11px] font-bold text-amber-300 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{item.rating.toFixed(1)}</span>
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-rose-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {item.description}
                        </p>
                      </div>

                      {/* Location & Availability Footer */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 truncate max-w-[160px]">
                            📍 {item.location || item.city || currentCity}
                          </span>
                          <span
                            className={`font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                              isAvailable
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {isAvailable ? 'Available' : 'Sold Out'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Starting From</span>
                            <span className="text-sm font-black text-rose-400">
                              ₹{item.priceFrom?.toLocaleString('en-IN') || 250}
                            </span>
                          </div>

                          <span className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 group-hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-md">
                            <span>Book</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && viewMode === 'grid' && (
          <div className="flex items-center justify-center gap-2 pt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-400 px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl">
              Page <strong className="text-white">{page}</strong> of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

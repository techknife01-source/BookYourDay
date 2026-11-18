import React, { useState } from 'react';
import { MapPin, Search, Check, Navigation, X, AlertCircle } from 'lucide-react';
import { BookingService } from '../../services/bookingService';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: string;
  onSelectCity: (city: string) => void;
}

interface CityInfo {
  name: string;
  state: string;
  lat: number;
  lng: number;
  isPopular?: boolean;
}

const INDIAN_CITIES: CityInfo[] = [
  { name: 'Asansol', state: 'West Bengal', lat: 23.6880, lng: 86.9661, isPopular: true },
  { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, isPopular: true },
  { name: 'Mumbai', state: 'Maharashtra', lat: 18.9953, lng: 72.8242, isPopular: true },
  { name: 'Delhi NCR', state: 'Delhi', lat: 28.6139, lng: 77.2090, isPopular: true },
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.9716, lng: 77.5946, isPopular: true },
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, isPopular: true },
  { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, isPopular: true },
  { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, isPopular: true },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, isPopular: false },
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, isPopular: false },
  { name: 'Chandigarh', state: 'Punjab', lat: 30.7333, lng: 76.7794, isPopular: false },
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, isPopular: false },
  { name: 'Bhubaneswar', state: 'Odisha', lat: 20.2961, lng: 85.8245, isPopular: false },
  { name: 'Durgapur', state: 'West Bengal', lat: 23.5204, lng: 87.3119, isPopular: false },
  { name: 'Siliguri', state: 'West Bengal', lat: 26.7271, lng: 88.3953, isPopular: false },
  { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, isPopular: false }
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  onSelectCity
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCities = INDIAN_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (cityName: string, coords?: { lat: number; lng: number }) => {
    BookingService.setSavedCity(cityName);
    if (coords) {
      localStorage.setItem('byd_user_coords', JSON.stringify(coords));
    } else {
      const found = INDIAN_CITIES.find((c) => c.name.toLowerCase() === cityName.toLowerCase());
      if (found) {
        localStorage.setItem('byd_user_coords', JSON.stringify({ lat: found.lat, lng: found.lng }));
      }
    }
    onSelectCity(cityName);
    onClose();
  };

  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleAutoDetect = () => {
    setIsDetecting(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setIsDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetecting(false);
        const { latitude, longitude } = pos.coords;

        // Find nearest Indian city from list
        let nearest = INDIAN_CITIES[0];
        let minDist = Infinity;
        for (const city of INDIAN_CITIES) {
          const d = getDistanceKm(latitude, longitude, city.lat, city.lng);
          if (d < minDist) {
            minDist = d;
            nearest = city;
          }
        }

        handleSelect(nearest.name, { lat: latitude, lng: longitude });
      },
      (err) => {
        setIsDetecting(false);
        console.warn('Geolocation permission error:', err);
        setErrorMsg('Location access was denied or timed out. Please pick your city from the list.');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600/20 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white leading-tight">Select Your City</h3>
              <p className="text-xs text-slate-400">Discover shows, events & bookings tailored to your city</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Auto Detect */}
        <div className="p-6 space-y-4 border-b border-slate-800/60 bg-slate-900/30">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your city or state (e.g. Kolkata, Mumbai, Asansol)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 rounded-xl text-rose-400 font-semibold text-sm transition-all"
          >
            <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Detecting GPS Location...' : 'Use Current GPS Location'}</span>
          </button>

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Popular Cities Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!searchQuery && (
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Top Metros & Popular Cities
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {INDIAN_CITIES.filter((c) => c.isPopular).map((city) => {
                  const isSelected = currentCity.toLowerCase() === city.name.toLowerCase();
                  return (
                    <button
                      key={city.name}
                      onClick={() => handleSelect(city.name, { lat: city.lat, lng: city.lng })}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-rose-600/20 border-rose-500 text-white shadow-md shadow-rose-900/30'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-sm block">{city.name}</span>
                        <span className="text-[10px] text-slate-400 block">{city.state}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-rose-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Cities List */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              {searchQuery ? `Search Results (${filteredCities.length})` : 'All Available Cities'}
            </span>
            <div className="space-y-1.5">
              {filteredCities.map((city) => {
                const isSelected = currentCity.toLowerCase() === city.name.toLowerCase();
                return (
                  <button
                    key={city.name}
                    onClick={() => handleSelect(city.name, { lat: city.lat, lng: city.lng })}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-colors ${
                      isSelected
                        ? 'bg-rose-600/10 text-rose-400 font-bold'
                        : 'hover:bg-slate-900 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <span className="text-sm font-semibold">{city.name}</span>
                      <span className="text-xs text-slate-500 ml-2 font-normal">({city.state})</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-rose-500" />}
                  </button>
                );
              })}

              {filteredCities.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No cities found matching "{searchQuery}".
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

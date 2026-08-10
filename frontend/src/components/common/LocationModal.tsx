import React, { useState } from 'react';
import { MapPin, Search, Check, Navigation, X } from 'lucide-react';
import { CITIES } from '../../data/mockData';
import { BookingService } from '../../services/bookingService';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: string;
  onSelectCity: (city: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  onSelectCity
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isOpen) return null;

  const filteredCities = CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.state && c.state.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (cityName: string) => {
    BookingService.setSavedCity(cityName);
    onSelectCity(cityName);
    onClose();
  };

  const handleAutoDetect = () => {
    setIsDetecting(true);
    setTimeout(() => {
      setIsDetecting(false);
      handleSelect('Asansol');
    }, 800);
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
              <p className="text-xs text-slate-400">Personalize shows, events & bookings near you</p>
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
              placeholder="Search your city or state..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </div>

          <button
            onClick={handleAutoDetect}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 rounded-xl text-rose-400 font-semibold text-sm transition-all"
          >
            <Navigation className={`w-4 h-4 ${isDetecting ? 'animate-spin' : ''}`} />
            <span>{isDetecting ? 'Detecting Location...' : 'Use Current Location'}</span>
          </button>
        </div>

        {/* Popular Cities Grid */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {!searchQuery && (
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Popular Cities
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CITIES.filter((c) => c.isPopular).map((city) => {
                  const isSelected = currentCity === city.name;
                  return (
                    <button
                      key={city.id}
                      onClick={() => handleSelect(city.name)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/30'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="truncate">{city.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Cities List */}
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
              {searchQuery ? 'Search Results' : 'All Cities'}
            </span>
            <div className="space-y-1">
              {filteredCities.map((city) => {
                const isSelected = currentCity === city.name;
                return (
                  <button
                    key={city.id}
                    onClick={() => handleSelect(city.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-rose-600/20 text-rose-400 border border-rose-500/30 font-bold'
                        : 'text-slate-300 hover:bg-slate-900/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {city.name}
                        {city.state ? `, ${city.state}` : ''} ({city.country})
                      </span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-rose-400" />}
                  </button>
                );
              })}
              {filteredCities.length === 0 && (
                <p className="text-xs text-slate-500 py-4 text-center">No cities found matching "{searchQuery}"</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

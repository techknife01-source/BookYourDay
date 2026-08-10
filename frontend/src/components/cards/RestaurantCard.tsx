import React, { useState } from 'react';
import { Heart, Utensils, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Restaurant } from '../../types';
import { BookingService } from '../../services/bookingService';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const [isWishlisted, setIsWishlisted] = useState(() =>
    BookingService.isInWishlist(restaurant.id)
  );

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = BookingService.toggleWishlist(restaurant.id, 'dining');
    setIsWishlisted(added);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden group hover:border-slate-700 transition-all flex flex-col h-full shadow-lg relative">
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

        <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
          <Utensils className="w-3 h-3" />
          {restaurant.priceRange}
        </div>

        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all z-10"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-slate-700 text-emerald-400 font-extrabold text-xs flex items-center gap-1">
          <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
          <span>{restaurant.rating}</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">
            {restaurant.cuisine.join(', ')}
          </span>
          <h3 className="font-bold text-base text-white leading-tight truncate group-hover:text-emerald-400 transition-colors">
            {restaurant.name}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{restaurant.address}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">FOR TWO</span>
            <span className="text-sm font-extrabold text-white">₹{restaurant.priceForTwo}</span>
          </div>
          <Link
            to={`/dining/${restaurant.id}`}
            className="py-2 px-3.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-bold text-xs rounded-xl border border-emerald-500/30 transition-all"
          >
            Reserve Table
          </Link>
        </div>
      </div>
    </div>
  );
};

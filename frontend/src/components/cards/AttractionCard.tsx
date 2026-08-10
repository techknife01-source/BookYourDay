import React, { useState } from 'react';
import { Heart, Star, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Attraction } from '../../types';
import { BookingService } from '../../services/bookingService';

interface AttractionCardProps {
  attraction: Attraction;
}

export const AttractionCard: React.FC<AttractionCardProps> = ({ attraction }) => {
  const [isWishlisted, setIsWishlisted] = useState(() =>
    BookingService.isInWishlist(attraction.id)
  );

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = BookingService.toggleWishlist(attraction.id, 'attractions');
    setIsWishlisted(added);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden group hover:border-slate-700 transition-all flex flex-col h-full shadow-lg relative">
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
        <img
          src={attraction.image}
          alt={attraction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

        <div className="absolute top-3 left-3 bg-cyan-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
          <Compass className="w-3 h-3" />
          {attraction.category}
        </div>

        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all z-10"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-1 mb-1 text-cyan-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-cyan-400" />
            <span>{attraction.rating}</span>
            <span className="text-slate-500 text-[10px]">({attraction.reviewsCount})</span>
          </div>
          <h3 className="font-bold text-base text-white leading-tight truncate group-hover:text-cyan-400 transition-colors">
            {attraction.title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 truncate">{attraction.highlights[0]}</p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">ENTRY PASS</span>
            <span className="text-sm font-extrabold text-white">₹{attraction.adultPrice}</span>
          </div>
          <Link
            to={`/attractions/${attraction.id}`}
            className="py-2 px-3.5 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white font-bold text-xs rounded-xl border border-cyan-500/30 transition-all"
          >
            Pass Options
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Heart, MapPin, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SportsEvent } from '../../types';
import { BookingService } from '../../services/bookingService';

interface SportsCardProps {
  sportsEvent: SportsEvent;
}

export const SportsCard: React.FC<SportsCardProps> = ({ sportsEvent }) => {
  const [isWishlisted, setIsWishlisted] = useState(() =>
    BookingService.isInWishlist(sportsEvent.id)
  );

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = BookingService.toggleWishlist(sportsEvent.id, 'sports');
    setIsWishlisted(added);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden group hover:border-slate-700 transition-all flex flex-col h-full shadow-lg relative">
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
        <img
          src={sportsEvent.image}
          alt={sportsEvent.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

        <div className="absolute top-3 left-3 bg-indigo-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          {sportsEvent.sport}
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
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">
            {sportsEvent.tournament}
          </span>
          <h3 className="font-bold text-base text-white leading-tight truncate group-hover:text-indigo-400 transition-colors">
            {sportsEvent.title}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{sportsEvent.venue}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">{sportsEvent.date} • {sportsEvent.time}</p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">TICKETS FROM</span>
            <span className="text-sm font-extrabold text-white">₹{sportsEvent.startingPrice}</span>
          </div>
          <Link
            to={`/sports/${sportsEvent.id}`}
            className="py-2 px-3.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs rounded-xl border border-indigo-500/30 transition-all"
          >
            Book Seats
          </Link>
        </div>
      </div>
    </div>
  );
};

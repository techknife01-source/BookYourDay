import React, { useState } from 'react';
import { Calendar, Heart, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EventItem } from '../../types';
import { BookingService } from '../../services/bookingService';

interface EventCardProps {
  eventItem: EventItem;
}

export const EventCard: React.FC<EventCardProps> = ({ eventItem }) => {
  const [isWishlisted, setIsWishlisted] = useState(() =>
    BookingService.isInWishlist(eventItem.id)
  );

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = BookingService.toggleWishlist(eventItem.id, 'events');
    setIsWishlisted(added);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden group hover:border-slate-700 transition-all flex flex-col h-full shadow-lg hover:shadow-2xl relative">
      <div className="relative h-48 sm:h-52 overflow-hidden bg-slate-950">
        <img
          src={eventItem.image}
          alt={eventItem.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20" />

        {/* Date Pill Tag */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-950 font-black text-center rounded-xl p-1.5 min-w-[42px] shadow-lg">
          <div className="text-[10px] uppercase font-bold leading-none text-rose-600">
            {eventItem.date.split(' ')[1] || 'AUG'}
          </div>
          <div className="text-base font-black leading-none mt-0.5">
            {eventItem.date.split(' ')[2] || '24'}
          </div>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all z-10"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest block mb-1">
            {eventItem.category}
          </span>
          <h3 className="font-bold text-base text-white leading-tight truncate group-hover:text-teal-400 transition-colors">
            {eventItem.title}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{eventItem.venue}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">STARTING FROM</span>
            <span className="text-sm font-extrabold text-white">₹{eventItem.startingPrice}</span>
          </div>
          <Link
            to={`/events/${eventItem.id}`}
            className="py-2 px-3.5 bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white font-bold text-xs rounded-xl border border-teal-500/30 transition-all"
          >
            Get Tickets
          </Link>
        </div>
      </div>
    </div>
  );
};

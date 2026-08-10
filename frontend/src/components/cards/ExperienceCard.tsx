import React, { useState } from 'react';
import { Heart, Sparkles, Clock, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Experience } from '../../types';
import { BookingService } from '../../services/bookingService';

interface ExperienceCardProps {
  experience: Experience;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience }) => {
  const [isWishlisted, setIsWishlisted] = useState(() =>
    BookingService.isInWishlist(experience.id)
  );

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = BookingService.toggleWishlist(experience.id, 'experiences');
    setIsWishlisted(added);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden group hover:border-slate-700 transition-all flex flex-col h-full shadow-lg relative">
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-950">
        <img
          src={experience.image}
          alt={experience.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/30" />

        <div className="absolute top-3 left-3 bg-amber-600/90 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {experience.category}
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
          <h3 className="font-bold text-base text-white leading-tight truncate group-hover:text-amber-400 transition-colors">
            {experience.title}
          </h3>
          <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{experience.duration}</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">{experience.timeSlots.length} Slots Today</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold block">PER PERSON</span>
            <span className="text-sm font-extrabold text-white">₹{experience.pricePerPerson}</span>
          </div>
          <Link
            to={`/experiences/${experience.id}`}
            className="py-2 px-3.5 bg-amber-600/20 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs rounded-xl border border-amber-500/30 transition-all"
          >
            Select Slot
          </Link>
        </div>
      </div>
    </div>
  );
};

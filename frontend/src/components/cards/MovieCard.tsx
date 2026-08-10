import React, { useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Movie } from '../../types';
import { BookingService } from '../../services/bookingService';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [isWishlisted, setIsWishlisted] = useState(() =>
    BookingService.isInWishlist(movie.id)
  );

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = BookingService.toggleWishlist(movie.id, 'movies');
    setIsWishlisted(added);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden group hover:border-slate-700 transition-all flex flex-col h-full shadow-lg hover:shadow-2xl hover:shadow-black/60 relative">
      <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-950">
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/20" />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-slate-950/70 backdrop-blur-md border border-slate-700 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-all z-10"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2 z-10">
          <span className="bg-rose-600/90 text-white text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-md">
            <Star className="w-3 h-3 fill-white" />
            {movie.rating.toFixed(1)}
          </span>
          <span className="bg-black/60 backdrop-blur-md text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-lg">
            {movie.format[0]}
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block mb-1">
            {movie.genre.slice(0, 2).join(' • ')}
          </span>
          <h3 className="font-bold text-base text-white leading-tight truncate group-hover:text-rose-400 transition-colors">
            {movie.title}
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            {movie.language.join(', ')} • {movie.duration}
          </p>
        </div>

        <Link
          to={`/movies/${movie.id}`}
          className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all text-center border border-slate-700 hover:border-rose-500 shadow-sm"
        >
          Book Shows
        </Link>
      </div>
    </div>
  );
};

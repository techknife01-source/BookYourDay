import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  votesCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingStars: React.FC<RatingStarsProps> = ({ rating, votesCount, size = 'sm' }) => {
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md font-extrabold text-xs">
        <Star className={`${iconSizes[size]} fill-rose-500 text-rose-500`} />
        <span>{rating.toFixed(1)}</span>
      </div>
      {votesCount !== undefined && (
        <span className="text-slate-400 text-xs font-medium">
          ({votesCount > 1000 ? `${(votesCount / 1000).toFixed(1)}k` : votesCount} votes)
        </span>
      )}
    </div>
  );
};

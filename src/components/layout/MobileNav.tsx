import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Ticket, Heart, User } from 'lucide-react';
import { BookingService } from '../../services/bookingService';

export const MobileNav: React.FC = () => {
  const location = useLocation();
  const wishlistCount = BookingService.getWishlist().length;

  const items = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Explore', path: '/movies', icon: Compass },
    { label: 'Tickets', path: '/tickets', icon: Ticket },
    { label: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
    { label: 'Profile', path: '/profile', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#020617]/95 backdrop-blur-xl border-t border-slate-800 xl:hidden py-2 px-4 shadow-2xl">
      <div className="flex items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 relative ${
                isActive ? 'text-rose-500 font-extrabold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-rose-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

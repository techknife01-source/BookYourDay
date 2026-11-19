import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, MapPin, Heart, Ticket, User, Bell, Tag, ShieldCheck, Sparkles, Menu, X, LogIn, LogOut } from 'lucide-react';
import { BookingService } from '../../services/bookingService';
import { AuthModal } from '../common/AuthModal';

interface NavbarProps {
  currentCity: string;
  onOpenLocationModal: () => void;
  onOpenSearchModal: () => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCity,
  onOpenLocationModal,
  onOpenSearchModal,
  onOpenNotifications
}) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const syncUserFromStorage = () => {
    try {
      const stored = localStorage.getItem('byd_user') || localStorage.getItem('user');
      if (stored && stored !== 'undefined' && stored !== 'null') {
        setCurrentUser(JSON.parse(stored));
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  };

  useEffect(() => {
    syncUserFromStorage();
    window.addEventListener('byd_auth_change', syncUserFromStorage);
    window.addEventListener('storage', syncUserFromStorage);
    return () => {
      window.removeEventListener('byd_auth_change', syncUserFromStorage);
      window.removeEventListener('storage', syncUserFromStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('byd_auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('byd_user');
    localStorage.removeItem('user');
    setCurrentUser(null);
    window.dispatchEvent(new Event('byd_auth_change'));
    window.dispatchEvent(new Event('storage'));
    window.location.reload();
  };

  const wishlistCount = BookingService.getWishlist().length;
  const unreadNotifsCount = BookingService.getNotifications().filter((n) => !n.isRead).length;

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'AI Planner ✨', path: '/planner' },
    { label: 'Nearby 📍', path: '/nearby' },
    { label: 'Movies', path: '/movies' },
    { label: 'Events', path: '/events' },
    { label: 'Sports', path: '/sports' },
    { label: 'Parks', path: '/attractions' },
    { label: 'Play', path: '/experiences' },
    { label: 'Dining', path: '/dining' },
    { label: 'Travel', path: '/travel' },
    { label: 'Offers', path: '/offers' }
  ];

  return (
    <nav className="sticky top-0 z-40 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-900/40 group-hover:scale-105 transition-transform">
                <div className="w-5 h-5 border-2 border-white rounded-sm flex items-center justify-center relative">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg tracking-tight text-white group-hover:text-rose-400 transition-colors">
                  BOOK YOUR DAY
                </span>
                <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase -mt-1 hidden sm:block">
                  DISCOVER • BOOK • ENJOY
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center gap-5 text-xs font-semibold text-slate-400">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`transition-colors py-1 ${
                      isActive
                        ? 'text-white font-extrabold border-b-2 border-rose-600'
                        : 'hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearchModal}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-full text-xs text-slate-400 hover:text-white transition-all shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Search shows, events...</span>
            </button>

            {/* City Location Button */}
            <button
              onClick={onOpenLocationModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-rose-500/50 rounded-full text-xs font-semibold text-slate-200 transition-all"
            >
              <span className="text-rose-500">📍</span>
              <span className="uppercase text-[11px] font-bold tracking-wider max-w-[80px] sm:max-w-none truncate">
                {currentCity}
              </span>
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="relative w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Notifications Trigger */}
            <button
              onClick={onOpenNotifications}
              className="relative w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-all"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              )}
            </button>

            {/* User Profile / Tickets */}
            <Link
              to="/tickets"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-600/10 border border-rose-500/30 rounded-full text-xs font-bold text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>My Tickets</span>
            </Link>

            {/* Auth / Profile Actions */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-bold text-slate-200 hover:border-slate-500 transition-all"
                  title="Profile & Settings"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center text-white text-[10px]">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[80px] truncate">{currentUser.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-rose-400"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-full shadow-lg shadow-rose-900/30 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0b1329] border-b border-slate-800 p-4 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-rose-400 font-semibold"
            >
              Admin Portal
            </Link>
            <Link
              to="/partner"
              onClick={() => setMobileMenuOpen(false)}
              className="text-slate-400 hover:text-teal-400 font-semibold"
            >
              Partner Portal
            </Link>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setCurrentUser(u)}
      />
    </nav>
  );
};

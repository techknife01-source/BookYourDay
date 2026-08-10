import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Ticket, Calendar, Award, PhoneCall } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-20 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Why Book Your Day Trust Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Instant E-Tickets</h4>
              <p className="text-[11px] text-slate-500">QR Code access to venue</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">100% Safe Payments</h4>
              <p className="text-[11px] text-slate-500">256-bit encrypted checkout</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Easy Cancellation</h4>
              <p className="text-[11px] text-slate-500">Hassle-free instant refund</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">Verified Venues</h4>
              <p className="text-[11px] text-slate-500">Authorized ticketing partner</p>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 text-xs">
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-sm" />
              </div>
              <span className="font-black text-lg text-white">BOOK YOUR DAY</span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-sm">
              The next-generation ticketing & reservation platform. Discover movies, live music festivals, sports matches, theme parks, escape rooms, and dining reservations—all in one place.
            </p>
            <p className="text-[11px] text-slate-500">
              Tagline: <strong className="text-slate-300">Everything worth booking, in one place.</strong>
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-white uppercase tracking-wider block">Entertainment</span>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/movies" className="hover:text-white transition-colors">Movies</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Events & Concerts</Link></li>
              <li><Link to="/sports" className="hover:text-white transition-colors">Sports Matches</Link></li>
              <li><Link to="/attractions" className="hover:text-white transition-colors">Theme Parks</Link></li>
              <li><Link to="/experiences" className="hover:text-white transition-colors">VR & Escape Rooms</Link></li>
              <li><Link to="/dining" className="hover:text-white transition-colors">Dining Reservations</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-white uppercase tracking-wider block">Offers & Deals</span>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/offers" className="hover:text-white transition-colors">Bank Offers</Link></li>
              <li><Link to="/offers" className="hover:text-white transition-colors">Promo Coupons</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">BOOK YOUR DAY+</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition-colors">Saved Wishlist</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-white uppercase tracking-wider block">Portals</span>
            <ul className="space-y-2 text-slate-400">
              <li><Link to="/admin" className="hover:text-rose-400 transition-colors">Admin Portal</Link></li>
              <li><Link to="/partner" className="hover:text-teal-400 transition-colors">Partner / Venue Portal</Link></li>
              <li><Link to="/tickets" className="hover:text-white transition-colors">My Tickets</Link></li>
              <li><Link to="/profile" className="hover:text-white transition-colors">User Profile</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between text-[11px] text-slate-500 gap-4">
          <p>© 2026 BOOK YOUR DAY Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#support" className="hover:text-white transition-colors">Support Center</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useEffect, useState } from 'react';
import { catalogApi } from '../api/catalogApi';
import { RestaurantCard } from '../components/cards/RestaurantCard';
import { Utensils, Loader2 } from 'lucide-react';
import { CheckoutModal } from '../components/booking/CheckoutModal';
import { DigitalTicketModal } from '../components/booking/DigitalTicketModal';
import { Booking, Restaurant } from '../types';
import { calculatePrice } from '../utils/pricing';

export const DiningPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);
  const [reservationTime, setReservationTime] = useState('08:00 PM');
  const [guestCount, setGuestCount] = useState(2);
  const [reservationDate, setReservationDate] = useState('Tonight, 10 Aug');

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [digitalTicketOpen, setDigitalTicketOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchDining() {
      setLoading(true);
      try {
        const items = await catalogApi.getByCategory('dining');
        if (!mounted) return;
        const restList: Restaurant[] = items.map((item) => ({
          id: item.id,
          name: item.title,
          cuisine: item.metadata?.cuisine || ['Fine Dining', 'Multi-Cuisine'],
          image: item.image,
          rating: item.rating || 4.6,
          reviewsCount: item.reviewCount || 1200,
          priceForTwo: item.priceFrom ? item.priceFrom * 2 : 1200,
          priceRange: '$$$',
          openingHours: item.metadata?.timings || '11:00 AM - 11:00 PM',
          description: item.description || 'Exquisite dining experience.',
          city: item.city || 'Asansol',
          address: item.location || 'City Center',
          availableSlots: item.metadata?.availableSlots || ['07:00 PM', '08:00 PM', '09:00 PM'],
          menuHighlights: item.metadata?.menuHighlights || ['Chef Special']
        }));
        setRestaurants(restList);
      } catch (err) {
        console.error('Dining load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchDining();
    return () => { mounted = false; };
  }, []);

  // Table reservation cover deposit = ₹150 per guest
  const priceBreakdown = calculatePrice(150, guestCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold">
          <Utensils className="w-3.5 h-3.5" />
          <span>RESTAURANT RESERVATIONS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Dining & Table Reservations</h1>
        <p className="text-slate-400 text-sm">Fine dining, rooftop lounges, wood-fired bistros & chef's specials</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Restaurants from Database...</span>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-2">
          <h3 className="text-lg font-bold text-white">No Restaurants Found</h3>
          <p className="text-xs text-slate-400">Check back later for newly added dining venues.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {restaurants.map((r) => (
            <div key={r.id} className="flex flex-col">
              <RestaurantCard restaurant={r} />
              <button
                onClick={() => setSelectedRest(r)}
                className="mt-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Reserve Table
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reservation Drawer Modal */}
      {selectedRest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-white">{selectedRest.name}</h3>
                <p className="text-xs text-slate-400">{selectedRest.cuisine.join(' • ')}</p>
              </div>
              <button onClick={() => setSelectedRest(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Date & Party Size */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Reservation Date</label>
                <select
                  value={reservationDate}
                  onChange={(e) => setReservationDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="Tonight, 10 Aug">Tonight, 10 Aug</option>
                  <option value="Tomorrow, 11 Aug">Tomorrow, 11 Aug</option>
                  <option value="Wed, 12 Aug">Wed, 12 Aug</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-slate-300 block mb-1">Guests / Table Size</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value={2}>2 Guests (Cozy Table)</option>
                  <option value={4}>4 Guests (Standard Table)</option>
                  <option value={6}>6 Guests (Family Table)</option>
                  <option value={8}>8 Guests (VIP Lounge)</option>
                </select>
              </div>
            </div>

            {/* Time Slot Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Select Table Slot</label>
              <div className="flex items-center gap-2 overflow-x-auto">
                {selectedRest.availableSlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setReservationTime(time)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      reservationTime === time
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-emerald-400 block">Menu Highlights</span>
              <p className="text-[11px] text-slate-400">{selectedRest.menuHighlights.join(' • ')}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">TABLE COVER DEPOSIT</span>
                <span className="text-xl font-black text-emerald-400">₹{priceBreakdown.grandTotal}</span>
              </div>
              <button
                onClick={() => setCheckoutOpen(true)}
                className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-lg"
              >
                Confirm Table Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && selectedRest && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            setSelectedRest(null);
          }}
          category="dining"
          itemTitle={selectedRest.name}
          itemImage={selectedRest.image}
          venueOrCinema={selectedRest.address}
          city={selectedRest.city}
          date={reservationDate}
          time={reservationTime}
          seatsOrDetails={`Table for ${guestCount} Guests`}
          quantity={guestCount}
          initialPriceBreakdown={priceBreakdown}
          onBookingSuccess={(booking) => {
            setCompletedBooking(booking);
            setDigitalTicketOpen(true);
          }}
        />
      )}

      <DigitalTicketModal
        isOpen={digitalTicketOpen}
        onClose={() => setDigitalTicketOpen(false)}
        booking={completedBooking}
      />
    </div>
  );
};

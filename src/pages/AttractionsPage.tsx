import React, { useEffect, useState } from 'react';
import { catalogApi } from '../api/catalogApi';
import { AttractionCard } from '../components/cards/AttractionCard';
import { Compass, Loader2 } from 'lucide-react';
import { CheckoutModal } from '../components/booking/CheckoutModal';
import { DigitalTicketModal } from '../components/booking/DigitalTicketModal';
import { Booking, Attraction } from '../types';
import { calculatePrice } from '../utils/pricing';

export const AttractionsPage: React.FC = () => {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(1);
  const [selectedDate, setSelectedDate] = useState('Tomorrow, 11 Aug');

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [digitalTicketOpen, setDigitalTicketOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchAttractions() {
      setLoading(true);
      try {
        const items = await catalogApi.getByCategory('attractions');
        if (!mounted) return;
        const attrList: Attraction[] = items.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.metadata?.attractionCategory || 'Theme Park',
          image: item.image,
          city: item.city || 'Asansol',
          rating: item.rating || 4.7,
          reviewsCount: item.reviewCount || 3500,
          adultPrice: item.priceFrom || 899,
          childPrice: Math.round((item.priceFrom || 899) * 0.6),
          openingHours: item.metadata?.timings || '10:00 AM - 07:00 PM',
          description: item.description,
          highlights: item.metadata?.inclusions || ['Entry Ticket', 'Rides Included']
        }));
        setAttractions(attrList);
      } catch (err) {
        console.error('Attractions load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAttractions();
    return () => { mounted = false; };
  }, []);

  const handleOpenBooking = (attraction: Attraction) => {
    setSelectedAttraction(attraction);
  };

  const activeCost = selectedAttraction
    ? selectedAttraction.adultPrice * adultCount + selectedAttraction.childPrice * childCount
    : 0;

  const priceBreakdown = calculatePrice(activeCost / Math.max(1, adultCount + childCount), adultCount + childCount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>FAMILY DESTINATIONS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Attractions & Theme Parks</h1>
        <p className="text-slate-400 text-sm">Amusement parks, water slides, aquariums, zoos & museums</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Attractions from Database...</span>
        </div>
      ) : attractions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-2">
          <h3 className="text-lg font-bold text-white">No Attractions Found</h3>
          <p className="text-xs text-slate-400">Check back later for newly added amusement parks & landmarks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attraction) => (
            <div key={attraction.id} className="flex flex-col">
              <AttractionCard attraction={attraction} />
              <button
                onClick={() => handleOpenBooking(attraction)}
                className="mt-3 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Book Entry Pass
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Booking Drawer Modal for Attractions */}
      {selectedAttraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-lg text-white">{selectedAttraction.title}</h3>
              <button
                onClick={() => setSelectedAttraction(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Date Picker */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Visit Date</label>
              <div className="flex gap-2 overflow-x-auto">
                {['Today, 10 Aug', 'Tomorrow, 11 Aug', 'Wed, 12 Aug', 'Thu, 13 Aug'].map((dt) => (
                  <button
                    key={dt}
                    onClick={() => setSelectedDate(dt)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold ${
                      selectedDate === dt
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {dt}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Counter */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-white block">Adult Pass (₹{selectedAttraction.adultPrice})</span>
                  <span className="text-[10px] text-slate-500">Age 12+ years</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                    className="w-7 h-7 bg-slate-800 text-white rounded-lg font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-white w-4 text-center">{adultCount}</span>
                  <button
                    onClick={() => setAdultCount(adultCount + 1)}
                    className="w-7 h-7 bg-slate-800 text-white rounded-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="font-bold text-white block">Child Pass (₹{selectedAttraction.childPrice})</span>
                  <span className="text-[10px] text-slate-500">Age 3-11 years</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                    className="w-7 h-7 bg-slate-800 text-white rounded-lg font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-white w-4 text-center">{childCount}</span>
                  <button
                    onClick={() => setChildCount(childCount + 1)}
                    className="w-7 h-7 bg-slate-800 text-white rounded-lg font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">TOTAL AMOUNT</span>
                <span className="text-xl font-black text-cyan-400">₹{priceBreakdown.grandTotal}</span>
              </div>
              <button
                onClick={() => {
                  setCheckoutOpen(true);
                }}
                className="py-3 px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs rounded-xl shadow-lg"
              >
                Continue to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && selectedAttraction && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            setSelectedAttraction(null);
          }}
          category="attractions"
          itemTitle={selectedAttraction.title}
          itemImage={selectedAttraction.image}
          venueOrCinema={selectedAttraction.title}
          city={selectedAttraction.city}
          date={selectedDate}
          time={selectedAttraction.openingHours}
          seatsOrDetails={`${adultCount} Adult + ${childCount} Child Pass(es)`}
          quantity={adultCount + childCount}
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

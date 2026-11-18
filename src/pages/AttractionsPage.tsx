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
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(1);
  const [selectedDate, setSelectedDate] = useState('Tomorrow, 11 Aug');

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [digitalTicketOpen, setDigitalTicketOpen] = useState(false);

  const parkTabs = [
    { id: 'all', label: 'All Parks & Landmarks' },
    { id: 'water', label: 'Water Parks' },
    { id: 'zoo', label: 'Zoo & Sanctuaries' },
    { id: 'amusement', label: 'Amusement Parks' },
    { id: 'theme', label: 'Theme Parks' },
    { id: 'adventure', label: 'Adventure Parks' },
    { id: 'nature', label: 'Nature Reserves' }
  ];

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
          category: item.metadata?.attractionCategory || item.metadata?.category || 'Theme Park',
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

  const filteredAttractions = attractions.filter((a) => {
    if (selectedCategory === 'all') return true;
    const cat = (a.category || '').toLowerCase();
    const title = (a.title || '').toLowerCase();
    if (selectedCategory === 'water') return cat.includes('water') || title.includes('aqua') || title.includes('water');
    if (selectedCategory === 'zoo') return cat.includes('zoo') || title.includes('zoo') || title.includes('safari');
    if (selectedCategory === 'amusement') return cat.includes('amusement') || title.includes('amusement');
    if (selectedCategory === 'theme') return cat.includes('theme') || title.includes('imagicaa');
    if (selectedCategory === 'adventure') return cat.includes('adventure') || title.includes('adventure') || title.includes('della');
    if (selectedCategory === 'nature') return cat.includes('nature') || title.includes('nature') || title.includes('eco');
    return true;
  });

  const activeCost = selectedAttraction
    ? selectedAttraction.adultPrice * adultCount + selectedAttraction.childPrice * childCount
    : 0;

  const priceBreakdown = calculatePrice(
    activeCost / Math.max(1, adultCount + childCount),
    adultCount + childCount
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-full text-xs font-bold">
          <Compass className="w-3.5 h-3.5" />
          <span>FAMILY DESTINATIONS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Attractions & Theme Parks</h1>
        <p className="text-slate-400 text-sm">Amusement parks, water slides, zoological sanctuaries, adventure & nature parks</p>
      </div>

      {/* Park Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
        {parkTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedCategory(t.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === t.id
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Attractions...</span>
        </div>
      ) : filteredAttractions.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-2">
          <h3 className="text-lg font-bold text-white">No Attractions Found</h3>
          <p className="text-xs text-slate-400">No destinations currently listed in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((attraction) => (
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

      {/* Booking Modal */}
      {selectedAttraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-200">
            <div>
              <h3 className="text-xl font-bold text-white">{selectedAttraction.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{selectedAttraction.openingHours} • {selectedAttraction.city}</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <span className="font-bold text-xs text-white block">Adults (₹{selectedAttraction.adultPrice})</span>
                  <span className="text-[10px] text-slate-500">Ages 12+</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-xs">{adultCount}</span>
                  <button
                    onClick={() => setAdultCount(adultCount + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800">
                <div>
                  <span className="font-bold text-xs text-white block">Children (₹{selectedAttraction.childPrice})</span>
                  <span className="text-[10px] text-slate-500">Ages 3-11</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setChildCount(Math.max(0, childCount - 1))}
                    className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-bold text-xs">{childCount}</span>
                  <button
                    onClick={() => setChildCount(childCount + 1)}
                    className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 font-bold text-xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">TOTAL</span>
                <span className="text-xl font-black text-cyan-400">₹{activeCost}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedAttraction(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setCheckoutOpen(true);
                  }}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg"
                >
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {selectedAttraction && priceBreakdown && (
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
          time="Full Day Access"
          seatsOrDetails={`${adultCount} Adults, ${childCount} Children`}
          quantity={adultCount + childCount}
          initialPriceBreakdown={priceBreakdown}
          onBookingSuccess={(b) => {
            setCompletedBooking(b);
            setDigitalTicketOpen(true);
            setCheckoutOpen(false);
            setSelectedAttraction(null);
          }}
        />
      )}

      {/* Digital Ticket Modal */}
      <DigitalTicketModal
        isOpen={digitalTicketOpen}
        onClose={() => setDigitalTicketOpen(false)}
        booking={completedBooking}
      />
    </div>
  );
};

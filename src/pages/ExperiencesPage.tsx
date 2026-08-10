import React, { useEffect, useState } from 'react';
import { catalogApi } from '../api/catalogApi';
import { ExperienceCard } from '../components/cards/ExperienceCard';
import { Sparkles, Loader2 } from 'lucide-react';
import { CheckoutModal } from '../components/booking/CheckoutModal';
import { DigitalTicketModal } from '../components/booking/DigitalTicketModal';
import { Booking, Experience } from '../types';
import { calculatePrice } from '../utils/pricing';

export const ExperiencesPage: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('03:30 PM');
  const [guestCount, setGuestCount] = useState<number>(2);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [digitalTicketOpen, setDigitalTicketOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function fetchExperiences() {
      setLoading(true);
      try {
        const items = await catalogApi.getByCategory('experiences');
        if (!mounted) return;
        const expList: Experience[] = items.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.metadata?.activityType || 'Indoor Play',
          image: item.image,
          rating: item.rating || 4.8,
          reviewsCount: item.reviewCount || 850,
          pricePerPerson: item.priceFrom || 499,
          duration: item.metadata?.duration || '1 Hour',
          city: item.city || 'Asansol',
          address: item.location || 'Mall Arena',
          timeSlots: (item.metadata?.timeSlots || ['02:00 PM', '04:00 PM', '06:00 PM']).map((t: string) => ({
            time: t,
            availableCapacity: 8
          })),
          highlights: item.metadata?.highlights || ['Equipment Provided']
        }));
        setExperiences(expList);
      } catch (err) {
        console.error('Experiences load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchExperiences();
    return () => { mounted = false; };
  }, []);

  const priceBreakdown = selectedExp
    ? calculatePrice(selectedExp.pricePerPerson, guestCount)
    : calculatePrice(0, 1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ACTIVITIES & ADVENTURE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Experiences & Play</h1>
        <p className="text-slate-400 text-sm">VR arenas, bowling lanes, escape rooms & cooking workshops</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Experiences from Database...</span>
        </div>
      ) : experiences.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-2">
          <h3 className="text-lg font-bold text-white">No Experiences Found</h3>
          <p className="text-xs text-slate-400">Check back later for new gaming & leisure activities.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp) => (
            <div key={exp.id} className="flex flex-col">
              <ExperienceCard experience={exp} />
              <button
                onClick={() => setSelectedExp(exp)}
                className="mt-3 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Select Time Slot
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Time Slot Picker Modal */}
      {selectedExp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-lg p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-white">{selectedExp.title}</h3>
                <p className="text-xs text-slate-400">{selectedExp.duration} Session</p>
              </div>
              <button onClick={() => setSelectedExp(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            {/* Time Slot Buttons */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Available Time Slots Today</label>
              <div className="grid grid-cols-2 gap-2">
                {selectedExp.timeSlots.map((slot) => {
                  const isAvailable = slot.availableCapacity > 0;
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        !isAvailable
                          ? 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
                          : isSelected
                          ? 'bg-amber-600 border-amber-500 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="font-bold text-xs block">{slot.time}</span>
                      <span className="text-[10px] opacity-80 block mt-0.5">
                        {isAvailable ? `${slot.availableCapacity} spots left` : 'SOLD OUT'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-white">Number of Players / Guests</span>
              <div className="flex items-center gap-2">
                {[1, 2, 4, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setGuestCount(num)}
                    className={`w-8 h-8 rounded-lg font-bold ${
                      guestCount === num ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">TOTAL COST</span>
                <span className="text-xl font-black text-amber-400">₹{priceBreakdown.grandTotal}</span>
              </div>
              <button
                onClick={() => setCheckoutOpen(true)}
                className="py-3 px-6 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs rounded-xl shadow-lg"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {checkoutOpen && selectedExp && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => {
            setCheckoutOpen(false);
            setSelectedExp(null);
          }}
          category="experiences"
          itemTitle={selectedExp.title}
          itemImage={selectedExp.image}
          venueOrCinema={selectedExp.address}
          city={selectedExp.city}
          date="Today, 10 Aug"
          time={selectedSlot}
          seatsOrDetails={`${guestCount} Player Pass(es)`}
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

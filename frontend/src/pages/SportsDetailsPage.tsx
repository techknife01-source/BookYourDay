import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin, ArrowLeft } from 'lucide-react';
import { MOCK_SPORTS } from '../data/mockData';
import { CheckoutModal } from '../components/booking/CheckoutModal';
import { DigitalTicketModal } from '../components/booking/DigitalTicketModal';
import { Booking } from '../types';
import { calculatePrice } from '../utils/pricing';

export const SportsDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const sportsEvent = MOCK_SPORTS.find((s) => s.id === id) || MOCK_SPORTS[0];

  const [selectedStandId, setSelectedStandId] = useState(sportsEvent.stands[0].id);
  const [seatCount, setSeatCount] = useState(2);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [digitalTicketOpen, setDigitalTicketOpen] = useState(false);

  const selectedStand = sportsEvent.stands.find((st) => st.id === selectedStandId) || sportsEvent.stands[0];
  const priceBreakdown = calculatePrice(selectedStand.price, seatCount);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Sports</span>
      </button>

      <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {sportsEvent.tournament}
          </span>
          <span className="text-xs font-bold text-slate-400">{sportsEvent.sport}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white">{sportsEvent.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
            <Calendar className="w-4 h-4" />
            {sportsEvent.date} • {sportsEvent.time}
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-4 h-4" />
            {sportsEvent.venue}, {sportsEvent.city}
          </span>
        </div>

        {/* Stand Selector */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white">Select Stadium Stand</h3>
          <div className="space-y-2">
            {sportsEvent.stands.map((stand) => (
              <div
                key={stand.id}
                onClick={() => setSelectedStandId(stand.id)}
                className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  selectedStandId === stand.id
                    ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-900/30'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{stand.name}</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">{stand.seatsAvailable} seats left</span>
                </div>
                <span className="text-base font-black text-white">₹{stand.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div>
            <span className="text-[10px] text-slate-500 font-bold uppercase block">TOTAL AMOUNT</span>
            <span className="text-2xl font-black text-indigo-400">₹{priceBreakdown.grandTotal}</span>
          </div>
          <button
            onClick={() => setCheckoutOpen(true)}
            className="py-3.5 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm rounded-xl shadow-xl shadow-indigo-900/40"
          >
            Reserve Stadium Seats
          </button>
        </div>
      </div>

      {checkoutOpen && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          category="sports"
          itemTitle={sportsEvent.title}
          itemImage={sportsEvent.image}
          venueOrCinema={sportsEvent.venue}
          city={sportsEvent.city}
          date={sportsEvent.date}
          time={sportsEvent.time}
          seatsOrDetails={`${seatCount}x ${selectedStand.name}`}
          quantity={seatCount}
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

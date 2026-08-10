import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, Ticket, ShieldCheck, Star } from 'lucide-react';
import { MOCK_EVENTS } from '../data/mockData';
import { CheckoutModal } from '../components/booking/CheckoutModal';
import { DigitalTicketModal } from '../components/booking/DigitalTicketModal';
import { Booking } from '../types';
import { calculatePrice } from '../utils/pricing';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const eventItem = MOCK_EVENTS.find((e) => e.id === id) || MOCK_EVENTS[0];

  const [selectedTierId, setSelectedTierId] = useState(eventItem.ticketTiers[0].id);
  const [ticketQuantity, setTicketQuantity] = useState(2);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [digitalTicketOpen, setDigitalTicketOpen] = useState(false);

  const selectedTier = eventItem.ticketTiers.find((t) => t.id === selectedTierId) || eventItem.ticketTiers[0];
  const priceBreakdown = calculatePrice(selectedTier.price, ticketQuantity);

  const handleBookingSuccess = (booking: Booking) => {
    setCompletedBooking(booking);
    setDigitalTicketOpen(true);
  };

  return (
    <div className="space-y-12 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </button>
      </div>

      {/* Hero Banner Header */}
      <section className="relative min-h-[380px] flex items-end overflow-hidden">
        <img
          src={eventItem.backdrop || eventItem.image}
          alt={eventItem.title}
          className="absolute inset-0 w-full h-full object-cover opacity-35 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 w-full flex flex-col md:flex-row items-center md:items-end gap-8">
          <img
            src={eventItem.image}
            alt={eventItem.title}
            className="w-48 sm:w-60 h-56 sm:h-72 object-cover rounded-3xl border-2 border-slate-700 shadow-2xl shrink-0"
          />

          <div className="space-y-3 text-center md:text-left flex-1">
            <span className="bg-teal-600/20 text-teal-400 border border-teal-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase inline-block">
              {eventItem.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{eventItem.title}</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">{eventItem.description}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-300 pt-2">
              <span className="flex items-center gap-1.5 text-teal-400 font-bold">
                <Calendar className="w-4 h-4" />
                {eventItem.date} at {eventItem.time}
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-4 h-4" />
                {eventItem.venue}, {eventItem.city}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Ticket Tier Selection */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-6">
          <div>
            <h2 className="text-xl font-black text-white">Select Ticket Category</h2>
            <p className="text-xs text-slate-400">Choose your entry pass tier</p>
          </div>

          <div className="space-y-3">
            {eventItem.ticketTiers.map((tier) => {
              const isSelected = tier.id === selectedTierId;
              return (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-teal-600/20 border-teal-500/80 shadow-lg shadow-teal-900/30'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-white">{tier.name}</h3>
                    <p className="text-xs text-slate-400">{tier.description}</p>
                    <span className="text-[10px] text-teal-400 font-bold block">
                      {tier.availableQuantity} passes left
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-white block">₹{tier.price}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">per pass</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantity Selector */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">NUMBER OF PASSES</span>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setTicketQuantity(num)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                    ticketQuantity === num
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">TOTAL AMOUNT</span>
              <span className="text-2xl font-black text-teal-400">₹{priceBreakdown.grandTotal}</span>
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="py-3.5 px-8 bg-teal-600 hover:bg-teal-500 text-white font-black text-sm rounded-xl transition-all shadow-xl shadow-teal-900/40"
            >
              Book {ticketQuantity} {ticketQuantity === 1 ? 'Pass' : 'Passes'}
            </button>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      {priceBreakdown && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          category="events"
          itemTitle={eventItem.title}
          itemImage={eventItem.image}
          venueOrCinema={eventItem.venue}
          city={eventItem.city}
          date={eventItem.date}
          time={eventItem.time}
          seatsOrDetails={`${ticketQuantity}x ${selectedTier.name}`}
          quantity={ticketQuantity}
          initialPriceBreakdown={priceBreakdown}
          onBookingSuccess={handleBookingSuccess}
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

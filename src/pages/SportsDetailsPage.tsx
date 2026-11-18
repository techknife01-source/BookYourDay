import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, ArrowLeft, Loader2, Trophy } from 'lucide-react';
import { catalogApi } from '../api/catalogApi';
import { MOCK_SPORTS } from '../data/mockData';
import { CheckoutModal } from '../components/booking/CheckoutModal';
import { DigitalTicketModal } from '../components/booking/DigitalTicketModal';
import { ReviewSection } from '../components/reviews/ReviewSection';
import { Booking } from '../types';
import { calculatePrice } from '../utils/pricing';

export const SportsDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [sportsEvent, setSportsEvent] = useState<any>(null);
  const [selectedStandId, setSelectedStandId] = useState<string>('');
  const [seatCount, setSeatCount] = useState(2);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [digitalTicketOpen, setDigitalTicketOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadSports() {
      if (!id) return;
      setLoading(true);
      try {
        const item = await catalogApi.getItemById('sports', id);
        if (!mounted) return;
        if (item) {
          const stands = item.metadata?.ticketTiers?.map((t: any) => ({
            id: t.id,
            name: t.name,
            price: t.price,
            seatsAvailable: t.availableQuantity || 100
          })) || [
            { id: 'st1', name: 'General Stand', price: item.priceFrom || 800, seatsAvailable: 250 },
            { id: 'st2', name: 'Club House VIP', price: (item.priceFrom || 800) * 3, seatsAvailable: 30 }
          ];

          setSportsEvent({
            id: item.id,
            title: item.title,
            tournament: item.metadata?.organizer || 'Championship Tournament',
            sport: item.metadata?.sportType || 'Cricket',
            image: item.image,
            date: item.metadata?.date || 'SUN, 30 AUG 2026',
            time: item.metadata?.time || '06:00 PM',
            venue: item.metadata?.venue || 'City Stadium',
            city: item.city || 'Kolkata',
            description: item.description,
            stands
          });
          setSelectedStandId(stands[0]?.id || 'st1');
        } else {
          const mock = MOCK_SPORTS.find((s) => s.id === id) || MOCK_SPORTS[0];
          setSportsEvent(mock);
          setSelectedStandId(mock.stands[0].id);
        }
      } catch (err) {
        console.warn('Error loading sports event:', err);
        const mock = MOCK_SPORTS.find((s) => s.id === id) || MOCK_SPORTS[0];
        setSportsEvent(mock);
        setSelectedStandId(mock.stands[0].id);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadSports();
    return () => { mounted = false; };
  }, [id]);

  if (loading || !sportsEvent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider">Loading Match Details...</span>
      </div>
    );
  }

  const selectedStand =
    sportsEvent.stands.find((st: any) => st.id === selectedStandId) || sportsEvent.stands[0];
  const priceBreakdown = calculatePrice(selectedStand?.price || 600, seatCount);

  const handleBookingSuccess = (booking: Booking) => {
    setCompletedBooking(booking);
    setDigitalTicketOpen(true);
  };

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
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{sportsEvent.description}</p>

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
            {sportsEvent.stands.map((stand: any) => (
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

        {/* Quantity Selector */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-bold text-slate-300">NUMBER OF SEATS</span>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 6].map((num) => (
              <button
                key={num}
                onClick={() => setSeatCount(num)}
                className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                  seatCount === num
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {num}
              </button>
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
            Reserve {seatCount} Stadium Seats
          </button>
        </div>
      </div>

      {/* Reviews & Fan Experiences */}
      <ReviewSection
        itemId={sportsEvent.id}
        itemType="sports"
        itemTitle={sportsEvent.title}
      />

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
          onBookingSuccess={handleBookingSuccess}
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

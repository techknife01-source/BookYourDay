import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { catalogApi } from '../api/catalogApi';
import { SeatSelector } from '../components/booking/SeatSelector';
import { CheckoutModal } from '../components/booking/CheckoutModal';
import { DigitalTicketModal } from '../components/booking/DigitalTicketModal';
import { ReviewSection } from '../components/reviews/ReviewSection';
import { Booking, Seat, Movie } from '../types';
import { PriceBreakdown } from '../utils/pricing';

interface LiveCinemaShow {
  id: string;
  name: string;
  address: string;
  city: string;
  facilities: string[];
  shows: {
    id: string;
    time: string;
    language: string;
    format: string;
    startingPrice: number;
    priceCategories: { category: string; price: number }[];
    bookedSeats: string[];
  }[];
}

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cinemas, setCinemas] = useState<LiveCinemaShow[]>([]);
  const [cinemasLoading, setCinemasLoading] = useState<boolean>(false);

  // Dynamic Date Generation (Today + 4 days)
  const dateOptions = React.useMemo(() => {
    const list = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const label =
        i === 0
          ? `Today, ${d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
          : i === 1
          ? `Tomorrow, ${d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`
          : d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
      list.push({ label, iso });
    }
    return list;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(dateOptions[0].label);
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(dateOptions[0].iso);
  const [selectedFormat, setSelectedFormat] = useState('2D');
  const [activeShow, setActiveShow] = useState<{
    showId: string;
    cinemaName: string;
    showtime: string;
    price: number;
    format: string;
  } | null>(null);

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [digitalTicketOpen, setDigitalTicketOpen] = useState(false);

  // Fetch Movie Data
  useEffect(() => {
    let mounted = true;
    async function fetchMovieDetails() {
      if (!id) return;
      setLoading(true);
      try {
        const item = await catalogApi.getItemById('movies', id);
        if (!mounted) return;
        if (item) {
          const defaultFmt = item.metadata?.format?.[0] || '2D';
          setSelectedFormat(defaultFmt);
          setMovie({
            id: item.id,
            title: item.title,
            poster: item.image,
            backdrop: item.backdrop || item.image,
            rating: item.rating || 4.8,
            votesCount: item.reviewCount || 12000,
            genre: item.metadata?.genre || ['Action', 'Sci-Fi'],
            language: item.metadata?.language || ['English', 'Hindi'],
            duration: item.metadata?.duration || '2h 30m',
            releaseDate: item.metadata?.releaseDate || '2026',
            format: item.metadata?.format || ['2D', '3D', 'IMAX 3D'],
            description: item.description,
            cast: item.metadata?.cast || [{ name: 'Lead Actor', role: 'Main', avatar: '' }],
            director: item.metadata?.director || 'Director'
          });
        }
      } catch (err) {
        console.error('Movie details fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchMovieDetails();
    return () => { mounted = false; };
  }, [id]);

  // Fetch Live Cinema Shows for selected Date
  useEffect(() => {
    let mounted = true;
    async function fetchShows() {
      if (!id) return;
      setCinemasLoading(true);
      try {
        const data = await catalogApi.getMovieShows(id, { date: selectedIsoDate });
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setCinemas(data);
        } else {
          setCinemas([]);
        }
      } catch (err) {
        console.warn('Shows fetch error:', err);
      } finally {
        if (mounted) setCinemasLoading(false);
      }
    }

    fetchShows();
    return () => { mounted = false; };
  }, [id, selectedIsoDate]);

  const handleSelectShow = (showId: string, cinemaName: string, showtime: string, price: number, format: string) => {
    setActiveShow({ showId, cinemaName, showtime, price, format });
    window.scrollTo({ top: 650, behavior: 'smooth' });
  };

  const handleProceedToCheckout = (seats: Seat[], breakdown: PriceBreakdown) => {
    setSelectedSeats(seats);
    setPriceBreakdown(breakdown);
    setCheckoutOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setCompletedBooking(booking);
    setDigitalTicketOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        <span className="text-xs font-bold uppercase tracking-wider">Fetching Movie Details...</span>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
        <p className="text-xs text-slate-400">The requested movie could not be retrieved from the database.</p>
        <button
          onClick={() => navigate('/movies')}
          className="px-6 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
        >
          Back to Movies
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Movies</span>
        </button>
      </div>

      {/* Cinematic Hero Backdrop Header */}
      <section className="relative min-h-[420px] flex items-end overflow-hidden">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 w-full flex flex-col md:flex-row items-center md:items-end gap-8">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-44 sm:w-56 h-64 sm:h-80 object-cover rounded-3xl border-2 border-slate-700 shadow-2xl shrink-0"
          />

          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="bg-rose-600/20 text-rose-400 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase">
                {movie.genre.join(' • ')}
              </span>
              <span className="bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                {movie.duration}
              </span>
              <span className="bg-amber-600/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {movie.rating} ({movie.votesCount.toLocaleString()} votes)
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{movie.title}</h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">{movie.description}</p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-400">
              <span>Director: <strong className="text-white">{movie.director}</strong></span>
              <span>Languages: <strong className="text-white">{movie.language.join(', ')}</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Date & Format Selector Toolbar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white">Select Date & Format</h2>
              <p className="text-xs text-slate-400">Choose your preferred screening time</p>
            </div>

            {/* Formats */}
            <div className="flex items-center gap-2 overflow-x-auto">
              {movie.format.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedFormat === fmt
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selector Pills */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {dateOptions.map((opt) => (
              <button
                key={opt.iso}
                onClick={() => {
                  setSelectedDate(opt.label);
                  setSelectedIsoDate(opt.iso);
                  setActiveShow(null);
                }}
                className={`py-3 px-5 rounded-2xl border text-xs font-bold whitespace-nowrap transition-all ${
                  selectedIsoDate === opt.iso
                    ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Cinema Showtimes Listing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <span className="w-2.5 h-6 bg-rose-600 rounded-full" />
          Available Cinema Halls
        </h2>

        {cinemasLoading ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 text-rose-500 animate-spin" />
            <span className="text-xs font-bold">Checking real-time cinema schedules...</span>
          </div>
        ) : cinemas.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-2">
            <p className="text-sm font-bold text-white">No shows currently listed for this date</p>
            <p className="text-xs text-slate-400">Please choose another date from the pills above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cinemas.map((cinema) => (
              <div
                key={cinema.id}
                className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4 shadow-lg hover:border-slate-700/80 transition-colors"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{cinema.name}</span>
                      <span className="text-slate-500 text-xs font-medium">({cinema.city})</span>
                    </h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                      <span>{cinema.address}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {cinema.facilities?.map((amenity) => (
                      <span
                        key={amenity}
                        className="bg-slate-950 text-slate-400 border border-slate-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Showtimes buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  {cinema.shows.map((show) => {
                    const isSelected = activeShow?.showId === show.id;

                    return (
                      <button
                        key={show.id}
                        onClick={() =>
                          handleSelectShow(
                            show.id,
                            cinema.name,
                            show.time,
                            show.startingPrice || 250,
                            show.format || selectedFormat
                          )
                        }
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/40'
                            : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        <div className="font-extrabold text-sm">{show.time}</div>
                        <div className="text-[10px] opacity-80 mt-0.5 font-semibold">
                          {show.format || '2D'} • ₹{show.startingPrice}
                        </div>
                        <span className="text-[9px] text-emerald-400 font-bold block mt-1">
                          Available
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Interactive Seat Selection Section */}
      {activeShow && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <SeatSelector
            movieTitle={movie.title}
            cinemaName={activeShow.cinemaName}
            showtime={`${selectedDate} • ${activeShow.showtime}`}
            basePrice={activeShow.price}
            showId={activeShow.showId}
            onProceedToCheckout={handleProceedToCheckout}
          />
        </section>
      )}

      {/* Verified Reviews & Ratings Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReviewSection
          itemId={movie.id}
          itemType="movie"
          itemTitle={movie.title}
        />
      </section>

      {/* Checkout Modal */}
      {priceBreakdown && activeShow && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          category="movies"
          itemTitle={movie.title}
          itemImage={movie.poster}
          venueOrCinema={activeShow.cinemaName}
          city="Asansol"
          date={selectedDate}
          time={activeShow.showtime}
          seatsOrDetails={`Seats ${selectedSeats.map((s) => s.id).join(', ')} (${activeShow.format})`}
          quantity={selectedSeats.length}
          initialPriceBreakdown={priceBreakdown}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Digital Ticket Confirmation Modal */}
      <DigitalTicketModal
        isOpen={digitalTicketOpen}
        onClose={() => setDigitalTicketOpen(false)}
        booking={completedBooking}
      />
    </div>
  );
};

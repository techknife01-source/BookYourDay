import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, Check, Info } from 'lucide-react';
import { Seat } from '../../types';
import { generateSeatGrid, calculatePrice, PriceBreakdown } from '../../utils/pricing';

interface SeatSelectorProps {
  movieTitle: string;
  cinemaName: string;
  showtime: string;
  basePrice: number;
  onProceedToCheckout: (selectedSeats: Seat[], priceBreakdown: PriceBreakdown) => void;
}

export const SeatSelector: React.FC<SeatSelectorProps> = ({
  movieTitle,
  cinemaName,
  showtime,
  basePrice,
  onProceedToCheckout
}) => {
  const [seats, setSeats] = useState<Seat[]>(() => generateSeatGrid(basePrice));
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes seat lock

  // Countdown timer effect
  useEffect(() => {
    if (selectedSeatIds.length === 0) return;

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Release locked seats
          setSelectedSeatIds([]);
          return 600;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedSeatIds.length]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const toggleSeat = (seatId: string) => {
    const targetSeat = seats.find((s) => s.id === seatId);
    if (!targetSeat || targetSeat.status === 'occupied') return;

    if (selectedSeatIds.includes(seatId)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId));
    } else {
      if (selectedSeatIds.length >= 8) {
        alert('You can select a maximum of 8 seats per transaction.');
        return;
      }
      setSelectedSeatIds((prev) => [...prev, seatId]);
    }
  };

  // Auto-suggest best available seats
  const handleAutoSelectBest = (count: number = 2) => {
    // Find consecutive available seats in row D or E (middle row)
    const preferredRows = ['D', 'E', 'F', 'C'];
    for (const row of preferredRows) {
      const rowSeats = seats.filter((s) => s.row === row && s.status === 'available');
      for (let i = 0; i <= rowSeats.length - count; i++) {
        let consecutive = true;
        const candidateIds: string[] = [];
        for (let j = 0; j < count; j++) {
          if (i + j < rowSeats.length && rowSeats[i + j].number === rowSeats[i].number + j) {
            candidateIds.push(rowSeats[i + j].id);
          } else {
            consecutive = false;
            break;
          }
        }
        if (consecutive && candidateIds.length === count) {
          setSelectedSeatIds(candidateIds);
          setTimerSeconds(600);
          return;
        }
      }
    }
    // Fallback: pick any available
    const available = seats.filter((s) => s.status === 'available').slice(0, count);
    setSelectedSeatIds(available.map((s) => s.id));
    setTimerSeconds(600);
  };

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const totalBasePrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const priceBreakdown = calculatePrice(
    selectedSeats.length > 0 ? totalBasePrice / selectedSeats.length : basePrice,
    selectedSeats.length
  );

  return (
    <div className="space-y-8 bg-[#020617] p-4 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
      {/* Show Info Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div>
          <h2 className="text-xl font-black text-white">{movieTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {cinemaName} • <span className="text-rose-400 font-bold">{showtime}</span>
          </p>
        </div>

        {selectedSeatIds.length > 0 && (
          <div className="flex items-center gap-2 bg-rose-600/20 border border-rose-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-rose-400 animate-pulse">
            <Clock className="w-4 h-4" />
            <span>Seats Reserved: {formatTimer(timerSeconds)}</span>
          </div>
        )}
      </div>

      {/* Screen Visual */}
      <div className="text-center space-y-2 py-4">
        <div className="w-3/4 max-w-xl mx-auto h-3 bg-gradient-to-b from-rose-500 to-rose-900/30 rounded-t-full shadow-[0_-10px_25px_rgba(225,29,72,0.3)]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
          ALL EYES THIS WAY • SCREEN
        </span>
      </div>

      {/* Seat Map Grid */}
      <div className="overflow-x-auto pb-6 pt-2 no-scrollbar">
        <div className="min-w-[640px] flex flex-col items-center gap-2.5">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((rowLetter) => {
            const rowSeats = seats.filter((s) => s.row === rowLetter);
            return (
              <div key={rowLetter} className="flex items-center gap-3">
                <span className="w-5 text-center text-xs font-bold text-slate-500">{rowLetter}</span>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {rowSeats.map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    const isOccupied = seat.status === 'occupied';

                    let colorClass = 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-rose-500 hover:text-white';
                    if (isOccupied) {
                      colorClass = 'bg-slate-950 text-slate-700 border-slate-900 cursor-not-allowed';
                    } else if (isSelected) {
                      colorClass = 'bg-rose-600 text-white border-rose-500 font-bold shadow-lg shadow-rose-900/50 scale-105';
                    } else if (seat.type === 'premium') {
                      colorClass = 'bg-amber-900/30 text-amber-300 border-amber-700/50 hover:bg-rose-600 hover:text-white';
                    } else if (seat.type === 'vip') {
                      colorClass = 'bg-indigo-900/30 text-indigo-300 border-indigo-700/50 hover:bg-rose-600 hover:text-white';
                    }

                    return (
                      <React.Fragment key={seat.id}>
                        {seat.number === 7 && <div className="w-6 sm:w-8" />} {/* Aisle gap */}
                        <button
                          disabled={isOccupied}
                          onClick={() => toggleSeat(seat.id)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border text-[11px] font-semibold flex items-center justify-center transition-all ${colorClass}`}
                          title={`${seat.id} - ₹${seat.price} (${seat.type})`}
                        >
                          {seat.number}
                        </button>
                      </React.Fragment>
                    );
                  })}
                </div>
                <span className="w-5 text-center text-xs font-bold text-slate-500">{rowLetter}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Quick Select Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-slate-800 border border-slate-700 rounded-md" />
            <span className="text-slate-400">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-rose-600 border border-rose-500 rounded-md" />
            <span className="text-slate-200 font-bold">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-slate-950 border border-slate-900 rounded-md" />
            <span className="text-slate-600">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 bg-amber-900/40 border border-amber-700/50 rounded-md" />
            <span className="text-amber-400">Premium</span>
          </div>
        </div>

        <button
          onClick={() => handleAutoSelectBest(2)}
          className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-600/10 border border-rose-500/20 px-3.5 py-2 rounded-xl transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Select Best 2 Seats</span>
        </button>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-4 z-20 p-4 bg-[#0b1329]/95 backdrop-blur-xl border border-slate-800 rounded-2xl flex items-center justify-between shadow-2xl">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
            {selectedSeatIds.length} {selectedSeatIds.length === 1 ? 'Seat' : 'Seats'} Selected
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-white">₹{priceBreakdown.grandTotal}</span>
            <span className="text-[10px] text-slate-500">incl. fees & tax</span>
          </div>
          {selectedSeatIds.length > 0 && (
            <span className="text-xs text-rose-400 font-bold block truncate max-w-[200px] sm:max-w-xs">
              {selectedSeatIds.join(', ')}
            </span>
          )}
        </div>

        <button
          disabled={selectedSeatIds.length === 0}
          onClick={() => onProceedToCheckout(selectedSeats, priceBreakdown)}
          className={`px-8 py-3.5 rounded-xl font-extrabold text-sm transition-all shadow-xl ${
            selectedSeatIds.length > 0
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40 cursor-pointer'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          Continue to Checkout
        </button>
      </div>
    </div>
  );
};

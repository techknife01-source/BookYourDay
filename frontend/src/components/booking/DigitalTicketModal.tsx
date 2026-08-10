import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, Download, Share2, Send, Calendar, MapPin, Ticket } from 'lucide-react';
import { Booking } from '../../types';
import { TicketQR } from '../common/TicketQR';

interface DigitalTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onOpenTransferModal?: () => void;
}

export const DigitalTicketModal: React.FC<DigitalTicketModalProps> = ({
  isOpen,
  onClose,
  booking,
  onOpenTransferModal
}) => {
  useEffect(() => {
    if (isOpen && booking) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen, booking]);

  if (!isOpen || !booking) return null;

  const handleDownload = () => {
    alert(`Downloading Ticket PDF for Booking #${booking.bookingNumber}...`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Ticket: ${booking.itemTitle}`,
        text: `My ticket for ${booking.itemTitle} at ${booking.venueOrCinema}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`Booking #${booking.bookingNumber} - ${booking.itemTitle}`);
      alert('Ticket details copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-md my-8 overflow-hidden shadow-2xl flex flex-col relative">
        {/* Header Success Banner */}
        <div className="bg-gradient-to-r from-rose-600 to-indigo-600 p-6 text-center space-y-2 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          <CheckCircle2 className="w-12 h-12 text-white mx-auto shadow-xl" />
          <h2 className="text-xl font-black text-white tracking-tight">Booking Confirmed!</h2>
          <p className="text-xs text-rose-100 font-semibold">Your digital ticket is ready to enter</p>
        </div>

        {/* Physical Ticket Body */}
        <div className="p-6 space-y-6 bg-slate-900/60">
          {/* Item details */}
          <div className="flex gap-4">
            <img
              src={booking.itemImage}
              alt={booking.itemTitle}
              className="w-20 h-24 object-cover rounded-2xl shrink-0 shadow-lg"
            />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest block">
                {booking.category}
              </span>
              <h3 className="font-bold text-lg text-white leading-snug truncate">{booking.itemTitle}</h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{booking.venueOrCinema}</span>
              </p>
              <div className="mt-2 text-xs text-rose-400 font-bold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{booking.date} • {booking.time}</span>
              </div>
            </div>
          </div>

          {/* Dotted Ticket Tear Line */}
          <div className="relative py-2">
            <div className="border-b-2 border-dashed border-slate-700 w-full" />
            <div className="w-6 h-6 rounded-full bg-[#0b1329] absolute -left-9 top-1/2 -translate-y-1/2 border-r border-slate-800" />
            <div className="w-6 h-6 rounded-full bg-[#0b1329] absolute -right-9 top-1/2 -translate-y-1/2 border-l border-slate-800" />
          </div>

          {/* QR Code and Reference */}
          <div className="flex flex-col items-center gap-3">
            <TicketQR data={booking.qrCodeData} size={150} />
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                BOOKING REFERENCE
              </span>
              <p className="font-mono text-sm font-black text-rose-400">{booking.bookingNumber}</p>
            </div>
          </div>

          {/* Ticket Information Grid */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">SEATS / TICKETS</span>
              <span className="font-bold text-white block mt-0.5">{booking.seatsOrTicketsDetails}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">PASSENGER</span>
              <span className="font-bold text-white block mt-0.5 truncate">{booking.customerName}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">TOTAL PAID</span>
              <span className="font-bold text-emerald-400 block mt-0.5">₹{booking.totalAmount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">STATUS</span>
              <span className="font-bold text-emerald-400 block mt-0.5">{booking.status}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleDownload}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex flex-col items-center gap-1 transition-all"
            >
              <Download className="w-4 h-4 text-rose-400" />
              <span>Download</span>
            </button>
            <button
              onClick={handleShare}
              className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex flex-col items-center gap-1 transition-all"
            >
              <Share2 className="w-4 h-4 text-indigo-400" />
              <span>Share</span>
            </button>
            {onOpenTransferModal && (
              <button
                onClick={onOpenTransferModal}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex flex-col items-center gap-1 transition-all"
              >
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Transfer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

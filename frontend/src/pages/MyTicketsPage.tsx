import React, { useState } from 'react';
import { Ticket, Calendar, MapPin, QrCode, Trash2, Send, CheckCircle2 } from 'lucide-react';
import { BookingService } from '../services/bookingService';
import { Booking } from '../types';
import { DigitalTicketModal } from '../components/booking/DigitalTicketModal';
import { TicketTransferModal } from '../components/booking/TicketTransferModal';

export const MyTicketsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>(() => BookingService.getBookings());
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  const handleOpenTicket = (booking: Booking) => {
    setSelectedBooking(booking);
    setTicketModalOpen(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking? A 100% refund will be credited to your BYD Wallet.')) {
      BookingService.cancelBooking(bookingId);
      setBookings(BookingService.getBookings());
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'cancelled') return b.status === 'CANCELLED';
    if (activeTab === 'upcoming') return b.status === 'CONFIRMED';
    return b.status === 'CONFIRMED'; // In realistic app, filter by past dates
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
          <Ticket className="w-3.5 h-3.5" />
          <span>PASS MANAGEMENT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">My Tickets & Reservations</h1>
        <p className="text-slate-400 text-sm">Access your QR codes, transfer passes, or view booking history</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'upcoming', label: 'Upcoming Shows' },
          { id: 'completed', label: 'Past Activity' },
          { id: 'cancelled', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Ticket Cards Grid */}
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <div
            key={booking.id}
            className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-700 transition-all shadow-lg"
          >
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={booking.itemImage}
                alt={booking.itemTitle}
                className="w-16 h-20 object-cover rounded-2xl shrink-0"
              />
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                    {booking.category}
                  </span>
                  <span className="bg-emerald-600/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {booking.status}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white truncate">{booking.itemTitle}</h3>
                <p className="text-xs text-slate-400 truncate">{booking.venueOrCinema}, {booking.city}</p>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  <span>{booking.date} • {booking.time}</span>
                  <span>•</span>
                  <span className="text-rose-400 font-mono">{booking.seatsOrTicketsDetails}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-800">
              {booking.status === 'CONFIRMED' && (
                <>
                  <button
                    onClick={() => handleCancelBooking(booking.id)}
                    className="p-2.5 bg-slate-900 hover:bg-rose-900/30 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                    title="Cancel Booking"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setTransferModalOpen(true);
                    }}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    <Send className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Transfer</span>
                  </button>
                </>
              )}

              <button
                onClick={() => handleOpenTicket(booking)}
                className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-900/30 flex items-center gap-2 transition-all"
              >
                <QrCode className="w-4 h-4" />
                <span>View Digital Ticket</span>
              </button>
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="p-12 text-center bg-slate-900/30 border border-slate-800 rounded-3xl space-y-3">
            <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No tickets found</h3>
            <p className="text-xs text-slate-400">You don't have any bookings in this category yet.</p>
          </div>
        )}
      </div>

      <DigitalTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        booking={selectedBooking}
        onOpenTransferModal={() => {
          setTicketModalOpen(false);
          setTransferModalOpen(true);
        }}
      />

      <TicketTransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
};

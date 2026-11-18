import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, QrCode, Trash2, Send, Loader2, RefreshCw, FileText, Printer, X, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { BookingService } from '../services/bookingService';
import { Booking } from '../types';
import { DigitalTicketModal } from '../components/booking/DigitalTicketModal';
import { TicketTransferModal } from '../components/booking/TicketTransferModal';

export const MyTicketsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);

  // Reschedule Modal State
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('19:30');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleMsg, setRescheduleMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Invoice Modal State
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceBooking, setInvoiceBooking] = useState<Booking | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const fetched = await BookingService.getBookingsAsync();
      setBookings(fetched);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleOpenTicket = (booking: Booking) => {
    setSelectedBooking(booking);
    setTicketModalOpen(true);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking? A 100% refund will be credited to your original payment method / wallet.')) {
      await BookingService.cancelBookingAsync(bookingId);
      await loadBookings();
    }
  };

  const handleOpenReschedule = (booking: Booking) => {
    setRescheduleTarget(booking);
    setRescheduleMsg(null);
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    setNewDate(tmrw.toISOString().split('T')[0]);
    setNewTime(booking.time || '19:30');
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTarget || !newDate) return;

    try {
      setRescheduling(true);
      setRescheduleMsg(null);
      const ok = await BookingService.rescheduleBookingAsync(rescheduleTarget.id, newDate, newTime);
      if (ok) {
        setRescheduleMsg({ type: 'success', text: `Booking successfully rescheduled to ${newDate} at ${newTime}!` });
        setTimeout(() => {
          setRescheduleModalOpen(false);
          loadBookings();
        }, 1200);
      } else {
        setRescheduleMsg({ type: 'error', text: 'Rescheduling failed. The selected slot may be full or unavailable.' });
      }
    } catch (err: any) {
      setRescheduleMsg({ type: 'error', text: err?.message || 'Failed to reschedule.' });
    } finally {
      setRescheduling(false);
    }
  };

  const handleOpenInvoice = (booking: Booking) => {
    setInvoiceBooking(booking);
    setInvoiceModalOpen(true);
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'cancelled') {
      return b.status === 'CANCELLED';
    }

    const bookingDate = new Date(b.date);
    const isPast = !isNaN(bookingDate.getTime()) && bookingDate < new Date(new Date().setHours(0, 0, 0, 0));

    if (activeTab === 'completed') {
      return b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && isPast);
    }
    // upcoming
    return b.status === 'CONFIRMED' && !isPast;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
          <Ticket className="w-3.5 h-3.5" />
          <span>CUSTOMER DASHBOARD</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">My Bookings & Digital Passes</h1>
        <p className="text-slate-400 text-sm">Access your QR codes, reschedule dates, cancel with full refund, or download GST invoices</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'upcoming', label: `Upcoming (${bookings.filter(b => b.status === 'CONFIRMED').length})` },
          { id: 'completed', label: 'Past Activity' },
          { id: 'cancelled', label: `Cancelled (${bookings.filter(b => b.status === 'CANCELLED').length})` }
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
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Your Reservations...</span>
        </div>
      ) : (
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
                  className="w-16 h-20 object-cover rounded-2xl shrink-0 border border-slate-800"
                />
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                      {booking.category}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        booking.status === 'CONFIRMED'
                          ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30'
                          : booking.status === 'CANCELLED'
                          ? 'bg-rose-600/20 text-rose-400 border-rose-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">#{booking.bookingNumber}</span>
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
              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-800 flex-wrap">
                {/* Download / View Invoice */}
                <button
                  onClick={() => handleOpenInvoice(booking)}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl transition-all"
                  title="Tax Invoice"
                >
                  <FileText className="w-4 h-4 text-amber-400" />
                </button>

                {booking.status === 'CONFIRMED' && (
                  <>
                    {/* Reschedule Button */}
                    <button
                      onClick={() => handleOpenReschedule(booking)}
                      className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                      title="Reschedule Slot"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Reschedule</span>
                    </button>

                    {/* Transfer Button */}
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setTransferModalOpen(true);
                      }}
                      className="py-2.5 px-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all"
                    >
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Transfer</span>
                    </button>

                    {/* Cancel Button */}
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="p-2.5 bg-slate-900 hover:bg-rose-900/30 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                      title="Cancel Booking & Refund"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleOpenTicket(booking)}
                  className="py-2.5 px-5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-900/30 flex items-center gap-2 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Digital Pass</span>
                </button>
              </div>
            </div>
          ))}

          {filteredBookings.length === 0 && (
            <div className="p-12 text-center bg-slate-900/30 border border-slate-800 rounded-3xl space-y-3">
              <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No bookings found</h3>
              <p className="text-xs text-slate-400">You don't have any bookings matching this category right now.</p>
            </div>
          )}
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleModalOpen && rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setRescheduleModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                Reschedule Reservation
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {rescheduleTarget.itemTitle} • #{rescheduleTarget.bookingNumber}
              </p>
            </div>

            {rescheduleMsg && (
              <div
                className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold ${
                  rescheduleMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                {rescheduleMsg.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{rescheduleMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleConfirmReschedule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Choose New Date</label>
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Choose Preferred Time</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                >
                  <option value="11:00 AM">11:00 AM (Morning Slot)</option>
                  <option value="02:30 PM">02:30 PM (Matinee Slot)</option>
                  <option value="06:00 PM">06:00 PM (Evening Slot)</option>
                  <option value="08:30 PM">08:30 PM (Prime Night Slot)</option>
                </select>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
                <Clock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Zero rescheduling fee applied for MemberPlus accounts. Seat re-allocation will be auto-assigned in the same category.</span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRescheduleModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rescheduling}
                  className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rescheduling ? 'animate-spin' : ''}`} />
                  <span>{rescheduling ? 'Updating...' : 'Confirm Reschedule'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {invoiceModalOpen && invoiceBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-slate-200">
            <button
              onClick={() => setInvoiceModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Printable Header */}
            <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
              <div>
                <span className="text-xl font-black text-rose-500">BOOKYOURDAY</span>
                <p className="text-[10px] text-slate-400 mt-0.5">BookYourDay Technologies Pvt. Ltd.</p>
                <p className="text-[10px] text-slate-500">GSTIN: 19AAACB2026M1Z8 • SAC: 999652</p>
              </div>
              <div className="text-right">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  TAX INVOICE - PAID
                </span>
                <p className="text-[11px] font-mono text-slate-400 mt-1">INV-{invoiceBooking.bookingNumber}</p>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Billed To</span>
                <span className="font-bold text-white block">Alex Mercer</span>
                <span className="text-slate-400 block text-[11px]">{invoiceBooking.city}, India</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Date & Time</span>
                <span className="font-bold text-white block">{invoiceBooking.date}</span>
                <span className="text-slate-400 block text-[11px]">{invoiceBooking.time}</span>
              </div>
            </div>

            {/* Line items */}
            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-white pb-2 border-b border-slate-800/80">
                <span>{invoiceBooking.itemTitle} ({invoiceBooking.quantity}x)</span>
                <span>₹{invoiceBooking.totalPrice - 80}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Platform Convenience Fee</span>
                <span>₹50</span>
              </div>
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>Integrated GST (18%)</span>
                <span>₹30</span>
              </div>
              <div className="flex items-center justify-between font-black text-white pt-2 border-t border-slate-800 text-sm">
                <span>Total Amount Paid</span>
                <span className="text-emerald-400">₹{invoiceBooking.totalPrice}</span>
              </div>
            </div>

            {/* Transaction info */}
            <div className="text-[11px] text-slate-500 space-y-0.5 font-mono">
              <p>Transaction ID: tx_{invoiceBooking.id.substring(0, 14)}</p>
              <p>Payment Mode: Razorpay Verified (Auto-Settled)</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl border border-slate-700 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setInvoiceModalOpen(false)}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

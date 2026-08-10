import React, { useState } from 'react';
import { Send, X, CheckCircle2 } from 'lucide-react';
import { Booking } from '../../types';
import { BookingService } from '../../services/bookingService';

interface TicketTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export const TicketTransferModal: React.FC<TicketTransferModalProps> = ({
  isOpen,
  onClose,
  booking
}) => {
  const [recipient, setRecipient] = useState('');
  const [transferred, setTransferred] = useState(false);

  if (!isOpen || !booking) return null;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient) return;

    BookingService.transferTicket(booking.id, recipient);
    setTransferred(true);
    setTimeout(() => {
      setTransferred(false);
      setRecipient('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b1329] border border-slate-800 rounded-3xl w-full max-w-md p-6 overflow-hidden shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Send className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-white">Transfer Ticket</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {transferred ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-lg text-white">Transfer Initiated!</h4>
            <p className="text-xs text-slate-400">
              Ticket #{booking.bookingNumber} is now being transferred to {recipient}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold">TICKET TO TRANSFER</span>
              <p className="font-bold text-white">{booking.itemTitle}</p>
              <p className="text-slate-400">{booking.seatsOrTicketsDetails} ({booking.date})</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Recipient Email or Mobile Number
              </label>
              <input
                type="text"
                required
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="friend@example.com or +1 555-0192"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Once transferred, the ticket QR code will be re-generated and sent directly to the recipient's email/phone.
            </p>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition-all"
            >
              Confirm Ticket Transfer
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

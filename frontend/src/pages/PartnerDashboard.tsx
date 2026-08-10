import React, { useState } from 'react';
import { Building2, Calendar, Plus, CheckCircle, QrCode } from 'lucide-react';

export const PartnerDashboard: React.FC = () => {
  const [partnerName] = useState('Grand Cineplex & Multiplex');
  const [showAddedMsg, setShowAddedMsg] = useState(false);

  const [movieName, setMovieName] = useState('');
  const [showTime, setShowTime] = useState('');
  const [ticketPrice, setTicketPrice] = useState('350');

  const handleAddShow = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAddedMsg(true);
    setTimeout(() => {
      setShowAddedMsg(false);
      setMovieName('');
      setShowTime('');
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">{partnerName}</h1>
            <p className="text-xs text-slate-400">Authorized Venue Operator & Organizer Console</p>
          </div>
        </div>

        {/* Schedule Show Form */}
        <form onSubmit={handleAddShow} className="p-6 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-teal-400" />
            Schedule New Showtime / Slot
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">EVENT / MOVIE TITLE</label>
              <input
                type="text"
                required
                placeholder="e.g. Inception 2"
                value={movieName}
                onChange={(e) => setMovieName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">SHOWTIME</label>
              <input
                type="text"
                required
                placeholder="e.g. 07:15 PM"
                value={showTime}
                onChange={(e) => setShowTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">TICKET PRICE (₹)</label>
              <input
                type="number"
                required
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-2.5 px-6 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Publish Showtime Live
          </button>

          {showAddedMsg && (
            <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-fade-in pt-2">
              <CheckCircle className="w-4 h-4" />
              Showtime published successfully to BOOK YOUR DAY catalog!
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

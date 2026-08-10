import React, { useState } from 'react';
import { Shield, TrendingUp, Ticket, Users, DollarSign, Film, Music, Check, X } from 'lucide-react';
import { BookingService } from '../services/bookingService';
import { MOCK_MOVIES, MOCK_EVENTS } from '../data/mockData';

export const AdminDashboard: React.FC = () => {
  const [bookings] = useState(() => BookingService.getBookings());

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.status === 'CONFIRMED' ? b.totalAmount : 0), 0);
  const totalBookingsCount = bookings.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>EXECUTIVE PORTAL</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Platform Admin Analytics</h1>
          <p className="text-slate-400 text-xs">Real-time revenue metrics, system capacity & booking logs</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>TOTAL REVENUE</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-white block">₹{totalRevenue.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-400 font-bold">+18.4% from last month</span>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>TOTAL PASSES ISSUED</span>
            <Ticket className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-black text-white block">{totalBookingsCount}</span>
          <span className="text-[10px] text-slate-400 font-bold">Confirmed transactions</span>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>ACTIVE USERS</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl font-black text-white block">14,280</span>
          <span className="text-[10px] text-indigo-400 font-bold">Across 10 cities</span>
        </div>

        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>CONVERSION RATE</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white block">94.2%</span>
          <span className="text-[10px] text-amber-400 font-bold">High checkout completion</span>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <h3 className="font-bold text-base text-white">Recent System Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Title / Venue</th>
                <th className="p-3">Category</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-900/60">
                  <td className="p-3 font-mono font-bold text-rose-400">{b.bookingNumber}</td>
                  <td className="p-3 font-semibold">{b.customerName}</td>
                  <td className="p-3">{b.itemTitle}</td>
                  <td className="p-3 uppercase font-bold text-slate-400 text-[10px]">{b.category}</td>
                  <td className="p-3 font-bold text-white">₹{b.totalAmount}</td>
                  <td className="p-3">
                    <span className="bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold text-[10px]">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

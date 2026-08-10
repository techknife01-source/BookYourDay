import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, Ticket, Users, DollarSign, Building2, Check, X, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { BookingService } from '../services/bookingService';
import { partnerApi, PartnerProfile } from '../api/partnerApi';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'partners'>('analytics');
  const [bookings] = useState(() => BookingService.getBookings());

  // Partners state for Admin
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.status === 'CONFIRMED' ? b.totalAmount : 0), 0);
  const totalBookingsCount = bookings.length;

  const fetchPartners = async () => {
    setLoadingPartners(true);
    try {
      const data = await partnerApi.getAllPartnersAdmin(statusFilter === 'ALL' ? undefined : statusFilter);
      setPartners(data);
    } catch {
      // Ignore
    } finally {
      setLoadingPartners(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'partners') {
      fetchPartners();
    }
  }, [activeTab, statusFilter]);

  const handleUpdateStatus = async (partnerId: string, status: string) => {
    let rejectionReason: string | undefined;
    if (status === 'REJECTED') {
      const reason = prompt('Enter rejection reason for partner:');
      if (reason === null) return; // User cancelled
      rejectionReason = reason || 'Does not meet partner onboarding guidelines.';
    }

    try {
      await partnerApi.updatePartnerStatusAdmin(partnerId, status, rejectionReason);
      setActionMessage(`Partner status updated to ${status}`);
      setTimeout(() => setActionMessage(null), 3000);
      fetchPartners();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update partner status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>EXECUTIVE PORTAL</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Platform Admin Console</h1>
          <p className="text-slate-400 text-xs">Manage partners, view analytics, and audit marketplace operations</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'partners'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Partner Approval
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold text-center">
          {actionMessage}
        </div>
      )}

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fade-in">
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
      )}

      {/* TAB 2: PARTNER APPROVAL MANAGEMENT */}
      {activeTab === 'partners' && (
        <div className="space-y-6 animate-fade-in">
          {/* Status Filter buttons */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === st
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={fetchPartners}
              className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPartners ? 'animate-spin' : ''}`} /> Refresh List
            </button>
          </div>

          {/* Partners Table */}
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-white">Partner Onboarding Applications</h3>
            {loadingPartners ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Loading partner applications...
              </div>
            ) : partners.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No partner records found matching status filter "{statusFilter}".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Business Name</th>
                      <th className="p-3">Domain</th>
                      <th className="p-3">Email / Contact</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {partners.map((p) => (
                      <tr key={p.id || p._id} className="hover:bg-slate-900/60">
                        <td className="p-3 font-bold text-white">{p.businessName}</td>
                        <td className="p-3 text-teal-400 font-semibold">{p.businessType}</td>
                        <td className="p-3 text-slate-300">{p.email}</td>
                        <td className="p-3">{p.city}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            p.status === 'APPROVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : p.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {p.status !== 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(p.id || p._id!, 'APPROVED')}
                                className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                            )}

                            {p.status !== 'REJECTED' && p.status !== 'SUSPENDED' && (
                              <button
                                onClick={() => handleUpdateStatus(p.id || p._id!, 'REJECTED')}
                                className="py-1 px-2.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            )}

                            {p.status === 'APPROVED' && (
                              <button
                                onClick={() => handleUpdateStatus(p.id || p._id!, 'SUSPENDED')}
                                className="py-1 px-2.5 bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg transition-all flex items-center gap-1"
                              >
                                <AlertTriangle className="w-3 h-3" /> Suspend
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

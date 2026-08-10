import React, { useState, useEffect } from 'react';
import { Building2, Calendar, Plus, CheckCircle, ShieldAlert, Clock, RefreshCw, DollarSign, Ticket, AlertTriangle, Layers, Tag, ArrowUpRight, BarChart3, UserCheck, XCircle } from 'lucide-react';
import { partnerApi, PartnerProfile, PartnerStats, PartnerListing, PartnerBooking } from '../api/partnerApi';

export const PartnerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [listings, setListings] = useState<PartnerListing[]>([]);
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'bookings' | 'revenue' | 'profile'>('overview');

  // Application form state
  const [applyForm, setApplyForm] = useState({
    businessName: '',
    businessType: 'EVENT_ORGANIZER',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: 'Asansol'
  });
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  // New Listing form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListing, setNewListing] = useState({
    category: 'EVENT',
    title: '',
    price: '500',
    city: 'Asansol',
    venue: '',
    date: 'SAT, 24 AUG 2026',
    time: '18:00',
    description: '',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=600'
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  const fetchPartnerData = async () => {
    setLoading(true);
    try {
      const profile = await partnerApi.getPartnerProfile();
      setPartner(profile);

      if (profile && profile.status === 'APPROVED') {
        const [dashRes, listRes, bookRes] = await Promise.all([
          partnerApi.getDashboard().catch(() => null),
          partnerApi.getListings().catch(() => []),
          partnerApi.getPartnerBookings().catch(() => [])
        ]);

        if (dashRes) {
          setStats(dashRes.stats);
        }
        setListings(listRes);
        setBookings(bookRes);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplySubmitting(true);
    setApplyMessage(null);
    try {
      const res = await partnerApi.applyPartner(applyForm);
      setPartner(res);
      setApplyMessage('Application submitted successfully! Our team will review your details.');
    } catch (err: any) {
      setApplyMessage(err?.response?.data?.message || 'Failed to submit partner application.');
    } finally {
      setApplySubmitting(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSubmitting(true);
    setCreateMsg(null);
    try {
      await partnerApi.createListing(newListing);
      setCreateMsg('Listing created and published successfully!');
      setTimeout(() => {
        setShowCreateModal(false);
        setCreateMsg(null);
        fetchPartnerData();
      }, 1500);
    } catch (err: any) {
      setCreateMsg(err?.response?.data?.message || 'Failed to create listing.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleToggleStatus = async (category: string, id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'PAUSED' : 'PUBLISHED';
    try {
      await partnerApi.updateListingStatus(category, id, nextStatus);
      fetchPartnerData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading partner portal...</p>
      </div>
    );
  }

  // Case 1: No partner record -> Show Onboarding Application
  if (!partner) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-white">Become a BookYourDay Partner</h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            List your cinema, live events, sports matches, attractions, dining experiences, or activities on India's premier booking marketplace.
          </p>
        </div>

        <form onSubmit={handleApply} className="p-8 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-6 shadow-2xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
            <UserCheck className="w-5 h-5 text-teal-400" />
            Partner Application Form
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">BUSINESS / VENUE NAME *</label>
              <input
                type="text"
                required
                placeholder="e.g. Grand Multiplex & Arena"
                value={applyForm.businessName}
                onChange={(e) => setApplyForm({ ...applyForm, businessName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">BUSINESS DOMAIN *</label>
              <select
                value={applyForm.businessType}
                onChange={(e) => setApplyForm({ ...applyForm, businessType: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              >
                <option value="CINEMA">Cinema & Theatre Operator</option>
                <option value="EVENT_ORGANIZER">Event & Concert Organizer</option>
                <option value="SPORTS_VENUE">Sports Arena & Tournament</option>
                <option value="ATTRACTION">Theme Park & Attraction</option>
                <option value="RESTAURANT">Dining & Fine Restaurant</option>
                <option value="EXPERIENCE">Adventure & Experience Provider</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">BUSINESS EMAIL *</label>
              <input
                type="email"
                required
                placeholder="partner@business.com"
                value={applyForm.email}
                onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">PHONE NUMBER</label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={applyForm.phone}
                onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">CITY *</label>
              <input
                type="text"
                required
                placeholder="Asansol"
                value={applyForm.city}
                onChange={(e) => setApplyForm({ ...applyForm, city: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">ADDRESS / LOCATION</label>
              <input
                type="text"
                placeholder="123 Burnpur Road"
                value={applyForm.address}
                onChange={(e) => setApplyForm({ ...applyForm, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">BUSINESS DESCRIPTION</label>
            <textarea
              rows={3}
              placeholder="Tell us about your venue, seating capacity, or live event offerings..."
              value={applyForm.description}
              onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={applySubmitting}
            className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {applySubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Submit Partner Application'}
          </button>

          {applyMessage && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-xs text-teal-300 font-semibold text-center">
              {applyMessage}
            </div>
          )}
        </form>
      </div>
    );
  }

  // Case 2: Partner application PENDING / REJECTED / SUSPENDED
  if (partner.status !== 'APPROVED') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div className="p-8 bg-slate-900/80 border border-slate-800 rounded-3xl text-center space-y-4 shadow-xl">
          {partner.status === 'PENDING' && (
            <>
              <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 mx-auto">
                <Clock className="w-8 h-8 animate-pulse" />
              </div>
              <h1 className="text-2xl font-black text-white">Application Under Admin Review</h1>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your application for <strong className="text-teal-400">{partner.businessName}</strong> ({partner.city}) has been received and is currently <span className="text-amber-400 font-bold">PENDING APPROVAL</span> by the platform administrator.
              </p>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs text-slate-400 space-y-1 max-w-md mx-auto">
                <p>• <strong>Business:</strong> {partner.businessName}</p>
                <p>• <strong>Category:</strong> {partner.businessType}</p>
                <p>• <strong>Email:</strong> {partner.email}</p>
                <p>• <strong>Status:</strong> <span className="text-amber-400 font-bold">PENDING</span></p>
              </div>
            </>
          )}

          {partner.status === 'REJECTED' && (
            <>
              <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 mx-auto">
                <XCircle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-white">Application Not Approved</h1>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your partner application for <strong>{partner.businessName}</strong> was rejected by the admin team.
              </p>
              {partner.rejectionReason && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 font-medium">
                  <strong>Reason:</strong> {partner.rejectionReason}
                </div>
              )}
            </>
          )}

          {partner.status === 'SUSPENDED' && (
            <>
              <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black text-white">Partner Account Suspended</h1>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Your partner account for <strong>{partner.businessName}</strong> has been suspended. Published inventory has been paused. Please contact platform compliance.
              </p>
            </>
          )}

          <button
            onClick={fetchPartnerData}
            className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Check Status
          </button>
        </div>
      </div>
    );
  }

  // Case 3: APPROVED Partner Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{partner.businessName}</h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400">{partner.businessType} • {partner.city}</p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="py-2.5 px-5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Listing
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'listings', label: `Listings (${listings.length})`, icon: Layers },
          { id: 'bookings', label: `Bookings (${bookings.length})`, icon: Ticket },
          { id: 'revenue', label: 'Revenue & Payments', icon: DollarSign },
          { id: 'profile', label: 'Business Profile', icon: UserCheck }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600/20 text-teal-400 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>GROSS BOOKING VALUE</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-2xl font-black text-white block">₹{(stats?.grossBookingValue || 0).toLocaleString()}</span>
              <span className="text-[10px] text-emerald-400 font-bold">Verified payment transactions</span>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>SUCCESSFUL BOOKINGS</span>
                <Ticket className="w-4 h-4 text-teal-400" />
              </div>
              <span className="text-2xl font-black text-white block">{stats?.successfulBookingsCount || 0}</span>
              <span className="text-[10px] text-slate-400 font-bold">Confirmed tickets issued</span>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>ACTIVE LISTINGS</span>
                <Layers className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-2xl font-black text-white block">{listings.length}</span>
              <span className="text-[10px] text-indigo-400 font-bold">Published catalog inventory</span>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>REFUNDS PROCESSED</span>
                <RefreshCw className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-2xl font-black text-white block">₹{(stats?.refundsAmount || 0).toLocaleString()}</span>
              <span className="text-[10px] text-amber-400 font-bold">{stats?.refundsCount || 0} cancellation refunds</span>
            </div>
          </div>

          {/* Recent Listings */}
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="font-bold text-sm text-white">Your Recent Inventory Listings</h3>
            {listings.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No listings created yet. Click "Create New Listing" above to publish inventory.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {listings.slice(0, 5).map((l) => (
                      <tr key={l.id || l._id} className="hover:bg-slate-900/60">
                        <td className="p-3 font-semibold text-white">{l.title || l.name}</td>
                        <td className="p-3 uppercase font-bold text-teal-400 text-[10px]">{l.category}</td>
                        <td className="p-3">{l.city || partner.city}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            l.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleStatus(l.category, l.id || l._id!, l.status)}
                            className="text-[10px] font-bold text-teal-400 hover:underline"
                          >
                            {l.status === 'PUBLISHED' ? 'Pause' : 'Publish'}
                          </button>
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

      {/* TAB 2: LISTINGS MANAGEMENT */}
      {activeTab === 'listings' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">Managed Inventory Listings</h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="py-2 px-4 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Listing
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((item) => (
              <div key={item.id || item._id} className="p-5 bg-slate-900/70 border border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-teal-400 tracking-wider block mb-1">{item.category}</span>
                    <h4 className="font-bold text-sm text-white">{item.title || item.name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p>• City: <span className="text-slate-200">{item.city || partner.city}</span></p>
                  <p>• Price: <span className="text-white font-bold">₹{item.startingPrice || item.entryPrice || item.pricePerPerson || item.costForTwo || item.price || 500}</span></p>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStatus(item.category, item.id || item._id!, item.status)}
                    className={`py-1 px-3 rounded-lg text-xs font-bold transition-all ${
                      item.status === 'PUBLISHED'
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {item.status === 'PUBLISHED' ? 'Pause Listing' : 'Publish Live'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4 animate-fade-in">
          <h3 className="font-bold text-base text-white">Customer Booking Logs</h3>
          {bookings.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No bookings received for your inventory yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Ref #</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Event / Show</th>
                    <th className="p-3">Date/Time</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-900/60">
                      <td className="p-3 font-mono font-bold text-teal-400">{b.bookingNumber}</td>
                      <td className="p-3 font-semibold text-white">{b.customerName}</td>
                      <td className="p-3">{b.itemTitle}</td>
                      <td className="p-3 text-slate-400">{b.date} {b.time}</td>
                      <td className="p-3 font-bold">{b.quantity}</td>
                      <td className="p-3 font-bold text-white">₹{b.totalAmount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          b.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: REVENUE */}
      {activeTab === 'revenue' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <span className="text-xs text-slate-400 font-bold block">GROSS BOOKING VALUE</span>
              <span className="text-3xl font-black text-white">₹{(stats?.grossBookingValue || 0).toLocaleString()}</span>
              <p className="text-[10px] text-emerald-400 font-bold">Total customer payment transactions</p>
            </div>

            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-2">
              <span className="text-xs text-slate-400 font-bold block">TOTAL REFUNDS</span>
              <span className="text-3xl font-black text-rose-400">₹{(stats?.refundsAmount || 0).toLocaleString()}</span>
              <p className="text-[10px] text-slate-400 font-bold">{stats?.refundsCount || 0} cancellations refunded</p>
            </div>

            <div className="p-6 bg-slate-900/60 border border-teal-500/30 rounded-3xl space-y-2 bg-gradient-to-br from-teal-950/20 to-slate-900">
              <span className="text-xs text-teal-400 font-bold block">NET REVENUE ACCRUED</span>
              <span className="text-3xl font-black text-teal-300">₹{((stats?.grossBookingValue || 0) - (stats?.refundsAmount || 0)).toLocaleString()}</span>
              <p className="text-[10px] text-teal-400 font-bold">Verified net ticket revenue</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PROFILE */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4 animate-fade-in">
          <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">Partner Profile Information</h3>
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-300">
            <div>
              <p className="text-slate-500 text-[10px] font-bold">BUSINESS NAME</p>
              <p className="font-bold text-white text-sm">{partner.businessName}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold">BUSINESS DOMAIN</p>
              <p className="font-bold text-teal-400">{partner.businessType}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold">EMAIL</p>
              <p>{partner.email}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold">CITY</p>
              <p>{partner.city}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold">STATUS</p>
              <span className="text-emerald-400 font-bold">{partner.status}</span>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Create New Partner Listing</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">DOMAIN CATEGORY</label>
                  <select
                    value={newListing.category}
                    onChange={(e) => setNewListing({ ...newListing, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="EVENT">Event / Concert</option>
                    <option value="SPORTS">Sports Match</option>
                    <option value="ATTRACTION">Attraction / Theme Park</option>
                    <option value="RESTAURANT">Restaurant Dining</option>
                    <option value="EXPERIENCE">Adventure / Workshop</option>
                    <option value="MOVIE">Movie / Cinema</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">TITLE / EVENT NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer Music Live"
                    value={newListing.title}
                    onChange={(e) => setNewListing({ ...newListing, title: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">PRICE (₹)</label>
                  <input
                    type="number"
                    required
                    value={newListing.price}
                    onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">CITY</label>
                  <input
                    type="text"
                    required
                    value={newListing.city}
                    onChange={(e) => setNewListing({ ...newListing, city: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">DATE</label>
                  <input
                    type="text"
                    required
                    value={newListing.date}
                    onChange={(e) => setNewListing({ ...newListing, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  placeholder="Listing details and highlights..."
                  value={newListing.description}
                  onChange={(e) => setNewListing({ ...newListing, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {createSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Publish Listing'}
                </button>
              </div>

              {createMsg && (
                <p className="text-xs text-center font-bold text-teal-400 pt-1">{createMsg}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

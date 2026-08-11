import React, { useState, useEffect } from 'react';
import {
  Shield, TrendingUp, Ticket, Users, DollarSign, Building2, Check, X, AlertTriangle,
  RefreshCw, Search, Tag, HelpCircle, FileText, CreditCard, Filter, Eye, Plus, Calendar
} from 'lucide-react';
import { adminApi, OverviewMetrics, AdminUser, AdminListing, AdminBooking, AdminPayment, AdminTicket, AdminCoupon, SupportTicket, AuditLog } from '../api/adminApi';
import { partnerApi, PartnerProfile } from '../api/partnerApi';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'partners' | 'listings' | 'bookings' | 'payments' | 'tickets' | 'coupons' | 'support' | 'audit' | 'search'
  >('overview');

  const [dateRange, setDateRange] = useState<string>('30d');
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Users Tab
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('');

  // Partners Tab
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [partnerStatusFilter, setPartnerStatusFilter] = useState('ALL');

  // Listings Tab
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listingCategory, setListingCategory] = useState('');
  const [listingStatusFilter, setListingStatusFilter] = useState('');
  const [listingSearch, setListingSearch] = useState('');

  // Bookings Tab
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Payments Tab
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');

  // Tickets Tab
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketSearch, setTicketSearch] = useState('');

  // Coupons Tab
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FLAT',
    discountValue: 10,
    maxDiscountAmount: '',
    minBookingAmount: 0,
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });

  // Support Tab
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loadingSupport, setLoadingSupport] = useState(false);
  const [supportStatusFilter, setSupportStatusFilter] = useState('');

  // Audit Tab
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Global Search Tab
  const [globalQuery, setGlobalQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Fetch Overview Metrics
  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    try {
      const data = await adminApi.getOverviewMetrics(dateRange);
      setMetrics(data);
    } catch {
      // ignore
    } finally {
      setLoadingMetrics(false);
    }
  };

  // Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await adminApi.getUsers({
        search: userSearch || undefined,
        role: userRoleFilter || undefined,
        status: userStatusFilter || undefined
      });
      setUsers(data.users);
    } catch {
      // ignore
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Partners
  const fetchPartners = async () => {
    setLoadingPartners(true);
    try {
      const data = await partnerApi.getAllPartnersAdmin(partnerStatusFilter === 'ALL' ? undefined : partnerStatusFilter);
      setPartners(data);
    } catch {
      // ignore
    } finally {
      setLoadingPartners(false);
    }
  };

  // Fetch Listings
  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const data = await adminApi.getListings({
        category: listingCategory || undefined,
        status: listingStatusFilter || undefined,
        search: listingSearch || undefined
      });
      setListings(data.listings);
    } catch {
      // ignore
    } finally {
      setLoadingListings(false);
    }
  };

  // Fetch Bookings
  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const data = await adminApi.getBookings({
        bookingNumber: bookingSearch || undefined,
        status: bookingStatusFilter || undefined
      });
      setBookings(data.bookings);
    } catch {
      // ignore
    } finally {
      setLoadingBookings(false);
    }
  };

  // Fetch Payments
  const fetchPayments = async () => {
    setLoadingPayments(true);
    try {
      const data = await adminApi.getPayments({
        status: paymentStatusFilter || undefined
      });
      setPayments(data.payments);
    } catch {
      // ignore
    } finally {
      setLoadingPayments(false);
    }
  };

  // Fetch Tickets
  const fetchTickets = async () => {
    setLoadingTickets(true);
    try {
      const data = await adminApi.getTickets({
        ticketNumber: ticketSearch || undefined
      });
      setTickets(data.tickets);
    } catch {
      // ignore
    } finally {
      setLoadingTickets(false);
    }
  };

  // Fetch Coupons
  const fetchCoupons = async () => {
    setLoadingCoupons(true);
    try {
      const data = await adminApi.getCoupons();
      setCoupons(data);
    } catch {
      // ignore
    } finally {
      setLoadingCoupons(false);
    }
  };

  // Fetch Support
  const fetchSupport = async () => {
    setLoadingSupport(true);
    try {
      const data = await adminApi.getSupportTickets({
        status: supportStatusFilter || undefined
      });
      setSupportTickets(data.tickets);
    } catch {
      // ignore
    } finally {
      setLoadingSupport(false);
    }
  };

  // Fetch Audit
  const fetchAudit = async () => {
    setLoadingAudit(true);
    try {
      const data = await adminApi.getAuditLogs();
      setAuditLogs(data);
    } catch {
      // ignore
    } finally {
      setLoadingAudit(false);
    }
  };

  // Global Search
  const handleGlobalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalQuery.trim()) return;
    setLoadingSearch(true);
    try {
      const res = await adminApi.globalSearch(globalQuery);
      setSearchResults(res);
    } catch {
      // ignore
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') fetchMetrics();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'partners') fetchPartners();
    if (activeTab === 'listings') fetchListings();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'payments') fetchPayments();
    if (activeTab === 'tickets') fetchTickets();
    if (activeTab === 'coupons') fetchCoupons();
    if (activeTab === 'support') fetchSupport();
    if (activeTab === 'audit') fetchAudit();
  }, [activeTab, dateRange, partnerStatusFilter, userRoleFilter, userStatusFilter, listingCategory, listingStatusFilter, bookingStatusFilter, paymentStatusFilter, supportStatusFilter]);

  // User status update
  const handleUserStatusUpdate = async (userId: string, status: string) => {
    try {
      await adminApi.updateUserStatus(userId, status);
      showNotification(`User status updated to ${status}`);
      fetchUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update user status');
    }
  };

  // Partner status update
  const handlePartnerStatusUpdate = async (partnerId: string, status: string) => {
    let rejectionReason: string | undefined;
    if (status === 'REJECTED') {
      const reason = prompt('Enter rejection reason for partner:');
      if (reason === null) return;
      rejectionReason = reason || 'Does not meet onboarding criteria.';
    }
    try {
      await partnerApi.updatePartnerStatusAdmin(partnerId, status, rejectionReason);
      showNotification(`Partner status updated to ${status}`);
      fetchPartners();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update partner status');
    }
  };

  // Listing status update
  const handleListingStatusUpdate = async (category: string, id: string, status: string) => {
    try {
      await adminApi.updateListingStatus(category, id, status);
      showNotification(`Listing status updated to ${status}`);
      fetchListings();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update listing status');
    }
  };

  // Coupon create
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createCoupon({
        code: couponForm.code,
        description: couponForm.description,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : undefined,
        minBookingAmount: Number(couponForm.minBookingAmount),
        validUntil: couponForm.validUntil
      });
      showNotification(`Coupon ${couponForm.code.toUpperCase()} created!`);
      setShowCouponModal(false);
      fetchCoupons();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create coupon');
    }
  };

  // Toggle coupon status
  const handleToggleCoupon = async (id: string) => {
    try {
      await adminApi.toggleCouponStatus(id);
      showNotification('Coupon status toggled');
      fetchCoupons();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to toggle coupon');
    }
  };

  // Support ticket status update
  const handleSupportUpdate = async (id: string, status: string) => {
    try {
      await adminApi.updateSupportTicket(id, { status });
      showNotification(`Support ticket status updated to ${status}`);
      fetchSupport();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update ticket');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>PLATFORM OPERATIONS CENTER</span>
          </div>
          <h1 className="text-3xl font-black text-white mt-1">Admin Control Panel</h1>
          <p className="text-slate-400 text-xs">Real-time marketplace monitoring, users, listings, bookings, and auditing</p>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleGlobalSearch} className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Admin search (users, bookings, IDs)..."
              value={globalQuery}
              onChange={(e) => setGlobalQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>
          <button
            type="submit"
            onClick={() => setActiveTab('search')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
          >
            Search
          </button>
        </form>
      </div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-bold text-center animate-fade-in">
          {actionMessage}
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/60">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'partners', label: 'Partners', icon: Building2 },
          { id: 'listings', label: 'Listings', icon: Filter },
          { id: 'bookings', label: 'Bookings', icon: Ticket },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'tickets', label: 'Tickets', icon: Tag },
          { id: 'coupons', label: 'Coupons', icon: Plus },
          { id: 'support', label: 'Support', icon: HelpCircle },
          { id: 'audit', label: 'Audit Logs', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* 1. OVERVIEW TAB */}
      {/* ==================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Date Filter Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-slate-300">Time Window:</span>
              {['today', '7d', '30d', '90d'].map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all uppercase ${
                    dateRange === r
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'today' ? 'Today' : r}
                </button>
              ))}
            </div>

            <button
              onClick={fetchMetrics}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMetrics ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          {/* Metrics Grid */}
          {loadingMetrics ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
              Calculating platform aggregations...
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>GROSS BOOKING VALUE</span>
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-2xl font-black text-white block">₹{metrics.grossBookingValue.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 font-bold">Confirmed customer bookings</span>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>TOTAL BOOKINGS</span>
                  <Ticket className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-2xl font-black text-white block">{metrics.totalBookings}</span>
                <span className="text-[10px] text-slate-400 font-bold">{metrics.confirmedBookings} Confirmed | {metrics.cancelledBookings} Cancelled</span>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>TOTAL USERS</span>
                  <Users className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-2xl font-black text-white block">{metrics.totalUsers}</span>
                <span className="text-[10px] text-indigo-400 font-bold">Registered platform accounts</span>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>PARTNERS</span>
                  <Building2 className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-2xl font-black text-white block">{metrics.totalPartners}</span>
                <span className="text-[10px] text-amber-400 font-bold">{metrics.pendingPartnerApplications} Pending Applications</span>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>PUBLISHED LISTINGS</span>
                  <Filter className="w-4 h-4 text-teal-400" />
                </div>
                <span className="text-2xl font-black text-white block">{metrics.publishedListings}</span>
                <span className="text-[10px] text-teal-400 font-bold">Live across 6 domains</span>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>SUCCESSFUL PAYMENTS</span>
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-2xl font-black text-white block">{metrics.successfulPayments}</span>
                <span className="text-[10px] text-slate-400 font-bold">{metrics.failedPayments} Failed Transactions</span>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>REFUNDS PROCESSED</span>
                  <RefreshCw className="w-4 h-4 text-rose-400" />
                </div>
                <span className="text-2xl font-black text-white block">₹{metrics.refundAmount.toLocaleString()}</span>
                <span className="text-[10px] text-rose-400 font-bold">Verified Razorpay refunds</span>
              </div>

              <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <span>ACTIVE TICKETS</span>
                  <Tag className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-2xl font-black text-white block">{metrics.activeTickets}</span>
                <span className="text-[10px] text-purple-400 font-bold">Valid entry passes issued</span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. USERS TAB */}
      {/* ==================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="partner">Partner</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="DEACTIVATED">DEACTIVATED</option>
              </select>
            </div>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} /> Refresh Users
            </button>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="font-bold text-base text-white mb-4">Platform User Registry</h3>
            {loadingUsers ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">City</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Member Plus</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-slate-900/60">
                        <td className="p-3">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-slate-400 text-[10px]">{u.email}</div>
                        </td>
                        <td className="p-3 font-semibold uppercase text-slate-400 text-[10px]">{u.role}</td>
                        <td className="p-3">{u.savedCity || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : u.status === 'SUSPENDED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {u.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.isMemberPlus ? (
                            <span className="text-amber-400 font-bold text-[10px]">PLUS</span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">Standard</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {u.status !== 'ACTIVE' && (
                              <button
                                onClick={() => handleUserStatusUpdate(u._id, 'ACTIVE')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg"
                              >
                                Activate
                              </button>
                            )}
                            {u.status !== 'SUSPENDED' && (
                              <button
                                onClick={() => handleUserStatusUpdate(u._id, 'SUSPENDED')}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-lg"
                              >
                                Suspend
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

      {/* ==================================================== */}
      {/* 3. PARTNERS TAB */}
      {/* ==================================================== */}
      {activeTab === 'partners' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setPartnerStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    partnerStatusFilter === st
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
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPartners ? 'animate-spin' : ''}`} /> Refresh Partners
            </button>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
            <h3 className="font-bold text-base text-white mb-4">Partner Approvals & Moderation</h3>
            {loadingPartners ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Loading partners...
              </div>
            ) : partners.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No partner records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Business Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Email</th>
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
                                onClick={() => handlePartnerStatusUpdate(p.id || p._id!, 'APPROVED')}
                                className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg flex items-center gap-1"
                              >
                                <Check className="w-3 h-3" /> Approve
                              </button>
                            )}
                            {p.status !== 'REJECTED' && p.status !== 'SUSPENDED' && (
                              <button
                                onClick={() => handlePartnerStatusUpdate(p.id || p._id!, 'REJECTED')}
                                className="py-1 px-2.5 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[10px] rounded-lg flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Reject
                              </button>
                            )}
                            {p.status === 'APPROVED' && (
                              <button
                                onClick={() => handlePartnerStatusUpdate(p.id || p._id!, 'SUSPENDED')}
                                className="py-1 px-2.5 bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-[10px] rounded-lg flex items-center gap-1"
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

      {/* ==================================================== */}
      {/* 4. LISTINGS TAB */}
      {/* ==================================================== */}
      {activeTab === 'listings' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={listingCategory}
                onChange={(e) => setListingCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="">All Domains</option>
                <option value="movie">Movies</option>
                <option value="event">Events</option>
                <option value="sports">Sports</option>
                <option value="attraction">Attractions</option>
                <option value="restaurant">Restaurants</option>
                <option value="experience">Experiences</option>
              </select>
              <select
                value={listingStatusFilter}
                onChange={(e) => setListingStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">DRAFT</option>
                <option value="SUBMITTED">SUBMITTED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="PAUSED">PAUSED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
              <input
                type="text"
                placeholder="Filter listing title..."
                value={listingSearch}
                onChange={(e) => setListingSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
              />
            </div>
            <button
              onClick={fetchListings}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingListings ? 'animate-spin' : ''}`} /> Refresh Listings
            </button>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
            <h3 className="font-bold text-base text-white mb-4">Platform Inventory Moderation</h3>
            {loadingListings ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Loading inventory...
              </div>
            ) : listings.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No listings found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Title / Item</th>
                      <th className="p-3">Domain</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {listings.map((l) => (
                      <tr key={l._id || l.id} className="hover:bg-slate-900/60">
                        <td className="p-3 font-bold text-white">{l.title || l.name}</td>
                        <td className="p-3 uppercase font-semibold text-rose-400 text-[10px]">{l.category}</td>
                        <td className="p-3">{l.city || l.venueName || l.cinemaName || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            l.status === 'PUBLISHED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : l.status === 'APPROVED'
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                              : l.status === 'PAUSED'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {l.status || 'DRAFT'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {l.status !== 'PUBLISHED' && (
                              <button
                                onClick={() => handleListingStatusUpdate(l.category, l._id || l.id!, 'PUBLISHED')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg"
                              >
                                Publish
                              </button>
                            )}
                            {l.status === 'PUBLISHED' && (
                              <button
                                onClick={() => handleListingStatusUpdate(l.category, l._id || l.id!, 'PAUSED')}
                                className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] rounded-lg"
                              >
                                Pause
                              </button>
                            )}
                            {l.status !== 'REJECTED' && (
                              <button
                                onClick={() => handleListingStatusUpdate(l.category, l._id || l.id!, 'REJECTED')}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px] rounded-lg"
                              >
                                Reject
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

      {/* ==================================================== */}
      {/* 5. BOOKINGS TAB */}
      {/* ==================================================== */}
      {activeTab === 'bookings' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                placeholder="Search booking # or customer..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
              />
              <select
                value={bookingStatusFilter}
                onChange={(e) => setBookingStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PAYMENT_PENDING">PAYMENT_PENDING</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>
            <button
              onClick={fetchBookings}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingBookings ? 'animate-spin' : ''}`} /> Refresh Bookings
            </button>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
            <h3 className="font-bold text-base text-white mb-4">Master Booking Audit</h3>
            {loadingBookings ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Loading bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No bookings found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Booking #</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Item Title</th>
                      <th className="p-3">Domain</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {bookings.map((b) => (
                      <tr key={b._id || b.id} className="hover:bg-slate-900/60">
                        <td className="p-3 font-mono font-bold text-rose-400">{b.bookingNumber}</td>
                        <td className="p-3">
                          <div className="font-semibold text-white">{b.customerName}</div>
                          <div className="text-[10px] text-slate-400">{b.customerEmail}</div>
                        </td>
                        <td className="p-3 font-medium">{b.itemTitle}</td>
                        <td className="p-3 uppercase font-bold text-slate-400 text-[10px]">{b.category}</td>
                        <td className="p-3 font-bold text-white">₹{b.totalAmount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            b.status === 'CONFIRMED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : b.status === 'CANCELLED' || b.status === 'EXPIRED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={async () => {
                              const detail = await adminApi.getBookingById(b._id || b.id!);
                              setSelectedBooking(detail);
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Booking Detail Modal */}
          {selectedBooking && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm">Booking Reference: {selectedBooking.booking.bookingNumber}</h3>
                  <button onClick={() => setSelectedBooking(null)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div><strong className="text-slate-400">Customer:</strong> {selectedBooking.booking.customerName} ({selectedBooking.booking.customerEmail})</div>
                  <div><strong className="text-slate-400">Item:</strong> {selectedBooking.booking.itemTitle}</div>
                  <div><strong className="text-slate-400">Amount:</strong> ₹{selectedBooking.booking.totalAmount}</div>
                  <div><strong className="text-slate-400">Status:</strong> {selectedBooking.booking.status}</div>
                  {selectedBooking.payment && (
                    <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                      <div className="font-bold text-emerald-400">Payment Record</div>
                      <div>Transaction ID: {selectedBooking.payment.transactionId}</div>
                      <div>Razorpay Order ID: {selectedBooking.payment.razorpayOrderId}</div>
                      <div>Status: {selectedBooking.payment.status}</div>
                    </div>
                  )}
                  {selectedBooking.ticket && (
                    <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                      <div className="font-bold text-purple-400">Ticket Record</div>
                      <div>Ticket #: {selectedBooking.ticket.ticketNumber}</div>
                      <div>Seats/Pass: {selectedBooking.ticket.seatDetails}</div>
                      <div>Status: {selectedBooking.ticket.status}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. PAYMENTS TAB */}
      {/* ==================================================== */}
      {activeTab === 'payments' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300"
            >
              <option value="">All Payment Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUND_PENDING">REFUND_PENDING</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
            <button
              onClick={fetchPayments}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPayments ? 'animate-spin' : ''}`} /> Refresh Payments
            </button>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
            <h3 className="font-bold text-base text-white mb-4">Razorpay Payment Audit Log</h3>
            {loadingPayments ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Loading payments...
              </div>
            ) : payments.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No payment records found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Transaction ID</th>
                      <th className="p-3">Razorpay Order</th>
                      <th className="p-3">Razorpay Payment ID</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-900/60">
                        <td className="p-3 font-mono font-semibold text-rose-400">{p.transactionId}</td>
                        <td className="p-3 text-slate-400">{p.razorpayOrderId || 'N/A'}</td>
                        <td className="p-3 text-slate-400">{p.razorpayPaymentId || 'N/A'}</td>
                        <td className="p-3 font-bold text-white">₹{p.amount} {p.currency}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            p.status === 'SUCCESS'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : p.status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 7. TICKETS TAB */}
      {/* ==================================================== */}
      {activeTab === 'tickets' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <input
              type="text"
              placeholder="Filter by ticket number..."
              value={ticketSearch}
              onChange={(e) => setTicketSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
            />
            <button
              onClick={fetchTickets}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingTickets ? 'animate-spin' : ''}`} /> Refresh Tickets
            </button>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
            <h3 className="font-bold text-base text-white mb-4">Issued Pass Registry</h3>
            {loadingTickets ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Loading tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No tickets found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Ticket #</th>
                      <th className="p-3">Item Title</th>
                      <th className="p-3">Venue / Cinema</th>
                      <th className="p-3">Seats / Pass</th>
                      <th className="p-3">Validity</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {tickets.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-900/60">
                        <td className="p-3 font-mono font-bold text-rose-400">{t.ticketNumber}</td>
                        <td className="p-3 font-semibold text-white">{t.itemTitle}</td>
                        <td className="p-3 text-slate-300">{t.venueOrCinema}</td>
                        <td className="p-3 text-slate-400">{t.seatDetails}</td>
                        <td className="p-3 text-slate-400">{t.validDate} {t.validTime}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            t.status === 'VALID'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {t.status}
                          </span>
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

      {/* ==================================================== */}
      {/* 8. COUPONS TAB */}
      {/* ==================================================== */}
      {activeTab === 'coupons' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white text-sm">Coupons & Offer Engine</h3>
            <button
              onClick={() => setShowCouponModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Coupon
            </button>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
            {loadingCoupons ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Loading coupons...
              </div>
            ) : coupons.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No active coupons.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Code</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Value</th>
                      <th className="p-3">Min Booking</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {coupons.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-900/60">
                        <td className="p-3 font-mono font-bold text-rose-400 uppercase">{c.code}</td>
                        <td className="p-3">{c.description}</td>
                        <td className="p-3 font-semibold text-teal-400">{c.discountType}</td>
                        <td className="p-3 font-bold text-white">
                          {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}
                        </td>
                        <td className="p-3">₹{c.minBookingAmount || 0}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            c.isActive
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleCoupon(c._id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] font-bold"
                          >
                            {c.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Create Coupon Modal */}
          {showCouponModal && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <form onSubmit={handleCreateCoupon} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm">Create New Platform Coupon</h3>
                  <button type="button" onClick={() => setShowCouponModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Coupon Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SUMMER50"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Description</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat ₹50 off on weekend bookings"
                      value={couponForm.description}
                      onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Discount Type</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      >
                        <option value="PERCENTAGE">PERCENTAGE (%)</option>
                        <option value="FLAT">FLAT (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Discount Value</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Min Booking Amt (₹)</label>
                      <input
                        type="number"
                        value={couponForm.minBookingAmount}
                        onChange={(e) => setCouponForm({ ...couponForm, minBookingAmount: Number(e.target.value) })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Valid Until</label>
                      <input
                        type="date"
                        required
                        value={couponForm.validUntil}
                        onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCouponModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
                  >
                    Save Coupon
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 9. SUPPORT TAB */}
      {/* ==================================================== */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <select
              value={supportStatusFilter}
              onChange={(e) => setSupportStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300"
            >
              <option value="">All Support Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <button
              onClick={fetchSupport}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSupport ? 'animate-spin' : ''}`} /> Refresh Tickets
            </button>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
            <h3 className="font-bold text-base text-white mb-4">Customer & Partner Support Center</h3>
            {loadingSupport ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Loading support tickets...
              </div>
            ) : supportTickets.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No support tickets found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Created</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {supportTickets.map((st) => (
                      <tr key={st._id} className="hover:bg-slate-900/60">
                        <td className="p-3">
                          <div className="font-bold text-white">{st.subject}</div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">{st.description}</div>
                        </td>
                        <td className="p-3 font-semibold text-amber-400 text-[10px]">{st.priority}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            st.status === 'RESOLVED'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : st.status === 'OPEN'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {st.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400">{new Date(st.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {st.status !== 'RESOLVED' && (
                              <button
                                onClick={() => handleSupportUpdate(st._id, 'RESOLVED')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg"
                              >
                                Resolve
                              </button>
                            )}
                            {st.status !== 'CLOSED' && (
                              <button
                                onClick={() => handleSupportUpdate(st._id, 'CLOSED')}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] rounded-lg"
                              >
                                Close
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

      {/* ==================================================== */}
      {/* 10. AUDIT LOGS TAB */}
      {/* ==================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            <h3 className="font-bold text-white text-sm">Immutable Platform Audit Trail</h3>
            <button
              onClick={fetchAudit}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAudit ? 'animate-spin' : ''}`} /> Refresh Logs
            </button>
          </div>

          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
            {loadingAudit ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Loading audit trail...
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">No audit logs recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Actor</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Target</th>
                      <th className="p-3">Details</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-200">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-900/60">
                        <td className="p-3 font-mono font-semibold text-rose-400">{log.actorUserId}</td>
                        <td className="p-3 uppercase font-bold text-slate-400 text-[10px]">{log.actorRole}</td>
                        <td className="p-3 font-bold text-white">{log.action}</td>
                        <td className="p-3 text-slate-300">{log.targetType}: {log.targetId}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-400">{JSON.stringify(log.details || {})}</td>
                        <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 11. GLOBAL SEARCH TAB */}
      {/* ==================================================== */}
      {activeTab === 'search' && (
        <div className="space-y-6 animate-fade-in">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl space-y-6">
            <h3 className="font-bold text-base text-white">Global Search Results for "{globalQuery}"</h3>
            {loadingSearch ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500" />
                Searching across all databases...
              </div>
            ) : !searchResults ? (
              <div className="text-slate-500 text-xs py-8">Enter a query above and press Search.</div>
            ) : (
              <div className="space-y-6 text-xs text-slate-300">
                {/* Users */}
                <div>
                  <h4 className="font-bold text-rose-400 text-sm mb-2">Users ({searchResults.users?.length || 0})</h4>
                  {searchResults.users?.map((u: any) => (
                    <div key={u._id} className="p-2.5 bg-slate-950 rounded-xl mb-1 flex justify-between">
                      <span>{u.name} ({u.email})</span>
                      <span className="font-bold uppercase text-slate-400">{u.role}</span>
                    </div>
                  ))}
                </div>

                {/* Partners */}
                <div>
                  <h4 className="font-bold text-amber-400 text-sm mb-2">Partners ({searchResults.partners?.length || 0})</h4>
                  {searchResults.partners?.map((p: any) => (
                    <div key={p._id} className="p-2.5 bg-slate-950 rounded-xl mb-1 flex justify-between">
                      <span>{p.businessName} - {p.city}</span>
                      <span className="font-bold uppercase text-emerald-400">{p.status}</span>
                    </div>
                  ))}
                </div>

                {/* Listings */}
                <div>
                  <h4 className="font-bold text-teal-400 text-sm mb-2">Listings ({searchResults.listings?.length || 0})</h4>
                  {searchResults.listings?.map((l: any) => (
                    <div key={l._id} className="p-2.5 bg-slate-950 rounded-xl mb-1 flex justify-between">
                      <span>{l.title || l.name} ({l.category})</span>
                      <span className="font-bold uppercase text-slate-400">{l.status}</span>
                    </div>
                  ))}
                </div>

                {/* Bookings */}
                <div>
                  <h4 className="font-bold text-indigo-400 text-sm mb-2">Bookings ({searchResults.bookings?.length || 0})</h4>
                  {searchResults.bookings?.map((b: any) => (
                    <div key={b._id} className="p-2.5 bg-slate-950 rounded-xl mb-1 flex justify-between font-mono">
                      <span>#{b.bookingNumber} - {b.itemTitle} (₹{b.totalAmount})</span>
                      <span className="font-bold text-emerald-400">{b.status}</span>
                    </div>
                  ))}
                </div>

                {/* Payments */}
                <div>
                  <h4 className="font-bold text-purple-400 text-sm mb-2">Payments ({searchResults.payments?.length || 0})</h4>
                  {searchResults.payments?.map((pm: any) => (
                    <div key={pm._id} className="p-2.5 bg-slate-950 rounded-xl mb-1 flex justify-between font-mono">
                      <span>Txn: {pm.transactionId} - Order: {pm.razorpayOrderId}</span>
                      <span className="font-bold text-emerald-400">{pm.status}</span>
                    </div>
                  ))}
                </div>

                {/* Tickets */}
                <div>
                  <h4 className="font-bold text-emerald-400 text-sm mb-2">Tickets ({searchResults.tickets?.length || 0})</h4>
                  {searchResults.tickets?.map((t: any) => (
                    <div key={t._id} className="p-2.5 bg-slate-950 rounded-xl mb-1 flex justify-between font-mono">
                      <span>Pass #: {t.ticketNumber} - {t.itemTitle}</span>
                      <span className="font-bold text-emerald-400">{t.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

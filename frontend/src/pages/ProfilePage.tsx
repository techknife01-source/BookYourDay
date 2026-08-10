import React, { useState } from 'react';
import { User, Wallet, Sparkles, MapPin, Shield, CreditCard, CheckCircle, Bell } from 'lucide-react';
import { BookingService } from '../services/bookingService';
import { UserProfile } from '../types';

export const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(() => BookingService.getUserProfile());
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = BookingService.updateUserProfile({ name, email, phone });
    setProfile(updated);
    setIsEditing(false);
  };

  const handleAddWalletMoney = () => {
    const updated = BookingService.updateUserProfile({ walletBalance: profile.walletBalance + 500 });
    setProfile(updated);
    alert('₹500 added to your BYD Wallet!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Card */}
      <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-rose-950/30 border border-slate-800 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 border-2 border-slate-700 flex items-center justify-center text-white text-2xl font-black shadow-xl shrink-0">
            {profile.name.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">{profile.name}</h1>
              {profile.isMemberPlus && (
                <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-[10px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  BOOK YOUR DAY+
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">{profile.email} • {profile.phone}</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all shrink-0"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleSave} className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
          <h3 className="font-bold text-sm text-white">Update Contact Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">EMAIL</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1">PHONE</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="py-2.5 px-6 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md"
          >
            Save Changes
          </button>
        </form>
      )}

      {/* BYD Wallet & Membership Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet */}
        <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">BYD Digital Wallet</h3>
                <p className="text-xs text-slate-400">Instant refunds & 1-click checkout</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block">AVAILABLE BALANCE</span>
              <span className="text-2xl font-black text-emerald-400">₹{profile.walletBalance}</span>
            </div>
            <button
              onClick={handleAddWalletMoney}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
            >
              + Add ₹500
            </button>
          </div>
        </div>

        {/* Member Plus Card */}
        <div className="p-6 bg-gradient-to-br from-rose-950/40 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">BOOK YOUR DAY+</h3>
                <p className="text-xs text-slate-400">Zero convenience fees & priority seats</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-1">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Active VIP Subscription
            </span>
            <p className="text-[11px] text-slate-400">Renews on {profile.memberPlusExpiry}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

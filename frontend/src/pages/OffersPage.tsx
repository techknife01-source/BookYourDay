import React, { useState } from 'react';
import { MOCK_OFFERS } from '../data/mockData';
import { OfferCard } from '../components/cards/OfferCard';
import { Tag, Sparkles } from 'lucide-react';

export const OffersPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleApply = (code: string) => {
    setCopiedCode(code);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
          <Tag className="w-3.5 h-3.5" />
          <span>PROMOTIONS & DISCOUNTS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Offers & Deals</h1>
        <p className="text-slate-400 text-sm">Save on movies, events, sports, theme parks & dining reservations</p>
      </div>

      {copiedCode && (
        <div className="p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl text-emerald-400 font-bold text-xs flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Code "{copiedCode}" copied! Paste it during checkout to redeem discount.
          </span>
          <button onClick={() => setCopiedCode(null)} className="text-xs underline">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_OFFERS.map((offer) => (
          <OfferCard key={offer.id} offer={offer} onApply={handleApply} />
        ))}
      </div>
    </div>
  );
};

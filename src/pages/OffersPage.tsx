import React, { useState, useEffect } from 'react';
import { catalogApi } from '../api/catalogApi';
import { MOCK_OFFERS } from '../data/mockData';
import { OfferCard } from '../components/cards/OfferCard';
import { Tag, Sparkles, Loader2, Check } from 'lucide-react';
import { Offer } from '../types';

export const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    async function loadOffers() {
      setLoading(true);
      try {
        const liveOffers = await catalogApi.getOffers(selectedCategory !== 'all' ? selectedCategory : undefined);
        if (!mounted) return;
        if (Array.isArray(liveOffers) && liveOffers.length > 0) {
          const mapped: Offer[] = liveOffers.map((o: any) => ({
            id: o._id || o.id,
            title: o.title,
            code: o.offerCode || o.code,
            description: o.description,
            category: (o.categoryApplicable?.toLowerCase() || 'all') as any,
            bankName: o.bankPartner || 'Bank Partner',
            validUntil: o.validUntil || '31 DEC 2026',
            bannerBg: o.bannerImage || 'linear-gradient(135deg, #e11d48, #be123c)'
          }));
          setOffers(mapped);
        } else {
          // Filter MOCK_OFFERS as fallback
          if (selectedCategory === 'all') {
            setOffers(MOCK_OFFERS);
          } else {
            setOffers(MOCK_OFFERS.filter((m) => m.category === selectedCategory || m.category === 'all'));
          }
        }
      } catch (err) {
        console.warn('Offers fetch error:', err);
        setOffers(MOCK_OFFERS);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadOffers();
    return () => { mounted = false; };
  }, [selectedCategory]);

  const handleApply = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
  };

  const categories = [
    { id: 'all', label: 'All Deals' },
    { id: 'movies', label: 'Movies' },
    { id: 'events', label: 'Events & Concerts' },
    { id: 'sports', label: 'Sports' },
    { id: 'attractions', label: 'Theme Parks' },
    { id: 'dining', label: 'Dining' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
          <Tag className="w-3.5 h-3.5" />
          <span>PROMOTIONS & DISCOUNTS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Exclusive Offers & Bank Deals</h1>
        <p className="text-slate-400 text-sm">Save instantly on movies, stadium passes, water parks, dining and hotels with verified promo codes.</p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === c.id
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {copiedCode && (
        <div className="p-4 bg-emerald-600/20 border border-emerald-500/30 rounded-2xl text-emerald-400 font-bold text-xs flex items-center justify-between animate-fadeIn">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Code "{copiedCode}" copied to clipboard! Paste it during checkout to redeem your instant discount.
          </span>
          <button onClick={() => setCopiedCode(null)} className="text-xs underline hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-16 text-slate-400 gap-2">
          <Loader2 className="w-6 h-6 text-rose-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Fetching Active Offers...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onApply={handleApply} />
          ))}
        </div>
      )}
    </div>
  );
};

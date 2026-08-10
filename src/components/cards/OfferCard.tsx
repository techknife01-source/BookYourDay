import React, { useState } from 'react';
import { Tag, Copy, Check } from 'lucide-react';
import { Offer } from '../../types';

interface OfferCardProps {
  offer: Offer;
  onApply?: (code: string) => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, onApply }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(offer.code);
    setCopied(true);
    if (onApply) onApply(offer.code);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-gradient-to-br ${offer.bannerBg} border border-slate-700/80 rounded-3xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between space-y-4`}
    >
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1">
          <span className="bg-white/20 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/20">
            {offer.bankName || 'EXCLUSIVE OFFER'}
          </span>
          <h3 className="text-lg font-bold text-white leading-tight mt-2">{offer.title}</h3>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0">
          <Tag className="w-5 h-5" />
        </div>
      </div>

      <p className="text-xs text-slate-200 leading-relaxed relative z-10">{offer.description}</p>

      <div className="pt-3 border-t border-white/15 flex items-center justify-between relative z-10">
        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20 font-mono text-xs font-bold text-white tracking-widest">
          {offer.code}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 bg-white text-slate-950 hover:bg-slate-200 font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Code</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

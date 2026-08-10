import React from 'react';
import { MOCK_SPORTS } from '../data/mockData';
import { SportsCard } from '../components/cards/SportsCard';
import { Trophy } from 'lucide-react';

export const SportsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold">
          <Trophy className="w-3.5 h-3.5" />
          <span>STADIUM TOURNAMENTS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Live Sports Matches</h1>
        <p className="text-slate-400 text-sm">Cricket, Football, Basketball, Tennis & premier league tickets</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SPORTS.map((sp) => (
          <SportsCard key={sp.id} sportsEvent={sp} />
        ))}
      </div>
    </div>
  );
};

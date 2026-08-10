import React, { useEffect, useState } from 'react';
import { catalogApi } from '../api/catalogApi';
import { SportsCard } from '../components/cards/SportsCard';
import { Trophy, Loader2 } from 'lucide-react';
import { SportsEvent } from '../types';

export const SportsPage: React.FC = () => {
  const [sports, setSports] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function fetchSports() {
      setLoading(true);
      try {
        const items = await catalogApi.getByCategory('sports');
        if (!mounted) return;
        const spList: SportsEvent[] = items.map((item) => ({
          id: item.id,
          title: item.title,
          teams: item.metadata?.teamsOrPlayers || [{ name: 'Team A', logo: '' }, { name: 'Team B', logo: '' }],
          tournament: item.metadata?.sportType || 'League Match',
          sport: item.metadata?.sportType || 'Cricket',
          image: item.image,
          date: item.metadata?.date || '20 Aug 2026',
          time: item.metadata?.time || '07:30 PM',
          venue: item.location || 'Stadium',
          city: item.city || 'Asansol',
          startingPrice: item.priceFrom || 750,
          stands: [{ id: 's1', name: 'West Stand', price: item.priceFrom || 750, seatsAvailable: 50 }]
        }));
        setSports(spList);
      } catch (err) {
        console.error('Sports load error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchSports();
    return () => { mounted = false; };
  }, []);

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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Sports Events from Database...</span>
        </div>
      ) : sports.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-2">
          <h3 className="text-lg font-bold text-white">No Sports Events Found</h3>
          <p className="text-xs text-slate-400">Check back later for upcoming stadium matches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sports.map((sp) => (
            <SportsCard key={sp.id} sportsEvent={sp} />
          ))}
        </div>
      )}
    </div>
  );
};

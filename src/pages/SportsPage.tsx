import React, { useEffect, useState } from 'react';
import { catalogApi } from '../api/catalogApi';
import { SportsCard } from '../components/cards/SportsCard';
import { Trophy, Loader2 } from 'lucide-react';
import { SportsEvent } from '../types';

export const SportsPage: React.FC = () => {
  const [sports, setSports] = useState<SportsEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSport, setSelectedSport] = useState<string>('all');

  const sportTabs = [
    { id: 'all', label: 'All Sports' },
    { id: 'cricket', label: 'Cricket' },
    { id: 'football', label: 'Football' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'tennis', label: 'Tennis' },
    { id: 'badminton', label: 'Badminton' },
    { id: 'other', label: 'Kabaddi & Others' }
  ];

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
          tournament: item.metadata?.organizer || 'Tournament',
          sport: item.metadata?.sportType || 'Cricket',
          image: item.image,
          date: item.metadata?.date || '20 Aug 2026',
          time: item.metadata?.time || '07:30 PM',
          venue: item.location || 'Stadium',
          city: item.city || 'Asansol',
          startingPrice: item.priceFrom || 750,
          stands: [{ id: 's1', name: 'Standard Stand', price: item.priceFrom || 750, seatsAvailable: 50 }]
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

  const filteredSports = sports.filter((s) => {
    if (selectedSport === 'all') return true;
    if (selectedSport === 'other') {
      return !['cricket', 'football', 'basketball', 'tennis', 'badminton'].includes(s.sport.toLowerCase());
    }
    return s.sport.toLowerCase().includes(selectedSport.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-full text-xs font-bold">
          <Trophy className="w-3.5 h-3.5" />
          <span>STADIUM TOURNAMENTS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Live Sports Matches</h1>
        <p className="text-slate-400 text-sm">Cricket, Football, Basketball, Tennis, Badminton & premier tournaments</p>
      </div>

      {/* Sport Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 no-scrollbar">
        {sportTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelectedSport(t.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSport === t.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Stadium Events...</span>
        </div>
      ) : filteredSports.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-2">
          <h3 className="text-lg font-bold text-white">No Matches Found</h3>
          <p className="text-xs text-slate-400">No scheduled matches for the selected sport category at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSports.map((sp) => (
            <SportsCard key={sp.id} sportsEvent={sp} />
          ))}
        </div>
      )}
    </div>
  );
};

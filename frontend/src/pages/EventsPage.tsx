import React, { useState } from 'react';
import { MOCK_EVENTS } from '../data/mockData';
import { EventCard } from '../components/cards/EventCard';
import { Music, Filter } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredEvents = MOCK_EVENTS.filter((e) => {
    if (selectedCategory !== 'all' && e.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-600/20 text-teal-400 border border-teal-500/30 rounded-full text-xs font-bold">
          <Music className="w-3.5 h-3.5" />
          <span>LIVE ENTERTAINMENT</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Events & Concerts</h1>
        <p className="text-slate-400 text-sm">Discover live music, stand-up comedy, festivals, and theatre</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-800 pb-3">
        {['all', 'Concert', 'Comedy', 'Theatre', 'Festival', 'Workshop'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all uppercase whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {cat === 'all' ? 'All Events' : cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} eventItem={event} />
        ))}
      </div>
    </div>
  );
};

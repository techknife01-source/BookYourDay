import React, { useEffect, useState } from 'react';
import { catalogApi } from '../api/catalogApi';
import { EventCard } from '../components/cards/EventCard';
import { Music, Loader2 } from 'lucide-react';
import { EventItem } from '../types';

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    async function fetchEvents() {
      setLoading(true);
      try {
        const items = await catalogApi.getByCategory('events');
        if (!mounted) return;
        const evtList: EventItem[] = items.map((item) => ({
          id: item.id,
          title: item.title,
          category: item.metadata?.eventCategory || 'Concert',
          image: item.image,
          backdrop: item.backdrop || item.image,
          date: item.metadata?.date || '15 Aug 2026',
          time: item.metadata?.time || '07:00 PM',
          venue: item.location || 'City Arena',
          city: item.city || 'Asansol',
          startingPrice: item.priceFrom || 499,
          rating: item.rating || 4.7,
          organizer: item.metadata?.organizer || 'Live Events',
          description: item.description,
          ticketTiers: item.metadata?.ticketTiers || [{ id: 't1', name: 'General Entry', price: item.priceFrom || 499, description: 'Standard Access', availableQuantity: 50 }]
        }));
        setEvents(evtList);
      } catch (err) {
        console.error('Events fetch error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchEvents();
    return () => { mounted = false; };
  }, []);

  const filteredEvents = events.filter((e) => {
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider">Loading Events from Database...</span>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-2">
          <h3 className="text-lg font-bold text-white">No Events Found</h3>
          <p className="text-xs text-slate-400">Try selecting a different event category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} eventItem={event} />
          ))}
        </div>
      )}
    </div>
  );
};

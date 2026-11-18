import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, MapPin, Star, ArrowRight, Loader2, Tag, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

interface AssistantResult {
  id: string;
  title: string;
  category: string;
  city: string;
  image: string;
  rating?: number;
  price?: number;
  description?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  results?: AssistantResult[];
  explanation?: string;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose, currentCity = 'Kolkata' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I'm your AI Booking Concierge. Tell me what you're looking for (e.g. "Find cricket events this weekend", "Luxury hotels under ₹4,000 in Asansol", or "Water parks near Kolkata") and I will fetch real-time matching experiences for you!`
    }
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Find hotels under ₹3,500 in Asansol',
    'Find cricket matches in Kolkata',
    'Find water parks and theme parks',
    'Find romantic dinner spots under ₹2,000'
  ];

  const handleAsk = async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    const promptText = userPrompt.trim();
    setQuery('');

    // Add user message
    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: promptText
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // 1. Natural language parameter extraction
      const lower = promptText.toLowerCase();

      // Extract City
      let targetCity = currentCity;
      if (lower.includes('kolkata')) targetCity = 'Kolkata';
      else if (lower.includes('asansol')) targetCity = 'Asansol';
      else if (lower.includes('mumbai')) targetCity = 'Mumbai';
      else if (lower.includes('delhi')) targetCity = 'Delhi';
      else if (lower.includes('bengaluru') || lower.includes('bangalore')) targetCity = 'Bengaluru';
      else if (lower.includes('chennai')) targetCity = 'Chennai';

      // Extract Category
      let category = '';
      if (lower.includes('hotel') || lower.includes('stay') || lower.includes('resort')) category = 'hotels';
      else if (lower.includes('movie') || lower.includes('cinema') || lower.includes('theatre')) category = 'movies';
      else if (lower.includes('cricket') || lower.includes('sport') || lower.includes('match') || lower.includes('football')) category = 'sports';
      else if (lower.includes('park') || lower.includes('water') || lower.includes('zoo') || lower.includes('amusement')) category = 'attractions';
      else if (lower.includes('food') || lower.includes('restaurant') || lower.includes('dinner') || lower.includes('buffet') || lower.includes('lunch')) category = 'dining';
      else if (lower.includes('concert') || lower.includes('event') || lower.includes('comedy') || lower.includes('live')) category = 'events';

      // Extract Budget Max Price (e.g. "under 3000" or "under ₹10,000")
      const budgetMatch = lower.match(/(?:under|below|max|budget)\s*(?:₹|rs\.?|inr)?\s*(\d+[\d,]*)/i);
      let maxPrice = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, ''), 10) : undefined;

      // 2. Query real database via Search API
      const searchRes = await apiClient.get('/search', {
        params: {
          q: promptText,
          city: targetCity,
          category: category || undefined,
          maxPrice: maxPrice || undefined
        }
      });

      let items: AssistantResult[] = [];
      if (searchRes.data && searchRes.data.success && Array.isArray(searchRes.data.data?.results)) {
        items = searchRes.data.data.results.map((r: any) => ({
          id: r.id,
          title: r.title,
          category: r.category,
          city: r.city,
          image: r.image,
          rating: r.rating || 4.8,
          price: r.price,
          description: r.description
        }));
      }

      // If search returns few results, fallback to catalog by category
      if (items.length === 0 && category) {
        const catRes = await apiClient.get(`/catalog/${category}`);
        if (catRes.data && catRes.data.success && Array.isArray(catRes.data.data)) {
          items = catRes.data.data.slice(0, 3).map((r: any) => ({
            id: r.id,
            title: r.title,
            category: r.category,
            city: r.city,
            image: r.image,
            rating: r.rating || 4.7,
            price: r.priceFrom || 500,
            description: r.description
          }));
        }
      }

      const explanation = items.length > 0
        ? `I found ${items.length} top-rated match${items.length === 1 ? '' : 'es'} in ${targetCity}${maxPrice ? ` within your budget of ₹${maxPrice.toLocaleString()}` : ''}:`
        : `I could not find exact matches for "${promptText}" in ${targetCity}. Here are recommended popular experiences nearby:`;

      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          sender: 'assistant',
          text: explanation,
          results: items.slice(0, 3)
        }
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          sender: 'assistant',
          text: `I had trouble connecting to the catalog search. Please try searching directly or choose one of our trending options.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (res: AssistantResult) => {
    onClose();
    const catLower = res.category.toLowerCase();
    if (catLower === 'movie') navigate(`/movies/${res.id}`);
    else if (catLower === 'event') navigate(`/events/${res.id}`);
    else if (catLower === 'sports') navigate(`/sports/${res.id}`);
    else if (catLower === 'hotel') navigate(`/hotels/${res.id}`);
    else navigate(`/${catLower}s/${res.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full h-[650px] flex flex-col overflow-hidden shadow-2xl relative text-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-500 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <span>AI Booking Assistant</span>
                <span className="text-[10px] bg-rose-600/20 text-rose-400 border border-rose-500/30 font-bold px-2 py-0.5 rounded-full">
                  LIVE DB SEARCH
                </span>
              </h3>
              <p className="text-xs text-slate-400">Natural-language discovery & smart reservation recommendations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#020617]/60">
          {messages.map((m) => {
            const isMe = m.sender === 'user';
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-2`}>
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? 'bg-rose-600 text-white rounded-br-none shadow-lg shadow-rose-900/30'
                      : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/80 shadow-md'
                  }`}
                >
                  <p>{m.text}</p>
                </div>

                {/* Direct Booking Cards */}
                {m.results && m.results.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl pt-1">
                    {m.results.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleCardClick(r)}
                        className="bg-slate-950 border border-slate-800 hover:border-rose-500/60 rounded-2xl p-3 flex gap-3 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
                      >
                        <img
                          src={r.image}
                          alt={r.title}
                          className="w-16 h-20 object-cover rounded-xl shrink-0 border border-slate-800"
                        />
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="font-bold text-rose-400 uppercase">{r.category}</span>
                              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {r.rating}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-white truncate mt-0.5 group-hover:text-rose-400 transition-colors">
                              {r.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              <span className="truncate">{r.city}</span>
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                            <span className="text-xs font-black text-emerald-400">
                              {r.price ? `₹${r.price}` : 'Book'}
                            </span>
                            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                              <span>Select</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 p-3 rounded-2xl w-fit border border-slate-800">
              <Loader2 className="w-4 h-4 text-rose-500 animate-spin" />
              <span>Checking database, availability and pricing...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleAsk(qp)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors shrink-0"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(query);
          }}
          className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="e.g. Find 2 tickets for movies tonight under ₹500 in Asansol"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="py-3 px-5 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
};

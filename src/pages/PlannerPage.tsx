import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Calendar,
  Clock,
  Wallet,
  MapPin,
  Users,
  Compass,
  Trash2,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Film,
  Ticket,
  Utensils,
  Trophy,
  Plus,
  Edit3,
  TrendingDown,
  Layers,
  Search,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { DayPlan, DayPlanItem, PlannerRequest } from '../types';
import { PlannerService } from '../services/plannerService';

interface PlannerPageProps {
  currentCity?: string;
}

export const PlannerPage: React.FC<PlannerPageProps> = ({ currentCity = 'Kolkata' }) => {
  const navigate = useNavigate();

  // Natural Language Prompt State
  const [promptText, setPromptText] = useState(
    'I have one free day in Kolkata tomorrow and ₹3000. I want breakfast, an attraction, lunch, an activity, and something fun in the evening.'
  );

  // Form Controls / Constraints State
  const [city, setCity] = useState(currentCity);
  const [budget, setBudget] = useState(3000);
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('22:00');
  const [pace, setPace] = useState<'relaxed' | 'moderate' | 'packed'>('moderate');
  const [showFilters, setShowFilters] = useState(false);

  // Planner Status & Result State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayPlan, setDayPlan] = useState<DayPlan | null>(null);

  // Time editing modal state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newTimeVal, setNewTimeVal] = useState('14:00');

  // Quick Preset Sample Prompts
  const quickPrompts = [
    {
      label: 'Kolkata Explorer (₹3,000)',
      text: 'I have one free day in Kolkata tomorrow and ₹3000. I want breakfast, an attraction, lunch, an activity, and something fun in the evening.'
    },
    {
      label: 'Romantic Date (₹5,000)',
      text: 'Give me a romantic day in Kolkata under ₹5000 for 2 adults with fine dining and scenic activities.'
    },
    {
      label: 'Airport Layover (6 Hours)',
      text: 'I have 6 hours near Kolkata airport with ₹2000 budget for quick food and relaxing entertainment.'
    },
    {
      label: 'Family Outing (₹4,000)',
      text: 'Make a fun, family-friendly day in Kolkata for 4 people with food and theme park attractions under ₹4000.'
    }
  ];

  // Auto-generate initial plan on initial mount
  useEffect(() => {
    handleGeneratePlan();
  }, []);

  const handleGeneratePlan = async (customPrompt?: string) => {
    setLoading(true);
    setError(null);
    const activePrompt = customPrompt || promptText;

    try {
      // 1. Generate plan using natural language prompt or structured parameters
      const requestParams: PlannerRequest = {
        prompt: activePrompt,
        city: city || 'Kolkata',
        budget: Number(budget) || 3000,
        guests: Number(guests) || 1,
        date,
        startTime,
        endTime,
        pace
      };

      const plan = await PlannerService.generatePlan(requestParams);
      setDayPlan(plan);
      if (plan.budget) setBudget(plan.budget);
      if (plan.city) setCity(plan.city);
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setError(err?.message || 'Failed to generate itinerary plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (action?: any, targetItemId?: string, targetCategory?: string) => {
    if (!dayPlan) return;
    setLoading(true);
    setError(null);

    try {
      const updatedPlan = await PlannerService.regeneratePlan(dayPlan, {
        action,
        targetItemId,
        targetCategory,
        updatedConstraints: {
          city,
          budget: Number(budget),
          guests: Number(guests),
          date,
          startTime,
          endTime,
          pace
        }
      });
      setDayPlan(updatedPlan);
    } catch (err: any) {
      console.error('Regeneration failed:', err);
      setError(err?.message || 'Failed to modify itinerary.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTimeChange = async () => {
    if (!editingItemId || !dayPlan) return;
    setEditingItemId(null);
    setLoading(true);

    try {
      const updatedPlan = await PlannerService.regeneratePlan(dayPlan, {
        action: 'MOVE',
        targetItemId: editingItemId,
        targetTime: newTimeVal
      });
      setDayPlan(updatedPlan);
    } catch (err: any) {
      setError(err?.message || 'Failed to change time slot.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'RESTAURANT': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ATTRACTION': return 'bg-teal-500/10 text-teal-400 border-teal-500/30';
      case 'EXPERIENCE': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'EVENT': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'MOVIE': return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'SPORTS': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat.toUpperCase()) {
      case 'RESTAURANT': return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'ATTRACTION': return <Compass className="w-4 h-4 text-teal-400" />;
      case 'EXPERIENCE': return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'EVENT': return <Ticket className="w-4 h-4 text-rose-400" />;
      case 'MOVIE': return <Film className="w-4 h-4 text-sky-400" />;
      case 'SPORTS': return <Trophy className="w-4 h-4 text-emerald-400" />;
      default: return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-20">
      {/* Top Banner Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-[#0a1228] to-[#020617] border-b border-slate-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI Smart Itinerary Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
            Plan Your Day in Seconds with <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400">Real Inventory</span>
          </h1>
          <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
            Tell our AI what you want to experience today, your budget, and preferences. We automatically orchestrate real bookable venues, restaurants, events, and attractions with zero hallucinations.
          </p>

          {/* Prompt Search Box */}
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="relative bg-slate-900/90 border-2 border-slate-700/80 focus-within:border-rose-500 rounded-2xl p-2.5 shadow-2xl backdrop-blur-xl transition-all">
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="e.g. I have 1 free day in Kolkata and ₹3000. Give me breakfast, an attraction, lunch, and something fun in the evening."
                rows={2}
                className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base p-2 focus:outline-none resize-none font-medium"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 px-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                  <span>Constraints & Preferences</span>
                  {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleGeneratePlan()}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm rounded-xl shadow-lg shadow-rose-900/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Itinerary</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold mr-1">Quick Prompts:</span>
              {quickPrompts.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPromptText(preset.text);
                    handleGeneratePlan(preset.text);
                  }}
                  className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60 rounded-full text-slate-300 hover:text-white transition-all text-[11px]"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Expandable Preferences / Constraints Bar */}
      {showFilters && (
        <section className="bg-slate-900/90 border-b border-slate-800 py-6 px-4 sm:px-6 lg:px-8 animate-fade-in">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
            {/* City */}
            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> Target City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Budget */}
            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-amber-400" /> Max Budget (₹)
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                step={500}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Guests */}
            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-sky-400" /> Number of Guests
              </label>
              <input
                type="number"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                min={1}
                max={10}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Pace */}
            <div>
              <label className="block text-slate-400 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Schedule Pace
              </label>
              <select
                value={pace}
                onChange={(e: any) => setPace(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-rose-500"
              >
                <option value="relaxed">Relaxed (Slow & Casual)</option>
                <option value="moderate">Moderate (Standard)</option>
                <option value="packed">Packed (Action-Filled)</option>
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Main Itinerary Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 bg-rose-950/40 border border-rose-800/80 rounded-2xl flex items-start gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Error Processing Request</p>
              <p className="text-xs text-rose-400/90 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && !dayPlan && (
          <div className="py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 font-semibold text-sm">Orchestrating real BookYourDay marketplace inventory...</p>
          </div>
        )}

        {/* Day Plan Display */}
        {dayPlan && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column: Timeline View (2 Spans on LG) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Warnings Banner if any */}
              {dayPlan.warnings && dayPlan.warnings.length > 0 && (
                <div className="p-4 bg-amber-950/30 border border-amber-800/60 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-extrabold uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" />
                    <span>Planner Constraints Alert</span>
                  </div>
                  {dayPlan.warnings.map((warn, i) => (
                    <p key={i} className="text-xs text-amber-300/90 leading-relaxed pl-6">
                      • {warn}
                    </p>
                  ))}
                </div>
              )}

              {/* Timeline Header Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>Day Itinerary in</span>
                    <span className="text-rose-400">{dayPlan.city}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {dayPlan.items.length} confirmed activities • Date: {dayPlan.date}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRegenerate('REGENERATE_ALL')}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>

                  <button
                    onClick={() => handleRegenerate('MAKE_CHEAPER')}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-xl border border-amber-500/30 transition-all"
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Make Cheaper</span>
                  </button>
                </div>
              </div>

              {/* Chronological Timeline Stream */}
              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-rose-500 before:via-purple-500 before:to-indigo-500">
                {dayPlan.items.map((item, idx) => (
                  <div key={item.id || idx} className="relative group">
                    {/* Timeline Node Point */}
                    <div className="absolute -left-6 sm:-left-8 top-5 w-6 h-6 rounded-full bg-slate-900 border-2 border-rose-500 flex items-center justify-center text-[10px] font-bold text-rose-400 shadow-md">
                      {idx + 1}
                    </div>

                    {/* Travel Time Indicator Badge if distanceKm exists */}
                    {idx > 0 && item.travelTimeMinutes > 0 && (
                      <div className="mb-3 ml-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-full text-[11px] font-medium text-slate-400">
                        <Navigation className="w-3 h-3 text-rose-400" />
                        <span>
                          {item.travelTimeMinutes} min travel ({item.distanceKm ? `${item.distanceKm} km` : 'nearby'})
                        </span>
                      </div>
                    )}

                    {/* Item Card Container */}
                    <div className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg transition-all">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Time & Title Info */}
                        <div className="flex items-start gap-3">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80'}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-800"
                          />

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-rose-400 font-extrabold text-xs tracking-wide bg-rose-500/10 px-2 py-0.5 rounded-md">
                                {item.startTime} – {item.endTime}
                              </span>

                              <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${getCategoryBadgeColor(item.category)}`}>
                                {getCategoryIcon(item.category)}
                                <span>{item.category}</span>
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
                              {item.title}
                            </h3>

                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                              <span className="truncate max-w-xs">{item.location}</span>
                            </p>
                          </div>
                        </div>

                        {/* Price & Primary Actions */}
                        <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                          <div>
                            <span className="text-xs text-slate-500 font-medium">Estimated Price</span>
                            <p className="text-lg font-black text-emerald-400">₹{item.estimatedCost}</p>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            {/* Book Now Button */}
                            <button
                              onClick={() => navigate(item.bookingUrl || `/search`)}
                              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1"
                            >
                              <span>Book Now</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            {/* Item Actions Dropdown */}
                            <button
                              onClick={() => {
                                setEditingItemId(item.id);
                                setNewTimeVal(item.startTime);
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                              title="Change Time"
                            >
                              <Clock className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRegenerate('REPLACE', item.id, item.category)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                              title="Replace Item"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleRegenerate('REMOVE', item.id)}
                              className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 rounded-lg text-xs"
                              title="Remove Item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Cost Summary & AI Explanation Card */}
            <div className="space-y-6">
              {/* Budget Overview Gauge Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span>Cost Summary & Budget</span>
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Target Budget:</span>
                    <span className="font-bold text-white">₹{dayPlan.budget}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Estimated Total:</span>
                    <span className={`font-black text-lg ${dayPlan.estimatedTotal <= dayPlan.budget ? 'text-emerald-400' : 'text-amber-400'}`}>
                      ₹{dayPlan.estimatedTotal}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-800">
                    <span>Remaining Budget:</span>
                    <span className="font-bold text-slate-300">₹{dayPlan.remainingBudget}</span>
                  </div>

                  {/* Budget Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 mt-2">
                    <div
                      className={`h-full transition-all duration-500 ${dayPlan.estimatedTotal <= dayPlan.budget ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`}
                      style={{ width: `${Math.min(100, (dayPlan.estimatedTotal / (dayPlan.budget || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* AI Explanation Card */}
              {dayPlan.aiExplanation && (
                <div className="bg-gradient-to-br from-indigo-950/40 to-purple-950/40 border border-indigo-800/50 rounded-2xl p-6 shadow-xl space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Why This Itinerary?</span>
                  </div>
                  <p className="text-xs text-indigo-200/90 leading-relaxed font-medium">
                    {dayPlan.aiExplanation}
                  </p>
                </div>
              )}

              {/* Key Assumptions */}
              {dayPlan.assumptions && dayPlan.assumptions.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-xs space-y-2">
                  <span className="font-bold text-slate-300 uppercase tracking-wider block">Assumptions & Logistics</span>
                  <ul className="space-y-1 text-slate-400">
                    {dayPlan.assumptions.map((ass, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                        <span>{ass}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Change Time Modal */}
      {editingItemId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <span>Change Activity Start Time</span>
            </h3>

            <p className="text-xs text-slate-400">
              Select a new start time for this activity. The engine will automatically shift downstream activities to prevent schedule overlaps.
            </p>

            <input
              type="time"
              value={newTimeVal}
              onChange={(e) => setNewTimeVal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold text-center text-lg focus:outline-none focus:border-rose-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingItemId(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={handleApplyTimeChange}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-500"
              >
                Apply Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

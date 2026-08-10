import React, { useState } from 'react';
import { MOCK_MOVIES } from '../data/mockData';
import { MovieCard } from '../components/cards/MovieCard';
import { Film, Filter } from 'lucide-react';

export const MoviesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'showing' | 'coming' | 'popular'>('showing');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');

  const filteredMovies = MOCK_MOVIES.filter((m) => {
    if (selectedLanguage !== 'all' && !m.language.includes(selectedLanguage)) return false;
    if (selectedGenre !== 'all' && !m.genre.includes(selectedGenre)) return false;
    if (selectedFormat !== 'all' && !m.format.includes(selectedFormat)) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-full text-xs font-bold">
          <Film className="w-3.5 h-3.5" />
          <span>CINEMA EXPERIENCE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">Movies in Cinemas</h1>
        <p className="text-slate-400 text-sm">Discover top blockbusters, IMAX screenings & 4DX experiences</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'showing', label: 'Now Showing' },
          { id: 'coming', label: 'Coming Soon' },
          { id: 'popular', label: 'Top Rated' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-bold">
          <Filter className="w-4 h-4 text-rose-500" />
          <span>FILTERS:</span>
        </div>

        {/* Language dropdown */}
        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-semibold focus:outline-none"
        >
          <option value="all">All Languages</option>
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Tamil">Tamil</option>
          <option value="Spanish">Spanish</option>
        </select>

        {/* Genre dropdown */}
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-semibold focus:outline-none"
        >
          <option value="all">All Genres</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Action">Action</option>
          <option value="Drama">Drama</option>
          <option value="Fantasy">Fantasy</option>
        </select>

        {/* Format dropdown */}
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-semibold focus:outline-none"
        >
          <option value="all">All Formats</option>
          <option value="IMAX 3D">IMAX 3D</option>
          <option value="3D">3D</option>
          <option value="4DX">4DX</option>
          <option value="2D">2D</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

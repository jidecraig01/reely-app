import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { discoverMedia } from '../tmdb';
import type { MediaItem, MediaType } from '../types';

interface VibeSearchProps {
  onResults: (movies: MediaItem[], query: string) => void;
  onLoading: (loading: boolean) => void;
  mediaType: MediaType;
}

export default function VibeSearch({ onResults, onLoading, mediaType }: VibeSearchProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleVibeSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    onLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const res = await fetch(`${supabaseUrl}/functions/v1/vibe-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || 'Vibe search failed');
      }

      const filters = await res.json();

      // Determine which media types to search
      const requestedTypes: MediaType[] = Array.isArray(filters.media_types) && filters.media_types.length > 0
        ? filters.media_types
        : [mediaType];

      // Fetch results for each requested media type (up to 2 pages each for ~30 results)
      const allResults: MediaItem[] = [];
      for (const mt of requestedTypes) {
        const page1 = await discoverMedia({
          genre_ids: filters.genre_ids,
          min_rating: filters.min_rating,
          min_year: filters.min_year,
          max_year: filters.max_year,
          sort_by: filters.sort_by,
          media_type: mt,
          page: 1,
        });
        allResults.push(...page1);
      }

      // Sort by popularity (vote_average if requested) and take top 30
      allResults.sort((a, b) => b.vote_average - a.vote_average);
      const results = allResults.slice(0, 30);

      onResults(results, query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed. Try again.');
    } finally {
      onLoading(false);
    }
  }

  async function handleQuickSearch(mood: string) {
    setQuery(mood);
    handleVibeSearch({ preventDefault: () => {} } as React.FormEvent);
  }

  const quickMoods = [
    'Something dark and thrilling',
    'Feel-good comedy night',
    'Mind-bending sci-fi',
    'Cozy rainy day drama',
  ];

  return (
    <div className="mb-10">
      <form onSubmit={handleVibeSearch} className="relative max-w-2xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your mood... e.g. 'dark thriller set in winter'"
          className="input-field w-full pr-28 text-base"
        />
        <button type="submit" className="btn-primary absolute right-1.5 top-1/2 -translate-y-1/2">
          Vibe Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {quickMoods.map((mood) => (
          <button
            key={mood}
            onClick={() => handleQuickSearch(mood)}
            className="text-xs text-screenDim bg-velvet/60 border border-velvetLighter/50 rounded-full px-3 py-1.5 hover:border-neon/50 hover:text-screen transition-colors"
          >
            {mood}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
    </div>
  );
}

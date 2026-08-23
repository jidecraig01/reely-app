import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { getTrending } from './tmdb';
import type { MediaItem, MediaType, WatchlistItem } from './types';
import Auth from './components/Auth';
import Header from './components/Header';
import VibeSearch from './components/VibeSearch';
import MovieCard from './components/MovieCard';
import WatchlistCard from './components/WatchlistCard';
import CinematicBackground from './components/CinematicBackground';

type View = 'discover' | 'watchlist';

export default function App() {
  const [session, setSession] = useState<boolean | null>(null);
  const [view, setView] = useState<View>('discover');
  const [mediaType, setMediaType] = useState<MediaType>('movie');
  const [movies, setMovies] = useState<MediaItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingLoaded, setTrendingLoaded] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(!!data?.session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const loadWatchlist = useCallback(async () => {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .order('added_at', { ascending: false });

    if (error) {
      console.error('Error loading watchlist:', error);
      return;
    }
    setWatchlist((data as WatchlistItem[]) || []);
  }, []);

  useEffect(() => {
    if (session) {
      loadWatchlist();
    }
  }, [session, loadWatchlist]);

  useEffect(() => {
    if (session && view === 'discover' && !trendingLoaded.has(mediaType)) {
      setLoading(true);
      getTrending(mediaType)
        .then((results) => {
          setMovies(results.slice(0, 30));
          setTrendingLoaded((prev) => new Set(prev).add(mediaType));
        })
        .catch((err) => console.error('Error loading trending:', err))
        .finally(() => setLoading(false));
    }
  }, [session, view, mediaType, trendingLoaded]);

  // When switching media type in discover view, show the cached trending for that type
  useEffect(() => {
    if (view === 'discover' && trendingLoaded.has(mediaType) && !searchQuery) {
      setLoading(true);
      getTrending(mediaType)
        .then((results) => setMovies(results.slice(0, 30)))
        .catch((err) => console.error('Error loading trending:', err))
        .finally(() => setLoading(false));
    }
  }, [mediaType]); // eslint-disable-line react-hooks/exhaustive-deps

  const watchlistIds = new Set(watchlist.map((w) => w.tmdb_id));

  async function handleAddToWatchlist(movie: MediaItem) {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        user_id: userId,
        tmdb_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        media_type: movie.media_type,
        rating: null,
        ai_blurb: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to watchlist:', error);
      return;
    }

    setWatchlist((prev) => [data as WatchlistItem, ...prev]);

    // Fire-and-forget: trigger blurb generation
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    fetch(`${supabaseUrl}/functions/v1/movie-blurb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session?.access_token}`,
      },
      body: JSON.stringify({
        tmdb_id: movie.id,
        title: movie.title,
        overview: movie.overview,
        watchlist_id: data.id,
      }),
    })
      .then(async (res) => {
        if (!res.ok) return;
        const result = await res.json();
        if (result.blurb) {
          setWatchlist((prev) =>
            prev.map((w) =>
              w.id === data.id ? { ...w, ai_blurb: result.blurb } : w
            )
          );
        }
      })
      .catch((err) => console.error('Blurb generation failed:', err));
  }

  async function handleRemoveFromWatchlist(tmdbId: number) {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('tmdb_id', tmdbId);

    if (error) {
      console.error('Error removing from watchlist:', error);
      return;
    }

    setWatchlist((prev) => prev.filter((w) => w.tmdb_id !== tmdbId));
  }

  async function handleRate(tmdbId: number, rating: number) {
    const { error } = await supabase
      .from('watchlist')
      .update({ rating })
      .eq('tmdb_id', tmdbId);

    if (error) {
      console.error('Error rating movie:', error);
      return;
    }

    setWatchlist((prev) =>
      prev.map((w) => (w.tmdb_id === tmdbId ? { ...w, rating } : w))
    );
  }

  if (session === null) {
    return (
      <>
        <CinematicBackground />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-screenDim">Loading...</p>
        </div>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <CinematicBackground />
        <Auth />
      </>
    );
  }

  return (
    <>
      <CinematicBackground />
      <div className="min-h-screen">
      <Header
        view={view}
        onViewChange={setView}
        watchlistCount={watchlist.length}
        mediaType={mediaType}
        onMediaTypeChange={setMediaType}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'discover' ? (
          <>
            <div className="text-center mb-8">
              <h2 className="font-display text-4xl tracking-wide text-screen">
                {searchQuery ? `Results for "${searchQuery}"` : mediaType === 'tv' ? 'Trending TV Series' : 'Trending Movies'}
              </h2>
              <p className="text-screenDim text-sm mt-2">
                {searchQuery
                  ? 'Found via your vibe search'
                  : 'Search by mood above, or browse what\'s popular'}
              </p>
            </div>

            <VibeSearch
              mediaType={mediaType}
              onResults={(results, query) => {
                setMovies(results);
                setSearchQuery(query);
              }}
              onLoading={setLoading}
            />

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="text-screenDim animate-pulse">Loading...</div>
              </div>
            ) : movies.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-screenDim">No results found. Try a different mood.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <MovieCard
                    key={`${movie.media_type}-${movie.id}`}
                    movie={movie}
                    inWatchlist={watchlistIds.has(movie.id)}
                    onAdd={handleAddToWatchlist}
                    onRemove={handleRemoveFromWatchlist}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="font-display text-4xl tracking-wide text-screen">Your Watchlist</h2>
              <p className="text-screenDim text-sm mt-2">
                {watchlist.length === 0
                  ? 'Nothing here yet — go discover something to watch'
                  : `${watchlist.length} ${watchlist.length === 1 ? 'title' : 'titles'} to watch`}
              </p>
            </div>

            {watchlist.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-screenDim mb-4">Your watchlist is empty.</p>
                <button onClick={() => setView('discover')} className="btn-primary">
                  Discover
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {watchlist.map((item) => (
                  <WatchlistCard
                    key={item.id}
                    item={item}
                    onRemove={handleRemoveFromWatchlist}
                    onRate={handleRate}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-velvetLight/30 mt-20 py-6 text-center">
        <p className="text-screenDim/60 text-xs">
          REELY · Movie & TV data from TMDB · AI-powered by OpenAI
        </p>
      </footer>
      </div>
    </>
  );
}

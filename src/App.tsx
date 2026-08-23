import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';
import { getTrendingMovies } from './tmdb';
import type { Movie, WatchlistItem } from './types';
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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingLoaded, setTrendingLoaded] = useState(false);

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
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading watchlist:', error);
      return;
    }
    setWatchlist(data || []);
  }, []);

  useEffect(() => {
    if (session) {
      loadWatchlist();
    }
  }, [session, loadWatchlist]);

  useEffect(() => {
    if (session && view === 'discover' && !trendingLoaded) {
      setLoading(true);
      getTrendingMovies()
        .then((results) => {
          setMovies(results);
          setTrendingLoaded(true);
        })
        .catch((err) => console.error('Error loading trending:', err))
        .finally(() => setLoading(false));
    }
  }, [session, view, trendingLoaded]);

  const watchlistIds = new Set(watchlist.map((w) => w.movie_id));

  async function handleAddToWatchlist(movie: Movie) {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from('watchlist')
      .insert({
        user_id: userId,
        movie_id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview,
        release_date: movie.release_date,
        vote_average: movie.vote_average,
        rating: null,
        ai_blurb: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding to watchlist:', error);
      return;
    }

    setWatchlist((prev) => [data, ...prev]);

    // Fire-and-forget: trigger blurb generation
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    fetch(`${supabaseUrl}/functions/v1/movie-blurb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session?.access_token}`,
      },
      body: JSON.stringify({
        movie_id: movie.id,
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

  async function handleRemoveFromWatchlist(movieId: number) {
    const { error } = await supabase
      .from('watchlist')
      .delete()
      .eq('movie_id', movieId);

    if (error) {
      console.error('Error removing from watchlist:', error);
      return;
    }

    setWatchlist((prev) => prev.filter((w) => w.movie_id !== movieId));
  }

  async function handleRate(movieId: number, rating: number) {
    const { error } = await supabase
      .from('watchlist')
      .update({ rating })
      .eq('movie_id', movieId);

    if (error) {
      console.error('Error rating movie:', error);
      return;
    }

    setWatchlist((prev) =>
      prev.map((w) => (w.movie_id === movieId ? { ...w, rating } : w))
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
      <Header view={view} onViewChange={setView} watchlistCount={watchlist.length} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === 'discover' ? (
          <>
            <div className="text-center mb-8">
              <h2 className="font-display text-4xl tracking-wide text-screen">
                {searchQuery ? `Results for "${searchQuery}"` : 'Trending This Week'}
              </h2>
              <p className="text-screenDim text-sm mt-2">
                {searchQuery
                  ? 'Found via your vibe search'
                  : 'Search by mood above, or browse what\'s popular'}
              </p>
            </div>

            <VibeSearch
              onResults={(results, query) => {
                setMovies(results);
                setSearchQuery(query);
              }}
              onLoading={setLoading}
            />

            {loading ? (
              <div className="flex justify-center py-20">
                <div className="text-screenDim animate-pulse">Loading movies...</div>
              </div>
            ) : movies.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-screenDim">No movies found. Try a different mood.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <MovieCard
                    key={movie.id}
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
                  ? 'Nothing here yet — go discover some movies'
                  : `${watchlist.length} ${watchlist.length === 1 ? 'movie' : 'movies'} to watch`}
              </p>
            </div>

            {watchlist.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-screenDim mb-4">Your watchlist is empty.</p>
                <button onClick={() => setView('discover')} className="btn-primary">
                  Discover Movies
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
          REELY · Movie data from TMDB · AI-powered by OpenAI
        </p>
      </footer>
      </div>
    </>
  );
}

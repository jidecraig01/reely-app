import { supabase } from '../supabaseClient';
import Logo from './Logo';

interface HeaderProps {
  view: 'discover' | 'watchlist';
  onViewChange: (view: 'discover' | 'watchlist') => void;
  watchlistCount: number;
  mediaType: 'movie' | 'tv';
  onMediaTypeChange: (type: 'movie' | 'tv') => void;
}

export default function Header({ view, onViewChange, watchlistCount, mediaType, onMediaTypeChange }: HeaderProps) {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-velvetLight/30 overflow-hidden">
      <Logo onClick={() => onViewChange('discover')} />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <nav className="flex gap-1">
            <button
              onClick={() => onViewChange('discover')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                view === 'discover' ? 'text-gold' : 'text-screenDim hover:text-screen'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => onViewChange('watchlist')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                view === 'watchlist' ? 'text-gold' : 'text-screenDim hover:text-screen'
              }`}
            >
              Watchlist
              {watchlistCount > 0 && (
                <span className="bg-velvetLighter text-screen text-xs px-1.5 py-0.5 rounded-full">
                  {watchlistCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {view === 'discover' && (
            <div className="flex gap-1 bg-velvet/60 rounded-lg p-1">
              <button
                onClick={() => onMediaTypeChange('movie')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  mediaType === 'movie' ? 'bg-gold text-ink' : 'text-screenDim hover:text-screen'
                }`}
              >
                Movies
              </button>
              <button
                onClick={() => onMediaTypeChange('tv')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  mediaType === 'tv' ? 'bg-gold text-ink' : 'text-screenDim hover:text-screen'
                }`}
              >
                TV Series
              </button>
            </div>
          )}

          <button onClick={handleSignOut} className="btn-ghost text-sm">
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

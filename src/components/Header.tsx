import { supabase } from '../supabaseClient';

interface HeaderProps {
  view: 'discover' | 'watchlist';
  onViewChange: (view: 'discover' | 'watchlist') => void;
  watchlistCount: number;
}

export default function Header({ view, onViewChange, watchlistCount }: HeaderProps) {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-velvetLight/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="font-display text-3xl tracking-wide text-gold cursor-pointer" onClick={() => onViewChange('discover')}>
            REELY
          </h1>

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

        <button onClick={handleSignOut} className="btn-ghost text-sm">
          Sign Out
        </button>
      </div>
    </header>
  );
}

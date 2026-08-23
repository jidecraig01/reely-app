import { supabase } from '../supabaseClient';

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
    <header
      className="sticky top-0 z-50 bg-ink/90 backdrop-blur-md border-b border-velvetLight/30 bg-cover bg-center"
      style={{ backgroundImage: "url('/magnific_a-modern-website-header-b_vQqYpIMa47.png')" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1 flex items-start justify-between bg-transparent text-screen">
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onViewChange('discover')}
            aria-label="REELY home"
            className="w-40 sm:w-64 self-stretch"
          />
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
        <div className="flex flex-col items-end gap-2">
          <button onClick={handleSignOut} className="btn-ghost text-sm">
            Sign Out
          </button>

          {view === 'discover' && (
            <div className="flex gap-1 bg-velvet/60 rounded-lg p-1">
              <button
                onClick={() => onMediaTypeChange('movie')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  mediaType === 'movie' ? 'text-white' : 'text-screenDim hover:text-screen'
                }`}
                style={mediaType === 'movie' ? { background: 'linear-gradient(135deg, #FF9A4A 0%, #FF7A00 50%, #E66800 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 0 10px rgba(255,122,0,0.3)' } : undefined}
              >
                Movies
              </button>
              <button
                onClick={() => onMediaTypeChange('tv')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  mediaType === 'tv' ? 'text-white' : 'text-screenDim hover:text-screen'
                }`}
                style={mediaType === 'tv' ? { background: 'linear-gradient(135deg, #FF9A4A 0%, #FF7A00 50%, #E66800 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 0 10px rgba(255,122,0,0.3)' } : undefined}
              >
                TV Series
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

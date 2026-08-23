import { useState } from 'react';
import { TMDB_IMG_SMALL } from '../tmdb';
import type { WatchlistItem } from '../types';

interface WatchlistCardProps {
  item: WatchlistItem;
  onRemove: (movieId: number) => void;
  onRate: (movieId: number, rating: number) => void;
}

export default function WatchlistCard({ item, onRemove, onRate }: WatchlistCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);

  return (
    <div className="card flex flex-col sm:flex-row">
      <div className="relative sm:w-36 shrink-0 aspect-[2/3] sm:aspect-auto overflow-hidden bg-velvetLight">
        {item.poster_path ? (
          <img
            src={`${TMDB_IMG_SMALL}${item.poster_path}`}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-screenDim text-sm p-2 text-center">
            {item.title}
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-screen">{item.title}</h3>
          <button
            onClick={() => onRemove(item.movie_id)}
            className="text-screenDim hover:text-red-400 transition-colors text-sm shrink-0"
            title="Remove from watchlist"
          >
            Remove
          </button>
        </div>

        <div className="flex items-center gap-3 mt-1 text-sm text-screenDim">
          {item.release_date && (
            <span className="font-mono">{item.release_date.slice(0, 4)}</span>
          )}
          {item.vote_average > 0 && (
            <span className="font-mono text-gold/80">★ {item.vote_average.toFixed(1)}</span>
          )}
        </div>

        {item.ai_blurb && (
          <div className="mt-3">
            <p className="text-xs text-plum font-medium uppercase tracking-wider mb-1">
              Why you'll like this
            </p>
            <p className="text-sm text-screen/80 leading-relaxed">{item.ai_blurb}</p>
          </div>
        )}

        {item.ai_blurb === null && (
          <p className="text-xs text-screenDim/50 mt-3 italic">
            Generating your personalized blurb...
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center gap-2">
          <span className="text-xs text-screenDim">Your rating:</span>
          <div className="flex gap-1" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onRate(item.movie_id, star)}
                className={`text-lg transition-colors ${
                  (hovering ? false : item.rating !== null && star <= item.rating)
                    ? 'text-gold'
                    : 'text-velvetLighter hover:text-gold/60'
                }`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { TMDB_IMG_SMALL, MOVIE_GENRES, TV_GENRES } from '../tmdb';
import type { MediaItem } from '../types';

interface MovieCardProps {
  movie: MediaItem;
  inWatchlist: boolean;
  onAdd: (movie: MediaItem) => void;
  onRemove: (movieId: number) => void;
}

export default function MovieCard({ movie, inWatchlist, onAdd, onRemove }: MovieCardProps) {
  const genreMap = movie.media_type === 'tv' ? TV_GENRES : MOVIE_GENRES;
  const genres = movie.genre_ids
    ?.slice(0, 2)
    .map((id) => genreMap[id])
    .filter(Boolean);

  return (
    <div className="card group flex flex-col">
      <div className="relative aspect-[2/3] overflow-hidden bg-velvetLight">
        {movie.poster_path ? (
          <img
            src={`${TMDB_IMG_SMALL}${movie.poster_path}`}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-screenDim text-sm p-4 text-center">
            {movie.title}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-80" />

        <div className="absolute top-2 left-2 bg-ink/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-screenDim">
          {movie.media_type === 'tv' ? 'TV' : 'Film'}
        </div>

        <div className="absolute top-2 right-2 bg-ink/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-mono text-gold">
          {movie.vote_average.toFixed(1)}
        </div>

        {inWatchlist ? (
          <button
            onClick={() => onRemove(movie.id)}
            className="absolute bottom-2 right-2 bg-sage text-ink rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-sage/80 transition-colors"
            title="In your watchlist — click to remove"
          >
            ✓
          </button>
        ) : (
          <button
            onClick={() => onAdd(movie)}
            className="absolute bottom-2 right-2 bg-gold text-ink rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold hover:bg-gold/80 transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
            title="Add to watchlist"
          >
            +
          </button>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-screen line-clamp-1">{movie.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          {movie.release_date && (
            <span className="text-xs text-screenDim font-mono">
              {movie.release_date.slice(0, 4)}
            </span>
          )}
          {genres && genres.length > 0 && (
            <span className="text-xs text-screenDim/70">{genres.join(' · ')}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export type MediaType = 'movie' | 'tv';

export interface MediaItem {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
  media_type: MediaType;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  rating: number | null;
  ai_blurb: string | null;
  media_type: MediaType;
  added_at: string;
}

export interface VibeSearchResult {
  genre_ids: number[];
  min_rating: number;
  max_year: number | null;
  min_year: number | null;
  sort_by: string;
  media_types: MediaType[];
}

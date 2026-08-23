import type { Movie } from './types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY as string;
const TMDB_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMG_SMALL = 'https://image.tmdb.org/t/p/w342';
export const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/w1280';

export const TMDB_GENRES: Record<number, string> = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

interface TMDBResponse<T> {
  results: T[];
  total_pages: number;
  total_results: number;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB request failed: ${res.status}`);
  }
  return res.json();
}

export async function discoverMovies(opts: {
  genre_ids?: number[];
  min_rating?: number;
  min_year?: number | null;
  max_year?: number | null;
  sort_by?: string;
  page?: number;
}): Promise<Movie[]> {
  const params: Record<string, string> = {
    sort_by: opts.sort_by || 'popularity.desc',
    'vote_count.gte': '50',
    include_adult: 'false',
  };
  if (opts.genre_ids && opts.genre_ids.length > 0) {
    params.with_genres = opts.genre_ids.join(',');
  }
  if (opts.min_rating !== undefined) {
    params['vote_average.gte'] = String(opts.min_rating);
  }
  if (opts.min_year) {
    params['primary_release_date.gte'] = `${opts.min_year}-01-01`;
  }
  if (opts.max_year) {
    params['primary_release_date.lte'] = `${opts.max_year}-12-31`;
  }
  if (opts.page) {
    params.page = String(opts.page);
  }

  const data = await tmdbFetch<TMDBResponse<Movie>>('/discover/movie', params);
  return data.results;
}

export async function getTrendingMovies(): Promise<Movie[]> {
  const data = await tmdbFetch<TMDBResponse<Movie>>('/trending/movie/week');
  return data.results;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  const data = await tmdbFetch<TMDBResponse<Movie>>('/search/movie', { query });
  return data.results;
}

export async function getMovieDetails(movieId: number): Promise<Movie> {
  return tmdbFetch<Movie>(`/movie/${movieId}`);
}

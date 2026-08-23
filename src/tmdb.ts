import type { MediaItem, MediaType } from './types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY as string;
const TMDB_BASE = 'https://api.themoviedb.org/3';
export const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
export const TMDB_IMG_SMALL = 'https://image.tmdb.org/t/p/w342';
export const TMDB_BACKDROP = 'https://image.tmdb.org/t/p/w1280';

export const MOVIE_GENRES: Record<number, string> = {
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

export const TV_GENRES: Record<number, string> = {
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
};

export const TMDB_GENRES = MOVIE_GENRES;

interface TMDBResponse<T> {
  results: T[];
  total_pages: number;
  total_results: number;
}

interface RawTMDBItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids?: number[];
}

function normalizeItem(raw: RawTMDBItem, mediaType: MediaType): MediaItem {
  return {
    id: raw.id,
    title: raw.title || raw.name || 'Untitled',
    poster_path: raw.poster_path,
    backdrop_path: raw.backdrop_path,
    overview: raw.overview,
    release_date: raw.release_date || raw.first_air_date || '',
    vote_average: raw.vote_average,
    genre_ids: raw.genre_ids,
    media_type: mediaType,
  };
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

export async function discoverMedia(opts: {
  genre_ids?: number[];
  min_rating?: number;
  min_year?: number | null;
  max_year?: number | null;
  sort_by?: string;
  media_type?: MediaType;
  page?: number;
}): Promise<MediaItem[]> {
  const mediaType = opts.media_type || 'movie';
  const endpoint = mediaType === 'tv' ? '/discover/tv' : '/discover/movie';
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
  const dateField = mediaType === 'tv' ? 'first_air_date' : 'primary_release_date';
  if (opts.min_year) {
    params[`${dateField}.gte`] = `${opts.min_year}-01-01`;
  }
  if (opts.max_year) {
    params[`${dateField}.lte`] = `${opts.max_year}-12-31`;
  }
  if (opts.page) {
    params.page = String(opts.page);
  }

  const data = await tmdbFetch<TMDBResponse<RawTMDBItem>>(endpoint, params);
  return data.results.map((r) => normalizeItem(r, mediaType));
}

export async function getTrending(mediaType: MediaType): Promise<MediaItem[]> {
  const data = await tmdbFetch<TMDBResponse<RawTMDBItem>>(`/trending/${mediaType}/week`);
  return data.results.map((r) => normalizeItem(r, mediaType));
}

export async function getTrendingMovies(): Promise<MediaItem[]> {
  return getTrending('movie');
}

export async function getTrendingTV(): Promise<MediaItem[]> {
  return getTrending('tv');
}

export async function searchMulti(query: string): Promise<MediaItem[]> {
  const data = await tmdbFetch<TMDBResponse<RawTMDBItem & { media_type: string }>>('/search/multi', { query });
  return data.results
    .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
    .map((r) => normalizeItem(r, r.media_type as MediaType));
}

export async function getMovieDetails(movieId: number): Promise<MediaItem> {
  const data = await tmdbFetch<RawTMDBItem>(`/movie/${movieId}`);
  return normalizeItem(data, 'movie');
}

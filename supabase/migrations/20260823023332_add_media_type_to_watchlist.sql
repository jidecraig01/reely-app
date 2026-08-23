/*
# Add media_type column to watchlist table

1. Changes
- `watchlist` table: add `media_type` column (text, default 'movie') to distinguish
  movies from TV series. Existing rows default to 'movie'.
- Add `vote_average` column (double precision, default 0) so TMDB ratings can be
  stored alongside watchlist items (used by the WatchlistCard UI).
- Add `release_date` column (text, nullable) for consistency with the frontend's
  expected shape. The existing `release_year` column is left intact (no data loss).

2. Security
- No RLS policy changes — existing owner-scoped CRUD policies remain in effect.
*/

ALTER TABLE watchlist
  ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'movie';

ALTER TABLE watchlist
  ADD COLUMN IF NOT EXISTS vote_average double precision DEFAULT 0;

ALTER TABLE watchlist
  ADD COLUMN IF NOT EXISTS release_date text;

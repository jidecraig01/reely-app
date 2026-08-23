/*
# Create watchlist table

1. New Tables
- `watchlist`
  - `id` (uuid, primary key)
  - `user_id` (uuid, not null, defaults to authenticated user, references auth.users with cascade delete)
  - `movie_id` (integer, not null — TMDB movie ID)
  - `title` (text, not null)
  - `poster_path` (text, nullable — TMDB poster path)
  - `overview` (text, nullable — TMDB overview)
  - `release_date` (text, nullable — TMDB release date)
  - `vote_average` (double precision, default 0 — TMDB rating)
  - `rating` (integer, nullable — user's personal 1-5 star rating)
  - `ai_blurb` (text, nullable — cached AI-generated personalized blurb)
  - `created_at` (timestamptz, default now)
  - Unique constraint on (user_id, movie_id) to prevent duplicate watchlist entries

2. Security
- Enable RLS on `watchlist`.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- SELECT, INSERT, UPDATE, DELETE policies all check auth.uid() = user_id.
*/

CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id integer NOT NULL,
  title text NOT NULL,
  poster_path text,
  overview text,
  release_date text,
  vote_average double precision DEFAULT 0,
  rating integer,
  ai_blurb text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, movie_id)
);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_watchlist" ON watchlist;
CREATE POLICY "select_own_watchlist" ON watchlist FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_watchlist" ON watchlist;
CREATE POLICY "insert_own_watchlist" ON watchlist FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_watchlist" ON watchlist;
CREATE POLICY "update_own_watchlist" ON watchlist FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_watchlist" ON watchlist;
CREATE POLICY "delete_own_watchlist" ON watchlist FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

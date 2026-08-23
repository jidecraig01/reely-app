# REELY — setup guide

This is a complete, working Movie Watchlist app: React + Tailwind frontend, Supabase for
auth/database, TMDB for the movie catalog, OpenAI for mood-based search and personalized
blurbs. Nothing runs until you fill in three sets of keys below — none of it is optional.

Budget about 45–60 minutes for this whole checklist, done once, by whoever's driving.

---

## 1. Get a TMDB key (free, ~5 min)

1. Go to themoviedb.org and create a free account, verify your email.
2. On desktop (their signup flow doesn't work well on mobile), go to **Settings → API**.
3. Click **Request an API Key**, choose the **Developer** option, fill the short form
   (for "application URL" you can use your GitHub repo URL once you have one, or
   `http://localhost`).
4. Copy the **API Key (v3 auth)** — you'll paste this in two places (see steps 4 and 5).

## 2. Get an OpenAI key (~5 min)

1. Go to platform.openai.com, sign up/sign in.
2. Add a payment method under **Settings → Billing** — required even for small usage.
3. **Set a hard spend limit** (a few dollars is plenty for a hackathon) under Billing →
   Limits. This protects you if something calls the API in a loop.
4. Go to **API Keys → Create new secret key**. Copy it immediately — it's only shown once.

## 3. Create your Supabase project (~5 min)

1. Go to supabase.com → **New Project**. Pick any name/region, set a database password
   (save it somewhere), wait ~2 minutes for provisioning.
2. Go to **Settings → API**. Copy the **Project URL** and the **anon / public key**.

   > If your team is building inside Bolt using its native Supabase integration instead,
   > Bolt creates this project for you automatically — just open that project in the
   > Supabase dashboard afterward to do steps 4–6 below.

## 4. Run the database schema (~2 min)

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of `supabase/migrations/0001_init.sql` from this project.
3. Click **Run**. This creates the `watchlist` table and locks it down so each user can
   only ever see their own rows (row-level security).

## 5. Deploy the two Edge Functions (~10 min, no command line needed)

Supabase now lets you deploy Edge Functions straight from the dashboard — no CLI or
Docker required.

1. In the Supabase dashboard, go to **Edge Functions → Deploy a new function → Via Editor**.
2. Name it exactly `vibe-search`. Paste in the full contents of
   `supabase/functions/vibe-search/index.ts`. Click **Deploy**.
3. Repeat for a second function named exactly `movie-blurb`, using
   `supabase/functions/movie-blurb/index.ts`.
4. Go to **Edge Functions → Manage secrets** (or **Settings → Edge Functions**) and add:
   - `OPENAI_API_KEY` = the key from step 2
   - `TMDB_API_KEY` = the key from step 1

   These secrets are only ever readable by your Edge Functions on the server — never by
   the browser. This is the whole reason the AI calls go through a function instead of
   living in the React app directly.

## 6. Fill in your local `.env`

1. Copy `.env.example` to a new file named `.env`.
2. Fill in:
   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from step 3
   - `VITE_TMDB_API_KEY` from step 1
3. `.env` is already in `.gitignore` — it will not get pushed to GitHub or exposed anywhere.

---

## 7. Getting this into Bolt

Bolt is browser-based and doesn't accept a folder upload directly — the reliable path is
through GitHub, and you don't need the command line for this either:

1. Create a free account at github.com if you don't have one.
2. Click **New repository**, name it `reely`, keep it private or public, don't
   initialize it with a README (you already have one).
3. On the new repo's page, click **uploading an existing file**, then drag in every file
   and folder from this project (keep the folder structure intact).

   > `.env` should NOT be part of what you upload — it's excluded by `.gitignore`, and
   > you'll set the same values directly inside Bolt's environment variables panel instead.

4. Commit the upload.
5. In Bolt, start a new project and use **Import from URL** (or the GitHub import option),
   pasting your repo's URL (`https://github.com/your-username/reely`).
6. Once imported, add your three `VITE_...` values from `.env` into Bolt's environment
   variable settings for the project (Bolt will prompt for these, or you'll find them
   under project settings).
7. If your team is using Bolt's native Supabase integration and it created its own
   project, make sure you ran steps 4–6 above inside *that* project, not a separate one.

From here, Bolt can run, preview, and let you keep iterating on the app with prompts —
you're just starting from a finished, working codebase instead of a blank one.

## 8. (Optional) Run it locally first

If anyone on the team has Node.js installed and wants to sanity-check the app before
pushing to GitHub:

```
npm install
npm run dev
```

Then open the local URL it prints. This step is entirely optional — importing straight
into Bolt works without it.

---

## What each AI feature actually does

- **Vibe search** (`supabase/functions/vibe-search`) — takes your freeform mood text,
  asks OpenAI to turn it into TMDB genre/rating/year filters, then queries TMDB directly.
  OpenAI never invents a movie — it only ever picks filters; TMDB is always the source of
  the actual titles.
- **"Why you'll like this"** (`supabase/functions/movie-blurb`) — runs once per movie,
  when it's added to your watchlist, using that movie's TMDB summary plus your three
  highest-rated saved titles. The result is cached in the `ai_blurb` column so it's never
  regenerated on repeat views.

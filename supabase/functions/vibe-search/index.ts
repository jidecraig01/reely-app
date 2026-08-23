const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GENRE_MAP: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  "romantic": 10749,
  "sci-fi": 878,
  "scifi": 878,
  "science fiction": 878,
  thriller: 53,
  war: 10752,
  western: 37,
};

const SORT_MAP: Record<string, string> = {
  popular: "popularity.desc",
  rated: "vote_average.desc",
  recent: "primary_release_date.desc",
  oldest: "primary_release_date.asc",
};

interface VibeFilters {
  genre_ids: number[];
  min_rating: number;
  min_year: number | null;
  max_year: number | null;
  sort_by: string;
  media_types: string[];
}

function keywordFallback(query: string): VibeFilters {
  const q = query.toLowerCase();
  const genre_ids: number[] = [];
  for (const [keyword, id] of Object.entries(GENRE_MAP)) {
    if (q.includes(keyword)) {
      genre_ids.push(id);
      if (genre_ids.length >= 3) break;
    }
  }
  let min_year: number | null = null;
  let max_year: number | null = null;
  const decadeMatch = q.match(/(\d{4})s/);
  if (decadeMatch) {
    min_year = parseInt(decadeMatch[1]);
    max_year = min_year + 9;
  }
  let sort_by = "popularity.desc";
  if (q.includes("best") || q.includes("top rated") || q.includes("highest rated")) {
    sort_by = "vote_average.desc";
  } else if (q.includes("new") || q.includes("recent")) {
    sort_by = "primary_release_date.desc";
  }
  const media_types = q.includes("tv") || q.includes("show") || q.includes("series")
    ? ["movie", "tv"]
    : ["movie", "tv"];
  return {
    genre_ids: genre_ids.slice(0, 3),
    min_rating: 6,
    min_year,
    max_year,
    sort_by,
    media_types,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing 'query' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

    // If no OpenAI key, use keyword fallback immediately
    if (!OPENAI_API_KEY) {
      const filters = keywordFallback(query);
      return new Response(
        JSON.stringify(filters),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a movie and TV recommendation filter assistant. Given a user's mood or vibe description, translate it into TMDB API filter parameters. You must ONLY return valid JSON — no markdown, no explanation.

Available genres (use the genre IDs): ${JSON.stringify(GENRE_MAP)}

Return JSON with this exact shape:
{
  "genre_ids": [array of genre IDs as integers, 1-3 max],
  "min_rating": number from 0 to 10 (minimum TMDB vote average, use 0 if no preference),
  "min_year": number or null (earliest release year, e.g. 2000),
  "max_year": number or null (latest release year),
  "sort_by": one of: "popularity.desc", "vote_average.desc", "primary_release_date.desc", "primary_release_date.asc",
  "media_types": array containing "movie" and/or "tv" — include both unless the user explicitly wants only one
}

Rules:
- Pick genres that match the mood. If the mood is vague, pick 1-2 broad genres.
- Set min_rating to at least 6.0 unless the user explicitly wants bad movies or B-movies.
- Use min_year/max_year if the user mentions a decade or era (e.g. "80s" → min_year: 1980, max_year: 1989).
- Default sort_by is "popularity.desc" unless the user asks for "best rated" or "newest".
- Include both "movie" and "tv" in media_types unless the user explicitly asks for only movies or only TV.`;

    let filters: VibeFilters;

    try {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: query },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (!openaiRes.ok) {
        console.error("OpenAI error:", await openaiRes.text());
        filters = keywordFallback(query);
      } else {
        const openaiData = await openaiRes.json();
        const content = openaiData.choices?.[0]?.message?.content;

        if (!content) {
          filters = keywordFallback(query);
        } else {
          let parsed: Record<string, unknown>;
          try {
            parsed = JSON.parse(content);
          } catch {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              filters = keywordFallback(query);
              return new Response(
                JSON.stringify(filters),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
            parsed = JSON.parse(jsonMatch[0]);
          }

          const genre_ids = Array.isArray(parsed.genre_ids)
            ? parsed.genre_ids.filter((g: unknown) => typeof g === "number").slice(0, 3)
            : [];
          const min_rating = typeof parsed.min_rating === "number" ? parsed.min_rating : 0;
          const min_year = typeof parsed.min_year === "number" ? parsed.min_year : null;
          const max_year = typeof parsed.max_year === "number" ? parsed.max_year : null;
          const sort_by = typeof parsed.sort_by === "string" && SORT_MAP[parsed.sort_by]
            ? SORT_MAP[parsed.sort_by]
            : typeof parsed.sort_by === "string" ? parsed.sort_by : "popularity.desc";
          const media_types = Array.isArray(parsed.media_types)
            ? parsed.media_types.filter((t: unknown) => t === "movie" || t === "tv")
            : ["movie", "tv"];

          filters = { genre_ids, min_rating, min_year, max_year, sort_by, media_types };
        }
      }
    } catch (_aiErr) {
      filters = keywordFallback(query);
    }

    return new Response(
      JSON.stringify(filters),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

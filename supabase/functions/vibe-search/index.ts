import { createClient } from "npm:@supabase/supabase-js@2.45.0";

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
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a movie recommendation filter assistant. Given a user's mood or vibe description, translate it into TMDB API filter parameters. You must ONLY return valid JSON — no markdown, no explanation.

Available genres (use the genre IDs): ${JSON.stringify(GENRE_MAP)}

Return JSON with this exact shape:
{
  "genre_ids": [array of genre IDs as integers, 1-3 max],
  "min_rating": number from 0 to 10 (minimum TMDB vote average, use 0 if no preference),
  "min_year": number or null (earliest release year, e.g. 2000),
  "max_year": number or null (latest release year),
  "sort_by": one of: "popularity.desc", "vote_average.desc", "primary_release_date.desc", "primary_release_date.asc"
}

Rules:
- Pick genres that match the mood. If the mood is vague, pick 1-2 broad genres.
- Set min_rating to at least 6.0 unless the user explicitly wants bad movies or B-movies.
- Use min_year/max_year if the user mentions a decade or era (e.g. "80s" → min_year: 1980, max_year: 1989).
- Default sort_by is "popularity.desc" unless the user asks for "best rated" or "newest".`;

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
      const errText = await openaiRes.text();
      console.error("OpenAI error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiData = await openaiRes.json();
    const content = openaiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Empty AI response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let filters;
    try {
      filters = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return new Response(
          JSON.stringify({ error: "Invalid AI response format" }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      filters = JSON.parse(jsonMatch[0]);
    }

    // Validate and sanitize
    const genre_ids = Array.isArray(filters.genre_ids)
      ? filters.genre_ids.filter((g: unknown) => typeof g === "number").slice(0, 3)
      : [];
    const min_rating = typeof filters.min_rating === "number" ? filters.min_rating : 0;
    const min_year = typeof filters.min_year === "number" ? filters.min_year : null;
    const max_year = typeof filters.max_year === "number" ? filters.max_year : null;
    const sort_by = typeof filters.sort_by === "string" && SORT_MAP[filters.sort_by]
      ? SORT_MAP[filters.sort_by]
      : filters.sort_by || "popularity.desc";

    return new Response(
      JSON.stringify({ genre_ids, min_rating, min_year, max_year, sort_by }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

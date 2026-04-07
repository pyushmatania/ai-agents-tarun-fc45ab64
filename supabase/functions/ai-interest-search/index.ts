import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, currentCategory } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return new Response(JSON.stringify({ error: "query is required (min 2 chars)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an interest/entity identification AI. Given a user's search query, identify what they're looking for and return structured results.

CATEGORIES available: shows (TV shows, movies, anime, k-drama), sports (teams, players, leagues), music (artists, bands, singers), gaming (games, esports), books (titles, authors), hobbies (activities, skills), news (topics, sources), curious (science, tech topics).

The user is currently browsing the "${currentCategory || "unknown"}" category. First try to match within that category. If the item clearly belongs to a different category, suggest the correct one.

Return a JSON response with this EXACT structure:
{
  "results": [
    {
      "name": "Exact correct name",
      "category": "books",
      "subCategory": "Business",
      "description": "Short 1-line description",
      "author": "Author name if applicable",
      "year": "Year if applicable",
      "imageSearchQuery": "best search query to find an image/cover for this item",
      "confidence": 0.95
    }
  ],
  "clarifyingQuestion": null or "Did you mean X or Y?",
  "suggestions": ["related item 1", "related item 2"]
}

Rules:
- Return 1-3 results, ordered by confidence
- If ambiguous (e.g. "shoe dog" could be a book or a brand), return multiple results with different categories
- If you're very confident (>0.9), return 1 result
- If unsure, set clarifyingQuestion to ask the user
- imageSearchQuery should be specific enough to find a real cover/poster/logo
- ALWAYS use the most well-known/canonical name (e.g. "Shoe Dog: A Memoir by the Creator of Nike" → "Shoe Dog")`;

    const response = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Search query: "${query.trim()}"${currentCategory ? `\nCurrent category: ${currentCategory}` : ""}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "identify_interest",
              description: "Identify and categorize a user interest/entity from a search query",
              parameters: {
                type: "object",
                properties: {
                  results: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        category: { type: "string", enum: ["shows", "sports", "music", "gaming", "books", "hobbies", "news", "curious"] },
                        subCategory: { type: "string" },
                        description: { type: "string" },
                        author: { type: "string" },
                        year: { type: "string" },
                        imageSearchQuery: { type: "string" },
                        confidence: { type: "number" },
                      },
                      required: ["name", "category", "subCategory", "description", "imageSearchQuery", "confidence"],
                    },
                  },
                  clarifyingQuestion: { type: "string" },
                  suggestions: { type: "array", items: { type: "string" } },
                },
                required: ["results"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "identify_interest" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI search failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No results from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("interest search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

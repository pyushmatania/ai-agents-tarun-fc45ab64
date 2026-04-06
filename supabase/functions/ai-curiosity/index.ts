import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, category } = await req.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an AI agents expert. When given a search query about AI agents, generate 5 realistic, informative items. Each item should have: "title" (string), "url" (a plausible https URL), "desc" (one sentence description), "type" (one of: tool, repo, article, video, news). Respond with ONLY a JSON array.`
          },
          {
            role: "user",
            content: `Generate 5 items about: ${query} (category: ${category})`
          }
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "[]";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    const items = match ? JSON.parse(match[0]) : [];

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, items: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

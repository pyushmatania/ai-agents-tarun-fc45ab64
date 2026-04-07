import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const today = new Date().toISOString().split("T")[0];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI news reporter. Generate 8 realistic, current AI agent news headlines based on your latest knowledge. Each should feel like a real Inshorts-style news card. Include: "title" (short headline, max 12 words), "summary" (2-3 sentence summary), "source" (realistic news source name like TechCrunch, The Verge, VentureBeat, Wired, etc.), "category" (one of: launch, funding, research, product, policy, open-source), "timeAgo" (realistic time like "2h ago", "5h ago", "1d ago"). Make them diverse — cover launches, funding, research breakthroughs, policy changes, and open-source releases. Respond with ONLY a valid JSON array.`
          },
          {
            role: "user",
            content: `Generate 8 latest AI agent news headlines for ${today}. Make them feel real, current, and diverse.`
          }
        ],
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      console.error("AI gateway error:", status, body);
      throw new Error(`AI gateway returned ${status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "[]";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    const items = match ? JSON.parse(match[0]) : [];

    return new Response(JSON.stringify({ items }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ai-news error:", error);
    return new Response(JSON.stringify({ error: msg, items: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, description, url, contentType } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isVideo = contentType === "youtube" || contentType === "instagram";

    const systemPrompt = isVideo
      ? `You are an AI learning assistant that works like NotebookLM. Given a video title and description, create a comprehensive study summary in this exact JSON format:
{
  "summary": "A 2-3 sentence TL;DR of what this video covers",
  "keyPoints": ["point1", "point2", "point3", "point4", "point5"],
  "concepts": [{"term": "concept name", "explanation": "simple explanation"}],
  "quiz": [{"question": "Q?", "options": ["A", "B", "C", "D"], "correct": 0}],
  "actionItems": ["What to do after watching this"],
  "relatedTopics": ["topic1", "topic2", "topic3"]
}
Respond with ONLY valid JSON, no other text.`
      : `You are an AI learning assistant. Given an article/content title and description, create a comprehensive study breakdown in this exact JSON format:
{
  "summary": "A 2-3 sentence TL;DR of the content",
  "keyPoints": ["point1", "point2", "point3", "point4", "point5"],
  "concepts": [{"term": "concept name", "explanation": "simple explanation"}],
  "quiz": [{"question": "Q?", "options": ["A", "B", "C", "D"], "correct": 0}],
  "actionItems": ["What to do after reading this"],
  "relatedTopics": ["topic1", "topic2", "topic3"]
}
Respond with ONLY valid JSON, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Title: ${title}\nDescription: ${description}\nURL: ${url}\nType: ${contentType}` },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      console.error("AI gateway error:", status, body);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    const result = match ? JSON.parse(match[0]) : {};

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ai-learn error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

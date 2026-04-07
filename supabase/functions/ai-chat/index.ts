import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const GENERAL_SYSTEM_PROMPT = `You are AGNI 🔥 — a brilliant AI companion built into Neural-OS. You're warm, curious, sharp, and never boring.

You can help with ANYTHING:
- AI & tech questions (your specialty)
- General knowledge, science, history, math
- Creative writing, brainstorming, ideation
- Code help, debugging, explanations
- Daily life advice, career guidance
- Explaining complex topics simply
- Analyzing images and files shared by the user

FORMATTING RULES (CRITICAL — follow these for beautiful card-based rendering):
1. Use markdown headers (## and ###) to structure your response into clear sections
2. Use **bold** for key terms and concepts
3. For code examples, ALWAYS use fenced code blocks with language tags (\`\`\`python, \`\`\`javascript, etc.)
4. For key takeaways, use a "## Key Takeaways" or "## Key Points" header followed by a bulleted list
5. For step-by-step processes, use "## Steps" or "## How to" headers followed by numbered lists
6. For definitions, use the format: **Term**: Definition text
7. For examples, use "## Example" or "## Real-World Example" or "## Analogy" headers
8. For comparisons, structure as two sections or a table
9. Use blockquotes (>) for important callouts or quotes
10. Keep paragraphs short (2-3 sentences max) for readability on mobile

STYLE:
- Be conversational but informative
- Include relevant emojis sparingly
- Give concrete examples and analogies
- Keep responses focused — no filler
- Structure long answers with clear sections using headers

IMPORTANT: At the end of EVERY response, add:
[SUGGESTIONS]suggestion1|suggestion2|suggestion3[/SUGGESTIONS]
These should be 3 short (max 6 words each) contextual follow-up suggestions.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = GENERAL_SYSTEM_PROMPT;
    
    if (context) {
      const ctxParts: string[] = [];
      if (context.identity) ctxParts.push(`User identity: ${context.identity}`);
      if (context.mission) ctxParts.push(`User's mission: ${context.mission}`);
      if (context.vibe) ctxParts.push(`Preferred teaching style: ${context.vibe}`);
      if (context.level) ctxParts.push(`Brain level: ${context.level}`);
      if (context.universeVibe) ctxParts.push(`Universe vibe: Teach through the world of "${context.universeVibe}" — use characters, vocabulary, and plot moments from this universe`);
      if (context.interests) ctxParts.push(`Interests: ${context.interests}`);
      if (ctxParts.length > 0) {
        systemPrompt += `\n\nUSER PROFILE:\n${ctxParts.join("\n")}\n\nIMPORTANT: Adapt your tone, depth, analogies, and examples to match ALL of the user's profile settings above. They are not decorative — they define how you should respond.`;
      }
    }

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
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const body = await response.text();
      console.error("AI gateway error:", status, body);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ai-chat error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

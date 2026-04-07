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
      if (context.identity) ctxParts.push(`User identity (CURRENT): ${context.identity}\n→ Use analogies and examples from their professional world. If earlier messages used a different identity, IGNORE that and use this one.`);
      
      if (context.mission) ctxParts.push(`User's mission (CURRENT): ${context.mission}\n→ Frame answers around this goal. If earlier messages referenced a different mission, IGNORE that.`);
      
      // Vibe — explicit behavioral instructions
      if (context.vibe) {
        const vibeId = context.vibe.split(" — ")[0]?.trim().toLowerCase();
        let vibeRule = "";
        if (vibeId.includes("meme") || vibeId.includes("fun")) vibeRule = "Use Gen-Z humor, memes, pop culture refs, light roasting. Shitpost energy but accurate.";
        else if (vibeId.includes("story")) vibeRule = "Frame everything as a narrative with characters and conflict.";
        else if (vibeId.includes("visual")) vibeRule = "Use ASCII art, diagrams, flowcharts. Make concepts visual.";
        else if (vibeId.includes("sensei")) vibeRule = "Wise, disciplined. Short profound statements. Karate Kid energy.";
        else if (vibeId.includes("fact")) vibeRule = "Pure technical, no fluff, no jokes. Bullet points. Dry and fast.";
        else if (vibeId.includes("hype")) vibeRule = "HIGH ENERGY! Exclamation marks! Motivational speaker vibes!";
        else if (vibeId.includes("board")) vibeRule = "Executive summary. ROI-focused. Strategic framing.";
        else if (vibeId.includes("game")) vibeRule = "XP, levels, boss battles, side quests. Game UI energy.";
        else if (vibeId.includes("podcast")) vibeRule = "Conversational deep-dive. Interview style. Thoughtful.";
        else if (vibeId.includes("lab")) vibeRule = "Hypothesis → experiment → result. Scientific method.";
        else if (vibeId.includes("wizard")) vibeRule = "Mysterious, magical framing. Concepts as spells.";
        else if (vibeId.includes("news")) vibeRule = "Breaking news framing. Reporter energy.";
        ctxParts.push(`Teaching style: ${context.vibe}\nSTYLE RULE: ${vibeRule}`);
      }
      
      // Brain level — explicit depth rules
      if (context.level) {
        const levelId = context.level.split(" — ")[0]?.trim().toLowerCase();
        let depthRule = "Adapt depth to match.";
        if (levelId.includes("sprout") || levelId.includes("class 5")) {
          depthRule = "MANDATORY: Explain like talking to a 10-year-old. ZERO jargon. Only everyday analogies (cooking, playing, school). Short sentences. Simple words. Skip complexity — give intuition only.";
        } else if (levelId.includes("chill") || levelId.includes("class 8")) {
          depthRule = "Simple language, real-world examples. Introduce terms with 'which basically means...' Keep casual.";
        } else if (levelId.includes("explorer") || levelId.includes("class 10")) {
          depthRule = "Some technical terms OK but always explain. Clear definitions. Medium depth.";
        } else if (levelId.includes("builder") || levelId.includes("class 12")) {
          depthRule = "Technical language OK. Show code. Practical, hands-on.";
        } else if (levelId.includes("pro") || levelId.includes("college")) {
          depthRule = "Professional-grade. Best practices, edge cases, production considerations.";
        } else if (levelId.includes("hacker") || levelId.includes("scientist") || levelId.includes("researcher")) {
          depthRule = "Deep technical. Papers, math, internals, undocumented tricks.";
        } else if (levelId.includes("demon") || levelId.includes("professor") || levelId.includes("architect")) {
          depthRule = "Maximum depth. Trade-offs, system design, frontier research. No hand-holding.";
        }
        ctxParts.push(`Brain level: ${context.level}\nDEPTH RULE: ${depthRule}`);
      }
      
      // Universe vibe — HIGHEST PRIORITY, overrides interests
      if (context.universeVibe) {
        ctxParts.push(`Universe vibe (HIGHEST PRIORITY): "${context.universeVibe}"\nMANDATORY: ALL examples, analogies, metaphors, and references MUST come from "${context.universeVibe}" — NEVER use other franchises, shows, or games. Even if previous messages in the conversation used a different franchise, IGNORE those and ONLY use "${context.universeVibe}" from now on. This is non-negotiable.`);
      }
      if (context.interests) ctxParts.push(`General interests (use ONLY if no universe vibe is set): ${context.interests}`);
      
      if (ctxParts.length > 0) {
        systemPrompt += `\n\nUSER PROFILE (BINDING — these are rules, not suggestions):\n${ctxParts.join("\n\n")}\n\nCRITICAL RULES:\n1. Brain level controls HOW SIMPLY you explain — a Sprout/Class 5 answer should be understandable by a child\n2. If Universe Vibe is set, EVERY example uses ONLY that world — IGNORE any different franchise references from earlier in the conversation\n3. Vibe controls your tone and style — commit fully to it\n4. These are NOT decorative tags — they define your entire response style\n5. The user profile above reflects the CURRENT settings — always follow these, not what was used in previous messages`;
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

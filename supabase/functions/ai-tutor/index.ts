import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8080",
  // TODO: add your production domain(s) here
];

function corsHeadersFor(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Vary": "Origin",
  };
}

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

function buildAgniSystemPrompt(profile: {
  identity?: string;
  mission?: string;
  vibe?: string;
  level?: string;
  universeVibe?: string;
  lessonTitle?: string;
  lessonTopic?: string;
}): string {
  const parts: string[] = [];

  parts.push(`You are AGNI 🔥, an elite AI Agents tutor and mentor. Your name comes from the Sanskrit word for fire — because you light up curiosity and burn away confusion. You teach AI Agents from zero to dangerous.

You are warm, sharp, a little playful, and never boring. Learning should feel like an adventure, not homework.

🧭 OPERATING PRINCIPLES:
1. Profile is law. Every reply is filtered through Identity + Mission + Vibe + Level.
2. Custom is first-class. The richer the description, the richer the teaching.
3. Concrete over abstract. Real names, real numbers, real tools.
4. One concept at a time. Land it, check it, build on it.
5. Hook every reply. A question, a challenge, never a dead stop.
6. Celebrate progress naturally.
7. Identity drives metaphors. Mission drives priorities. Vibe drives voice. Level drives depth.
8. No filler. No "Great question!" Just teach.
9. Vibe never overrides truth.
10. The CURRENT profile below is the source of truth — IGNORE any different settings/vibes/interests from earlier messages in the conversation.`);

  // Identity
  if (profile.identity) {
    parts.push(`\n🪪 IDENTITY: ${profile.identity}
- Every analogy comes from this world first
- Every example stars someone like them
- Every metaphor reaches into their daily reality`);
  }

  // Mission
  if (profile.mission) {
    parts.push(`\n🎯 MISSION: ${profile.mission}
- Shape what you prioritize and what outcomes you optimize for
- Reference their goal in every explanation: "Since your goal is [mission], here's how this moves you closer…"`);
  }

  // Vibe — with explicit behavioral rules
  if (profile.vibe) {
    const vibeId = profile.vibe.split(" — ")[0]?.trim().toLowerCase();
    let vibeRules = "";
    if (vibeId.includes("meme") || vibeId.includes("fun")) {
      vibeRules = `\nSTYLE RULES: Use Gen-Z humor, memes, pop culture references, light roasting. Think "if Twitter explained AI." Use emojis liberally. Shitpost energy but accurate.`;
    } else if (vibeId.includes("story")) {
      vibeRules = `\nSTYLE RULES: Frame EVERYTHING as a narrative. Characters, conflict, plot twists, resolution. "Once upon a time..." energy.`;
    } else if (vibeId.includes("visual")) {
      vibeRules = `\nSTYLE RULES: Use ASCII art, diagrams, flowcharts, "picture this" scenarios. Make concepts visual.`;
    } else if (vibeId.includes("sensei")) {
      vibeRules = `\nSTYLE RULES: Disciplined, wise, Karate Kid energy. Short profound statements. "The student who rushes, learns nothing."`;
    } else if (vibeId.includes("fact")) {
      vibeRules = `\nSTYLE RULES: Pure technical, no fluff, no jokes. Fastest information transfer. Bullet points. Dry.`;
    } else if (vibeId.includes("hype")) {
      vibeRules = `\nSTYLE RULES: HIGH ENERGY! Exclamation marks! This is INCREDIBLE! Motivational speaker energy!`;
    } else if (vibeId.includes("board")) {
      vibeRules = `\nSTYLE RULES: Executive summary style. ROI-focused. "Bottom line..." Strategic framing.`;
    } else if (vibeId.includes("game")) {
      vibeRules = `\nSTYLE RULES: XP, levels, boss battles, side quests. "You unlocked: new knowledge!" Game UI energy.`;
    } else if (vibeId.includes("podcast")) {
      vibeRules = `\nSTYLE RULES: Conversational deep-dive. "So here's the thing..." Interview style, thoughtful.`;
    } else if (vibeId.includes("lab")) {
      vibeRules = `\nSTYLE RULES: Hypothesis → experiment → result. Scientific method framing.`;
    } else if (vibeId.includes("wizard")) {
      vibeRules = `\nSTYLE RULES: Mysterious, magical framing. Concepts as spells. "The ancient art of..."`;
    } else if (vibeId.includes("news")) {
      vibeRules = `\nSTYLE RULES: Breaking news framing. "BREAKING:" headers. Reporter energy.`;
    }
    parts.push(`\n🎨 TEACHING VIBE: ${profile.vibe}${vibeRules}`);
  }

  // Universe vibe — HIGHEST PRIORITY
  if (profile.universeVibe) {
    parts.push(`\n🌍 UNIVERSE VIBE (HIGHEST PRIORITY): "${profile.universeVibe}"
- EVERY example, analogy, and metaphor MUST use characters, scenes, and vocabulary from "${profile.universeVibe}"
- Cast characters as roles: The LLM = protagonist, tools = abilities, memory = backstory, planning = strategy
- Use world vocabulary and plot moments as teaching examples
- NEVER use examples from other franchises, shows, games, or anime — ONLY "${profile.universeVibe}"
- Even if previous messages in the conversation used a DIFFERENT franchise/show/person, IGNORE those completely and ONLY use "${profile.universeVibe}" from now on
- Don't break immersion unless asked for "real talk"
- This overrides general interests entirely`);
  }

  // Level — with EXPLICIT depth rules
  if (profile.level) {
    const levelId = profile.level.split(" — ")[0]?.trim().toLowerCase();
    let levelRules = "";
    if (levelId.includes("sprout") || levelId.includes("class 5")) {
      levelRules = `\nDEPTH RULES (MANDATORY):
- Explain like talking to a 10-year-old child
- ZERO jargon — if you MUST use a technical term, immediately explain it in simple words
- Use ONLY everyday analogies (cooking, playing, school, cartoons)
- Short sentences. Simple words. Max 2-3 sentence paragraphs
- "Imagine you have a lunchbox..." level of simplicity
- If a concept is complex, skip the complexity — give the intuition only`;
    } else if (levelId.includes("chill") || levelId.includes("class 8")) {
      levelRules = `\nDEPTH RULES: Simple language, real-world examples. Introduce terms gently with "which basically means..." Keep it casual and accessible.`;
    } else if (levelId.includes("explorer") || levelId.includes("class 10")) {
      levelRules = `\nDEPTH RULES: Some technical terms OK but always explain them. Clear definitions + diagrams. Medium depth.`;
    } else if (levelId.includes("builder") || levelId.includes("class 12")) {
      levelRules = `\nDEPTH RULES: Technical language OK. Show code examples. Practical, hands-on, "how to actually build this."`;
    } else if (levelId.includes("pro") || levelId.includes("college")) {
      levelRules = `\nDEPTH RULES: Professional-grade. Best practices, edge cases, production considerations. Assume solid foundation.`;
    } else if (levelId.includes("hacker") || levelId.includes("scientist") || levelId.includes("researcher")) {
      levelRules = `\nDEPTH RULES: Deep technical. Papers, math, internals, undocumented tricks. Assume expert knowledge.`;
    } else if (levelId.includes("demon") || levelId.includes("professor") || levelId.includes("architect")) {
      levelRules = `\nDEPTH RULES: Maximum depth. Trade-offs, system design, frontier research, open problems. No hand-holding.`;
    } else if (levelId.includes("master") || levelId.includes("phd")) {
      levelRules = `\nDEPTH RULES: Research-grade. Formal notation OK. Papers, proofs, ablation studies. Academic rigor.`;
    }
    parts.push(`\n🧠 BRAIN LEVEL: ${profile.level}${levelRules}`);
  }

  // Lesson context
  if (profile.lessonTitle && profile.lessonTopic) {
    parts.push(`\n📚 CURRENT LESSON: "${profile.lessonTitle}"
Topic: ${profile.lessonTopic}

Teach this topic interactively. Start by introducing the concept, then ask the student questions to check understanding. Be conversational and engaging. After 3-4 exchanges, tell the student they're ready for the quiz by saying "QUIZ_READY" at the end of your message.

PERSONALIZATION: If the student shares personal info (name, role, interests, hobbies), weave their interests into your analogies and examples throughout the conversation. Reference at least 1-2 of their interests in your FIRST response.`);
  }

  parts.push(`\nIMPORTANT: At the very end of EVERY response, add a line with exactly this format:
[SUGGESTIONS]suggestion1|suggestion2|suggestion3[/SUGGESTIONS]
These should be 3 short (max 6 words each) contextual follow-up questions or actions the student might want to ask next, based on what was just taught. Make them specific to the current topic, not generic.`);

  return parts.join("\n");
}

const rateLimits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const existing = rateLimits.get(userId) || [];
  const recent = existing.filter(t => now - t < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) return false;
  recent.push(now);
  rateLimits.set(userId, recent);
  return true;
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = corsHeadersFor(origin);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Rate limiting
  const authHeader = req.headers.get("Authorization");
  const jwt = authHeader?.replace("Bearer ", "");
  if (!jwt) {
    return new Response(
      JSON.stringify({ error: "Missing authorization" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: { user: authUser }, error: authError } = await supabaseAdmin.auth.getUser(jwt);
  if (authError || !authUser) {
    return new Response(
      JSON.stringify({ error: "Invalid token" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (!checkRateLimit(authUser.id)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please slow down." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json", "Retry-After": "60" } }
    );
  }

  try {
    const { messages, system, model, customApiKey, provider, teachingMode, lessonTopic, lessonTitle, teachingContext, stream } = await req.json();

    // Build system prompt — prefer the new 4-dimension context if provided
    let systemPrompt: string;
    
    if (teachingContext) {
      // New v2 system: parse teaching context into structured profile
      systemPrompt = buildAgniSystemPrompt({
        identity: teachingContext.identity,
        mission: teachingContext.mission,
        vibe: teachingContext.vibe,
        level: teachingContext.level,
        universeVibe: teachingContext.universeVibe,
        lessonTitle,
        lessonTopic,
      });
    } else if (system) {
      systemPrompt = system;
      if (lessonTitle && lessonTopic) {
        systemPrompt += `\n\nYou are currently teaching the lesson: "${lessonTitle}"\nTopic: ${lessonTopic}\n\nTeach this topic interactively. Start by introducing the concept, then ask the student questions to check understanding. Be conversational and engaging. After 3-4 exchanges, tell the student they're ready for the quiz by saying "QUIZ_READY" at the end of your message.

PERSONALIZATION: If the student shares personal info (name, role, interests, hobbies), weave their interests into your analogies and examples throughout the conversation.

IMPORTANT: At the very end of EVERY response, add a line with exactly this format:
[SUGGESTIONS]suggestion1|suggestion2|suggestion3[/SUGGESTIONS]
These should be 3 short (max 6 words each) contextual follow-up questions or actions the student might want to ask next, based on what was just taught.`;
      }
    } else {
      systemPrompt = buildAgniSystemPrompt({ lessonTitle, lessonTopic });
    }

    // If user provides their own API key
    if (customApiKey && provider) {
      if (provider === "anthropic") {
        const apiMsgs = messages.map((m: any) => ({
          role: m.role === "system" ? "user" : m.role,
          content: m.content,
        }));
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "x-api-key": customApiKey,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model || "claude-sonnet-4-20250514",
            max_tokens: 1024,
            system: systemPrompt,
            messages: apiMsgs,
          }),
        });
        if (!response.ok) {
          const err = await response.text();
          console.error("Anthropic error:", response.status, err);
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        let text = "";
        for (const b of (data.content || [])) { if (b.type === "text") text += b.text; }
        return new Response(JSON.stringify({ text }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const endpoint = provider === "google"
        ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
        : "https://api.openai.com/v1/chat/completions";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${customApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      });
      if (!response.ok) {
        const err = await response.text();
        console.error("BYOK error:", response.status, err);
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";
      return new Response(JSON.stringify({ text }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Default: Lovable AI Gateway
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const selectedModel = model || "google/gemini-3-flash-preview";

    const requestBody: any = {
      model: selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    };

    if (stream) {
      requestBody.stream = true;
      const response = await fetch(LOVABLE_GATEWAY, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI gateway returned ${status}`);
      }

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // Non-streaming
    const response = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
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
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ text, model: selectedModel }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ai-tutor error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

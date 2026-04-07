import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
9. Vibe never overrides truth.`);

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

  // Vibe
  if (profile.vibe) {
    parts.push(`\n🎨 TEACHING VIBE: ${profile.vibe}`);
  }

  // Universe vibe
  if (profile.universeVibe) {
    parts.push(`\n🌍 UNIVERSE VIBE: Teach through the world of "${profile.universeVibe}"
- Cast characters as roles: The LLM = protagonist, tools = abilities, memory = backstory, planning = strategy
- Use world vocabulary and plot moments as teaching examples
- Maintain the lens consistently — every example framed inside that world
- Don't break immersion unless asked for "real talk"
- If the universe has specific characters, use them as examples for different agent roles`);
  }

  // Level
  if (profile.level) {
    parts.push(`\n🧠 BRAIN LEVEL: ${profile.level}
- Calibrate vocabulary, depth, assumed background, and pacing to this level`);
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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
      temperature: 0.7,
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

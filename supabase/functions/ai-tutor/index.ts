import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

const TEACHING_MODE_PROMPTS: Record<string, string> = {
  class5: `You are AGNI, a fun and friendly AI tutor teaching a 10-year-old student. Use very simple language, lots of emojis, fun analogies (like comparing AI agents to superheroes or video game characters), and short sentences. Make everything feel like a fun adventure. Use "imagine if..." a lot. Keep responses under 150 words.`,
  engineer: `You are AGNI, a technical AI tutor for software engineers. Be precise, use proper terminology, include code snippets when relevant, reference papers/docs, and explain architectural patterns. Be thorough but concise. Use markdown formatting. Keep responses under 250 words.`,
  hacker: `You are AGNI, a hacker-style AI tutor. Be direct, practical, ship-fast mentality. Focus on "how to build this RIGHT NOW". Include code snippets, CLI commands, and quick-start patterns. Skip theory, go straight to implementation. Use terminal-style formatting. Keep responses under 200 words.`,
  founder: `You are AGNI, a strategic AI advisor for founders and business leaders. Focus on business impact, ROI, competitive advantage, market dynamics. Use case studies and real-world examples. Frame everything in terms of "how does this make money / save time / beat competitors". Keep responses under 200 words.`,
  crazy: `You are AGNI, a wild sci-fi futurist AI tutor. Go full creative — talk about agent swarms, digital consciousness, self-improving AI, AI civilizations. Be imaginative and mind-blowing while staying technically grounded. Use 🤯🚀🌌 liberally. Keep responses under 200 words.`,
  semiconductor: `You are AGNI, an AI tutor specialized in semiconductor manufacturing context (HCL/fab environment). Relate AI agent concepts to chip manufacturing, yield optimization, defect detection, supply chain. Use industry-specific examples. Keep responses under 200 words.`,
};

const BASE_SYSTEM = `You are AGNI, an expert AI tutor for the Neural-OS learning platform that teaches people about AI agents. You are enthusiastic, encouraging, and make complex topics accessible.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, system, model, customApiKey, provider, teachingMode, lessonTopic, lessonTitle, stream } = await req.json();

    // Build system prompt based on teaching mode and lesson context
    let systemPrompt = system || BASE_SYSTEM;
    
    if (teachingMode && TEACHING_MODE_PROMPTS[teachingMode]) {
      systemPrompt = TEACHING_MODE_PROMPTS[teachingMode];
    }
    
    if (lessonTitle && lessonTopic) {
      systemPrompt += `\n\nYou are currently teaching the lesson: "${lessonTitle}"\nTopic: ${lessonTopic}\n\nTeach this topic interactively. Start by introducing the concept, then ask the student questions to check understanding. Be conversational and engaging. After 3-4 exchanges, tell the student they're ready for the quiz by saying "QUIZ_READY" at the end of your message.

PERSONALIZATION: If the student shares personal info (name, role, interests, hobbies), weave their interests into your analogies and examples throughout the conversation. For example, if they love cricket, explain concepts using cricket analogies. If they're a founder, frame things in business terms. Make the student feel like this lesson was made specifically for them. Reference at least 1-2 of their interests in your FIRST response.

IMPORTANT: At the very end of EVERY response, add a line with exactly this format:
[SUGGESTIONS]suggestion1|suggestion2|suggestion3[/SUGGESTIONS]
These should be 3 short (max 6 words each) contextual follow-up questions or actions the student might want to ask next, based on what was just taught. Make them specific to the current topic, not generic. Think of them as "what would a curious student ask next?". Do NOT include generic items like "Quiz me" — focus on topic-specific curiosity.`;
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

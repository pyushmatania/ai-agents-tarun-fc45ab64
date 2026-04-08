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
    const { conversation, lessonTitle, lessonTopic, teachingMode, difficultyPrompt } = await req.json();

    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return new Response(JSON.stringify({ error: "conversation is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Use client-provided difficulty prompt or fall back to mode-based mapping
    let difficultyText = difficultyPrompt || "";
    if (!difficultyText) {
      const DIFFICULTY_MAP: Record<string, string> = {
        class5: "easy", founder: "medium", engineer: "hard", hacker: "hard",
      };
      const difficulty = DIFFICULTY_MAP[teachingMode] || "medium";
      const difficultyGuide: Record<string, string> = {
        easy: `Difficulty: EASY. Use simple language a child can understand. Questions should test basic recall and simple concepts.`,
        medium: `Difficulty: MEDIUM. Use clear professional language. Questions should test understanding and application.`,
        hard: `Difficulty: HARD. Use precise technical language. Questions should test deep understanding, edge cases.`,
      };
      difficultyText = difficultyGuide[difficulty];
    }

    const systemPrompt = `You are a quiz generator for the Neural-OS AI learning platform. Based on the conversation between a tutor and student about "${lessonTitle}" (topic: ${lessonTopic}), generate exactly 3 quiz questions that test what was actually discussed.

${difficultyText}

Return a JSON array with exactly 3 objects. Each object MUST have these fields:
- "type": one of "mcq", "truefalse", or "fillin"
- "question": the question string
- "difficulty": "${difficulty}"
- "explanation": a brief explanation of the correct answer

For type "mcq": include "options" (array of 4 strings) and "correctIndex" (0-3)
For type "truefalse": include "correctAnswer" (true or false)
For type "fillin": include "correctText" (the expected answer, 1-3 words)

Rules:
- Include at least one "mcq" question
- Mix question types for variety
- Questions must be based on what was actually taught in the conversation
- Keep questions clear and concise
- Teaching mode is "${teachingMode}"

Return ONLY the JSON array, no markdown, no explanation, no wrapping.`;

    const conversationSummary = conversation
      .filter((m: any) => m.content && m.content.length > 10)
      .slice(-10)
      .map((m: any) => `${m.role}: ${m.content.slice(0, 500)}`)
      .join("\n\n");

    const response = await fetch(LOVABLE_GATEWAY, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Here is the lesson conversation:\n\n${conversationSummary}\n\nGenerate 3 quiz questions based on this conversation.` },
        ],
        temperature: 0.3,
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
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway returned ${status}`);
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content || "";

    // Clean markdown code fences if present
    text = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    let quizzes;
    try {
      quizzes = JSON.parse(text);
    } catch {
      console.error("Failed to parse quiz JSON:", text);
      throw new Error("Failed to generate valid quiz questions");
    }

    if (!Array.isArray(quizzes) || quizzes.length === 0) {
      throw new Error("Invalid quiz format returned");
    }

    // Validate each quiz has required fields
    const validated = quizzes.slice(0, 3).map((q: any) => {
      const base = { type: q.type, question: q.question, explanation: q.explanation || "" };
      if (q.type === "mcq") {
        return { ...base, options: q.options || [], correctIndex: q.correctIndex ?? 0 };
      } else if (q.type === "truefalse") {
        return { ...base, correctAnswer: q.correctAnswer ?? true };
      } else {
        return { ...base, type: "fillin", correctText: q.correctText || "" };
      }
    });

    return new Response(JSON.stringify({ quizzes: validated }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("ai-quiz error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

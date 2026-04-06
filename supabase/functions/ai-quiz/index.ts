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
    const { conversation, lessonTitle, lessonTopic, teachingMode } = await req.json();

    if (!conversation || !Array.isArray(conversation) || conversation.length === 0) {
      return new Response(JSON.stringify({ error: "conversation is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Map teaching mode to difficulty
    const DIFFICULTY_MAP: Record<string, string> = {
      class5: "easy",
      founder: "medium",
      engineer: "hard",
      hacker: "hard",
      crazy: "hard",
      semiconductor: "hard",
    };
    const difficulty = DIFFICULTY_MAP[teachingMode] || "medium";

    const difficultyGuide: Record<string, string> = {
      easy: `Difficulty: EASY. Use simple language a child can understand. Questions should test basic recall and simple concepts. Wrong MCQ options should be obviously wrong. Fill-in answers should be single common words.`,
      medium: `Difficulty: MEDIUM. Use clear professional language. Questions should test understanding and application. Wrong MCQ options should be plausible. Fill-in answers can be 1-2 word technical terms.`,
      hard: `Difficulty: HARD. Use precise technical language. Questions should test deep understanding, edge cases, and ability to apply concepts. Wrong MCQ options should be very plausible (common misconceptions). Fill-in answers can be specific technical terms or patterns.`,
    };

    const systemPrompt = `You are a quiz generator for the AgentDojo AI learning platform. Based on the conversation between a tutor and student about "${lessonTitle}" (topic: ${lessonTopic}), generate exactly 3 quiz questions that test what was actually discussed.

${difficultyGuide[difficulty]}

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
  } catch (error) {
    console.error("ai-quiz error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

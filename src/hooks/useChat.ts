import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type ChatTab = "curriculum" | "general";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  tab: ChatTab;
  metadata?: Record<string, any>;
  created_at: string;
}

const LOCAL_KEY = (tab: ChatTab) => `agni_chat_${tab}`;

function loadLocal(tab: ChatTab): ChatMessage[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY(tab));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(tab: ChatTab, messages: ChatMessage[]) {
  try {
    // Keep last 100 messages locally
    const trimmed = messages.slice(-100);
    localStorage.setItem(LOCAL_KEY(tab), JSON.stringify(trimmed));
  } catch {}
}

export function useChat(tab: ChatTab) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Load history on mount
  useEffect(() => {
    const load = async () => {
      if (user) {
        setIsLoadingHistory(true);
        try {
          const { data } = await supabase
            .from("chat_messages")
            .select("*")
            .eq("user_id", user.id)
            .eq("tab", tab)
            .order("created_at", { ascending: true })
            .limit(200);
          if (data && data.length > 0) {
            setMessages(data.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              tab: m.tab,
              metadata: m.metadata,
              created_at: m.created_at,
            })));
          } else {
            // Fallback to local
            setMessages(loadLocal(tab));
          }
        } catch {
          setMessages(loadLocal(tab));
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        setMessages(loadLocal(tab));
      }
    };
    load();
  }, [user, tab]);

  // Save to local whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveLocal(tab, messages);
    }
  }, [messages, tab]);

  const persistMessage = useCallback(async (msg: Omit<ChatMessage, "id" | "created_at">) => {
    if (!user) return;
    try {
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: msg.role,
        content: msg.content,
        tab: msg.tab,
        metadata: msg.metadata || {},
      });
    } catch (e) {
      console.error("Failed to persist message:", e);
    }
  }, [user]);

  const sendMessage = useCallback(async (content: string, extraContext?: Record<string, any>, options?: { hiddenPrompt?: string }) => {
    if (!content.trim() || isLoading) return;

    // Display text is what the user sees; hidden prompt is what goes to AI
    const displayText = content.trim();
    const actualPrompt = options?.hiddenPrompt || displayText;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: displayText,
      tab,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    persistMessage(userMsg);
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    // Add placeholder assistant message
    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      tab,
      created_at: new Date().toISOString(),
    }]);

    try {
      const allMessages = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const edgeFunction = tab === "curriculum" ? "ai-tutor" : "ai-chat";
      const body: any = tab === "curriculum"
        ? { messages: allMessages, stream: true, teachingContext: extraContext }
        : { messages: allMessages, context: extraContext };

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${edgeFunction}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed: ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Persist completed assistant message
      persistMessage({
        role: "assistant",
        content: assistantContent,
        tab,
      });
    } catch (e: any) {
      if (e.name === "AbortError") return;
      console.error("Chat error:", e);
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, content: `❌ Error: ${e.message || "Something went wrong"}` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages, tab, isLoading, persistMessage]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    localStorage.removeItem(LOCAL_KEY(tab));
    if (user) {
      try {
        // Delete all messages for this tab
        await supabase
          .from("chat_messages")
          .delete()
          .eq("user_id", user.id)
          .eq("tab", tab);
      } catch (e) {
        console.error("Failed to clear history:", e);
      }
    }
  }, [user, tab]);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    sendMessage,
    stopStreaming,
    clearHistory,
  };
}

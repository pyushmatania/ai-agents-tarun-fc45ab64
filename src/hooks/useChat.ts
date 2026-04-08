import { useState, useCallback, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getScopedStorage } from "@/lib/scopedStorage";

export type ChatTab = "curriculum" | "general";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  tab: ChatTab;
  metadata?: Record<string, any>;
  created_at: string;
}

const LOCAL_KEY = (tab: ChatTab) => `chat_${tab}`;

export function useChat(tab: ChatTab) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Mirror messages into a ref so sendMessage doesn't need messages in deps
  const messagesRef = useRef<ChatMessage[]>([]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Storage ref scoped to current user
  const storageRef = useRef(getScopedStorage(userId));
  useEffect(() => { storageRef.current = getScopedStorage(userId); }, [userId]);

  // Load history on mount and when user/tab changes
  useEffect(() => {
    const load = async () => {
      const storage = getScopedStorage(userId);
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
            setMessages(storage.get<ChatMessage[]>(LOCAL_KEY(tab), []));
          }
        } catch {
          setMessages(storage.get<ChatMessage[]>(LOCAL_KEY(tab), []));
        } finally {
          setIsLoadingHistory(false);
        }
      } else {
        setMessages(storage.get<ChatMessage[]>(LOCAL_KEY(tab), []));
      }
    };
    load();
  }, [user, userId, tab]);

  // Save to local whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      storageRef.current.set(LOCAL_KEY(tab), messages.slice(-100));
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

  const sendMessage = useCallback(async (content: string, extraContext?: Record<string, any>, options?: { hiddenPrompt?: string; hideUserMessage?: boolean }, settingsSnapshot?: { key: string; emoji: string; value: string }[]) => {
    if (!content.trim() || isLoading) return;

    const displayText = content.trim();
    const actualPrompt = options?.hiddenPrompt || displayText;
    const hideUser = options?.hideUserMessage || false;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: displayText,
      tab,
      created_at: new Date().toISOString(),
    };

    if (!hideUser) {
      setMessages(prev => [...prev, userMsg]);
      persistMessage(userMsg);
    }
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      tab,
      metadata: settingsSnapshot ? { settingsSnapshot } : undefined,
      created_at: new Date().toISOString(),
    }]);

    try {
      // Read from ref to avoid stale closure
      const historyMessages = messagesRef.current.map(m => ({ role: m.role, content: m.content }));
      const allMessages = [...historyMessages, { role: "user" as const, content: actualPrompt }];

      const edgeFunction = tab === "curriculum" ? "ai-tutor" : "ai-chat";
      const body: any = tab === "curriculum"
        ? { messages: allMessages, stream: true, teachingContext: extraContext }
        : { messages: allMessages, context: extraContext };

      // Get the user's actual access token for auth
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${edgeFunction}`,
        {
          method: "POST",
          headers,
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
            ? { ...m, content: `Error: ${e.message || "Something went wrong"}` }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [tab, isLoading, persistMessage]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
  }, []);

  const clearHistory = useCallback(async () => {
    setMessages([]);
    storageRef.current.remove(LOCAL_KEY(tab));
    if (user) {
      try {
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

  const regenerateLast = useCallback(async (extraContext?: Record<string, any>, settingsSnapshot?: { key: string; emoji: string; value: string }[]) => {
    const currentMessages = messagesRef.current;
    if (isLoading || currentMessages.length === 0) return;
    const lastUserIdx = [...currentMessages].reverse().findIndex(m => m.role === "user");
    if (lastUserIdx === -1) return;
    const actualIdx = currentMessages.length - 1 - lastUserIdx;
    const lastUserMsg = currentMessages[actualIdx];
    setMessages(prev => prev.slice(0, actualIdx));
    setTimeout(() => {
      sendMessage(lastUserMsg.content, extraContext, undefined, settingsSnapshot);
    }, 50);
  }, [isLoading, sendMessage]);

  return {
    messages,
    isLoading,
    isLoadingHistory,
    sendMessage,
    stopStreaming,
    clearHistory,
    regenerateLast,
  };
}

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getPersona } from "@/lib/neuralOS";

const LOCAL_KEY = "user_avatar_url";

/**
 * Hook for user avatar management
 * - Upload DP to Cloud storage
 * - Generate AI avatar based on gender/interests
 * - Show across all pages
 */
export function useAvatar() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(() => localStorage.getItem(LOCAL_KEY));
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Load avatar from profile on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single();
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
        localStorage.setItem(LOCAL_KEY, data.avatar_url);
      }
    })();
  }, [user]);

  const uploadAvatar = useCallback(async (file: File) => {
    if (!user) return null;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const url = urlData.publicUrl + `?t=${Date.now()}`;

      await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("user_id", user.id);

      setAvatarUrl(url);
      localStorage.setItem(LOCAL_KEY, url);
      return url;
    } catch (e) {
      console.error("Avatar upload failed:", e);
      return null;
    } finally {
      setUploading(false);
    }
  }, [user]);

  const generateAIAvatar = useCallback(async () => {
    if (!user) return null;
    setGenerating(true);
    try {
      const persona = getPersona();
      const ctx = (() => {
        try { return JSON.parse(localStorage.getItem("user_context") || "{}"); }
        catch { return {}; }
      })();

      const interests = [
        ...(persona.shows || []),
        ...(persona.sports || []),
        ...(persona.music || []),
        ...((persona as any).games || []),
      ].slice(0, 5);

      const { data, error } = await supabase.functions.invoke("ai-avatar", {
        body: {
          gender: ctx.gender || null,
          interests,
          name: persona.name || localStorage.getItem("edu_user_name") || "User",
        },
      });

      if (error) throw error;
      if (data?.url) {
        setAvatarUrl(data.url);
        localStorage.setItem(LOCAL_KEY, data.url);
        return data.url;
      }
      return null;
    } catch (e) {
      console.error("AI Avatar generation failed:", e);
      return null;
    } finally {
      setGenerating(false);
    }
  }, [user]);

  const removeAvatar = useCallback(async () => {
    if (!user) return;
    try {
      await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("user_id", user.id);
      setAvatarUrl(null);
      localStorage.removeItem(LOCAL_KEY);
    } catch (e) {
      console.error("Avatar remove failed:", e);
    }
  }, [user]);

  return { avatarUrl, uploading, generating, uploadAvatar, generateAIAvatar, removeAvatar };
}

/**
 * Get a fallback avatar based on persona
 * Returns: { emoji, gradient, initials }
 */
export function getFallbackAvatar(name?: string | null): {
  emoji: string;
  gradient: string;
  initials: string;
} {
  const persona = getPersona();
  const gender = (() => {
    try {
      const ctx = JSON.parse(localStorage.getItem("user_context") || "{}");
      return ctx.gender || null;
    } catch { return null; }
  })();

  // Pick emoji based on gender
  let emoji = "🧑‍💻";
  if (gender === "Male") emoji = "👨‍💻";
  else if (gender === "Female") emoji = "👩‍💻";
  else if (gender === "Non-binary") emoji = "🧑‍💻";

  // Pick gradient based on favorite interests
  const interests = [
    ...(persona.shows || []),
    ...(persona.sports || []),
    ...(persona.music || []),
  ];

  let gradient = "from-agni-green/40 to-agni-blue/40";
  if (interests.some(i => /cricket|dhoni|kohli|rohit/i.test(i))) {
    gradient = "from-blue-500/40 to-green-500/40";
  } else if (interests.some(i => /anime|naruto|dragon/i.test(i))) {
    gradient = "from-orange-500/40 to-red-500/40";
  } else if (interests.some(i => /music|arijit|taylor|drake/i.test(i))) {
    gradient = "from-purple-500/40 to-pink-500/40";
  } else if (interests.some(i => /gaming|gta|minecraft/i.test(i))) {
    gradient = "from-violet-500/40 to-indigo-500/40";
  }

  const initials = (name || persona.name || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return { emoji, gradient, initials };
}

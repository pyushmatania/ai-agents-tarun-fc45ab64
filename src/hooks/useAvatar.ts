import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getPersona } from "@/lib/neuralOS";
import { getScopedStorage, getCurrentScopedStorage } from "@/lib/scopedStorage";

/**
 * Hook for user avatar management
 */
export function useAvatar() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const storage = getScopedStorage(userId);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(() =>
    storage.get<string | null>("avatar_url", null)
  );
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Re-sync from scoped storage when user changes
  useEffect(() => {
    const s = getScopedStorage(userId);
    setAvatarUrl(s.get<string | null>("avatar_url", null));
  }, [userId]);

  // Load avatar from profile on mount
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url);
        getScopedStorage(user.id).set("avatar_url", data.avatar_url);
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
      getScopedStorage(user.id).set("avatar_url", url);
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
      const s = getScopedStorage(user.id);
      const ctx = s.get<Record<string, any>>("user_context", {});

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
          name: persona.name || s.get<string>("user_name", "") || "User",
        },
      });

      if (error) throw error;
      if (data?.url) {
        setAvatarUrl(data.url);
        getScopedStorage(user.id).set("avatar_url", data.url);
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
      getScopedStorage(user.id).remove("avatar_url");
    } catch (e) {
      console.error("Avatar remove failed:", e);
    }
  }, [user]);

  return { avatarUrl, uploading, generating, uploadAvatar, generateAIAvatar, removeAvatar };
}

/**
 * Get a fallback avatar based on persona
 */
export function getFallbackAvatar(name?: string | null): {
  emoji: string;
  gradient: string;
  initials: string;
} {
  const persona = getPersona();
  const storage = getCurrentScopedStorage();
  const ctx = storage.get<Record<string, any>>("user_context", {});
  const gender = ctx.gender || null;

  let emoji = "🧑‍💻";
  if (gender === "Male") emoji = "👨‍💻";
  else if (gender === "Female") emoji = "👩‍💻";
  else if (gender === "Non-binary") emoji = "🧑‍💻";

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

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserContext {
  age_range: string;
  gender: string;
  education: string;
  location: string;
  work_experience: string;
  job_title: string;
  mission_followup: Record<string, string>;
  teaching_identity: string;
  teaching_mission: string;
  teaching_vibe: string;
  teaching_brain: string;
  brain_track: string;
}

const LOCAL_KEY = "user_context";

const defaults: UserContext = {
  age_range: "",
  gender: "",
  education: "",
  location: "",
  work_experience: "",
  job_title: "",
  mission_followup: {},
  teaching_identity: "",
  teaching_mission: "",
  teaching_vibe: "",
  teaching_brain: "",
  brain_track: "skill",
};

function loadLocal(): UserContext {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults };
  } catch {
    return { ...defaults };
  }
}

function saveLocal(ctx: UserContext) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(ctx));
}

export function getUserContextLocal(): UserContext {
  return loadLocal();
}

export function useUserContext() {
  const { user } = useAuth();
  const [ctx, setCtxState] = useState<UserContext>(loadLocal);
  const [loaded, setLoaded] = useState(false);

  // Load from DB on auth
  useEffect(() => {
    if (!user) { setLoaded(true); return; }
    (async () => {
      const { data } = await supabase
        .from("user_context")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        const merged: UserContext = {
          age_range: data.age_range || "",
          gender: data.gender || "",
          education: data.education || "",
          location: data.location || "",
          work_experience: data.work_experience || "",
          job_title: data.job_title || "",
          mission_followup: (data.mission_followup as Record<string, string>) || {},
          teaching_identity: data.teaching_identity || "",
          teaching_mission: data.teaching_mission || "",
          teaching_vibe: data.teaching_vibe || "",
          teaching_brain: data.teaching_brain || "",
          brain_track: data.brain_track || "skill",
        };
        setCtxState(merged);
        saveLocal(merged);
      }
      setLoaded(true);
    })();
  }, [user]);

  const updateContext = useCallback(async (partial: Partial<UserContext>) => {
    const updated = { ...ctx, ...partial };
    setCtxState(updated);
    saveLocal(updated);

    if (user) {
      await supabase
        .from("user_context")
        .upsert({
          user_id: user.id,
          ...updated,
          mission_followup: updated.mission_followup as any,
        }, { onConflict: "user_id" });
    }
  }, [ctx, user]);

  return { ctx, updateContext, loaded };
}

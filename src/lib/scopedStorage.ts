/**
 * Per-user scoped localStorage wrapper.
 * Prevents multi-user data corruption on shared devices.
 */

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "";

// ── Types ──────────────────────────────────────────────────────

export interface ScopedStorage {
  get<T>(key: string, fallback: T): T;
  set(key: string, value: unknown): void;
  remove(key: string): void;
  clearAll(): void;
}

// ── Core factory ───────────────────────────────────────────────

function prefix(userId: string | null | undefined): string {
  return userId ? `u:${userId}::` : "guest::";
}

export function getScopedStorage(userId: string | null | undefined): ScopedStorage {
  const pfx = prefix(userId);

  return {
    get<T>(key: string, fallback: T): T {
      try {
        const raw = localStorage.getItem(pfx + key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
      } catch {
        return fallback;
      }
    },

    set(key: string, value: unknown): void {
      try {
        localStorage.setItem(pfx + key, JSON.stringify(value));
      } catch {
        // quota exceeded / private mode — silently fail
      }
    },

    remove(key: string): void {
      try {
        localStorage.removeItem(pfx + key);
      } catch {
        // ignore
      }
    },

    clearAll(): void {
      try {
        const toRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k?.startsWith(pfx)) toRemove.push(k);
        }
        toRemove.forEach(k => localStorage.removeItem(k));
      } catch {
        // ignore
      }
    },
  };
}

// ── Convenience: clear a user's entire namespace ───────────────

export function clearScopedStorage(userId: string | null | undefined): void {
  getScopedStorage(userId).clearAll();
}

// ── Sync helper: read current user id from localStorage ────────

export function getCurrentUserIdSync(): string | null {
  try {
    // Primary: known project-id based key
    const primaryKey = `sb-${PROJECT_ID}-auth-token`;
    const raw = localStorage.getItem(primaryKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const id = parsed?.user?.id;
      if (id) return id;
    }
    // Fallback: scan for any sb-*-auth-token key
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && /^sb-[a-z0-9]+-auth-token$/.test(k)) {
        const val = localStorage.getItem(k);
        if (val) {
          const parsed = JSON.parse(val);
          const id = parsed?.user?.id;
          if (id) return id;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// ── Convenience: get scoped storage for the current user ───────

export function getCurrentScopedStorage(): ScopedStorage {
  return getScopedStorage(getCurrentUserIdSync());
}

// ── Legacy key mapping ─────────────────────────────────────────

const LEGACY_MAP: Record<string, string> = {
  // Gamification (adojo_ prefix)
  adojo_xp: "xp",
  adojo_streak: "streak",
  adojo_best_streak: "best_streak",
  adojo_hearts: "hearts",
  adojo_gems: "gems",
  adojo_done: "done",
  adojo_bookmarks: "bookmarks",
  adojo_streak_freezes: "streak_freezes",
  adojo_heart_regen_at: "heart_regen_at",
  adojo_total_quizzes: "total_quizzes",
  adojo_total_perfect: "total_perfect",
  adojo_daily_xp: "daily_xp",
  adojo_lessons_today: "lessons_today",
  adojo_quizzes_today: "quizzes_today",
  adojo_perfect_today: "perfect_today",
  adojo_last_active: "last_active",
  adojo_ai_config: "ai_config",
  // Chat
  agni_chat_curriculum: "chat_curriculum",
  agni_chat_general: "chat_general",
  // Persona
  neuralos_persona_v2: "persona",
  user_context: "user_context",
  user_avatar_url: "avatar_url",
  // Teaching mode
  teaching_mode: "teaching_mode",
  teaching_identity: "teaching_identity",
  teaching_mission: "teaching_mission",
  teaching_vibe: "teaching_vibe",
  teaching_brain: "teaching_brain",
  teaching_brain_track: "teaching_brain_track",
  teaching_universe_vibe: "teaching_universe_vibe",
  teaching_custom_options: "teaching_custom_options",
  explain_styles_custom: "explain_styles_custom",
  explain_styles_active: "explain_styles_active",
  // Sources
  neuralos_followed_sources: "followed_sources",
  neuralos_read_sources: "read_sources",
  // User identity
  edu_user_name: "user_name",
  edu_user_role: "user_role",
};

const ALL_LEGACY_KEYS = [
  ...Object.keys(LEGACY_MAP),
  "edu_onboarded",
];

// ── Migration ──────────────────────────────────────────────────

export function migrateLegacyKeys(userId: string): void {
  try {
    const storage = getScopedStorage(userId);
    if (storage.get<boolean>("__legacy_migrated", false)) return;

    for (const [legacyKey, scopedKey] of Object.entries(LEGACY_MAP)) {
      const raw = localStorage.getItem(legacyKey);
      if (raw !== null) {
        // Store the raw value — it may or may not be JSON
        try {
          const parsed = JSON.parse(raw);
          storage.set(scopedKey, parsed);
        } catch {
          // Not JSON — store as string
          storage.set(scopedKey, raw);
        }
      }
    }

    storage.set("__legacy_migrated", true);
  } catch {
    // ignore — migration is best-effort
  }
}

// ── Cleanup legacy keys on logout ──────────────────────────────

export function clearLegacyKeys(): void {
  try {
    for (const key of ALL_LEGACY_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    // ignore
  }
}

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getScopedStorage, type ScopedStorage } from "@/lib/scopedStorage";

// ── Constants ──
const XP_PER_LEVEL = 500;
const MAX_HEARTS = 5;
const HEART_REGEN_MINUTES = 30;
const DAILY_GOAL_XP = 50;
const GEMS_PER_LESSON = 5;
const STREAK_FREEZE_COST = 50; // gems
const SYNC_DEBOUNCE_MS = 800;

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  emoji: string;
  target: number;
  current: number;
  xpReward: number;
  gemsReward: number;
  type: "lessons" | "xp" | "quizzes" | "streak" | "perfect";
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
  check: (stats: GamificationStats) => boolean;
}

export interface GamificationStats {
  xp: number;
  level: number;
  xpInLevel: number;
  xpToNextLevel: number;
  hearts: number;
  maxHearts: number;
  heartRegenAt: number | null;
  gems: number;
  streak: number;
  bestStreak: number;
  lastActiveDate: string;
  streakFreezes: number;
  dailyXp: number;
  dailyGoal: number;
  lessonsToday: number;
  quizzesToday: number;
  perfectLessonsToday: number;
  totalLessons: number;
  totalQuizzes: number;
  totalPerfect: number;
  done: string[];
  bookmarks: string[];
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_step", title: "First Step", description: "Complete your first lesson", emoji: "🌱", tier: "bronze", check: s => s.totalLessons >= 1 },
  { id: "getting_warm", title: "Getting Warm", description: "Complete 5 lessons", emoji: "🔥", tier: "bronze", check: s => s.totalLessons >= 5 },
  { id: "xp_collector", title: "XP Collector", description: "Earn 200 XP", emoji: "💰", tier: "bronze", check: s => s.xp >= 200 },
  { id: "bookworm", title: "Bookworm", description: "Bookmark 3 lessons", emoji: "🔖", tier: "bronze", check: s => s.bookmarks.length >= 3 },
  { id: "streak_3", title: "On Fire", description: "3-day streak", emoji: "🔥", tier: "silver", check: s => s.bestStreak >= 3 },
  { id: "halfway", title: "Halfway Hero", description: "Complete 11 lessons", emoji: "⚡", tier: "silver", check: s => s.totalLessons >= 11 },
  { id: "xp_hunter", title: "XP Hunter", description: "Earn 500 XP", emoji: "💎", tier: "silver", check: s => s.xp >= 500 },
  { id: "perfectionist", title: "Perfectionist", description: "3 perfect lessons", emoji: "✨", tier: "silver", check: s => s.totalPerfect >= 3 },
  { id: "streak_7", title: "Week Warrior", description: "7-day streak", emoji: "🗓️", tier: "gold", check: s => s.bestStreak >= 7 },
  { id: "gem_rich", title: "Gem Collector", description: "Collect 200 gems", emoji: "💎", tier: "gold", check: s => s.gems >= 200 },
  { id: "xp_master", title: "XP Master", description: "Earn 1000 XP", emoji: "🏅", tier: "gold", check: s => s.xp >= 1000 },
  { id: "agent_master", title: "Agent Master", description: "Complete all 22 lessons", emoji: "🏆", tier: "diamond", check: s => s.totalLessons >= 22 },
];

function generateDailyQuests(stats: GamificationStats): DailyQuest[] {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const seed = dayOfYear;

  return [
    {
      id: `dq_lessons_${seed}`,
      title: "Daily Learner",
      description: "Complete 2 lessons today",
      emoji: "📚",
      target: 2,
      current: Math.min(stats.lessonsToday, 2),
      xpReward: 20,
      gemsReward: 10,
      type: "lessons",
    },
    {
      id: `dq_xp_${seed}`,
      title: "XP Grinder",
      description: `Earn ${DAILY_GOAL_XP} XP today`,
      emoji: "⚡",
      target: DAILY_GOAL_XP,
      current: Math.min(stats.dailyXp, DAILY_GOAL_XP),
      xpReward: 15,
      gemsReward: 5,
      type: "xp",
    },
    {
      id: `dq_perfect_${seed}`,
      title: "Perfect Score",
      description: "Get a perfect quiz score",
      emoji: "🎯",
      target: 1,
      current: Math.min(stats.perfectLessonsToday, 1),
      xpReward: 25,
      gemsReward: 15,
      type: "perfect",
    },
  ];
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

function buildInitialStats(storage: ScopedStorage): GamificationStats {
  const today = getToday();
  const yesterday = getYesterday();
  const lastActive = storage.get<string>("last_active", "");
  const isNewDay = lastActive !== today;

  const xp = storage.get<number>("xp", 0);
  let streak = storage.get<number>("streak", 0);
  const bestStreak = storage.get<number>("best_streak", 0);
  const hearts = storage.get<number>("hearts", MAX_HEARTS);
  const gems = storage.get<number>("gems", 0);
  const done = storage.get<string[]>("done", []);
  const bookmarks = storage.get<string[]>("bookmarks", []);
  let streakFreezes = storage.get<number>("streak_freezes", 0);
  const heartRegenAt = storage.get<number | null>("heart_regen_at", null);
  const totalQuizzes = storage.get<number>("total_quizzes", 0);
  const totalPerfect = storage.get<number>("total_perfect", 0);

  const dailyXp = isNewDay ? 0 : storage.get<number>("daily_xp", 0);
  const lessonsToday = isNewDay ? 0 : storage.get<number>("lessons_today", 0);
  const quizzesToday = isNewDay ? 0 : storage.get<number>("quizzes_today", 0);
  const perfectLessonsToday = isNewDay ? 0 : storage.get<number>("perfect_today", 0);

  // Explicit streak handling on new day
  if (isNewDay && lastActive) {
    if (lastActive === yesterday) {
      // Streak continues — no change needed
    } else if (streakFreezes > 0) {
      // Consume a freeze to preserve streak
      streakFreezes = streakFreezes - 1;
      storage.set("streak_freezes", streakFreezes);
    } else {
      // Missed day(s) without freeze — reset streak
      streak = 0;
      storage.set("streak", 0);
    }
  }

  return {
    xp,
    level: Math.floor(xp / XP_PER_LEVEL) + 1,
    xpInLevel: xp % XP_PER_LEVEL,
    xpToNextLevel: XP_PER_LEVEL,
    hearts,
    maxHearts: MAX_HEARTS,
    heartRegenAt,
    gems,
    streak,
    bestStreak: Math.max(bestStreak, streak),
    lastActiveDate: lastActive,
    streakFreezes,
    dailyXp,
    dailyGoal: DAILY_GOAL_XP,
    lessonsToday,
    quizzesToday,
    perfectLessonsToday,
    totalLessons: done.length,
    totalQuizzes,
    totalPerfect,
    done,
    bookmarks,
  };
}

export function useGamification() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const storageRef = useRef<ScopedStorage>(getScopedStorage(userId));

  const [stats, setStats] = useState<GamificationStats>(() =>
    buildInitialStats(storageRef.current)
  );

  // Rebuild state when user changes
  useEffect(() => {
    storageRef.current = getScopedStorage(userId);
    setStats(buildInitialStats(storageRef.current));
  }, [userId]);

  // Helper to save to current user's storage
  const save = useCallback((key: string, value: unknown) => {
    storageRef.current.set(key, value);
  }, []);

  // Heart regeneration timer
  useEffect(() => {
    if (stats.hearts >= MAX_HEARTS) return;

    const checkRegen = () => {
      const regenAt = stats.heartRegenAt;
      if (regenAt && Date.now() >= regenAt) {
        const newHearts = Math.min(stats.hearts + 1, MAX_HEARTS);
        const newRegenAt = newHearts < MAX_HEARTS ? Date.now() + HEART_REGEN_MINUTES * 60000 : null;
        save("hearts", newHearts);
        save("heart_regen_at", newRegenAt);
        setStats(prev => ({ ...prev, hearts: newHearts, heartRegenAt: newRegenAt }));
      }
    };

    const interval = setInterval(checkRegen, 10000);
    return () => clearInterval(interval);
  }, [stats.hearts, stats.heartRegenAt, save]);

  const addXP = useCallback((amount: number) => {
    setStats(prev => {
      const today = getToday();
      const newXp = prev.xp + amount;
      const newDailyXp = prev.dailyXp + amount;
      const newGems = prev.gems + Math.floor(amount / 10);
      let newStreak = prev.streak;
      if (prev.lastActiveDate !== today) {
        newStreak = prev.streak + 1;
      }
      const newBest = Math.max(prev.bestStreak, newStreak);

      save("xp", newXp);
      save("daily_xp", newDailyXp);
      save("gems", newGems);
      save("streak", newStreak);
      save("best_streak", newBest);
      save("last_active", today);

      return {
        ...prev,
        xp: newXp,
        level: Math.floor(newXp / XP_PER_LEVEL) + 1,
        xpInLevel: newXp % XP_PER_LEVEL,
        dailyXp: newDailyXp,
        gems: newGems,
        streak: newStreak,
        bestStreak: newBest,
        lastActiveDate: today,
      };
    });
  }, [save]);

  const loseHeart = useCallback(() => {
    setStats(prev => {
      if (prev.hearts <= 0) return prev;
      const newHearts = prev.hearts - 1;
      const regenAt = prev.heartRegenAt || Date.now() + HEART_REGEN_MINUTES * 60000;
      save("hearts", newHearts);
      save("heart_regen_at", regenAt);
      return { ...prev, hearts: newHearts, heartRegenAt: regenAt };
    });
  }, [save]);

  const refillHearts = useCallback((withGems: boolean = false) => {
    setStats(prev => {
      if (withGems && prev.gems < 50) return prev;
      const newGems = withGems ? prev.gems - 50 : prev.gems;
      save("hearts", MAX_HEARTS);
      save("heart_regen_at", null);
      if (withGems) save("gems", newGems);
      return { ...prev, hearts: MAX_HEARTS, heartRegenAt: null, gems: newGems };
    });
  }, [save]);

  const completeLesson = useCallback((lessonId: string, xpEarned: number, isPerfect: boolean) => {
    setStats(prev => {
      const newDone = prev.done.includes(lessonId) ? prev.done : [...prev.done, lessonId];
      const newLessonsToday = prev.lessonsToday + 1;
      const newPerfectToday = isPerfect ? prev.perfectLessonsToday + 1 : prev.perfectLessonsToday;
      const newTotalPerfect = isPerfect ? prev.totalPerfect + 1 : prev.totalPerfect;
      const newGems = prev.gems + GEMS_PER_LESSON + (isPerfect ? 10 : 0);

      save("done", newDone);
      save("lessons_today", newLessonsToday);
      save("perfect_today", newPerfectToday);
      save("total_perfect", newTotalPerfect);
      save("gems", newGems);

      return {
        ...prev,
        done: newDone,
        totalLessons: newDone.length,
        lessonsToday: newLessonsToday,
        perfectLessonsToday: newPerfectToday,
        totalPerfect: newTotalPerfect,
        gems: newGems,
      };
    });
    addXP(xpEarned);
  }, [addXP, save]);

  const buyStreakFreeze = useCallback(() => {
    setStats(prev => {
      if (prev.gems < STREAK_FREEZE_COST) return prev;
      const newGems = prev.gems - STREAK_FREEZE_COST;
      const newFreezes = prev.streakFreezes + 1;
      save("gems", newGems);
      save("streak_freezes", newFreezes);
      return { ...prev, gems: newGems, streakFreezes: newFreezes };
    });
  }, [save]);

  const dailyQuests = useMemo(() => generateDailyQuests(stats), [stats.lessonsToday, stats.dailyXp, stats.perfectLessonsToday]);

  const achievements = useMemo(() =>
    ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.check(stats) })),
    [stats]
  );

  const unlockedAchievements = achievements.filter(a => a.unlocked).length;

  const streakDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        label: d.toLocaleDateString("en", { weekday: "narrow" }),
        date: d.getDate(),
        active: i >= 7 - Math.min(stats.streak, 7),
      };
    }),
    [stats.streak]
  );

  const heartRegenCountdown = useMemo(() => {
    if (!stats.heartRegenAt || stats.hearts >= MAX_HEARTS) return null;
    const remaining = Math.max(0, stats.heartRegenAt - Date.now());
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, [stats.heartRegenAt, stats.hearts]);

  const league = useMemo(() => {
    if (stats.xp >= 5000) return { name: "Diamond", emoji: "💎", color: "text-agni-blue" };
    if (stats.xp >= 2500) return { name: "Gold", emoji: "🥇", color: "text-agni-gold" };
    if (stats.xp >= 1000) return { name: "Silver", emoji: "🥈", color: "text-muted-foreground" };
    if (stats.xp >= 300) return { name: "Bronze", emoji: "🥉", color: "text-agni-orange" };
    return { name: "Starter", emoji: "🌱", color: "text-agni-green" };
  }, [stats.xp]);

  // ── Leaderboard sync with debounce + race protection ──
  const lastSuccessfullySyncedXp = useRef(stats.xp);
  const syncInFlight = useRef(false);
  const pendingSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;
    if (stats.xp === lastSuccessfullySyncedXp.current && lastSuccessfullySyncedXp.current !== 0) return;

    if (pendingSyncTimer.current) clearTimeout(pendingSyncTimer.current);

    pendingSyncTimer.current = setTimeout(async () => {
      if (syncInFlight.current) return;
      syncInFlight.current = true;

      try {
        const targetXp = stats.xp;
        const targetLevel = stats.level;
        const targetLeague = league.name;
        const xpDelta = Math.max(targetXp - lastSuccessfullySyncedXp.current, 0);

        const displayName =
          storageRef.current.get<string>("user_name", "") ||
          user?.user_metadata?.full_name?.split(" ")[0] ||
          "Learner";

        const { data: existing } = await supabase
          .from("leaderboard")
          .select("id, weekly_xp")
          .eq("user_id", userId)
          .maybeSingle();

        let error;
        if (existing) {
          ({ error } = await supabase.from("leaderboard").update({
            xp: targetXp,
            weekly_xp: (existing.weekly_xp || 0) + xpDelta,
            level: targetLevel,
            league: targetLeague,
            display_name: displayName,
          }).eq("user_id", userId));
        } else {
          ({ error } = await supabase.from("leaderboard").insert({
            user_id: userId,
            xp: targetXp,
            weekly_xp: targetXp,
            level: targetLevel,
            league: targetLeague,
            display_name: displayName,
          }));
        }

        if (!error) {
          lastSuccessfullySyncedXp.current = targetXp;
        }
      } catch {
        // sync failed — will retry on next XP change
      } finally {
        syncInFlight.current = false;
      }
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (pendingSyncTimer.current) clearTimeout(pendingSyncTimer.current);
    };
  }, [stats.xp, stats.level, league.name, userId, user]);

  return {
    stats,
    addXP,
    loseHeart,
    refillHearts,
    completeLesson,
    buyStreakFreeze,
    dailyQuests,
    achievements,
    unlockedAchievements,
    streakDays,
    heartRegenCountdown,
    league,
    STREAK_FREEZE_COST,
  };
}

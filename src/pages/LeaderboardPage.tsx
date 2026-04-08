import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Trophy, ArrowLeft, Flame, Zap, Crown, Shield, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Agni from "@/components/Agni";

interface LeaderboardEntry {
  display_name: string;
  xp: number;
  weekly_xp: number;
  user_id: string;
  level: number;
  league: string;
}

const LEAGUE_META: Record<string, { emoji: string; color: string }> = {
  Starter: { emoji: "🌱", color: "text-agni-green" },
  Bronze: { emoji: "🥉", color: "text-agni-orange" },
  Silver: { emoji: "🥈", color: "text-muted-foreground" },
  Gold: { emoji: "🥇", color: "text-agni-gold" },
  Diamond: { emoji: "💎", color: "text-agni-blue" },
};

const PODIUM_COLORS = [
  "from-agni-gold/30 to-agni-gold/5 border-agni-gold/40",
  "from-slate-400/20 to-slate-400/5 border-slate-400/30",
  "from-orange-600/20 to-orange-600/5 border-orange-600/30",
];

const LeaderboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats, league, streakDays } = useGamification();
  const [tab, setTab] = useState<"weekly" | "alltime">("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [user?.id, setMyPublicId] = useState<string | null>(null);

  // Compute SHA-256 of user ID for "is this me?" matching
  useEffect(() => {
    if (!user?.id) { setMyPublicId(null); return; }
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(user.id))
      .then(buf => setMyPublicId(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("")));
  }, [user?.id]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("leaderboard")
        .select("display_name, xp, weekly_xp, level, league")
        .order("weekly_xp", { ascending: false })
        .limit(50);
      if (data) setEntries(data as LeaderboardEntry[]);
    };
    fetch();

    const channel = supabase
      .channel("lb-page-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "leaderboard" }, () => fetch())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const sorted = [...entries].sort((a, b) =>
    tab === "weekly" ? b.weekly_xp - a.weekly_xp : b.xp - a.xp
  );

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);
  const myIdx = user?.id ? sorted.findIndex(p => p.user_id === user?.id) : -1;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto px-4 pt-5">

          {/* Header */}
          <FadeIn>
            <div className="flex items-center gap-3 mb-5">
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-xl bg-card flex items-center justify-center border border-border/50">
                <ArrowLeft size={16} className="text-muted-foreground" />
              </motion.button>
              <div className="flex-1">
                <h1 className="text-lg font-black text-foreground">Leaderboard</h1>
                <p className="text-[10px] text-muted-foreground font-bold">Compete with fellow learners</p>
              </div>
              <Agni expression="excited" size={40} animate />
            </div>
          </FadeIn>

          {/* Your rank card */}
          {user && myIdx >= 0 && (
            <FadeIn delay={0.05}>
              <div className="bg-gradient-to-r from-agni-green/15 to-agni-blue/10 border border-agni-green/25 rounded-2xl p-3.5 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-agni-green/20 flex items-center justify-center">
                    <span className="text-xl font-black text-agni-green">#{myIdx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-foreground">Your Ranking</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold text-agni-green bg-agni-green/15 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Zap size={8} /> {tab === "weekly" ? sorted[myIdx].weekly_xp : sorted[myIdx].xp} XP
                      </span>
                      <span className="text-[9px] font-bold text-agni-orange bg-agni-orange/15 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Flame size={8} /> {stats.streak}d
                      </span>
                      <span className={`text-[9px] font-bold ${league.color} bg-muted/30 px-2 py-0.5 rounded-full`}>
                        {league.emoji} {league.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Tabs */}
          <FadeIn delay={0.1}>
            <div className="flex gap-2 mb-5">
              {(["weekly", "alltime"] as const).map(t => (
                <motion.button key={t} whileTap={{ scale: 0.95 }}
                  onClick={() => setTab(t)}
                  className={`flex-1 text-[11px] font-black py-2.5 rounded-xl transition-all ${
                    tab === t
                      ? "bg-agni-gold/20 text-agni-gold border border-agni-gold/40 shadow-md"
                      : "bg-card text-muted-foreground border border-border/40"
                  }`}
                >
                  {t === "weekly" ? "🗓️ This Week" : "🏆 All Time"}
                </motion.button>
              ))}
            </div>
          </FadeIn>

          {/* Podium - Top 3 */}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {top3.length >= 3 && (
                <FadeIn delay={0.15}>
                  <div className="flex items-end justify-center gap-2 mb-5">
                    {/* 2nd place */}
                    <PodiumCard entry={top3[1]} rank={2} tab={tab} isYou={user?.id === top3[1].user_id} />
                    {/* 1st place */}
                    <PodiumCard entry={top3[0]} rank={1} tab={tab} isYou={user?.id === top3[0].user_id} first />
                    {/* 3rd place */}
                    <PodiumCard entry={top3[2]} rank={3} tab={tab} isYou={user?.id === top3[2].user_id} />
                  </div>
                </FadeIn>
              )}

              {/* Rest of leaderboard */}
              <StaggerContainer className="space-y-2 mb-4">
                {rest.map((entry, idx) => {
                  const rank = idx + 4;
                  const isYou = user?.id === entry.user_id;
                  const leagueMeta = LEAGUE_META[entry.league] || LEAGUE_META.Starter;
                  const xpVal = tab === "weekly" ? entry.weekly_xp : entry.xp;

                  return (
                    <StaggerItem key={entry.user_id}>
                      <motion.div
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition-all ${
                          isYou
                            ? "bg-agni-green/10 border-agni-green/25"
                            : "bg-card border-border/40"
                        }`}
                      >
                        <span className="text-xs font-black text-muted-foreground w-5 text-center">{rank}</span>
                        <div className="w-8 h-8 rounded-xl bg-muted/30 flex items-center justify-center text-sm">
                          {leagueMeta.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-extrabold truncate ${isYou ? "text-agni-green" : "text-foreground"}`}>
                            {entry.display_name} {isYou && <span className="text-[8px] text-agni-green/70">(You)</span>}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-bold ${leagueMeta.color}`}>{entry.league}</span>
                            <span className="text-[7px] text-muted-foreground">•</span>
                            <span className="text-[8px] font-bold text-muted-foreground">Lvl {entry.level}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-black text-agni-gold">{xpVal.toLocaleString()}</p>
                          <p className="text-[7px] text-muted-foreground font-bold">XP</p>
                        </div>
                      </motion.div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>

              {sorted.length === 0 && (
                <div className="text-center py-12">
                  <Agni expression="default" size={80} animate />
                  <p className="text-sm font-bold text-muted-foreground mt-3">No rankings yet!</p>
                  <p className="text-[11px] text-muted-foreground">Start learning to appear here 🚀</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* League tiers section */}
          <FadeIn delay={0.3}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/40 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-agni-purple flex items-center justify-center">
                  <Crown size={14} className="text-white" />
                </div>
                <h4 className="text-xs font-extrabold text-foreground">League Tiers</h4>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Starter", emoji: "🌱", xp: "0 XP", desc: "Just getting started" },
                  { name: "Bronze", emoji: "🥉", xp: "300 XP", desc: "Finding your rhythm" },
                  { name: "Silver", emoji: "🥈", xp: "1,000 XP", desc: "Dedicated learner" },
                  { name: "Gold", emoji: "🥇", xp: "2,500 XP", desc: "AI knowledge expert" },
                  { name: "Diamond", emoji: "💎", xp: "5,000 XP", desc: "Legendary mastery" },
                ].map((tier, i) => {
                  const isCurrentLeague = league.name === tier.name;
                  return (
                    <motion.div
                      key={tier.name}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${
                        isCurrentLeague
                          ? "bg-agni-green/10 border-agni-green/25"
                          : "bg-muted/15 border-border/30"
                      }`}
                    >
                      <span className="text-xl">{tier.emoji}</span>
                      <div className="flex-1">
                        <p className={`text-[11px] font-extrabold ${isCurrentLeague ? "text-agni-green" : "text-foreground"}`}>
                          {tier.name} {isCurrentLeague && "← You"}
                        </p>
                        <p className="text-[8px] text-muted-foreground font-semibold">{tier.desc}</p>
                      </div>
                      <span className="text-[9px] font-black text-muted-foreground">{tier.xp}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

// Podium card component for top 3
const PodiumCard = ({ entry, rank, tab, isYou, first }: {
  entry: LeaderboardEntry; rank: number; tab: "weekly" | "alltime"; isYou: boolean; first?: boolean;
}) => {
  const xpVal = tab === "weekly" ? entry.weekly_xp : entry.xp;
  const leagueMeta = LEAGUE_META[entry.league] || LEAGUE_META.Starter;
  const rankEmoji = rank === 1 ? "👑" : rank === 2 ? "🥈" : "🥉";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + (rank - 1) * 0.08, type: "spring" }}
      className={`flex flex-col items-center ${first ? "w-28 -mt-4" : "w-24"}`}
    >
      <motion.span
        className={`${first ? "text-3xl" : "text-xl"} mb-1`}
        animate={first ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {rankEmoji}
      </motion.span>
      <div className={`w-full rounded-2xl p-3 border text-center bg-gradient-to-b ${PODIUM_COLORS[rank - 1]} ${
        isYou ? "ring-2 ring-agni-green/40" : ""
      }`}>
        <span className="text-lg block mb-0.5">{leagueMeta.emoji}</span>
        <p className={`text-[10px] font-extrabold truncate ${isYou ? "text-agni-green" : "text-foreground"}`}>
          {entry.display_name}
        </p>
        <p className="text-[8px] text-muted-foreground font-bold">Lvl {entry.level}</p>
        <div className="mt-1.5 bg-background/40 rounded-lg py-1 px-2">
          <p className="text-[11px] font-black text-agni-gold">{xpVal.toLocaleString()}</p>
          <p className="text-[7px] text-muted-foreground font-bold">XP</p>
        </div>
      </div>
    </motion.div>
  );
};

export default LeaderboardPage;

import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn, StaggerContainer, StaggerItem } from "@/components/PageTransition";
import { Trophy, Target, Flame, Zap, Calendar, BookOpen, Star, Award, Lock, Heart, Diamond, Shield, Crown, TrendingUp, ChevronRight, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Agni from "@/components/Agni";
import DailyQuests from "@/components/DailyQuests";
import { useGamification } from "@/hooks/useGamification";
import { getCurrentScopedStorage } from "@/lib/scopedStorage";

const MODULE_PROGRESS = [
  { title: "Foundations", icon: "🧬", total: 6, ids: ["f1","f2","f3","f4","f5","f6"] },
  { title: "Frameworks", icon: "⚔️", total: 6, ids: ["w1","w2","w3","w4","w5","w6"] },
  { title: "Multi-Agent", icon: "🏢", total: 5, ids: ["m1","m2","m3","m4","m5"] },
  { title: "Real World", icon: "🚀", total: 5, ids: ["r1","r2","r3","r4","r5"] },
];

const TIER_COLORS = { bronze: "from-orange-600 to-orange-800", silver: "from-slate-400 to-slate-600", gold: "from-yellow-500 to-amber-600", diamond: "from-cyan-400 to-blue-600" };

const ProgressPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    stats, dailyQuests, achievements, unlockedAchievements,
    streakDays, heartRegenCountdown, league, buyStreakFreeze,
    refillHearts, STREAK_FREEZE_COST,
  } = useGamification();

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || getCurrentScopedStorage().get<string>("user_name", "") || "Learner";
  const displayProgress = Math.round((stats.done.length / 22) * 100);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto px-4 pt-5">

          {/* Top Bar */}
          <FadeIn>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Agni expression={stats.done.length >= 22 ? "celebrating" : stats.done.length > 10 ? "excited" : "happy"} size={45} animate={true} />
                <div>
                  <h2 className="text-sm font-black text-foreground">Your Stats</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-agni-green">{league.emoji} {league.name}</span>
                    <span className="text-border">•</span>
                    <span className="text-[10px] font-bold text-muted-foreground">Level {stats.level}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate("/settings")}
                  className="w-8 h-8 rounded-xl bg-card flex items-center justify-center border border-border/50 hover:border-primary/30 transition-colors"
                  title="Profile"
                >
                  <User size={14} className="text-muted-foreground" />
                </motion.button>
                <div className="flex items-center gap-1 bg-agni-pink/15 rounded-full px-2 py-0.5">
                  <Heart size={10} className="text-agni-pink fill-agni-pink" />
                  <span className="text-[10px] font-black text-agni-pink">{stats.hearts}</span>
                </div>
                <div className="flex items-center gap-1 bg-agni-gold/15 rounded-full px-2 py-0.5">
                  <Diamond size={10} className="text-agni-gold" />
                  <span className="text-[10px] font-black text-agni-gold">{stats.gems}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* XP Level Progress — Large */}
          <FadeIn delay={0.05}>
            <div className="bg-card rounded-2xl p-4 border border-border/40 shadow-card mb-4">
              <div className="flex items-center gap-3 mb-3">
                <motion.div
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-agni-green to-agni-green-light flex items-center justify-center shrink-0 shadow-glow-green"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="text-xl font-black text-white">{stats.level}</span>
                </motion.div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-extrabold text-foreground">Level {stats.level}</span>
                    <span className="text-[10px] text-muted-foreground font-bold">{stats.xpInLevel}/{stats.xpToNextLevel} XP</span>
                  </div>
                  <div className="w-full h-3 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-agni-green to-agni-green-light rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(stats.xpInLevel / stats.xpToNextLevel) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-1 font-semibold">
                    {stats.xpToNextLevel - stats.xpInLevel} XP to Level {stats.level + 1}
                  </p>
                </div>
              </div>
              {/* Total XP */}
              <div className="flex items-center justify-center gap-2 bg-agni-green/10 rounded-xl py-2">
                <Zap size={14} className="text-agni-green" />
                <span className="text-sm font-black text-agni-green">{stats.xp} Total XP</span>
              </div>
            </div>
          </FadeIn>

          {/* Stats Row */}
          <StaggerContainer className="grid grid-cols-4 gap-2 mb-4">
            {[
              { icon: BookOpen, value: stats.totalLessons, label: "Lessons", color: "bg-agni-blue" },
              { icon: Flame, value: `${stats.streak}d`, label: "Streak", color: "bg-agni-orange" },
              { icon: Star, value: stats.totalPerfect, label: "Perfect", color: "bg-agni-gold" },
              { icon: Target, value: `${displayProgress}%`, label: "Done", color: "bg-agni-purple" },
            ].map((stat, i) => (
              <StaggerItem key={i}>
                <motion.div whileTap={{ scale: 0.95 }} className="bg-card rounded-2xl p-2.5 border border-border/40 text-center shadow-card">
                  <div className={`w-8 h-8 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-1 shadow-md`}>
                    <stat.icon size={14} className="text-white" />
                  </div>
                  <p className="text-sm font-black text-foreground leading-none">{stat.value}</p>
                  <p className="text-micro text-muted-foreground mt-0.5">{stat.label}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Hearts & Regen */}
          <FadeIn delay={0.15}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/40 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl bg-agni-pink flex items-center justify-center">
                  <Heart size={14} className="text-white fill-white" />
                </div>
                <h4 className="text-xs font-extrabold text-foreground">Hearts</h4>
                {heartRegenCountdown && (
                  <span className="ml-auto text-[9px] font-bold text-agni-pink bg-agni-pink/15 px-2 py-0.5 rounded-full">
                    Next in {heartRegenCountdown}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: stats.maxHearts }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.06, type: "spring" }}
                  >
                    <Heart
                      size={24}
                      className={i < stats.hearts ? "text-agni-pink fill-agni-pink" : "text-muted-foreground/30"}
                    />
                  </motion.div>
                ))}
              </div>
              {stats.hearts < stats.maxHearts && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => refillHearts(true)}
                  className="w-full py-2 bg-agni-pink/15 border border-agni-pink/30 rounded-xl text-[10px] font-extrabold text-agni-pink flex items-center justify-center gap-1"
                >
                  <Diamond size={10} /> Refill for 50 gems
                </motion.button>
              )}
            </div>
          </FadeIn>

          {/* Streak Calendar */}
          <FadeIn delay={0.2}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/40 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-agni-orange flex items-center justify-center">
                  <Flame size={14} className="text-white" />
                </div>
                <h4 className="text-xs font-extrabold text-foreground">Streak</h4>
                <div className="ml-auto flex items-center gap-1.5">
                  {stats.streakFreezes > 0 && (
                    <span className="text-[9px] font-bold text-agni-blue bg-agni-blue/15 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Shield size={8} /> {stats.streakFreezes}
                    </span>
                  )}
                  <span className="text-[10px] font-black text-agni-orange bg-agni-orange/15 px-2.5 py-0.5 rounded-full">{stats.streak}d 🔥</span>
                </div>
              </div>
              <div className="flex justify-between gap-1 mb-3">
                {streakDays.map((d, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.25 + i * 0.04, type: "spring" }}
                    className="flex flex-col items-center gap-1"
                  >
                    <span className="text-[8px] text-muted-foreground font-bold">{d.label}</span>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black ${
                      d.active ? "bg-agni-orange text-white shadow-lg" : "bg-muted/50 text-muted-foreground"
                    }`}>
                      {d.active ? "🔥" : d.date}
                    </div>
                  </motion.div>
                ))}
              </div>
              {/* Streak Freeze purchase */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={buyStreakFreeze}
                className="w-full py-2 bg-agni-blue/10 border border-agni-blue/20 rounded-xl text-[10px] font-extrabold text-agni-blue flex items-center justify-center gap-1"
              >
                <Shield size={10} /> Buy Streak Freeze
                <Diamond size={8} className="text-agni-gold ml-1" />
                <span className="text-agni-gold">{STREAK_FREEZE_COST}</span>
              </motion.button>
            </div>
          </FadeIn>

          {/* Daily Quests */}
          <FadeIn delay={0.25}>
            <DailyQuests quests={dailyQuests} />
          </FadeIn>

          {/* League + Leaderboard link */}
          <FadeIn delay={0.3}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/40 shadow-card my-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-agni-purple flex items-center justify-center">
                    <Crown size={14} className="text-white" />
                  </div>
                  <h4 className="text-xs font-extrabold text-foreground">League</h4>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/leaderboard")}
                  className="text-[9px] font-black text-agni-gold bg-agni-gold/15 px-2.5 py-1 rounded-full flex items-center gap-0.5">
                  Leaderboard <ChevronRight size={10} />
                </motion.button>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-agni-purple/10 to-agni-blue/10 rounded-xl border border-agni-purple/20">
                <motion.span
                  className="text-3xl"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >{league.emoji}</motion.span>
                <div className="flex-1">
                  <p className={`text-sm font-black ${league.color}`}>{league.name} League</p>
                  <p className="text-[9px] text-muted-foreground font-semibold">
                    {stats.xp < 300 ? `${300 - stats.xp} XP to Bronze` :
                     stats.xp < 1000 ? `${1000 - stats.xp} XP to Silver` :
                     stats.xp < 2500 ? `${2500 - stats.xp} XP to Gold` :
                     stats.xp < 5000 ? `${5000 - stats.xp} XP to Diamond` : "Max league reached! 🏆"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-foreground">{stats.xp}</p>
                  <p className="text-[8px] text-muted-foreground font-bold">XP</p>
                </div>
              </div>
              {/* League tiers */}
              <div className="flex justify-between mt-3 px-2">
                {[
                  { name: "Starter", emoji: "🌱", xp: 0 },
                  { name: "Bronze", emoji: "🥉", xp: 300 },
                  { name: "Silver", emoji: "🥈", xp: 1000 },
                  { name: "Gold", emoji: "🥇", xp: 2500 },
                  { name: "Diamond", emoji: "💎", xp: 5000 },
                ].map((tier, i) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className={`flex flex-col items-center ${stats.xp >= tier.xp ? "opacity-100" : "opacity-40"}`}
                  >
                    <span className="text-sm">{tier.emoji}</span>
                    <span className="text-[7px] font-bold text-muted-foreground">{tier.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Module Progress Rings */}
          <FadeIn delay={0.35}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/40 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-agni-blue flex items-center justify-center">
                  <TrendingUp size={14} className="text-white" />
                </div>
                <h4 className="text-xs font-extrabold text-foreground">Module Progress</h4>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {MODULE_PROGRESS.map((mod, i) => {
                  const completed = mod.ids.filter(id => stats.done.includes(id)).length;
                  const pct = Math.round((completed / mod.total) * 100);
                  const circ = 2 * Math.PI * 18;
                  return (
                    <motion.div
                      key={mod.title}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="flex flex-col items-center"
                    >
                      <div className="relative w-12 h-12 mb-1">
                        <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
                          <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" opacity="0.3" />
                          <motion.circle
                            cx="22" cy="22" r="18" fill="none"
                            stroke={pct === 100 ? "hsl(var(--agni-green))" : "hsl(var(--agni-blue))"}
                            strokeWidth="3" strokeLinecap="round"
                            initial={{ strokeDasharray: `0 ${circ}` }}
                            animate={{ strokeDasharray: `${(pct / 100) * circ} ${circ}` }}
                            transition={{ duration: 0.8, delay: 0.45 + i * 0.1 }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-base">{mod.icon}</div>
                      </div>
                      <p className="text-[9px] font-extrabold text-foreground text-center">{mod.title}</p>
                      <p className="text-[8px] text-muted-foreground font-bold">{completed}/{mod.total}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Achievements */}
          <FadeIn delay={0.4}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/40 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-agni-gold flex items-center justify-center">
                  <Trophy size={14} className="text-white" />
                </div>
                <h4 className="text-xs font-extrabold text-foreground">Achievements</h4>
                <div className="ml-auto flex items-center gap-1 bg-agni-gold/15 rounded-full px-2 py-0.5">
                  <Award size={9} className="text-agni-gold" />
                  <span className="text-[9px] font-black text-agni-gold">{unlockedAchievements}/{achievements.length}</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-muted/30 rounded-full mb-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-agni-gold to-agni-orange rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedAchievements / achievements.length) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {achievements.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, scale: 0.7, rotateY: 90 }}
                    animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                    transition={{ delay: 0.5 + i * 0.04, type: "spring", stiffness: 200 }}
                    className={`relative rounded-xl p-2 text-center border transition-all ${
                      a.unlocked
                        ? `bg-gradient-to-b ${TIER_COLORS[a.tier]}/5 border-agni-gold/30`
                        : "bg-muted/20 border-border/30"
                    }`}
                  >
                    {!a.unlocked && (
                      <div className="absolute top-1 right-1">
                        <Lock size={7} className="text-muted-foreground/40" />
                      </div>
                    )}
                    <motion.span
                      className={`text-lg block ${!a.unlocked ? "grayscale opacity-40" : ""}`}
                      animate={a.unlocked ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, delay: 0.6 + i * 0.04 }}
                    >{a.emoji}</motion.span>
                    <p className={`text-[8px] font-extrabold mt-0.5 ${a.unlocked ? "text-foreground" : "text-muted-foreground"}`}>{a.title}</p>
                    <p className="text-[7px] text-muted-foreground leading-tight">{a.description}</p>
                    {a.unlocked && (
                      <div className={`mt-1 text-[6px] font-black uppercase bg-gradient-to-r ${TIER_COLORS[a.tier]} text-white px-1.5 py-0.5 rounded-full inline-block`}>
                        {a.tier}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Gems Store Preview */}
          <FadeIn delay={0.45}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/40 shadow-card mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-agni-gold flex items-center justify-center">
                  <Diamond size={14} className="text-white" />
                </div>
                <h4 className="text-xs font-extrabold text-foreground">Gem Store</h4>
                <span className="ml-auto text-[10px] font-black text-agni-gold">{stats.gems} 💎</span>
              </div>
              <div className="space-y-2">
                {[
                  { name: "Refill Hearts", emoji: "❤️", cost: 50, desc: "Restore all 5 hearts" },
                  { name: "Streak Freeze", emoji: "🛡️", cost: STREAK_FREEZE_COST, desc: "Protect your streak for 1 day" },
                  { name: "Double XP", emoji: "⚡", cost: 100, desc: "2x XP for next lesson (coming soon)" },
                ].map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.06 }}
                    className="flex items-center gap-2.5 p-2.5 bg-muted/20 rounded-xl border border-border/30"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="text-[10px] font-extrabold text-foreground">{item.name}</p>
                      <p className="text-[8px] text-muted-foreground font-semibold">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-0.5 bg-agni-gold/15 rounded-full px-2.5 py-1">
                      <Diamond size={10} className="text-agni-gold" />
                      <span className="text-[10px] font-black text-agni-gold">{item.cost}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default ProgressPage;

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import FloatingChatButton from "@/components/FloatingChatButton";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LogOut, Moon, Sun, ChevronRight, Shield, Bell, Loader2, LogIn, Brain, Key, Check, Eye, EyeOff, Zap, Diamond, Heart, Flame, Trash2, Sparkles, X, Plus, Search, TrendingUp, User, MapPin, Briefcase, GraduationCap, Target, Camera, Lightbulb } from "lucide-react";
import { InterestPill } from "@/components/InterestPill";
import { motion, AnimatePresence } from "framer-motion";
import { BUILT_IN_MODELS, BYOK_PROVIDERS, getAIConfig, saveAIConfig, type AIConfig } from "@/lib/aiConfig";
import { TEACHING_CATEGORIES, getTeachingSelection, setTeachingSelection, getAllOptions, saveCustomOption, getCustomOptions, IDENTITIES, MISSION_MODES, getAllExplainStyles, getActiveExplainStyleIds, setActiveExplainStyleIds, saveCustomExplainStyle, removeCustomExplainStyle, type ExplainStyle } from "@/lib/teachingConfig";
import CustomOptionInput from "@/components/CustomOptionInput";
import { getPersona, savePersona, SUGGESTION_CATEGORIES, getSubFilters, getSubFilterCount, POPULAR_PICKS, type NeuralOSPersona } from "@/lib/neuralOS";
import Agni from "@/components/Agni";
import StatsSection from "@/components/StatsSection";
import { useGamification } from "@/hooks/useGamification";
import { SFX } from "@/lib/sounds";
import { useUserContext } from "@/hooks/useUserContext";
import { AGE_RANGES, GENDERS, EDUCATION_LEVELS, EXPERIENCE_LEVELS, MISSION_FOLLOWUPS } from "@/lib/missionFollowups";
import { useAvatar } from "@/hooks/useAvatar";
import UserAvatar from "@/components/UserAvatar";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { stats, league } = useGamification();
  const { ctx, updateContext, loaded: ctxLoaded } = useUserContext();
  const { avatarUrl, uploading, generating, uploadAvatar, generateAIAvatar, removeAvatar } = useAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(localStorage.getItem("edu_user_name") || "");
  const [role, setRole] = useState(localStorage.getItem("edu_user_role") || "");
  const [saving, setSaving] = useState(false);
  const [lightMode, setLightMode] = useState(() => document.documentElement.classList.contains("light"));
  const [soundEnabled, setSoundEnabled] = useState(!SFX.isMuted());

  const [aiConfig, setAiConfig] = useState<AIConfig>(getAIConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);

  // Personal details state
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [identityExpanded, setIdentityExpanded] = useState(false);

  // Neural OS state
  const [persona, setPersonaState] = useState<NeuralOSPersona>(getPersona());
  const [neuralExpanded, setNeuralExpanded] = useState(false);
  const [activeCatId, setActiveCatId] = useState<string | null>(null);
  const [neuralSearch, setNeuralSearch] = useState("");
  const [neuralCustom, setNeuralCustom] = useState("");
  const [settingsSubFilter, setSettingsSubFilter] = useState<string | null>(null);

  // Explain Styles state
  const [explainExpanded, setExplainExpanded] = useState(false);
  const [activeExplainIds, setActiveExplainIds] = useState<string[]>(getActiveExplainStyleIds());
  const [customExplainLabel, setCustomExplainLabel] = useState("");
  const [customExplainPrompt, setCustomExplainPrompt] = useState("");
  const [showAddExplain, setShowAddExplain] = useState(false);
  // Re-sync persona when page gains focus (e.g. after editing in modal elsewhere)
  useEffect(() => {
    const sync = () => setPersonaState(getPersona());
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).single();
      if (data?.full_name) setFullName(data.full_name);
    };
    fetchProfile();
  }, [user]);

  const toggleTheme = () => {
    const next = !lightMode;
    setLightMode(next);
    document.documentElement.classList.toggle("light", next);
    localStorage.setItem("theme", next ? "light" : "dark");
  };

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem("edu_user_name", fullName);
    localStorage.setItem("edu_user_role", role);
    if (user) {
      await supabase.from("profiles").update({ full_name: fullName }).eq("user_id", user.id);
    }
    toast.success("Profile updated!");
    setSaving(false);
  };

  const handleLogout = async () => {
    if (user) await signOut();
    localStorage.removeItem("edu_onboarded");
    localStorage.removeItem("edu_user_name");
    localStorage.removeItem("edu_user_role");
    navigate("/welcome");
  };

  const handleResetProgress = () => {
    const keys = ["adojo_xp", "adojo_done", "adojo_bookmarks", "adojo_streak", "adojo_best_streak", "adojo_gems", "adojo_hearts", "adojo_daily_xp", "adojo_lessons_today", "adojo_total_quizzes", "adojo_total_perfect", "adojo_last_active", "adojo_streak_freezes", "adojo_heart_regen_at", "adojo_perfect_today", "adojo_quizzes_today"];
    keys.forEach(k => localStorage.removeItem(k));
    toast.success("Progress reset!");
    window.location.reload();
  };

  const updateAIConfig = (partial: Partial<AIConfig>) => {
    const updated = { ...aiConfig, ...partial };
    setAiConfig(updated);
    saveAIConfig(updated);
  };

  const selectedByokProvider = BYOK_PROVIDERS.find(p => p.id === aiConfig.byokProvider);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24">
        <div className="max-w-md mx-auto px-4 pt-5">

          {/* Top bar */}
          <FadeIn>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Agni expression="happy" size={50} animate={false} />
                <div>
                  <h2 className="text-sm font-black text-foreground">Settings</h2>
                  <p className="text-[10px] text-muted-foreground font-semibold">{league.emoji} {league.name} • Level {stats.level}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-agni-green/15 rounded-full px-2 py-0.5">
                  <Zap size={10} className="text-agni-green" />
                  <span className="text-[10px] font-black text-agni-green">{stats.xp}</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Profile Card */}
          <FadeIn delay={0.05}>
            <div className="bg-card rounded-2xl p-4 border border-border/40 mb-3 shadow-card">
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <UserAvatar avatarUrl={avatarUrl} name={fullName} size="lg" onClick={() => user && fileInputRef.current?.click()} />
                  {user && (
                    <button onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-agni-green flex items-center justify-center border-2 border-card">
                      {uploading ? <Loader2 size={10} className="animate-spin text-white" /> : <Camera size={10} className="text-white" />}
                    </button>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const url = await uploadAvatar(file);
                      if (url) toast.success("Profile photo updated!");
                      else toast.error("Upload failed");
                      e.target.value = "";
                    }}
                  />
                </div>
                <div className="flex-1">
                  <p className="font-black text-foreground text-sm">{fullName || "Your Name"}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">{role || "Learner"}</p>
                  {user && <p className="text-[10px] text-muted-foreground">{user.email}</p>}
                  {(() => {
                    try {
                      const ctx = JSON.parse(localStorage.getItem("user_context") || "{}");
                      const tags = [ctx.age_range, ctx.education, ctx.location, ctx.work_experience].filter(Boolean);
                      return tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tags.map((t: string, i: number) => (
                            <span key={i} className="text-[8px] font-bold bg-agni-purple/10 text-agni-purple px-1.5 py-0.5 rounded-full">{t}</span>
                          ))}
                        </div>
                      ) : null;
                    } catch { return null; }
                  })()}
                </div>
              </div>
              {user && (
                <div className="flex gap-1.5 mb-4">
                  <button 
                    onClick={async () => {
                      const url = await generateAIAvatar();
                      if (url) toast.success("AI avatar generated! 🎨");
                      else toast.error("Generation failed, try again");
                    }}
                    disabled={generating}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-agni-purple/20 to-agni-pink/20 border border-agni-purple/30 text-[9px] font-bold text-agni-purple hover:from-agni-purple/30 hover:to-agni-pink/30 transition-all disabled:opacity-50"
                  >
                    {generating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                    {generating ? "Creating..." : "AI Avatar"}
                  </button>
                  {avatarUrl && (
                    <button 
                      onClick={async () => { await removeAvatar(); toast.success("Avatar removed"); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-destructive/10 border border-destructive/20 text-[9px] font-bold text-destructive hover:bg-destructive/20 transition-all"
                    >
                      <Trash2 size={9} /> Remove
                    </button>
                  )}
                </div>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {[
                  { icon: Zap, value: stats.xp, label: "XP", color: "text-agni-green" },
                  { icon: Flame, value: stats.streak, label: "Streak", color: "text-agni-orange" },
                  { icon: Diamond, value: stats.gems, label: "Gems", color: "text-agni-gold" },
                  { icon: Heart, value: stats.hearts, label: "Hearts", color: "text-agni-pink" },
                ].map((s, i) => (
                  <div key={i} className="text-center bg-muted/20 rounded-xl py-2">
                    <s.icon size={14} className={`${s.color} mx-auto mb-0.5`} />
                    <p className="text-xs font-black text-foreground">{s.value}</p>
                    <p className="text-[7px] text-muted-foreground font-bold">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="text-micro text-muted-foreground">NAME</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your name"
                    className="h-10 rounded-xl bg-muted/50 border-border/40 text-foreground text-sm mt-1" />
                </div>
                <div>
                  <label className="text-micro text-muted-foreground">ROLE</label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Developer, Student"
                    className="h-10 rounded-xl bg-muted/50 border-border/40 text-foreground text-sm mt-1" />
                </div>
                <motion.div whileTap={{ scale: 0.97, y: 2 }}>
                  <Button onClick={handleSave} disabled={saving}
                    className="w-full h-10 rounded-xl bg-agni-green text-white font-black text-xs shadow-btn-3d active:shadow-btn-3d-pressed">
                    {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </FadeIn>

          {/* Identity Card */}
          <FadeIn delay={0.07}>
            <div className="bg-card rounded-2xl border border-border/40 mb-3 shadow-card overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => setIdentityExpanded(!identityExpanded)}
                className="flex items-center justify-between w-full p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-agni-purple flex items-center justify-center shadow-md">
                    <Target size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-foreground text-xs">Identity</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {ctx.teaching_identity ? (IDENTITIES.find(i => i.id === ctx.teaching_identity)?.emoji || "🧑") + " " + (IDENTITIES.find(i => i.id === ctx.teaching_identity)?.label || ctx.teaching_identity) : "Not set"}
                    </p>
                  </div>
                </div>
                <motion.div animate={{ rotate: identityExpanded ? 90 : 0 }}>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {identityExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-3.5 pb-3.5">
                      <p className="text-micro text-muted-foreground mb-2">WHO ARE YOU? — Drives metaphors & examples</p>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto scrollbar-none">
                        {IDENTITIES.map(id => (
                          <button key={id.id} onClick={() => {
                            updateContext({ teaching_identity: id.id });
                            setTeachingSelection("identity", id.id);
                            localStorage.setItem("edu_user_role", id.label);
                            setRole(id.label);
                          }}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all ${
                              ctx.teaching_identity === id.id
                                ? "bg-agni-purple/10 border-agni-purple/30 text-agni-purple"
                                : "bg-muted/30 border-border/40 text-muted-foreground"
                            }`}
                          >
                            {id.emoji} {id.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* Personal Details Card */}
          <FadeIn delay={0.09}>
            <div className="bg-card rounded-2xl border border-border/40 mb-3 shadow-card overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => setDetailsExpanded(!detailsExpanded)}
                className="flex items-center justify-between w-full p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                    style={{ background: "linear-gradient(135deg, #1CB0F6, #58CC02)" }}>
                    <User size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-foreground text-xs">Personal Details</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {[ctx.age_range, ctx.education, ctx.location].filter(Boolean).join(" • ") || "Not set yet"}
                    </p>
                  </div>
                </div>
                <motion.div animate={{ rotate: detailsExpanded ? 90 : 0 }}>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {detailsExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-3.5 pb-3.5 space-y-3">
                      {/* Age Range */}
                      <div>
                        <p className="text-micro text-muted-foreground mb-1.5">AGE RANGE</p>
                        <div className="flex flex-wrap gap-1.5">
                          {AGE_RANGES.map(a => (
                            <button key={a} onClick={() => updateContext({ age_range: a })}
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all ${
                                ctx.age_range === a ? "bg-agni-blue/10 border-agni-blue/30 text-agni-blue" : "bg-muted/30 border-border/40 text-muted-foreground"
                              }`}>{a}</button>
                          ))}
                        </div>
                      </div>

                      {/* Gender */}
                      <div>
                        <p className="text-micro text-muted-foreground mb-1.5">GENDER</p>
                        <div className="flex flex-wrap gap-1.5">
                          {GENDERS.map(g => (
                            <button key={g} onClick={() => updateContext({ gender: g })}
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all ${
                                ctx.gender === g ? "bg-agni-pink/10 border-agni-pink/30 text-agni-pink" : "bg-muted/30 border-border/40 text-muted-foreground"
                              }`}>{g}</button>
                          ))}
                        </div>
                      </div>

                      {/* Education */}
                      <div>
                        <p className="text-micro text-muted-foreground mb-1.5">EDUCATION</p>
                        <div className="flex flex-wrap gap-1.5">
                          {EDUCATION_LEVELS.map(e => (
                            <button key={e} onClick={() => updateContext({ education: e })}
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all ${
                                ctx.education === e ? "bg-agni-green/10 border-agni-green/30 text-agni-green" : "bg-muted/30 border-border/40 text-muted-foreground"
                              }`}>{e}</button>
                          ))}
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <p className="text-micro text-muted-foreground mb-1.5 flex items-center gap-1"><MapPin size={9} /> LOCATION</p>
                        <Input value={ctx.location} onChange={e => updateContext({ location: e.target.value })}
                          placeholder="e.g. Bangalore, India"
                          className="h-9 rounded-xl bg-muted/50 border-border/40 text-foreground text-[11px]" />
                      </div>

                      {/* Work Experience */}
                      <div>
                        <p className="text-micro text-muted-foreground mb-1.5 flex items-center gap-1"><Briefcase size={9} /> WORK EXPERIENCE</p>
                        <div className="flex flex-wrap gap-1.5">
                          {EXPERIENCE_LEVELS.map(e => (
                            <button key={e} onClick={() => updateContext({ work_experience: e })}
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all ${
                                ctx.work_experience === e ? "bg-agni-orange/10 border-agni-orange/30 text-agni-orange" : "bg-muted/30 border-border/40 text-muted-foreground"
                              }`}>{e}</button>
                          ))}
                        </div>
                      </div>

                      {/* Job Title */}
                      <div>
                        <p className="text-micro text-muted-foreground mb-1.5">JOB TITLE</p>
                        <Input value={ctx.job_title} onChange={e => updateContext({ job_title: e.target.value })}
                          placeholder="e.g. Software Engineer, Student"
                          className="h-9 rounded-xl bg-muted/50 border-border/40 text-foreground text-[11px]" />
                      </div>

                      {/* Mission Follow-up (dynamic based on selected mission) */}
                      {ctx.teaching_mission && MISSION_FOLLOWUPS[ctx.teaching_mission] && (
                        <div>
                          <p className="text-micro text-muted-foreground mb-1.5">📋 MISSION DETAILS ({(MISSION_MODES.find(m => m.id === ctx.teaching_mission)?.label || ctx.teaching_mission).toUpperCase()})</p>
                          <div className="space-y-2">
                            {MISSION_FOLLOWUPS[ctx.teaching_mission].map(q => (
                              <div key={q.id}>
                                <p className="text-[10px] font-bold text-foreground/80 mb-1">{q.label}</p>
                                {q.type === "select" && q.options ? (
                                  <div className="flex flex-wrap gap-1.5">
                                    {q.options.map(opt => (
                                      <button key={opt} onClick={() => updateContext({ mission_followup: { ...ctx.mission_followup, [q.id]: opt } })}
                                        className={`px-2 py-1 rounded-lg text-[9px] font-extrabold border transition-all ${
                                          ctx.mission_followup[q.id] === opt ? "bg-agni-gold/10 border-agni-gold/30 text-agni-gold" : "bg-muted/30 border-border/40 text-muted-foreground"
                                        }`}>{opt}</button>
                                    ))}
                                  </div>
                                ) : (
                                  <Input value={ctx.mission_followup[q.id] || ""} onChange={e => updateContext({ mission_followup: { ...ctx.mission_followup, [q.id]: e.target.value } })}
                                    placeholder={q.placeholder}
                                    className="h-8 rounded-lg bg-muted/50 border-border/40 text-foreground text-[10px]" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>

          {!user && (
            <FadeIn delay={0.1}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/auth")}
                className="w-full bg-card border-2 border-dashed border-agni-green/30 text-foreground font-extrabold rounded-2xl p-3 flex items-center justify-center gap-2 mb-3 shadow-card text-xs"
              >
                <LogIn size={14} className="text-agni-green" /> Sign in to sync progress
              </motion.button>
            </FadeIn>
          )}

          {/* AI Model Settings */}
          <FadeIn delay={0.15}>
            <div className="bg-card rounded-2xl border border-border/40 mb-3 shadow-card overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => setAiExpanded(!aiExpanded)}
                className="flex items-center justify-between w-full p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-agni-purple flex items-center justify-center shadow-md">
                    <Brain size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-foreground text-xs">AI Model</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {aiConfig.mode === "builtin"
                        ? BUILT_IN_MODELS.find(m => m.id === aiConfig.builtinModel)?.label || "Gemini Flash"
                        : `${selectedByokProvider?.label || "Custom"}: ${aiConfig.byokModel || "—"}`}
                    </p>
                  </div>
                </div>
                <motion.div animate={{ rotate: aiExpanded ? 90 : 0 }}>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {aiExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-3.5 space-y-3">
                      <div className="flex gap-1.5">
                        {(["builtin", "byok"] as const).map(mode => (
                          <button
                            key={mode}
                            onClick={() => updateAIConfig({ mode })}
                            className={`flex-1 px-3 py-2 rounded-xl text-[10px] font-extrabold border transition-all ${
                              aiConfig.mode === mode
                                ? "bg-agni-green/10 border-agni-green/30 text-agni-green"
                                : "bg-muted/30 border-border/40 text-muted-foreground"
                            }`}
                          >
                            {mode === "builtin" ? "⚡ Built-in" : "🔑 Your Key"}
                          </button>
                        ))}
                      </div>

                      {aiConfig.mode === "builtin" ? (
                        <div className="space-y-1.5">
                          <p className="text-micro text-muted-foreground">SELECT MODEL</p>
                          {BUILT_IN_MODELS.map(model => (
                            <motion.button
                              key={model.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateAIConfig({ builtinModel: model.id })}
                              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all ${
                                aiConfig.builtinModel === model.id
                                  ? "bg-agni-green/5 border-agni-green/25"
                                  : "border-border/30 hover:border-border/60"
                              }`}
                            >
                              <span className="text-base">{model.emoji}</span>
                              <div className="flex-1 text-left">
                                <p className="text-[11px] font-extrabold text-foreground">{model.label}</p>
                                <p className="text-[9px] text-muted-foreground font-semibold">{model.desc}</p>
                              </div>
                              {aiConfig.builtinModel === model.id && <Check size={12} className="text-agni-green" />}
                            </motion.button>
                          ))}
                          <p className="text-[8px] text-muted-foreground text-center pt-1 font-semibold">No API key needed — powered by Lovable AI</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div>
                            <p className="text-micro text-muted-foreground mb-1.5">PROVIDER</p>
                            <div className="flex gap-1.5">
                              {BYOK_PROVIDERS.map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => updateAIConfig({ byokProvider: p.id, byokModel: p.models[0] })}
                                  className={`flex-1 px-2 py-2 rounded-xl text-[10px] font-extrabold border transition-all text-center ${
                                    aiConfig.byokProvider === p.id
                                      ? "bg-agni-green/10 border-agni-green/30 text-agni-green"
                                      : "bg-muted/30 border-border/40 text-muted-foreground"
                                  }`}
                                >
                                  {p.emoji} {p.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {selectedByokProvider && (
                            <div>
                              <p className="text-micro text-muted-foreground mb-1.5">MODEL</p>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedByokProvider.models.map(m => (
                                  <button
                                    key={m}
                                    onClick={() => updateAIConfig({ byokModel: m })}
                                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                                      aiConfig.byokModel === m
                                        ? "bg-agni-green/10 border-agni-green/30 text-agni-green"
                                        : "bg-muted/30 border-border/40 text-muted-foreground"
                                    }`}
                                  >
                                    {m}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-micro text-muted-foreground mb-1.5 flex items-center gap-1">
                              <Key size={9} /> API KEY
                            </p>
                            <div className="relative">
                              <Input
                                type={showApiKey ? "text" : "password"}
                                value={aiConfig.byokApiKey}
                                onChange={(e) => updateAIConfig({ byokApiKey: e.target.value })}
                                placeholder="sk-... or AIza..."
                                className="h-9 rounded-xl bg-muted/50 border-border/40 text-foreground text-[11px] pr-9"
                              />
                              <button onClick={() => setShowApiKey(!showApiKey)} className="absolute right-2 top-1/2 -translate-y-1/2">
                                {showApiKey ? <EyeOff size={12} className="text-muted-foreground" /> : <Eye size={12} className="text-muted-foreground" />}
                              </button>
                            </div>
                            <p className="text-[8px] text-muted-foreground mt-1 font-semibold">🔒 Stored locally. Never sent to our servers.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* Neural OS Personality */}
          <FadeIn delay={0.18}>
            <div className="bg-card rounded-2xl border border-border/40 mb-3 shadow-card overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => setNeuralExpanded(!neuralExpanded)}
                className="flex items-center justify-between w-full p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                    style={{ background: "linear-gradient(135deg, #FF9600, #FF4B91)" }}
                  >
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-foreground text-xs">Neural OS Personality</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">
                      {persona.vibe ? `Vibe: ${persona.vibe}` : "Not configured"} • {(() => {
                        let total = 0;
                        SUGGESTION_CATEGORIES.forEach(cat => { total += ((persona[cat.field] as string[]) || []).length; });
                        return total;
                      })()} interests
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {(() => {
                    let total = 0;
                    SUGGESTION_CATEGORIES.forEach(cat => { total += ((persona[cat.field] as string[]) || []).length; });
                    return total > 0 ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-[9px] font-black text-white bg-agni-purple rounded-full w-5 h-5 flex items-center justify-center shadow-md"
                      >
                        {total}
                      </motion.span>
                    ) : null;
                  })()}
                  <motion.div animate={{ rotate: neuralExpanded ? 90 : 0 }}>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </motion.div>
                </div>
              </motion.button>

              <AnimatePresence>
                {neuralExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3.5 pb-3.5 space-y-3">
                      {/* 3-Category Teaching Config */}
                      {TEACHING_CATEGORIES.map((cat) => {
                        const currentVal = getTeachingSelection(cat.id);
                        const catColors: Record<string, { active: string; border: string }> = {
                          mission: { active: "bg-agni-orange/10 border-agni-orange/30 text-agni-orange", border: "border-agni-orange/25" },
                          vibe: { active: "bg-agni-blue/10 border-agni-blue/30 text-agni-blue", border: "border-agni-blue/25" },
                          brain: { active: "bg-agni-purple/10 border-agni-purple/30 text-agni-purple", border: "border-agni-purple/25" },
                        };
                        const colors = catColors[cat.id] || catColors.vibe;
                        return (
                          <div key={cat.id}>
                            <p className="text-micro text-muted-foreground mb-1.5">{cat.label.toUpperCase()}</p>
                            <p className="text-[8px] text-muted-foreground/50 mb-1">{cat.desc}</p>
                            <div className="flex gap-1.5 flex-wrap">
                              {getAllOptions(cat.id).map((opt: any) => (
                                <button key={opt.id} onClick={() => {
                                  setTeachingSelection(cat.id, opt.id);
                                  if (cat.id === "vibe") {
                                    const updated = savePersona({ vibe: opt.id });
                                    setPersonaState(updated);
                                  }
                                  if (cat.id === "brain") {
                                    const depthMap: Record<string, string> = { chill: "basic", explorer: "normal", pro: "deep", hacker: "deep", scientist: "deep", professor: "deep" };
                                    const updated = savePersona({ preferredDepth: (depthMap[opt.id] || "normal") as any });
                                    setPersonaState(updated);
                                  }
                                }}
                                  className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all ${
                                    currentVal === opt.id ? colors.active : "bg-muted/30 border-border/40 text-muted-foreground"
                                  }`}
                                >
                                  {opt.emoji} {opt.label}
                                </button>
                              ))}
                              {/* Compact custom input for all categories */}
                              <CustomOptionInput
                                categoryId={cat.id}
                                categoryLabel={cat.funName}
                                compact
                                onSave={(opt) => {
                                  const saved = saveCustomOption(cat.id, opt);
                                  setTeachingSelection(cat.id, saved.id);
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* Interest categories */}
                      <div>
                        <p className="text-micro text-muted-foreground mb-1.5">YOUR INTERESTS</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {SUGGESTION_CATEGORIES.map(cat => {
                            const items = (persona[cat.field] as string[]) || [];
                            return (
                              <button key={cat.id} onClick={() => { setActiveCatId(activeCatId === cat.id ? null : cat.id); setSettingsSubFilter(null); }}
                                className={`px-2 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all ${
                                  activeCatId === cat.id
                                    ? "bg-agni-green/10 border-agni-green/30 text-agni-green"
                                    : "bg-muted/30 border-border/40 text-muted-foreground"
                                }`}
                              >
                                {cat.emoji} {cat.label} {items.length > 0 && <span className="text-[8px] ml-0.5 opacity-70">({items.length})</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active category detail */}
                      <AnimatePresence mode="wait">
                        {activeCatId && (() => {
                          const cat = SUGGESTION_CATEGORIES.find(c => c.id === activeCatId);
                          if (!cat) return null;
                          const field = cat.field as keyof NeuralOSPersona;
                          const selected = (persona[field] as string[]) || [];
                          const subFilters = getSubFilters(cat);
                          const filtered = neuralSearch
                            ? cat.suggestions.filter(s => s.name.toLowerCase().includes(neuralSearch.toLowerCase()) || (s.tag && s.tag.toLowerCase().includes(neuralSearch.toLowerCase())))
                            : settingsSubFilter
                              ? cat.suggestions.filter(s => s.tag && s.tag.toLowerCase().startsWith(settingsSubFilter.toLowerCase()))
                              : cat.suggestions;

                          const toggleItem = (name: string) => {
                            const updated = selected.includes(name) ? selected.filter(x => x !== name) : [...selected, name];
                            const newPersona = savePersona({ [field]: updated });
                            setPersonaState(newPersona);
                          };

                          const addCustomItem = () => {
                            if (!neuralCustom.trim() || selected.includes(neuralCustom.trim())) return;
                            const updated = [...selected, neuralCustom.trim()];
                            const newPersona = savePersona({ [field]: updated });
                            setPersonaState(newPersona);
                            setNeuralCustom("");
                          };

                          return (
                            <motion.div key={activeCatId}
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                              className="bg-muted/20 rounded-xl p-3 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black text-foreground">{cat.emoji} {cat.label}</p>
                                <button onClick={() => { setActiveCatId(null); setSettingsSubFilter(null); }}>
                                  <X size={12} className="text-muted-foreground" />
                                </button>
                              </div>

                              {/* Search — also adds custom on Enter */}
                              <div className="relative">
                                <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input value={neuralSearch} onChange={e => setNeuralSearch(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === "Enter" && neuralSearch.trim() && !selected.includes(neuralSearch.trim())) {
                                      const updated = [...selected, neuralSearch.trim()];
                                      const newPersona = savePersona({ [field]: updated });
                                      setPersonaState(newPersona);
                                      setNeuralSearch("");
                                    }
                                  }}
                                  placeholder={`Search or add custom ${cat.label.toLowerCase()}...`}
                                  className="w-full h-7 pl-6 pr-2 bg-card border border-border/30 rounded-lg text-[10px] text-foreground placeholder:text-muted-foreground focus:outline-none"
                                />
                              </div>

                              {/* Sub-filter chips with count badges */}
                              {subFilters.length > 0 && !neuralSearch && (
                                <div>
                                  <div className="flex gap-1 overflow-x-auto scrollbar-none mb-1">
                                    <button
                                      onClick={() => setSettingsSubFilter(null)}
                                      className={`shrink-0 text-[8px] font-extrabold px-2 py-1 rounded-full transition-all flex items-center gap-0.5 ${
                                        !settingsSubFilter
                                          ? "bg-agni-green text-white"
                                          : "bg-card border border-border/30 text-muted-foreground"
                                      }`}
                                    >
                                      All
                                      <span className={`text-[7px] font-black rounded-full px-1 min-w-[14px] text-center ${
                                        !settingsSubFilter ? "bg-white/25 text-white" : "bg-muted/50"
                                      }`}>{cat.suggestions.length}</span>
                                    </button>
                                    {subFilters.map(tag => {
                                      const count = getSubFilterCount(cat, tag);
                                      return (
                                        <button
                                          key={tag}
                                          onClick={() => setSettingsSubFilter(settingsSubFilter === tag ? null : tag)}
                                          className={`shrink-0 text-[8px] font-extrabold px-2 py-1 rounded-full transition-all flex items-center gap-0.5 ${
                                            settingsSubFilter === tag
                                              ? "bg-agni-blue text-white"
                                              : "bg-card border border-border/30 text-muted-foreground"
                                          }`}
                                        >
                                          {tag}
                                          <span className={`text-[7px] font-black rounded-full px-1 min-w-[14px] text-center ${
                                            settingsSubFilter === tag ? "bg-white/25 text-white" : "bg-muted/50"
                                          }`}>{count}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {/* Select All for active sub-filter */}
                                  {settingsSubFilter && (
                                    <button
                                      onClick={() => {
                                        const subItems = cat.suggestions
                                          .filter(s => s.tag && s.tag.toLowerCase().startsWith(settingsSubFilter.toLowerCase()))
                                          .map(s => s.name);
                                        const allSelected = subItems.every(item => selected.includes(item));
                                        const updated = allSelected
                                          ? selected.filter(x => !subItems.includes(x))
                                          : [...new Set([...selected, ...subItems])];
                                        const newPersona = savePersona({ [field]: updated });
                                        setPersonaState(newPersona);
                                      }}
                                      className="text-[8px] font-extrabold text-agni-blue flex items-center gap-0.5"
                                    >
                                      {(() => {
                                        const subItems = cat.suggestions
                                          .filter(s => s.tag && s.tag.toLowerCase().startsWith(settingsSubFilter.toLowerCase()))
                                          .map(s => s.name);
                                        const allSelected = subItems.every(item => selected.includes(item));
                                        return allSelected ? (
                                          <><X size={8} /> Deselect all {settingsSubFilter}</>
                                        ) : (
                                          <><Check size={8} /> Select all {settingsSubFilter}</>
                                        );
                                      })()}
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Selected chips */}
                              {selected.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {selected.map((s, idx) => (
                                    <InterestPill
                                      key={s}
                                      name={s}
                                      categoryId={cat.id}
                                      index={idx}
                                      compact
                                      removable
                                      onClick={() => toggleItem(s)}
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Show "add as custom" hint */}
                              {neuralSearch.trim().length > 1 && !cat.suggestions.some(s => s.name.toLowerCase() === neuralSearch.toLowerCase().trim()) && (
                                <button onClick={() => {
                                  if (!selected.includes(neuralSearch.trim())) {
                                    const updated = [...selected, neuralSearch.trim()];
                                    const newPersona = savePersona({ [field]: updated });
                                    setPersonaState(newPersona);
                                  }
                                  setNeuralSearch("");
                                }}
                                  className="text-[9px] font-bold text-agni-gold bg-agni-gold/10 border border-agni-gold/20 rounded-lg px-2 py-1 w-full text-left"
                                >
                                  ✨ Add "{neuralSearch.trim()}" — press Enter
                                </button>
                              )}


                              {/* Suggestions — colorful pills */}
                              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto scrollbar-none">
                                {filtered.map((s, idx) => (
                                  <InterestPill
                                    key={s.name}
                                    name={s.name}
                                    emoji={s.emoji}
                                    categoryId={cat.id}
                                    index={idx}
                                    selected={selected.includes(s.name)}
                                    onClick={() => toggleItem(s.name)}
                                  />
                                ))}
                              </div>
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>

                      {/* Re-do onboarding button */}
                      <button onClick={() => {
                        localStorage.removeItem("edu_onboarded");
                        navigate("/welcome");
                      }}
                        className="w-full text-[10px] font-bold text-agni-blue flex items-center justify-center gap-1 py-1.5"
                      >
                        🔄 Re-do full onboarding
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>

          {/* Explain Styles Card */}
          <FadeIn delay={0.19}>
            <div className="bg-card rounded-2xl border border-border/40 mb-3 shadow-card overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => setExplainExpanded(!explainExpanded)}
                className="flex items-center justify-between w-full p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-agni-blue flex items-center justify-center shadow-md">
                    <Lightbulb size={16} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-foreground text-xs">Explain Styles</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">{activeExplainIds.length} active styles in chat</p>
                  </div>
                </div>
                <motion.div animate={{ rotate: explainExpanded ? 90 : 0 }}>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </motion.div>
              </motion.button>
              <AnimatePresence>
                {explainExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-3.5 pb-3.5 space-y-3">
                      <p className="text-[9px] text-muted-foreground/60">Tap to toggle — active styles show as quick actions in the chat input bar.</p>
                      <div className="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto scrollbar-none">
                        {getAllExplainStyles().map(style => {
                          const isActive = activeExplainIds.includes(style.id);
                          return (
                            <button key={style.id} onClick={() => {
                              const updated = isActive
                                ? activeExplainIds.filter(id => id !== style.id)
                                : [...activeExplainIds, style.id];
                              setActiveExplainIds(updated);
                              setActiveExplainStyleIds(updated);
                              SFX.select();
                            }}
                              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold border transition-all flex items-center gap-1 ${
                                isActive
                                  ? "bg-agni-blue/10 border-agni-blue/30 text-agni-blue"
                                  : "bg-muted/30 border-border/40 text-muted-foreground"
                              }`}
                            >
                              {isActive && <Check size={8} />}
                              {style.emoji} {style.label}
                              {style.isCustom && (
                                <span onClick={(e) => {
                                  e.stopPropagation();
                                  removeCustomExplainStyle(style.id);
                                  setActiveExplainIds(prev => prev.filter(id => id !== style.id));
                                  setActiveExplainStyleIds(activeExplainIds.filter(id => id !== style.id));
                                }} className="ml-0.5 opacity-50 hover:opacity-100">
                                  <X size={8} />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Add custom */}
                      {!showAddExplain ? (
                        <button onClick={() => setShowAddExplain(true)}
                          className="w-full text-[10px] font-bold text-agni-green flex items-center justify-center gap-1 py-1.5 border border-dashed border-agni-green/30 rounded-xl"
                        >
                          <Plus size={10} /> Add Custom Explain Style
                        </button>
                      ) : (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-muted/20 rounded-xl p-2.5 space-y-2">
                          <Input value={customExplainLabel} onChange={e => setCustomExplainLabel(e.target.value)}
                            placeholder="Style name (e.g. Bollywood Style)"
                            className="h-8 rounded-lg bg-card border-border/30 text-[10px]" />
                          <Input value={customExplainPrompt} onChange={e => setCustomExplainPrompt(e.target.value)}
                            placeholder="Prompt (e.g. Explain using Bollywood movie scenes...)"
                            className="h-8 rounded-lg bg-card border-border/30 text-[10px]" />
                          <div className="flex gap-1.5">
                            <Button size="sm" onClick={() => {
                              if (!customExplainLabel.trim() || !customExplainPrompt.trim()) return;
                              const saved = saveCustomExplainStyle({
                                label: customExplainLabel.trim(),
                                desc: customExplainPrompt.trim().slice(0, 40) + "...",
                                prompt: customExplainPrompt.trim(),
                              });
                              setActiveExplainIds(prev => { const n = [...prev, saved.id]; setActiveExplainStyleIds(n); return n; });
                              setCustomExplainLabel(""); setCustomExplainPrompt(""); setShowAddExplain(false);
                              toast.success("Custom explain style added!");
                            }}
                              className="h-7 text-[10px] font-black bg-agni-green text-white rounded-lg flex-1"
                            >
                              <Check size={10} className="mr-1" /> Save
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => { setShowAddExplain(false); setCustomExplainLabel(""); setCustomExplainPrompt(""); }}
                              className="h-7 text-[10px] rounded-lg"
                            >
                              Cancel
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="bg-card rounded-2xl border border-border/40 overflow-hidden mb-3 shadow-card">
              <div className="flex items-center justify-between p-3.5 border-b border-border/30">
                <div className="flex items-center gap-2.5">
                  {lightMode ? <Sun size={15} className="text-agni-gold" /> : <Moon size={15} className="text-agni-purple" />}
                  <div>
                    <p className="font-extrabold text-foreground text-xs">{lightMode ? "Light Mode" : "Dark Mode"}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">Switch appearance</p>
                  </div>
                </div>
                <Switch checked={lightMode} onCheckedChange={toggleTheme} />
              </div>
              <div className="flex items-center justify-between p-3.5 border-b border-border/30">
                <div className="flex items-center gap-2.5">
                  <Bell size={15} className={soundEnabled ? "text-agni-green" : "text-muted-foreground"} />
                  <div>
                    <p className="font-extrabold text-foreground text-xs">Sound Effects</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">Taps, chimes & celebrations</p>
                  </div>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={(v) => { setSoundEnabled(v); if (v) SFX.unmute(); else SFX.mute(); }} />
              </div>
              <button className="flex items-center justify-between w-full p-3.5 border-b border-border/30 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Bell size={15} className="text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-extrabold text-foreground text-xs">Notifications</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">Manage alerts</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between w-full p-3.5 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Shield size={15} className="text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-extrabold text-foreground text-xs">Privacy</p>
                    <p className="text-[10px] text-muted-foreground font-semibold">Data & security</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
            </div>
          </FadeIn>

          {/* Stats & Progress */}
          <FadeIn delay={0.25}>
            <div className="mb-4">
              <h3 className="text-xs font-black text-foreground mb-3 flex items-center gap-2">📊 Your Stats & Progress</h3>
              <StatsSection />
            </div>
          </FadeIn>

          {/* Danger Zone */}
          <FadeIn delay={0.3}>
            <div className="space-y-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleResetProgress}
                className="w-full bg-agni-orange/10 text-agni-orange font-extrabold rounded-2xl p-3 flex items-center justify-center gap-2 text-xs border border-agni-orange/20"
              >
                <Trash2 size={14} /> Reset All Progress
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full bg-agni-red/10 text-agni-red font-extrabold rounded-2xl p-3 flex items-center justify-center gap-2 text-xs border border-agni-red/20"
              >
                <LogOut size={14} /> {user ? "Log Out" : "Reset & Start Over"}
              </motion.button>
            </div>
          </FadeIn>

          <div className="text-center mt-6 mb-2 space-y-0.5">
            <p className="text-[11px] font-black text-foreground/60 tracking-widest uppercase">Neural-OS</p>
            <p className="text-[10px] font-bold text-muted-foreground">Version 01</p>
            <p className="text-[10px] font-semibold text-muted-foreground/70 italic">The Genesis</p>
            <p className="text-[10px] text-muted-foreground mt-1">Made in Jeypore ❤️</p>
          </div>
        </div>
        <FloatingChatButton tab="general" />
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default SettingsPage;

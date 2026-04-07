import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LogOut, Moon, Sun, ChevronRight, Shield, Bell, Loader2, LogIn, Brain, Key, Check, Eye, EyeOff, Zap, Diamond, Heart, Flame, Trash2, Sparkles, X, Plus, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BUILT_IN_MODELS, BYOK_PROVIDERS, getAIConfig, saveAIConfig, type AIConfig } from "@/lib/aiConfig";
import { getPersona, savePersona, SUGGESTION_CATEGORIES, type NeuralOSPersona } from "@/lib/neuralOS";
import Agni from "@/components/Agni";
import { useGamification } from "@/hooks/useGamification";
import { SFX } from "@/lib/sounds";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { stats, league } = useGamification();
  const [fullName, setFullName] = useState(localStorage.getItem("edu_user_name") || "");
  const [role, setRole] = useState(localStorage.getItem("edu_user_role") || "");
  const [saving, setSaving] = useState(false);
  const [lightMode, setLightMode] = useState(() => document.documentElement.classList.contains("light"));
  const [soundEnabled, setSoundEnabled] = useState(!SFX.isMuted());

  const [aiConfig, setAiConfig] = useState<AIConfig>(getAIConfig());
  const [showApiKey, setShowApiKey] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);

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
              <div className="flex items-center gap-3 mb-4">
                <motion.div whileHover={{ scale: 1.05 }} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-agni-green/30 to-agni-purple/30 flex items-center justify-center text-2xl">
                  🧑‍💻
                </motion.div>
                <div className="flex-1">
                  <p className="font-black text-foreground text-sm">{fullName || "Your Name"}</p>
                  <p className="text-[10px] text-muted-foreground font-semibold">{role || "Learner"}</p>
                  {user && <p className="text-[10px] text-muted-foreground">{user.email}</p>}
                </div>
              </div>

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

          {/* Preferences */}
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

          {/* Danger Zone */}
          <FadeIn delay={0.25}>
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

          <p className="text-center text-[10px] text-muted-foreground mt-4 font-semibold">AgentDojo v2.0 • Made with ❤️ by AGNI</p>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default SettingsPage;

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
import { LogOut, Moon, Sun, ChevronRight, Shield, Bell, Loader2, LogIn, Brain, Key, Check, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BUILT_IN_MODELS, BYOK_PROVIDERS, getAIConfig, saveAIConfig, type AIConfig } from "@/lib/aiConfig";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(localStorage.getItem("edu_user_name") || "");
  const [role, setRole] = useState(localStorage.getItem("edu_user_role") || "");
  const [saving, setSaving] = useState(false);
  const [lightMode, setLightMode] = useState(() =>
    document.documentElement.classList.contains("light")
  );

  // AI Config state
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
          <FadeIn>
            <h2 className="text-base font-display font-bold text-foreground mb-4">Settings</h2>
          </FadeIn>

          {/* Profile */}
          <FadeIn delay={0.1}>
            <div className="bg-card rounded-2xl p-3.5 border border-border/50 mb-3 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <motion.div whileHover={{ scale: 1.05 }} className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xl">
                  🧑‍💻
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{fullName || "Your Name"}</p>
                  <p className="text-[11px] text-muted-foreground">{role || "Learner"}</p>
                  {user && <p className="text-[10px] text-muted-foreground">{user.email}</p>}
                </div>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Name</label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your name"
                    className="h-10 rounded-xl bg-muted/50 border-border/50 text-foreground text-sm mt-1" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Role</label>
                  <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Developer, Student"
                    className="h-10 rounded-xl bg-muted/50 border-border/50 text-foreground text-sm mt-1" />
                </div>
                <Button onClick={handleSave} disabled={saving}
                  className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xs">
                  {saving ? <Loader2 size={14} className="animate-spin mr-1.5" /> : null}
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </div>
          </FadeIn>

          {!user && (
            <FadeIn delay={0.15}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/auth")}
                className="w-full bg-card border border-secondary/20 text-foreground font-semibold rounded-xl p-3 flex items-center justify-center gap-2 hover:border-secondary/40 transition-colors mb-3 shadow-card text-xs"
              >
                <LogIn size={14} /> Sign in to sync progress
              </motion.button>
            </FadeIn>
          )}

          {/* AI Model Settings */}
          <FadeIn delay={0.18}>
            <div className="bg-card rounded-2xl border border-border/50 mb-3 shadow-card overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => setAiExpanded(!aiExpanded)}
                className="flex items-center justify-between w-full p-3.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                    <Brain size={15} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-xs">AI Model</p>
                    <p className="text-[10px] text-muted-foreground">
                      {aiConfig.mode === "builtin"
                        ? BUILT_IN_MODELS.find(m => m.id === aiConfig.builtinModel)?.label || "Gemini Flash"
                        : `${selectedByokProvider?.label || "Custom"}: ${aiConfig.byokModel || "—"}`
                      }
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
                      {/* Mode Toggle */}
                      <div className="flex gap-1.5">
                        {(["builtin", "byok"] as const).map(mode => (
                          <button
                            key={mode}
                            onClick={() => updateAIConfig({ mode })}
                            className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${
                              aiConfig.mode === mode
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "bg-muted/30 border-border/50 text-muted-foreground"
                            }`}
                          >
                            {mode === "builtin" ? "⚡ Built-in Models" : "🔑 Your API Key"}
                          </button>
                        ))}
                      </div>

                      {aiConfig.mode === "builtin" ? (
                        <div className="space-y-1.5">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Select Model</p>
                          {BUILT_IN_MODELS.map(model => (
                            <motion.button
                              key={model.id}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateAIConfig({ builtinModel: model.id })}
                              className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
                                aiConfig.builtinModel === model.id
                                  ? "bg-primary/5 border-primary/25"
                                  : "border-border/30 hover:border-border/60"
                              }`}
                            >
                              <span className="text-base">{model.emoji}</span>
                              <div className="flex-1 text-left">
                                <p className="text-[11px] font-bold text-foreground">{model.label}</p>
                                <p className="text-[9px] text-muted-foreground">{model.desc}</p>
                              </div>
                              {aiConfig.builtinModel === model.id && (
                                <Check size={12} className="text-primary" />
                              )}
                            </motion.button>
                          ))}
                          <p className="text-[8px] text-muted-foreground text-center pt-1">No API key needed — powered by Lovable AI</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          {/* Provider selector */}
                          <div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Provider</p>
                            <div className="flex gap-1.5">
                              {BYOK_PROVIDERS.map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => updateAIConfig({ byokProvider: p.id, byokModel: p.models[0] })}
                                  className={`flex-1 px-2 py-2 rounded-lg text-[10px] font-bold border transition-all text-center ${
                                    aiConfig.byokProvider === p.id
                                      ? "bg-primary/10 border-primary/30 text-primary"
                                      : "bg-muted/30 border-border/50 text-muted-foreground"
                                  }`}
                                >
                                  {p.emoji} {p.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Model selector */}
                          {selectedByokProvider && (
                            <div>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Model</p>
                              <div className="flex flex-wrap gap-1.5">
                                {selectedByokProvider.models.map(m => (
                                  <button
                                    key={m}
                                    onClick={() => updateAIConfig({ byokModel: m })}
                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                                      aiConfig.byokModel === m
                                        ? "bg-primary/10 border-primary/30 text-primary"
                                        : "bg-muted/30 border-border/50 text-muted-foreground"
                                    }`}
                                  >
                                    {m}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* API Key input */}
                          <div>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                              <Key size={9} /> API Key
                            </p>
                            <div className="relative">
                              <Input
                                type={showApiKey ? "text" : "password"}
                                value={aiConfig.byokApiKey}
                                onChange={(e) => updateAIConfig({ byokApiKey: e.target.value })}
                                placeholder="sk-... or AIza..."
                                className="h-9 rounded-lg bg-muted/50 border-border/50 text-foreground text-[11px] pr-9"
                              />
                              <button
                                onClick={() => setShowApiKey(!showApiKey)}
                                className="absolute right-2 top-1/2 -translate-y-1/2"
                              >
                                {showApiKey ? <EyeOff size={12} className="text-muted-foreground" /> : <Eye size={12} className="text-muted-foreground" />}
                              </button>
                            </div>
                            <p className="text-[8px] text-muted-foreground mt-1">
                              🔒 Stored locally on your device. Never sent to our servers.
                            </p>
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
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden mb-3 shadow-card">
              <div className="flex items-center justify-between p-3.5 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  {lightMode ? <Sun size={15} className="text-primary" /> : <Moon size={15} className="text-secondary" />}
                  <div>
                    <p className="font-semibold text-foreground text-xs">{lightMode ? "Light Mode" : "Dark Mode"}</p>
                    <p className="text-[10px] text-muted-foreground">Switch appearance</p>
                  </div>
                </div>
                <Switch checked={lightMode} onCheckedChange={toggleTheme} />
              </div>
              <button className="flex items-center justify-between w-full p-3.5 border-b border-border/50 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Bell size={15} className="text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-xs">Notifications</p>
                    <p className="text-[10px] text-muted-foreground">Manage alerts</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
              <button className="flex items-center justify-between w-full p-3.5 hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2.5">
                  <Shield size={15} className="text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-xs">Privacy</p>
                    <p className="text-[10px] text-muted-foreground">Data & security</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
            </div>
          </FadeIn>

          <FadeIn delay={0.25}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full bg-destructive/10 text-destructive font-semibold rounded-xl p-3 flex items-center justify-center gap-2 hover:bg-destructive/15 transition-colors shadow-card text-xs"
            >
              <LogOut size={14} />
              {user ? "Log Out" : "Reset & Start Over"}
            </motion.button>
          </FadeIn>

          <p className="text-center text-[10px] text-muted-foreground mt-4">AI Agents v1.0 • Made with ❤️</p>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default SettingsPage;

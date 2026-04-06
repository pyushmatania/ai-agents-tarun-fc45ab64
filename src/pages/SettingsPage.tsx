import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LogOut, Moon, Sun, ChevronRight, Shield, Bell, Loader2, LogIn } from "lucide-react";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(localStorage.getItem("edu_user_name") || "");
  const [role, setRole] = useState(localStorage.getItem("edu_user_role") || "");
  const [saving, setSaving] = useState(false);
  const [lightMode, setLightMode] = useState(() =>
    document.documentElement.classList.contains("light")
  );

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

  return (
    <PageTransition>
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-md mx-auto px-4 pt-5">
        <h2 className="text-base font-display font-bold text-foreground mb-4">Settings</h2>

        {/* Profile */}
        <div className="bg-card rounded-2xl p-3.5 border border-border/50 mb-3 shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xl">
              🧑‍💻
            </div>
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

        {!user && (
          <button onClick={() => navigate("/auth")}
            className="w-full bg-card border border-secondary/20 text-foreground font-semibold rounded-xl p-3 flex items-center justify-center gap-2 hover:border-secondary/40 transition-colors mb-3 shadow-card text-xs">
            <LogIn size={14} /> Sign in to sync progress
          </button>
        )}

        {/* Preferences */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden mb-3 shadow-card">
          <div className="flex items-center justify-between p-3.5 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              {lightMode ? <Sun size={15} className="text-primary" /> : <Moon size={15} className="text-secondary" />}
              <div>
                <p className="font-semibold text-foreground text-xs">Light Mode</p>
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

        <button onClick={handleLogout}
          className="w-full bg-destructive/10 text-destructive font-semibold rounded-xl p-3 flex items-center justify-center gap-2 hover:bg-destructive/15 transition-colors shadow-card text-xs">
          <LogOut size={14} />
          {user ? "Log Out" : "Reset & Start Over"}
        </button>

        <p className="text-center text-[10px] text-muted-foreground mt-4">AI Agents v1.0 • Made with ❤️</p>
      </div>
      <BottomNav />
    </div>
    </PageTransition>
  );
};

export default SettingsPage;

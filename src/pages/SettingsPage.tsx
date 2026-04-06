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
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();
      if (data?.full_name) setFullName(data.full_name);
    };
    fetchProfile();
  }, [user]);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleSave = async () => {
    setSaving(true);
    localStorage.setItem("edu_user_name", fullName);
    localStorage.setItem("edu_user_role", role);

    if (user) {
      await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("user_id", user.id);
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
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h2 className="text-2xl font-extrabold text-foreground mb-6">Settings</h2>

        {/* Profile Card */}
        <div className="bg-card rounded-3xl p-5 border border-border mb-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl bg-edu-lavender flex items-center justify-center text-3xl">
              👤
            </div>
            <div className="flex-1">
              <p className="font-bold text-foreground text-lg">{fullName || "Your Name"}</p>
              <p className="text-sm text-muted-foreground">{role || "Learner"}</p>
              {user && <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="h-12 rounded-2xl bg-background border-border text-foreground mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Developer, Student"
                className="h-12 rounded-2xl bg-background border-border text-foreground mt-1"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold"
            >
              {saving ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </div>

        {/* Sign in prompt */}
        {!user && (
          <button
            onClick={() => navigate("/auth")}
            className="w-full bg-secondary/20 border border-secondary/30 text-foreground font-bold rounded-3xl p-4 flex items-center justify-center gap-2 hover:bg-secondary/30 transition-colors mb-4"
          >
            <LogIn size={18} />
            Sign in to sync progress
          </button>
        )}

        {/* Preferences */}
        <div className="bg-card rounded-3xl border border-border overflow-hidden mb-4">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={20} className="text-secondary" /> : <Sun size={20} className="text-primary" />}
              <div>
                <p className="font-semibold text-foreground text-sm">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Switch appearance</p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>

          <button className="flex items-center justify-between w-full p-5 border-b border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-muted-foreground" />
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">Notifications</p>
                <p className="text-xs text-muted-foreground">Manage alerts</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>

          <button className="flex items-center justify-between w-full p-5 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-muted-foreground" />
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">Privacy</p>
                <p className="text-xs text-muted-foreground">Data & security</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-muted-foreground" />
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-destructive/10 text-destructive font-bold rounded-3xl p-4 flex items-center justify-center gap-2 hover:bg-destructive/20 transition-colors"
        >
          <LogOut size={18} />
          {user ? "Log Out" : "Reset & Start Over"}
        </button>

        <p className="text-center text-xs text-muted-foreground mt-6">
          EduLearn v1.0 • Made with ❤️
        </p>
      </div>
      <BottomNav />
    </div>
    </PageTransition>
  );
};

export default SettingsPage;

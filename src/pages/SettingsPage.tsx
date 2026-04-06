import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, LogOut, Moon, Sun, ChevronRight, Shield, Bell, Loader2 } from "lucide-react";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
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
      setLoading(false);
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
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("user_id", user.id);
    if (error) toast.error("Failed to save");
    else toast.success("Profile updated!");
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
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
              <p className="font-bold text-foreground text-lg">
                {loading ? "..." : fullName || "Your Name"}
              </p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Full Name
            </label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your name"
              className="h-12 rounded-2xl bg-background border-border text-foreground"
            />
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
          Log Out
        </button>

        <p className="text-center text-xs text-muted-foreground mt-6">
          EduLearn v1.0 • Made with ❤️
        </p>
      </div>
      <BottomNav />
    </div>
  );
};

export default SettingsPage;

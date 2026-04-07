import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import MascotRobot from "@/components/MascotRobot";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      toast.error("Invalid or expired reset link");
      navigate("/auth");
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      toast.success("Password updated!");
      setTimeout(() => navigate("/"), 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md mx-auto px-6 pt-16 pb-8 flex-1 flex flex-col w-full relative z-10">
        <motion.div
          className="flex flex-col items-center mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <MascotRobot size={100} mood={success ? "celebrating" : "thinking"} speech={success ? "All set! 🎉" : "Set a new password 🔐"} />
          <h1 className="text-2xl font-extrabold text-foreground mt-3">
            Agent<span className="text-primary">Dojo</span>
          </h1>
        </motion.div>

        {success ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-4"
          >
            <CheckCircle size={48} className="text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Password Updated!</h2>
            <p className="text-muted-foreground text-sm">Redirecting you to the app...</p>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleReset}
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-xl font-bold text-foreground">Set New Password</h2>
            <p className="text-sm text-muted-foreground mb-4">Choose a strong password for your account</p>

            <div className="relative group">
              <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-12 h-13 rounded-2xl bg-card border-border text-foreground focus:border-primary/50 transition-all"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <div className="relative group">
              <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="pl-11 h-13 rounded-2xl bg-card border-border text-foreground focus:border-primary/50 transition-all"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 shadow-lg shadow-primary/20"
            >
              {loading ? "Updating..." : "Update Password"}
              <ArrowRight size={17} className="ml-2" />
            </Button>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;

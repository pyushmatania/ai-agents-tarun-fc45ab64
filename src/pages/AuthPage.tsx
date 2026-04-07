import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, ArrowLeft, Sparkles, CheckCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MascotRobot from "@/components/MascotRobot";

type AuthView = "signin" | "signup" | "forgot" | "verify";

const AuthPage = () => {
  const [view, setView] = useState<AuthView>("signin");
  const [signupEmail, setSignupEmail] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const mascotMood = view === "signup" ? "excited" : view === "forgot" ? "thinking" : view === "verify" ? "celebrating" : "waving";
  const mascotSpeech =
    view === "signin" ? "Welcome back, learner! 🔥" :
    view === "signup" ? "Let's start your journey! 🚀" :
    view === "verify" ? "Check your inbox! 📬" :
    "No worries, I got you! 🤝";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("Password reset link sent! Check your inbox.");
        setView("signin");
      } else if (view === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setSignupEmail(email);
        setView("verify");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Ambient glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-md mx-auto px-6 pt-8 pb-8 flex-1 flex flex-col w-full relative z-10">
        {/* Mascot + Branding */}
        <motion.div
          className="flex flex-col items-center mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            key={view}
            initial={{ scale: 0.8, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <MascotRobot size={100} mood={mascotMood} speech={mascotSpeech} />
          </motion.div>
          <h1 className="text-2xl font-extrabold text-foreground mt-2 tracking-tight">
            Agent<span className="text-primary">Dojo</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Master AI Agents, One Lesson at a Time</p>
        </motion.div>

        {/* View Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            {/* Email Verification Screen */}
            {view === "verify" ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center"
                >
                  <Mail size={36} className="text-primary" />
                </motion.div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Verify Your Email</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
                    We sent a verification link to
                  </p>
                  <p className="text-sm font-bold text-primary mt-1">{signupEmail}</p>
                </div>

                <div className="bg-card border border-border/20 rounded-2xl p-4 max-w-[300px] space-y-2">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground text-left">Open the email and tap the verification link</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground text-left">You'll be redirected back to sign in</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle size={16} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground text-left">Check spam folder if you don't see it</p>
                  </div>
                </div>

                <Button
                  onClick={() => {
                    setView("signin");
                    toast.success("Ready to sign in!");
                  }}
                  className="w-full max-w-[280px] h-13 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 shadow-lg shadow-primary/20"
                >
                  Go to Sign In
                  <ArrowRight size={17} className="ml-2" />
                </Button>

                <button
                  onClick={async () => {
                    try {
                      await supabase.auth.resend({ type: "signup", email: signupEmail });
                      toast.success("Verification email resent!");
                    } catch {
                      toast.error("Failed to resend. Try again.");
                    }
                  }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RefreshCw size={12} />
                  Resend verification email
                </button>
              </div>
            ) : (
            <>
            {/* View Title */}
            <div className="flex items-center gap-3 mb-5">
              {view === "forgot" && (
                <button onClick={() => setView("signin")} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
                  <ArrowLeft size={20} className="text-muted-foreground" />
                </button>
              )}
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {view === "signin" ? "Sign In" : view === "signup" ? "Create Account" : "Reset Password"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {view === "signin"
                    ? "Continue your learning streak"
                    : view === "signup"
                    ? "Join thousands of AI learners"
                    : "We'll send you a reset link"}
                </p>
              </div>
            </div>

            {/* Google Button (not on forgot) */}
            {view !== "forgot" && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignIn}
                  className="w-full h-13 rounded-2xl border-border bg-card hover:bg-muted text-foreground font-bold text-sm transition-all"
                >
                  <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </Button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground font-medium">or continue with email</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              </>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {view === "signup" && (
                <div className="relative group">
                  <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-11 h-13 rounded-2xl bg-card border-border text-foreground focus:border-primary/50 focus:ring-primary/20 transition-all"
                    required
                  />
                </div>
              )}

              <div className="relative group">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-13 rounded-2xl bg-card border-border text-foreground focus:border-primary/50 focus:ring-primary/20 transition-all"
                  required
                />
              </div>

              {view !== "forgot" && (
                <div className="relative group">
                  <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-12 h-13 rounded-2xl bg-card border-border text-foreground focus:border-primary/50 focus:ring-primary/20 transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              )}

              {view === "signin" && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-xs text-primary font-semibold hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-13 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20 mt-2"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                ) : (
                  <>
                    {view === "signin" ? "Sign In" : view === "signup" ? "Create Account" : "Send Reset Link"}
                    <ArrowRight size={17} className="ml-2" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer toggle */}
            {view !== "forgot" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-sm text-muted-foreground mt-6"
              >
                {view === "signin" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setView(view === "signin" ? "signup" : "signin")}
                  className="text-primary font-bold hover:underline"
                >
                  {view === "signin" ? "Sign Up" : "Sign In"}
                </button>
              </motion.p>
            )}

            {/* XP teaser for signup */}
            {view === "signup" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground"
              >
                <Sparkles size={14} className="text-secondary" />
                <span>Earn <span className="text-secondary font-bold">+50 XP</span> on signup!</span>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AuthPage;

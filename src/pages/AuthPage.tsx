import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight } from "lucide-react";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
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
        toast.success("Account created! Check your email to verify.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto px-6 pt-16 pb-8 flex-1 flex flex-col">
        {/* Logo area */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-primary mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg">
            📚
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">EduLearn</h1>
          <p className="text-muted-foreground mt-1">Your learning journey starts here</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-muted rounded-2xl p-1 mb-8">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              !isLogin ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1">
          {!isLogin && (
            <div className="relative">
              <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-12 h-14 rounded-2xl bg-card border-border text-foreground"
                required
              />
            </div>
          )}
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-card border-border text-foreground"
              required
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-card border-border text-foreground"
              required
              minLength={6}
            />
          </div>

          {isLogin && (
            <button type="button" className="text-sm text-primary font-semibold">
              Forgot password?
            </button>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:opacity-90 transition-all"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;

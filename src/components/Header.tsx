import { Bell, Settings, Flame, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import BotIllustration from "./illustrations/BotIllustration";
import MascotProfileModal from "./MascotProfileModal";
import { hasPersona } from "@/lib/neuralOS";

interface HeaderProps {
  name: string;
  progress: number;
}

const Header = ({ name, progress }: HeaderProps) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const xp = parseInt(localStorage.getItem("adojo_xp") || "0");
  const level = Math.floor(xp / 100) + 1;
  const personaActive = hasPersona();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2.5">
          {/* 🧠 Tap mascot to open Neural OS profile */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowProfile(true)}
            className="relative"
            title="My Persona — tap to edit"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-2 ring-primary/30 hover:ring-primary/60 transition-all">
              <BotIllustration size={36} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-[7px] font-bold text-white flex items-center justify-center border-2 border-background">
              {level}
            </div>
            {personaActive && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                <Sparkles size={6} className="text-white" />
              </div>
            )}
          </motion.button>
          <div>
            <h2 className="text-sm font-bold text-foreground leading-tight">Hello, {name}</h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-0.5">
                <Flame size={10} className="text-primary" />
                <span className="font-semibold text-primary text-[10px]">{xp} XP</span>
              </div>
              <span className="text-border">•</span>
              <span className="font-medium text-[10px]">{progress}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center border border-border/50 hover:border-primary/30 transition-colors relative"
          >
            <Bell size={14} className="text-muted-foreground" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/settings")}
            className="w-8 h-8 rounded-xl glass flex items-center justify-center border border-border/50 hover:border-primary/30 transition-colors"
          >
            <Settings size={14} className="text-muted-foreground" />
          </motion.button>
        </div>
      </motion.div>

      <MascotProfileModal open={showProfile} onClose={() => setShowProfile(false)} />
    </>
  );
};

export default Header;

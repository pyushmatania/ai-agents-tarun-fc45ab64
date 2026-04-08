import { Bell, Settings, Flame, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useCallback, useRef } from "react";
import Agni, { AgniExpression } from "./Agni";
import MascotProfileModal from "./MascotProfileModal";
import { hasPersona } from "@/lib/neuralOS";
import { SFX } from "@/lib/sounds";
import UserAvatar from "./UserAvatar";
import { useAvatar } from "@/hooks/useAvatar";
import { getCurrentScopedStorage } from "@/lib/scopedStorage";

const EXPRESSIONS: AgniExpression[] = ["default", "happy", "excited", "thinking", "teaching", "celebrating"];

const EXPR_SOUNDS: Record<AgniExpression, () => void> = {
  default: () => { SFX.tap(); navigator.vibrate?.([15]); },
  happy: () => { SFX.powerup("green"); navigator.vibrate?.([20, 30, 20]); },
  excited: () => { SFX.powerup("orange"); navigator.vibrate?.([10, 10, 10, 10, 30]); },
  thinking: () => { SFX.powerup("purple"); navigator.vibrate?.([40]); },
  teaching: () => { SFX.powerup("blue"); navigator.vibrate?.([15, 20, 15]); },
  celebrating: () => { SFX.powerup("gold"); navigator.vibrate?.([10, 10, 10, 10, 10, 10, 40]); },
  sad: () => { SFX.powerup("pink"); navigator.vibrate?.([50]); },
  sleeping: () => { SFX.tap(); navigator.vibrate?.([60]); },
};

interface HeaderProps {
  name: string;
  progress: number;
}

const Header = ({ name, progress }: HeaderProps) => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const { avatarUrl } = useAvatar();
  const xp = getCurrentScopedStorage().get<number>("xp", 0);
  const level = Math.floor(xp / 100) + 1;
  const personaActive = hasPersona();

  const [exprIndex, setExprIndex] = useState(0);
  const [currentExpr, setCurrentExpr] = useState<AgniExpression>("default");
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  const tapCount = useRef(0);

  const handleMascotTap = useCallback(() => {
    tapCount.current += 1;
    const nextIdx = (exprIndex + 1) % EXPRESSIONS.length;
    const nextExpr = EXPRESSIONS[nextIdx];
    setExprIndex(nextIdx);
    setCurrentExpr(nextExpr);
    EXPR_SOUNDS[nextExpr]();

    // Open profile modal after cycling through all expressions
    if (tapCount.current >= EXPRESSIONS.length) {
      tapCount.current = 0;
      setShowProfile(true);
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setCurrentExpr("default");
      setExprIndex(0);
      tapCount.current = 0;
    }, 4000);
  }, [exprIndex]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2.5">
          {/* 🧠 Tap mascot to cycle expressions */}
          <div
            onClick={handleMascotTap}
            className="relative cursor-pointer"
            title="Tap me!"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-2 ring-primary/30 overflow-hidden">
              <Agni expression={currentExpr} size={40} animate={true} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-[7px] font-bold text-white flex items-center justify-center border-2 border-background">
              {level}
            </div>
            {personaActive && (
              <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background flex items-center justify-center">
                <Sparkles size={6} className="text-white" />
              </div>
            )}
          </div>
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
          <UserAvatar
            avatarUrl={avatarUrl}
            name={name}
            size="sm"
            onClick={() => navigate("/settings")}
          />
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

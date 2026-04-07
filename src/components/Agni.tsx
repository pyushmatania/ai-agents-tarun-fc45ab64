import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SFX } from "@/lib/sounds";

export type AgniExpression =
  | "default"
  | "happy"
  | "excited"
  | "thinking"
  | "sad"
  | "teaching"
  | "sleeping"
  | "celebrating";

interface AgniProps {
  expression?: AgniExpression;
  size?: number;
  speech?: string;
  animate?: boolean;
  className?: string;
  interactive?: boolean;
  onExpressionChange?: (expr: AgniExpression) => void;
}

// Only eagerly import default; lazy-load the rest
import agniDefault from "@/assets/agni-default.png";

const LAZY_IMPORTS: Partial<Record<AgniExpression, () => Promise<{ default: string }>>> = {
  happy: () => import("@/assets/agni-happy.png"),
  excited: () => import("@/assets/agni-excited.png"),
  thinking: () => import("@/assets/agni-thinking.png"),
  sad: () => import("@/assets/agni-sad.png"),
  teaching: () => import("@/assets/agni-teaching.png"),
  sleeping: () => import("@/assets/agni-sleeping.png"),
  celebrating: () => import("@/assets/agni-celebrating.png"),
};

// Cache resolved URLs
const imageCache: Record<string, string> = { default: agniDefault };

function useAgniImage(expression: AgniExpression): string {
  const [src, setSrc] = useState(imageCache[expression] || agniDefault);

  useEffect(() => {
    if (imageCache[expression]) {
      setSrc(imageCache[expression]);
      return;
    }
    const loader = LAZY_IMPORTS[expression];
    if (loader) {
      loader().then((mod) => {
        imageCache[expression] = mod.default;
        setSrc(mod.default);
      });
    }
  }, [expression]);

  return src;
}

const CLICK_EXPRESSIONS: AgniExpression[] = ["happy", "excited", "celebrating", "teaching", "thinking", "default"];

const CLICK_SPEECHES: Record<AgniExpression, string[]> = {
  default: ["Hey there! 👋", "Tap me again!", "I'm AGNI! 🤖"],
  happy: ["Yay! 😊", "Love it!", "You're awesome! 💚"],
  excited: ["WOOO! 🎉", "So hyped!", "Let's GO! 🚀"],
  thinking: ["Hmm... 🤔", "Interesting...", "Let me think..."],
  sad: ["Oh no... 😢", "Don't go!", "I'll miss you!"],
  teaching: ["Did you know? 📚", "Pro tip! ✨", "Learn this! 🧠"],
  sleeping: ["Zzz... 💤", "5 more mins...", "So sleepy..."],
  celebrating: ["PARTY! 🎊", "We did it! 🏆", "Champion! 👑"],
};

const GLOW_COLORS: Record<AgniExpression, string> = {
  happy: "hsl(100 95% 40%)",
  excited: "hsl(46 100% 49%)",
  celebrating: "hsl(46 100% 49%)",
  sad: "hsl(199 92% 54%)",
  thinking: "hsl(270 100% 75%)",
  teaching: "hsl(100 95% 40%)",
  sleeping: "hsl(199 92% 54%)",
  default: "hsl(100 95% 40%)",
};

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  color: string;
}

const PARTICLE_EMOJIS: Record<AgniExpression, string[]> = {
  happy: ["💚", "✨", "😊", "🌟"],
  excited: ["🔥", "⚡", "💥", "🎆"],
  celebrating: ["🎉", "🎊", "🏆", "👑"],
  thinking: ["💭", "🧠", "❓", "💡"],
  sad: ["💧", "🌧️", "😢"],
  teaching: ["📖", "🎓", "✏️", "💡"],
  sleeping: ["💤", "🌙", "⭐"],
  default: ["✨", "💚", "🤖"],
};

const getBodyAnimation = (expression: AgniExpression) => {
  switch (expression) {
    case "happy":
      return { y: [0, -6, 0], transition: { duration: 0.7, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" } };
    case "excited":
      return { y: [0, -12, 0], rotate: [0, 6, -6, 0], transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" } };
    case "thinking":
      return { rotate: [0, -4, 4, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } };
    case "sad":
      return { y: [0, 3, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } };
    case "sleeping":
      return { rotate: [0, 3, 0, -2, 0], y: [0, 2, 0], transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" } };
    case "celebrating":
      return { y: [0, -15, 0], scale: [1, 1.08, 0.95, 1], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" } };
    case "teaching":
      return { scale: [1, 1.03, 1], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } };
    default:
      return { y: [0, -3, 0], transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" } };
  }
};

const getGlowColor = (expression: AgniExpression) => {
  switch (expression) {
    case "happy": return "0 0 20px hsl(100 95% 40% / 0.4), 0 0 40px hsl(100 95% 40% / 0.15)";
    case "excited": return "0 0 25px hsl(46 100% 49% / 0.4), 0 0 50px hsl(46 100% 49% / 0.15)";
    case "celebrating": return "0 0 30px hsl(100 95% 40% / 0.5), 0 0 60px hsl(46 100% 49% / 0.2)";
    case "sad": return "0 0 15px hsl(199 92% 54% / 0.3)";
    case "thinking": return "0 0 15px hsl(270 100% 75% / 0.3)";
    case "teaching": return "0 0 20px hsl(100 95% 40% / 0.3)";
    default: return "0 0 12px hsl(100 95% 40% / 0.2)";
  }
};

const Agni = ({ expression = "default", size = 100, speech, animate = true, className = "", interactive = false, onExpressionChange }: AgniProps) => {
  const [clickExprIndex, setClickExprIndex] = useState(0);
  const [activeExpr, setActiveExpr] = useState<AgniExpression | null>(null);
  const [clickSpeech, setClickSpeech] = useState<string | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [tapCount, setTapCount] = useState(0);
  const [showRing, setShowRing] = useState(false);
  const particleId = useRef(0);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();

  const currentExpr = activeExpr ?? expression;
  const displaySpeech = clickSpeech ?? speech;
  const imageSrc = useAgniImage(currentExpr);

  const spawnParticles = useCallback((expr: AgniExpression) => {
    const emojis = PARTICLE_EMOJIS[expr];
    const color = GLOW_COLORS[expr];
    const count = expr === "celebrating" ? 8 : 5;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleId.current++,
        x: (Math.random() - 0.5) * size * 1.5,
        y: -(Math.random() * size * 0.8 + size * 0.3),
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        color,
      });
    }
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1200);
  }, [size]);

  const handleClick = useCallback(() => {
    if (!interactive) return;
    SFX.tap();

    const nextIndex = (clickExprIndex + 1) % CLICK_EXPRESSIONS.length;
    const nextExpr = CLICK_EXPRESSIONS[nextIndex];
    setClickExprIndex(nextIndex);
    setActiveExpr(nextExpr);

    const speeches = CLICK_SPEECHES[nextExpr];
    setClickSpeech(speeches[Math.floor(Math.random() * speeches.length)]);

    setTapCount((c) => c + 1);
    spawnParticles(nextExpr);
    setShowRing(true);
    setTimeout(() => setShowRing(false), 400);

    onExpressionChange?.(nextExpr);

    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      setActiveExpr(null);
      setClickSpeech(null);
    }, 4000);
  }, [interactive, clickExprIndex, spawnParticles, onExpressionChange]);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`} style={{ cursor: interactive ? "pointer" : "default" }} onClick={handleClick}>
      {/* Tap counter badge */}
      <AnimatePresence>
        {interactive && tapCount > 0 && (
          <motion.div
            key={tapCount}
            initial={{ opacity: 0, scale: 0.5, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute -top-2 -right-2 z-30 bg-agni-pink text-white text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg"
          >
            {tapCount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click ring pulse */}
      <AnimatePresence>
        {showRing && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 rounded-full pointer-events-none z-10"
            style={{
              border: `2px solid ${GLOW_COLORS[currentExpr]}`,
              width: size,
              height: size,
              left: "50%",
              top: "50%",
              marginLeft: -size / 2,
              marginTop: -size / 2,
            }}
          />
        )}
      </AnimatePresence>

      {/* Particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: 0, x: p.x, y: p.y, scale: 1.2, rotate: Math.random() * 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute text-sm pointer-events-none z-30"
            style={{ left: "50%", top: "50%" }}
          >
            {p.emoji}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Speech bubble */}
      <AnimatePresence>
        {displaySpeech && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 z-20"
            style={{ minWidth: Math.max(80, displaySpeech.length * 6.5) }}
          >
            <div className="bg-card border border-agni-green/20 rounded-2xl px-3 py-1.5 text-[10px] font-bold text-foreground whitespace-nowrap shadow-elevated relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-agni-green/5 to-transparent pointer-events-none" />
              <span className="relative z-10">{displaySpeech}</span>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-b border-r border-agni-green/20 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Green glow underneath */}
      {animate && (
        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
          style={{
            width: size * 0.6,
            height: size * 0.15,
            background: `radial-gradient(ellipse, ${GLOW_COLORS[currentExpr]}40, transparent 70%)`,
          }}
          animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* AGNI Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentExpr}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.25 }}
        >
          <motion.img
            src={imageSrc}
            alt={`AGNI ${currentExpr}`}
            width={size}
            height={size}
            loading="lazy"
            animate={animate ? getBodyAnimation(currentExpr) : {}}
            className="object-contain select-none"
            style={{
              filter: `drop-shadow(${getGlowColor(currentExpr)})`,
            }}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Agni;

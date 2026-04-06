import { motion, AnimatePresence } from "framer-motion";

import agniDefault from "@/assets/agni-default.png";
import agniHappy from "@/assets/agni-happy.png";
import agniExcited from "@/assets/agni-excited.png";
import agniThinking from "@/assets/agni-thinking.png";
import agniSad from "@/assets/agni-sad.png";
import agniTeaching from "@/assets/agni-teaching.png";
import agniSleeping from "@/assets/agni-sleeping.png";
import agniCelebrating from "@/assets/agni-celebrating.png";

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
}

const EXPRESSION_IMAGES: Record<AgniExpression, string> = {
  default: agniDefault,
  happy: agniHappy,
  excited: agniExcited,
  thinking: agniThinking,
  sad: agniSad,
  teaching: agniTeaching,
  sleeping: agniSleeping,
  celebrating: agniCelebrating,
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

const Agni = ({ expression = "default", size = 100, speech, animate = true, className = "" }: AgniProps) => {
  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Speech bubble */}
      <AnimatePresence>
        {speech && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.7 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.7 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute -top-9 left-1/2 -translate-x-1/2 z-20"
            style={{ minWidth: Math.max(80, speech.length * 6.5) }}
          >
            <div className="bg-card border border-agni-green/20 rounded-2xl px-3 py-1.5 text-[10px] font-bold text-foreground whitespace-nowrap shadow-elevated relative">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-agni-green/5 to-transparent pointer-events-none" />
              <span className="relative z-10">{speech}</span>
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
            background: "radial-gradient(ellipse, hsl(100 95% 40% / 0.25), transparent 70%)",
          }}
          animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [0.9, 1.1, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* AGNI Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={expression}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.25 }}
        >
          <motion.img
            src={EXPRESSION_IMAGES[expression]}
            alt={`AGNI ${expression}`}
            width={size}
            height={size}
            animate={animate ? getBodyAnimation(expression) : {}}
            className="object-contain select-none"
            style={{
              filter: `drop-shadow(${getGlowColor(expression)})`,
            }}
            draggable={false}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Agni;

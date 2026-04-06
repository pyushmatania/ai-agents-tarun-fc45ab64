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
      return { y: [0, -5, 0], transition: { duration: 0.6, repeat: Infinity, repeatDelay: 1 } };
    case "excited":
      return { y: [0, -10, 0], rotate: [0, 5, -5, 0], transition: { duration: 0.8, repeat: Infinity } };
    case "thinking":
      return { rotate: [0, -5, 5, 0], transition: { duration: 1.5, repeat: Infinity } };
    case "sad":
      return { y: [0, 2, 0], transition: { duration: 1.5, repeat: Infinity } };
    case "sleeping":
      return { rotate: [0, 3, 0], transition: { duration: 3, repeat: Infinity } };
    case "celebrating":
      return { y: [0, -12, 0], scale: [1, 1.05, 0.95, 1], transition: { duration: 0.6, repeat: Infinity } };
    case "teaching":
      return { scale: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity } };
    default:
      return { scale: [1, 1.02, 1], transition: { duration: 2, repeat: Infinity } };
  }
};

const Agni = ({ expression = "default", size = 100, speech, animate = true, className = "" }: AgniProps) => {
  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Speech bubble */}
      <AnimatePresence>
        {speech && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.8 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 z-20"
            style={{ minWidth: Math.max(80, speech.length * 6) }}
          >
            <div className="bg-card border border-border rounded-2xl px-3 py-1.5 text-[10px] font-bold text-foreground whitespace-nowrap shadow-elevated relative">
              {speech}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-b border-r border-border rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AGNI Body */}
      <motion.img
        src={EXPRESSION_IMAGES[expression]}
        alt={`AGNI ${expression}`}
        width={size}
        height={size}
        animate={animate ? getBodyAnimation(expression) : {}}
        className="drop-shadow-lg object-contain"
        draggable={false}
      />
    </div>
  );
};

export default Agni;

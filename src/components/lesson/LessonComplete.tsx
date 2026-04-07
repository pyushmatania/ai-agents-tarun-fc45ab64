import { useEffect } from "react";
import { motion } from "framer-motion";
import Agni from "@/components/Agni";
import { Star, Zap, Clock, ArrowRight } from "lucide-react";
import { SFX } from "@/lib/sounds";

interface LessonCompleteProps {
  lessonTitle: string;
  xpEarned: number;
  correctCount: number;
  totalQuizzes: number;
  timeSpent: number; // seconds
  onContinue: () => void;
}

const LessonComplete = ({ lessonTitle, xpEarned, correctCount, totalQuizzes, timeSpent, onContinue }: LessonCompleteProps) => {
  const accuracy = totalQuizzes > 0 ? Math.round((correctCount / totalQuizzes) * 100) : 100;
  const isPerfect = accuracy === 100;
  const minutes = Math.floor(timeSpent / 60);

  useEffect(() => {
    SFX.celebration();
    if (isPerfect) setTimeout(() => SFX.levelUp(), 600);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col items-center justify-center px-5"
    >
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: -10,
              backgroundColor: ["#58CC02", "#FFC800", "#FF4B4B", "#CE82FF", "#1CB0F6", "#FF9600"][i % 6],
            }}
            animate={{
              y: [0, 600 + Math.random() * 200],
              x: [(Math.random() - 0.5) * 100],
              rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2 + Math.random(),
              delay: i * 0.08,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* AGNI celebrating */}
      <motion.div
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
      >
        <Agni
          expression={isPerfect ? "celebrating" : "happy"}
          size={130}
          speech={isPerfect ? "PERFECT! 🏆" : "Well done! 🎉"}
        />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-black text-foreground mt-4 text-center"
      >
        Lesson Complete!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-muted-foreground font-semibold mt-1"
      >
        {lessonTitle}
      </motion.p>

      {/* XP popup */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.7 }}
        className="mt-6 bg-agni-green rounded-2xl px-8 py-4 shadow-btn-3d"
      >
        <div className="flex items-center gap-2">
          <Zap size={24} className="text-white" />
          <span className="text-3xl font-black text-white">+{xpEarned}</span>
          <span className="text-white/60 font-bold text-sm">XP</span>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-6 w-full max-w-[280px] grid grid-cols-3 gap-3"
      >
        {[
          { icon: Star, value: `${accuracy}%`, label: "Accuracy", color: "text-agni-gold" },
          { icon: Zap, value: `${correctCount}/${totalQuizzes}`, label: "Correct", color: "text-agni-green" },
          { icon: Clock, value: `${minutes}m`, label: "Time", color: "text-agni-blue" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1 + i * 0.1, type: "spring" }}
            className="bg-card border border-border/40 rounded-2xl p-3 text-center"
          >
            <stat.icon size={16} className={`${stat.color} mx-auto mb-1`} />
            <p className="text-sm font-black text-foreground">{stat.value}</p>
            <p className="text-[8px] text-muted-foreground font-bold">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Stars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex gap-2 mt-5"
      >
        {[1, 2, 3].map((s) => (
          <motion.div
            key={s}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1.3 + s * 0.15, type: "spring" }}
          >
            <Star
              size={28}
              className={`${
                s <= (accuracy >= 100 ? 3 : accuracy >= 70 ? 2 : 1)
                  ? "text-agni-gold fill-agni-gold"
                  : "text-muted-foreground/20"
              }`}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        whileTap={{ scale: 0.95, y: 2 }}
        onClick={onContinue}
        className="mt-8 w-full max-w-[280px] py-3.5 bg-agni-green text-white font-black text-sm rounded-2xl shadow-btn-3d active:shadow-btn-3d-pressed active:translate-y-0.5 flex items-center justify-center gap-2"
      >
        Continue <ArrowRight size={16} />
      </motion.button>
    </motion.div>
  );
};

export default LessonComplete;

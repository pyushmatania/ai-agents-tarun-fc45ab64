import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Agni from "@/components/Agni";
import { SFX } from "@/lib/sounds";

interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_MESSAGES = [
  "Booting Neural-OS... 🧠",
  "Calibrating AGNI... 🔥",
  "Loading your AI Sensei... 🥋",
  "Ready to ignite! 🚀",
];

const CONFETTI_EMOJIS = ["🔥", "⚡", "✨", "🧠", "🚀", "💚", "🎯", "🎮", "🎵", "💥"];

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [phase, setPhase] = useState(0); // 0=logo, 1=mascot, 2=ready
  const [msgIndex, setMsgIndex] = useState(0);
  const [confetti, setConfetti] = useState<Array<{ id: number; emoji: string; x: number; delay: number }>>([]);

  useEffect(() => {
    // Phase transitions
    const t1 = setTimeout(() => { setPhase(1); SFX.tap(); }, 800);
    const t2 = setTimeout(() => { setPhase(2); SFX.success(); }, 2200);
    const t3 = setTimeout(() => {
      SFX.celebration();
      // Spawn confetti
      const items = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        emoji: CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
        x: Math.random() * 100,
        delay: Math.random() * 0.5,
      }));
      setConfetti(items);
    }, 2800);
    const t4 = setTimeout(onComplete, 4000);

    // Cycle messages
    const msgTimer = setInterval(() => {
      setMsgIndex(i => (i + 1) % SPLASH_MESSAGES.length);
    }, 900);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      clearInterval(msgTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: [
            "linear-gradient(135deg, hsl(195 30% 11%) 0%, hsl(270 40% 15%) 50%, hsl(195 30% 11%) 100%)",
            "linear-gradient(135deg, hsl(195 30% 11%) 0%, hsl(100 40% 15%) 50%, hsl(195 30% 11%) 100%)",
            "linear-gradient(135deg, hsl(195 30% 11%) 0%, hsl(199 40% 15%) 50%, hsl(195 30% 11%) 100%)",
            "linear-gradient(135deg, hsl(195 30% 11%) 0%, hsl(270 40% 15%) 50%, hsl(195 30% 11%) 100%)",
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating orbs */}
      <motion.div className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full bg-agni-green/10 blur-[60px]"
        animate={{ x: [0, 30, -20, 0], y: [0, -20, 10, 0], scale: [1, 1.3, 0.9, 1] }}
        transition={{ duration: 5, repeat: Infinity }} />
      <motion.div className="absolute bottom-1/3 right-1/4 w-32 h-32 rounded-full bg-agni-purple/15 blur-[50px]"
        animate={{ x: [0, -20, 15, 0], y: [0, 15, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity }} />
      <motion.div className="absolute top-1/3 right-1/3 w-24 h-24 rounded-full bg-agni-gold/10 blur-[40px]"
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ duration: 3, repeat: Infinity }} />

      {/* Confetti */}
      <AnimatePresence>
        {confetti.map(c => (
          <motion.span
            key={c.id}
            initial={{ opacity: 1, y: -20, x: `${c.x}vw`, scale: 0 }}
            animate={{ opacity: 0, y: "100vh", scale: 1, rotate: 360 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, delay: c.delay, ease: "easeIn" }}
            className="absolute top-0 text-2xl pointer-events-none z-20"
            style={{ left: `${c.x}%` }}
          >
            {c.emoji}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo text */}
        <AnimatePresence mode="wait">
          {phase >= 0 && (
            <motion.div
              key="logo"
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 15 }}
              className="text-center mb-6"
            >
              <motion.h1
                className="text-5xl font-black tracking-tight"
                animate={phase >= 2 ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <span className="text-foreground">Neural</span>
                <motion.span
                  className="text-agni-green"
                  animate={{ textShadow: ["0 0 20px hsl(100 95% 40% / 0.3)", "0 0 40px hsl(100 95% 40% / 0.6)", "0 0 20px hsl(100 95% 40% / 0.3)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  -OS
                </motion.span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] text-muted-foreground font-bold mt-1 tracking-[0.25em] uppercase"
              >
                The operating system of becoming
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AGNI mascot */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              key="mascot"
              initial={{ scale: 0, rotate: -20, y: 40 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              <Agni
                expression={phase >= 2 ? "celebrating" : "thinking"}
                size={160}
                animate
                speech={phase >= 2 ? "Let's GO! 🔥" : undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status message */}
        <motion.div
          className="mt-6 h-8 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-xs font-bold text-muted-foreground"
            >
              {SPLASH_MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Animated loading bar */}
        <motion.div
          className="mt-4 w-48 h-1.5 bg-muted/30 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-agni-green via-agni-blue to-agni-purple"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3.5, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Version badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-4 text-center space-y-0.5"
        >
          <p className="text-[9px] text-muted-foreground/50 font-mono tracking-widest">Version 01</p>
          <p className="text-[9px] text-muted-foreground/40 font-mono italic">The Genesis</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;

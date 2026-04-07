import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Agni from "@/components/Agni";
import neuralLogo from "@/assets/neural-os-cinematic.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [wordmark, setWordmark] = useState("");
  const fullText = "Neural-OS";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setWordmark(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setTimeout(onComplete, 1200);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Radial glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full bg-agni-green/10 blur-[80px]" />
      </div>

      {/* Cinematic Neural-OS Logo */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.2 }}
        className="px-8"
      >
        <img src={neuralLogo} alt="Neural-OS" width={320} height={320} className="drop-shadow-[0_0_60px_hsl(var(--agni-green)/0.3)]" />
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="text-xs text-muted-foreground font-semibold mt-1 tracking-[0.2em] uppercase"
      >
        The operating system of becoming
      </motion.p>

      {/* Version badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="mt-3 text-[9px] text-muted-foreground/50 font-mono tracking-widest"
      >
        v1.0 "TERMINATOR"
      </motion.div>

      {/* Loading dots */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="flex gap-1.5 mt-8"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-agni-green"
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;

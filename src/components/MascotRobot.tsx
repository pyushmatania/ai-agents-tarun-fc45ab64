import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

type MascotMood = "happy" | "excited" | "thinking" | "celebrating" | "sleeping" | "waving";

interface MascotRobotProps {
  size?: number;
  mood?: MascotMood;
  className?: string;
  speech?: string;
  animate?: boolean;
}

const MascotRobot = ({ size = 120, mood = "happy", className = "", speech, animate = true }: MascotRobotProps) => {
  const [blinkOpen, setBlinkOpen] = useState(true);
  const [pupilX, setPupilX] = useState(0);

  // Blink animation
  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setBlinkOpen(false);
      setTimeout(() => setBlinkOpen(true), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [animate]);

  // Pupil wander
  useEffect(() => {
    if (!animate) return;
    const interval = setInterval(() => {
      setPupilX(Math.random() * 4 - 2);
    }, 2000);
    return () => clearInterval(interval);
  }, [animate]);

  const eyeHeight = blinkOpen ? 14 : 2;
  const mouthVariants: Record<MascotMood, JSX.Element> = {
    happy: <path d="M80 128 Q100 142 120 128" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round" fill="none" />,
    excited: (
      <>
        <path d="M78 125 Q100 148 122 125" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round" fill="hsl(var(--destructive))" />
        <ellipse cx="100" cy="134" rx="12" ry="8" fill="hsl(var(--destructive))" opacity="0.8" />
      </>
    ),
    thinking: <path d="M85 132 Q100 128 115 132" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round" fill="none" />,
    celebrating: (
      <>
        <path d="M76 124 Q100 152 124 124" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round" fill="hsl(var(--primary))" opacity="0.3" />
      </>
    ),
    sleeping: <path d="M88 132 L112 132" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round" fill="none" />,
    waving: <path d="M80 128 Q100 142 120 128" stroke="hsl(var(--primary-foreground))" strokeWidth="3" strokeLinecap="round" fill="none" />,
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Speech bubble */}
      <AnimatePresence>
        {speech && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 bg-card border border-border/50 rounded-xl px-3 py-1.5 shadow-card whitespace-nowrap z-10"
          >
            <p className="text-[10px] font-semibold text-foreground">{speech}</p>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-card border-r border-b border-border/50 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        animate={mood === "waving" ? { rotate: [0, -3, 3, 0] } : mood === "excited" ? { y: [0, -4, 0] } : {}}
        transition={{ duration: mood === "excited" ? 0.5 : 2, repeat: Infinity, repeatDelay: mood === "excited" ? 0.3 : 1 }}
      >
        {/* Shadow */}
        <ellipse cx="100" cy="185" rx="35" ry="6" fill="hsl(var(--foreground))" opacity="0.08" />

        {/* Body - rounded cute robot */}
        <motion.rect
          x="55" y="80" width="90" height="75" rx="22"
          fill="hsl(var(--primary))"
          animate={mood === "celebrating" ? { scale: [1, 1.02, 1] } : {}}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
        {/* Body highlight */}
        <rect x="62" y="86" width="30" height="10" rx="5" fill="hsl(var(--primary-foreground))" opacity="0.15" />

        {/* Belly screen */}
        <rect x="72" y="105" width="56" height="32" rx="10" fill="hsl(var(--background))" opacity="0.3" />
        {/* Screen glow */}
        <motion.rect
          x="78" y="110" width="44" height="22" rx="7"
          fill="hsl(var(--secondary))" opacity="0.15"
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        {/* Heart on screen */}
        <motion.path
          d="M95 118 C95 115 91 113 91 116 C91 119 95 122 95 122 C95 122 99 119 99 116 C99 113 95 115 95 118Z"
          fill="hsl(var(--destructive))"
          opacity="0.7"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <motion.path
          d="M107 118 C107 115 103 113 103 116 C103 119 107 122 107 122 C107 122 111 119 111 116 C111 113 107 115 107 118Z"
          fill="hsl(var(--primary))"
          opacity="0.5"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />

        {/* Head */}
        <rect x="52" y="30" width="96" height="60" rx="24" fill="hsl(var(--secondary))" />
        {/* Head shine */}
        <rect x="60" y="36" width="40" height="8" rx="4" fill="hsl(var(--primary-foreground))" opacity="0.12" />

        {/* Antenna */}
        <line x1="100" y1="30" x2="100" y2="16" stroke="hsl(var(--muted-foreground))" strokeWidth="3" strokeLinecap="round" />
        <motion.circle
          cx="100" cy="12" r="6"
          fill="hsl(var(--primary))"
          animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Antenna glow */}
        <motion.circle
          cx="100" cy="12" r="10"
          fill="hsl(var(--primary))" opacity="0"
          animate={{ opacity: [0, 0.15, 0], scale: [0.8, 1.5, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Left Eye */}
        <ellipse cx="82" cy="58" rx="13" ry="14" fill="hsl(var(--primary-foreground))" />
        <motion.ellipse
          cx="82" cy="58" rx="12" ry={eyeHeight / 2 + 7}
          fill="hsl(var(--primary-foreground))"
          animate={{ ry: blinkOpen ? 13 : 1 }}
          transition={{ duration: 0.1 }}
        />
        <motion.circle
          cx={82 + pupilX} cy="58" r="6"
          fill="hsl(var(--background))"
          animate={{ cx: 82 + pupilX }}
          transition={{ duration: 0.3 }}
        />
        <circle cx={84 + pupilX} cy="55" r="2.5" fill="hsl(var(--primary-foreground))" />

        {/* Right Eye */}
        <ellipse cx="118" cy="58" rx="13" ry="14" fill="hsl(var(--primary-foreground))" />
        <motion.ellipse
          cx="118" cy="58" rx="12" ry={eyeHeight / 2 + 7}
          fill="hsl(var(--primary-foreground))"
          animate={{ ry: blinkOpen ? 13 : 1 }}
          transition={{ duration: 0.1 }}
        />
        <motion.circle
          cx={118 + pupilX} cy="58" r="6"
          fill="hsl(var(--background))"
          animate={{ cx: 118 + pupilX }}
          transition={{ duration: 0.3 }}
        />
        <circle cx={120 + pupilX} cy="55" r="2.5" fill="hsl(var(--primary-foreground))" />

        {/* Cheeks - blush */}
        <circle cx="68" cy="70" r="6" fill="hsl(var(--destructive))" opacity="0.15" />
        <circle cx="132" cy="70" r="6" fill="hsl(var(--destructive))" opacity="0.15" />

        {/* Mouth */}
        {mouthVariants[mood]}

        {/* Left Arm */}
        <motion.g
          animate={mood === "waving" ? { rotate: [0, -25, 0, -25, 0] } : { rotate: [0, -3, 0] }}
          transition={{ duration: mood === "waving" ? 1.2 : 3, repeat: Infinity }}
          style={{ transformOrigin: "50px 100px" }}
        >
          <rect x="28" y="92" width="30" height="16" rx="8" fill="hsl(var(--primary))" opacity="0.85" />
          <circle cx="28" cy="100" r="7" fill="hsl(var(--primary))" opacity="0.85" />
        </motion.g>

        {/* Right Arm */}
        <motion.g
          animate={mood === "waving" ? { rotate: [0, 30, -10, 30, 0] } : { rotate: [0, 3, 0] }}
          transition={{ duration: mood === "waving" ? 1.2 : 3.5, repeat: Infinity, delay: 0.5 }}
          style={{ transformOrigin: "150px 100px" }}
        >
          <rect x="142" y="92" width="30" height="16" rx="8" fill="hsl(var(--primary))" opacity="0.85" />
          <circle cx="172" cy="100" r="7" fill="hsl(var(--primary))" opacity="0.85" />
        </motion.g>

        {/* Legs */}
        <rect x="72" y="150" width="18" height="22" rx="9" fill="hsl(var(--secondary))" opacity="0.7" />
        <rect x="110" y="150" width="18" height="22" rx="9" fill="hsl(var(--secondary))" opacity="0.7" />
        {/* Feet */}
        <ellipse cx="81" cy="172" rx="12" ry="5" fill="hsl(var(--secondary))" opacity="0.5" />
        <ellipse cx="119" cy="172" rx="12" ry="5" fill="hsl(var(--secondary))" opacity="0.5" />

        {/* Celebration sparkles */}
        {(mood === "celebrating" || mood === "excited") && (
          <>
            <motion.text x="38" y="40" fontSize="14" animate={{ y: [40, 30, 40], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}>✨</motion.text>
            <motion.text x="152" y="35" fontSize="12" animate={{ y: [35, 25, 35], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.8, repeat: Infinity, delay: 0.3 }}>⭐</motion.text>
            <motion.text x="28" y="140" fontSize="10" animate={{ y: [140, 130, 140], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}>🎉</motion.text>
            <motion.text x="160" y="130" fontSize="11" animate={{ y: [130, 120, 130], opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity, delay: 0.2 }}>💫</motion.text>
          </>
        )}

        {/* Sleeping Zs */}
        {mood === "sleeping" && (
          <>
            <motion.text x="135" y="35" fontSize="16" fontWeight="bold" fill="hsl(var(--muted-foreground))" animate={{ y: [35, 20], opacity: [1, 0], x: [135, 145] }} transition={{ duration: 2, repeat: Infinity }}>Z</motion.text>
            <motion.text x="145" y="25" fontSize="12" fontWeight="bold" fill="hsl(var(--muted-foreground))" animate={{ y: [25, 10], opacity: [0.8, 0], x: [145, 155] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>z</motion.text>
            <motion.text x="155" y="18" fontSize="9" fontWeight="bold" fill="hsl(var(--muted-foreground))" animate={{ y: [18, 5], opacity: [0.6, 0], x: [155, 162] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>z</motion.text>
          </>
        )}
      </motion.svg>
    </div>
  );
};

export default MascotRobot;

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

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

const Agni = ({ expression = "default", size = 100, speech, animate = true, className = "" }: AgniProps) => {
  const [blinkState, setBlinkState] = useState(false);
  const scale = size / 100;

  // Blinking animation
  useEffect(() => {
    if (!animate || expression === "sleeping") return;
    const interval = setInterval(() => {
      setBlinkState(true);
      setTimeout(() => setBlinkState(false), 150);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, [animate, expression]);

  // Eye shapes per expression
  const getEyes = () => {
    if (blinkState && expression !== "sleeping") {
      return (
        <>
          <rect x="30" y="42" width="12" height="2" rx="1" fill="#58CC02" />
          <rect x="58" y="42" width="12" height="2" rx="1" fill="#58CC02" />
        </>
      );
    }

    switch (expression) {
      case "happy":
        return (
          <>
            <circle cx="36" cy="42" r="6" fill="#58CC02" />
            <circle cx="64" cy="42" r="6" fill="#58CC02" />
            <circle cx="36" cy="40" r="2" fill="#89E219" opacity="0.6" />
            <circle cx="64" cy="40" r="2" fill="#89E219" opacity="0.6" />
          </>
        );
      case "excited":
        return (
          <>
            {/* Star eyes */}
            <motion.g animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
              <polygon points="36,36 38,40 42,40 39,43 40,47 36,44 32,47 33,43 30,40 34,40" fill="#FFC800" />
            </motion.g>
            <motion.g animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}>
              <polygon points="64,36 66,40 70,40 67,43 68,47 64,44 60,47 61,43 58,40 62,40" fill="#FFC800" />
            </motion.g>
          </>
        );
      case "thinking":
        return (
          <>
            <circle cx="36" cy="42" r="5" fill="#58CC02" />
            <circle cx="64" cy="43" r="4" fill="#58CC02" />
            <circle cx="36" cy="40" r="1.5" fill="#89E219" opacity="0.5" />
          </>
        );
      case "sad":
        return (
          <>
            <motion.g animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 2, repeat: Infinity }}>
              <ellipse cx="36" cy="43" rx="5" ry="6" fill="#58CC02" opacity="0.5" />
              <ellipse cx="64" cy="43" rx="5" ry="6" fill="#58CC02" opacity="0.5" />
            </motion.g>
          </>
        );
      case "teaching":
        return (
          <>
            <circle cx="36" cy="42" r="5" fill="#58CC02" />
            <circle cx="64" cy="42" r="5" fill="#58CC02" />
            <circle cx="37" cy="41" r="1.5" fill="#89E219" opacity="0.5" />
            <circle cx="65" cy="41" r="1.5" fill="#89E219" opacity="0.5" />
          </>
        );
      case "sleeping":
        return (
          <>
            <rect x="30" y="42" width="12" height="2" rx="1" fill="#58CC02" opacity="0.4" />
            <rect x="58" y="42" width="12" height="2" rx="1" fill="#58CC02" opacity="0.4" />
          </>
        );
      case "celebrating":
        return (
          <>
            <motion.g animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.4, repeat: Infinity }}>
              <circle cx="36" cy="42" r="6" fill="#58CC02" />
              <circle cx="64" cy="42" r="6" fill="#58CC02" />
            </motion.g>
            <circle cx="36" cy="40" r="2.5" fill="#89E219" opacity="0.7" />
            <circle cx="64" cy="40" r="2.5" fill="#89E219" opacity="0.7" />
          </>
        );
      default:
        return (
          <>
            <circle cx="36" cy="42" r="5" fill="#58CC02" />
            <circle cx="64" cy="42" r="5" fill="#58CC02" />
            <circle cx="37" cy="41" r="1.5" fill="#89E219" opacity="0.4" />
            <circle cx="65" cy="41" r="1.5" fill="#89E219" opacity="0.4" />
          </>
        );
    }
  };

  // Mouth per expression
  const getMouth = () => {
    switch (expression) {
      case "happy":
      case "celebrating":
        return <path d="M42 50 Q50 57 58 50" stroke="#58CC02" strokeWidth="2" fill="none" strokeLinecap="round" />;
      case "excited":
        return (
          <>
            <path d="M42 49 Q50 58 58 49" stroke="#58CC02" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="50" cy="53" rx="5" ry="3" fill="#58CC02" opacity="0.3" />
          </>
        );
      case "thinking":
        return <line x1="44" y1="51" x2="56" y2="51" stroke="#58CC02" strokeWidth="1.5" strokeLinecap="round" />;
      case "sad":
        return <path d="M42 53 Q50 47 58 53" stroke="#58CC02" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />;
      case "teaching":
        return (
          <motion.g animate={{ scaleY: [1, 0.7, 1] }} transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.5 }}>
            <ellipse cx="50" cy="51" rx="4" ry="3" fill="#58CC02" opacity="0.5" />
          </motion.g>
        );
      case "sleeping":
        return <path d="M44 52 Q50 54 56 52" stroke="#58CC02" strokeWidth="1" fill="none" opacity="0.3" />;
      default:
        return <path d="M44 50 Q50 54 56 50" stroke="#58CC02" strokeWidth="1.5" fill="none" strokeLinecap="round" />;
    }
  };

  // Body animation variant
  const getBodyAnimation = () => {
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
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        animate={animate ? getBodyAnimation() : {}}
        className="drop-shadow-lg"
      >
        {/* Glow underneath */}
        <ellipse cx="50" cy="92" rx="20" ry="4" fill="#58CC02" opacity="0.15" />

        {/* Antenna */}
        <motion.g
          animate={animate ? { rotate: [0, 3, -3, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          style={{ transformOrigin: "50px 22px" }}
        >
          <line x1="50" y1="22" x2="50" y2="12" stroke="#37464F" strokeWidth="2" />
          <motion.circle
            cx="50" cy="10" r="3"
            fill="#58CC02"
            animate={animate ? { opacity: [0.5, 1, 0.5] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.g>

        {/* Helmet / Head */}
        <ellipse cx="50" cy="40" rx="26" ry="22" fill="#1A2C32" />
        {/* Helmet top highlight */}
        <ellipse cx="50" cy="32" rx="18" ry="8" fill="#233D45" opacity="0.5" />
        {/* Panel lines */}
        <path d="M32 35 Q50 28 68 35" stroke="#37464F" strokeWidth="0.5" fill="none" opacity="0.6" />

        {/* Green LED strips on helmet */}
        <path d="M28 40 Q28 25 50 22 Q72 25 72 40" stroke="#58CC02" strokeWidth="1" fill="none" opacity="0.4" />

        {/* Visor area */}
        <rect x="29" y="35" rx="8" ry="8" width="42" height="22" fill="#0A1419" opacity="0.8" />

        {/* Eyes */}
        {getEyes()}

        {/* Mouth */}
        {getMouth()}

        {/* Body / Torso */}
        <rect x="35" y="60" rx="8" width="30" height="22" fill="#1A2C32" />
        {/* Chest emblem */}
        <circle cx="50" cy="69" r="4" fill="#0A1419" stroke="#58CC02" strokeWidth="0.8" opacity="0.6" />
        <text x="50" y="71" textAnchor="middle" fill="#58CC02" fontSize="5" fontWeight="bold" opacity="0.8">A</text>

        {/* LED accent strips on shoulders */}
        <rect x="33" y="62" width="2" height="8" rx="1" fill="#58CC02" opacity="0.5" />
        <rect x="65" y="62" width="2" height="8" rx="1" fill="#58CC02" opacity="0.5" />

        {/* Arms */}
        {expression === "excited" || expression === "celebrating" ? (
          <>
            <motion.g animate={{ rotate: [-20, -30, -20] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ transformOrigin: "33px 65px" }}>
              <rect x="22" y="58" rx="4" width="12" height="8" fill="#1A2C32" />
              <rect x="20" y="56" rx="3" width="6" height="6" fill="#233D45" />
            </motion.g>
            <motion.g animate={{ rotate: [20, 30, 20] }} transition={{ duration: 0.5, repeat: Infinity }} style={{ transformOrigin: "67px 65px" }}>
              <rect x="66" y="58" rx="4" width="12" height="8" fill="#1A2C32" />
              <rect x="74" y="56" rx="3" width="6" height="6" fill="#233D45" />
            </motion.g>
          </>
        ) : expression === "thinking" ? (
          <>
            <rect x="24" y="62" rx="4" width="12" height="8" fill="#1A2C32" />
            <motion.g animate={{ y: [0, -2, 0] }} transition={{ duration: 1, repeat: Infinity }}>
              <rect x="66" y="56" rx="4" width="12" height="8" fill="#1A2C32" />
              <rect x="72" y="52" rx="3" width="6" height="6" fill="#233D45" />
            </motion.g>
          </>
        ) : expression === "teaching" ? (
          <>
            <rect x="24" y="64" rx="4" width="12" height="8" fill="#1A2C32" />
            <motion.g animate={{ rotate: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ transformOrigin: "67px 66px" }}>
              <rect x="66" y="60" rx="4" width="12" height="8" fill="#1A2C32" />
              <circle cx="78" cy="60" r="2" fill="#58CC02" opacity="0.6" />
            </motion.g>
          </>
        ) : (
          <>
            <rect x="24" y="64" rx="4" width="12" height="8" fill="#1A2C32" />
            <rect x="64" y="64" rx="4" width="12" height="8" fill="#1A2C32" />
          </>
        )}

        {/* Legs */}
        <rect x="38" y="80" rx="4" width="10" height="10" fill="#1A2C32" />
        <rect x="52" y="80" rx="4" width="10" height="10" fill="#1A2C32" />
        {/* Boots */}
        <rect x="36" y="87" rx="3" width="13" height="6" fill="#233D45" />
        <rect x="51" y="87" rx="3" width="13" height="6" fill="#233D45" />

        {/* Sleeping Z's */}
        {expression === "sleeping" && (
          <>
            <motion.text
              x="68" y="30"
              fill="#58CC02" fontSize="8" fontWeight="bold" opacity="0.6"
              animate={{ y: [30, 20], opacity: [0.6, 0], scale: [0.8, 1.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            >z</motion.text>
            <motion.text
              x="74" y="24"
              fill="#58CC02" fontSize="10" fontWeight="bold" opacity="0.4"
              animate={{ y: [24, 14], opacity: [0.4, 0], scale: [0.8, 1.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >Z</motion.text>
          </>
        )}

        {/* Celebrating confetti particles */}
        {expression === "celebrating" && (
          <>
            {[0, 1, 2, 3, 4, 5].map(i => (
              <motion.circle
                key={i}
                cx={30 + i * 10}
                cy={20}
                r={2}
                fill={["#FFC800", "#FF4B4B", "#CE82FF", "#1CB0F6", "#58CC02", "#FF9600"][i]}
                animate={{
                  y: [0, 30 + Math.random() * 20],
                  x: [(Math.random() - 0.5) * 20],
                  opacity: [1, 0],
                }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </>
        )}
      </motion.svg>
    </div>
  );
};

export default Agni;
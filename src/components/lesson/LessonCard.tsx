import { motion } from "framer-motion";
import Agni from "@/components/Agni";
import type { AgniExpression } from "@/components/Agni";

interface LessonCardProps {
  title: string;
  content: string;
  type: "concept" | "diagram" | "example" | "code";
  icon: string;
}

const LessonCard = ({ title, content, type, icon }: LessonCardProps) => {
  const bgColor = {
    concept: "from-agni-blue/20 to-agni-blue/5",
    diagram: "from-agni-purple/20 to-agni-purple/5",
    example: "from-agni-green/20 to-agni-green/5",
    code: "from-agni-orange/20 to-agni-orange/5",
  }[type];

  const borderColor = {
    concept: "border-agni-blue/20",
    diagram: "border-agni-purple/20",
    example: "border-agni-green/20",
    code: "border-agni-orange/20",
  }[type];

  const tagLabel = {
    concept: "CONCEPT",
    diagram: "DIAGRAM",
    example: "EXAMPLE",
    code: "CODE",
  }[type];

  const tagColor = {
    concept: "text-agni-blue bg-agni-blue/15",
    diagram: "text-agni-purple bg-agni-purple/15",
    example: "text-agni-green bg-agni-green/15",
    code: "text-agni-orange bg-agni-orange/15",
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full flex flex-col"
    >
      <div className={`flex-1 bg-gradient-to-b ${bgColor} border ${borderColor} rounded-3xl p-5 flex flex-col`}>
        {/* Tag */}
        <div className="flex items-center gap-2 mb-4">
          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${tagColor}`}>
            {tagLabel}
          </span>
        </div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.1 }}
          className="text-4xl mb-3"
        >
          {icon}
        </motion.div>

        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-lg font-black text-foreground mb-3 leading-tight"
        >
          {title}
        </motion.h3>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-sm text-foreground/80 leading-relaxed font-medium flex-1 overflow-y-auto"
        >
          {content.split("\n").map((line, i) => (
            <p key={i} className={`${line.startsWith("•") ? "pl-2 text-[13px]" : ""} ${i > 0 ? "mt-2" : ""}`}>
              {line.startsWith("**") ? (
                <span className="font-black text-foreground">{line.replace(/\*\*/g, "")}</span>
              ) : line.startsWith("`") ? (
                <code className="bg-muted/50 px-1.5 py-0.5 rounded text-[12px] font-mono text-agni-green">{line.replace(/`/g, "")}</code>
              ) : (
                line
              )}
            </p>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default LessonCard;

import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface TheoryCardProps {
  title?: string;
  content: string;
  highlights?: string[];
}

export default function TheoryCard({ title, content, highlights }: TheoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-card border border-border/30 overflow-hidden"
    >
      {title && (
        <div className="px-5 pt-5 pb-2 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-agni-green/15 flex items-center justify-center">
            <BookOpen size={16} className="text-agni-green" />
          </div>
          <h3 className="text-base font-black text-foreground leading-tight">{title}</h3>
        </div>
      )}
      <div className="px-5 pb-5 pt-2">
        <div className="prose prose-sm prose-invert max-w-none text-[14px] leading-relaxed [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h3]:font-black [&_code]:text-[12px] [&_code]:bg-muted/30 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-muted/20 [&_pre]:rounded-xl [&_pre]:p-3 [&_strong]:text-agni-green [&_li]:mb-1">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
      {highlights && highlights.length > 0 && (
        <div className="px-5 pb-5">
          <div className="flex flex-wrap gap-2">
            {highlights.map((h, i) => (
              <span key={i} className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-agni-green/10 text-agni-green border border-agni-green/20">
                ✦ {h}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

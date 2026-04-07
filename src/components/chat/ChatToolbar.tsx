import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Paperclip, Mic, Search, Plus, X } from "lucide-react";

interface ChatToolbarProps {
  onImageClick?: () => void;
  onFileClick?: () => void;
  onVoiceClick?: () => void;
  onSearchClick?: () => void;
}

export default function ChatToolbar({ onImageClick, onFileClick, onVoiceClick, onSearchClick }: ChatToolbarProps) {
  const [expanded, setExpanded] = useState(false);

  const tools = [
    { icon: Image, label: "Image", color: "#CE82FF", onClick: onImageClick },
    { icon: Paperclip, label: "File", color: "#58CC02", onClick: onFileClick },
    { icon: Mic, label: "Voice", color: "#FF6B6B", onClick: onVoiceClick },
    { icon: Search, label: "Search", color: "#4DA6FF", onClick: onSearchClick },
  ];

  return (
    <div className="flex items-center gap-1">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setExpanded(!expanded)}
        className="w-9 h-9 rounded-full bg-agni-purple/10 flex items-center justify-center"
      >
        {expanded ? <X size={16} className="text-agni-purple" /> : <Plus size={16} className="text-agni-purple" />}
      </motion.button>
      <AnimatePresence>
        {expanded && tools.map((tool, i) => (
          <motion.button
            key={tool.label}
            initial={{ opacity: 0, scale: 0.5, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: -8 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => {
              tool.onClick?.();
              setExpanded(false);
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: `${tool.color}15` }}
          >
            <tool.icon size={14} style={{ color: tool.color }} />
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Bookmark, Share2 } from "lucide-react";

interface MessageActionsProps {
  content: string;
  onBookmark?: () => void;
}

export default function MessageActions({ content, onBookmark }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    onBookmark?.();
  };

  return (
    <div className="flex items-center gap-1 mt-1">
      <button onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors">
        {copied ? <Check size={10} className="text-agni-green" /> : <Copy size={10} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button onClick={handleBookmark}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold transition-colors ${
          bookmarked ? "text-agni-gold" : "text-muted-foreground/50 hover:text-muted-foreground"
        }`}>
        <Bookmark size={10} fill={bookmarked ? "currentColor" : "none"} />
        Save
      </button>
      <button className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors">
        <Share2 size={10} />
        Share
      </button>
    </div>
  );
}

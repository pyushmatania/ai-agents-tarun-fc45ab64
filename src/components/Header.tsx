import { Bell, Settings, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface HeaderProps {
  name: string;
  progress: number;
}

const Header = ({ name, progress }: HeaderProps) => {
  const navigate = useNavigate();
  const xp = parseInt(localStorage.getItem("adojo_xp") || "0");
  const level = Math.floor(xp / 100) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between mb-4"
    >
      <div className="flex items-center gap-2.5">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-base ring-2 ring-primary/20">
            🧑‍💻
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-primary text-[7px] font-bold text-white flex items-center justify-center border-2 border-background">
            {level}
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground leading-tight">Hello, {name}</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-0.5">
              <Flame size={10} className="text-primary" />
              <span className="font-semibold text-primary text-[10px]">{xp} XP</span>
            </div>
            <span className="text-border">•</span>
            <span className="font-medium text-[10px]">{progress}%</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="w-8 h-8 rounded-xl glass flex items-center justify-center border border-border/50 hover:border-primary/30 transition-colors relative"
        >
          <Bell size={14} className="text-muted-foreground" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/settings")}
          className="w-8 h-8 rounded-xl glass flex items-center justify-center border border-border/50 hover:border-primary/30 transition-colors"
        >
          <Settings size={14} className="text-muted-foreground" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Header;

import { Bell, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  name: string;
  progress: number;
}

const Header = ({ name, progress }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-base ring-2 ring-primary/20">
          🧑‍💻
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground leading-tight">Hello, {name}</h2>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
            <span className="font-medium">{progress}% complete</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-xl glass flex items-center justify-center border border-border/50 hover:border-primary/30 transition-colors">
          <Bell size={15} className="text-muted-foreground" />
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="w-9 h-9 rounded-xl glass flex items-center justify-center border border-border/50 hover:border-primary/30 transition-colors"
        >
          <Settings size={15} className="text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Header;

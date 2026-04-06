import { Bell } from "lucide-react";

interface HeaderProps {
  name: string;
  progress: number;
}

const Header = ({ name, progress }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-edu-lavender flex items-center justify-center text-xl">
          👤
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Hey, {name}</h2>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="text-edu-orange">⚡</span>
            <span>Progress: {progress}%</span>
          </div>
        </div>
      </div>
      <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm border border-border">
        <Bell size={18} className="text-foreground" />
      </button>
    </div>
  );
};

export default Header;

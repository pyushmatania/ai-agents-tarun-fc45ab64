import { Bell } from "lucide-react";

interface HeaderProps {
  name: string;
  progress: number;
}

const Header = ({ name, progress }: HeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-edu-peach to-edu-orange-light flex items-center justify-center text-xl shadow-card">
          🧑‍💻
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground">Hello, {name}</h2>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="text-primary">⚡</span>
            <span className="font-semibold">Progress: {progress}%</span>
          </div>
        </div>
      </div>
      <button className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-card border border-border hover:shadow-card-hover transition-shadow">
        <Bell size={18} className="text-foreground" />
      </button>
    </div>
  );
};

export default Header;

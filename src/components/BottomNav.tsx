import { Home, BookOpen, BarChart3, FileText, Settings, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { icon: Home, path: "/", label: "Home" },
  { icon: BookOpen, path: "/courses", label: "Courses" },
  { icon: Sparkles, path: "/curiosity", label: "Curiosity" },
  { icon: FileText, path: "/mega-prompt", label: "Prompt" },
  { icon: BarChart3, path: "/progress", label: "Progress" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-4 pb-3">
        <div className="bg-edu-dark rounded-[28px] px-3 py-2.5 flex items-center justify-around shadow-elevated backdrop-blur-sm">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-card text-foreground shadow-card scale-105"
                    : "text-card/50 hover:text-card/80"
                }`}
              >
                <tab.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] font-bold ${isActive ? "opacity-100" : "opacity-0 h-0"} transition-all duration-200`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;

import { Home, BookOpen, BarChart3, FileText, Sparkles } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { icon: Home, path: "/", label: "Home" },
  { icon: BookOpen, path: "/courses", label: "Courses" },
  { icon: Sparkles, path: "/curiosity", label: "Spark" },
  { icon: FileText, path: "/mega-prompt", label: "Prompt" },
  { icon: BarChart3, path: "/progress", label: "Stats" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-3 pb-2">
        <div className="glass border border-border/40 rounded-2xl px-1.5 py-1.5 flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`relative flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[9px] font-semibold leading-none ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;

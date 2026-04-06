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
      <div className="max-w-md mx-auto px-4 pb-2">
        <div className="bg-edu-dark rounded-3xl px-2 py-3 flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`p-2.5 rounded-2xl transition-all ${
                  isActive
                    ? "bg-card text-foreground shadow-lg"
                    : "text-muted-foreground hover:text-card"
                }`}
              >
                <tab.icon size={20} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;

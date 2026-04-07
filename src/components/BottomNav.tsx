import { Home, BookOpen, BarChart3, Sparkles, Map, Library, UserCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const tabs = [
  { icon: Home, path: "/", label: "Home" },
  { icon: BookOpen, path: "/courses", label: "Learn" },
  { icon: Sparkles, path: "/curiosity", label: "Spark", center: true },
  { icon: BarChart3, path: "/progress", label: "Stats" },
  { icon: UserCircle, path: "/settings", label: "Profile" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto px-3 pb-2">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          className="relative bg-card/90 border border-agni-green/10 rounded-3xl px-1 py-1.5 flex items-center justify-around shadow-elevated backdrop-blur-xl"
        >
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;

            if (tab.center) {
              return (
                <motion.button
                  key={tab.path}
                  onClick={() => navigate(tab.path)}
                  whileTap={{ scale: 0.85 }}
                  className="relative -mt-6 z-10"
                >
                  <motion.div
                    animate={isActive ? { scale: [1, 1.08, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all border-4 border-background ${
                      isActive
                        ? "bg-gradient-to-br from-agni-green to-agni-green-light shadow-glow-green"
                        : "bg-gradient-to-br from-agni-green/80 to-agni-green-light/80"
                    }`}
                  >
                    <tab.icon size={20} strokeWidth={2.5} className="text-white" />
                  </motion.div>
                  <span className={`text-[8px] font-extrabold block text-center mt-0.5 ${isActive ? "text-agni-green" : "text-muted-foreground"}`}>
                    {tab.label}
                  </span>
                </motion.button>
              );
            }

            return (
              <motion.button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                whileTap={{ scale: 0.9 }}
                className={`relative flex flex-col items-center gap-0.5 px-1.5 py-1.5 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "text-agni-green"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon size={15} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[7px] font-bold leading-none tracking-wide ${isActive ? "text-agni-green" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-1 rounded-full bg-agni-green shadow-glow-green"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default BottomNav;
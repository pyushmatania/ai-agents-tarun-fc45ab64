import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";

/** Floating AGNI Chat button — place on any page */
export default function FloatingChatButton({ tab = "general" }: { tab?: "curriculum" | "general" }) {
  const navigate = useNavigate();
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      onClick={() => navigate("/chat", { state: { tab } })}
      className="fixed bottom-24 right-4 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
      style={{
        background: tab === "curriculum"
          ? "linear-gradient(135deg, #58CC02, #3D9400)"
          : "linear-gradient(135deg, #CE82FF, #9333EA)",
        boxShadow: tab === "curriculum"
          ? "0 4px 20px rgba(88,204,2,0.4)"
          : "0 4px 20px rgba(206,130,255,0.4)",
      }}
    >
      <Brain size={20} className="text-white" />
    </motion.button>
  );
}

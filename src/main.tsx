import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Default to light theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  // Only go dark if explicitly set
} else {
  document.documentElement.classList.add("light");
}

createRoot(document.getElementById("root")!).render(<App />);

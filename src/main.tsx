import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Default to dark theme (no .light class = dark)
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.documentElement.classList.add("light");
}

createRoot(document.getElementById("root")!).render(<App />);

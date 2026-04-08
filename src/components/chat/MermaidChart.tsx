import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, GitBranch, ChevronDown, ChevronUp } from "lucide-react";

interface MermaidChartProps {
  code: string;
}

let mermaidInitialized = false;

export default function MermaidChart({ code }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 10)}`);

  useEffect(() => {
    let cancelled = false;

    async function renderDiagram() {
      try {
        const mermaid = (await import("mermaid")).default;
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "dark",
            themeVariables: {
              primaryColor: "#58CC02",
              primaryTextColor: "#fff",
              primaryBorderColor: "#3a8a01",
              lineColor: "#CE82FF",
              secondaryColor: "#1A2C32",
              tertiaryColor: "#131F24",
              fontFamily: "Nunito, sans-serif",
              fontSize: "13px",
            },
            flowchart: { curve: "basis", padding: 12 },
            securityLevel: "loose",
          });
          mermaidInitialized = true;
        }

        const { svg: renderedSvg } = await mermaid.render(idRef.current, code.trim());
        if (!cancelled) setSvg(renderedSvg);
      } catch (err: any) {
        console.error("Mermaid render error:", err);
        if (!cancelled) setError(err?.message || "Failed to render diagram");
      }
    }

    renderDiagram();
    return () => { cancelled = true; };
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-[#0D1117] border border-border/20 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/10">
          <div className="flex items-center gap-2">
            <GitBranch size={14} className="text-agni-purple" />
            <span className="text-[11px] font-black text-agni-purple uppercase tracking-wider">Diagram</span>
          </div>
          <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">
            {copied ? <Check size={12} className="text-agni-green" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto scrollbar-none">
          <code className="text-[12px] leading-relaxed font-mono text-foreground/90">{code}</code>
        </pre>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl bg-card border border-border/20 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/10">
        <div className="flex items-center gap-2">
          <GitBranch size={14} className="text-agni-purple" />
          <span className="text-[11px] font-black text-agni-purple uppercase tracking-wider">Diagram</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors">
            {copied ? <Check size={12} className="text-agni-green" /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => setCollapsed(c => !c)}
            className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            {collapsed ? "Show" : "Hide"}
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div
              ref={containerRef}
              className="p-4 overflow-x-auto scrollbar-none flex justify-center [&_svg]:max-w-full [&_svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

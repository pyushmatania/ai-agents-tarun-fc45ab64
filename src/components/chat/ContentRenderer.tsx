import ReactMarkdown from "react-markdown";
import TheoryCard from "./TheoryCard";
import CodeCard from "./CodeCard";
import ExampleCard from "./ExampleCard";
import KeyPointsCard from "./KeyPointsCard";
import DefinitionCard from "./DefinitionCard";
import TimelineCard from "./TimelineCard";
import ComparisonCard from "./ComparisonCard";
import MessageActions from "./MessageActions";

interface ContentRendererProps {
  content: string;
  isUser: boolean;
  showActions?: boolean;
}

// Parse content into structured blocks
interface ContentBlock {
  type: "theory" | "code" | "example" | "keypoints" | "definition" | "timeline" | "comparison" | "text";
  content: string;
  meta?: Record<string, string>;
}

function parseContentBlocks(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  // Split by markdown headers and code blocks for card-based rendering
  const lines = raw.split("\n");
  let current: ContentBlock = { type: "text", content: "" };
  let inCodeBlock = false;
  let codeContent = "";
  let codeLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block detection
    if (line.trim().startsWith("```")) {
      if (!inCodeBlock) {
        // Flush current text
        if (current.content.trim()) {
          blocks.push({ ...current });
          current = { type: "text", content: "" };
        }
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
        codeContent = "";
      } else {
        inCodeBlock = false;
        blocks.push({ type: "code", content: codeContent.trim(), meta: { language: codeLang } });
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + "\n";
      continue;
    }

    // Key points: detect numbered or bulleted lists after a "key" header
    if (line.match(/^#{1,3}\s*(key\s*(takeaway|point|concept)|summary|important)/i)) {
      if (current.content.trim()) {
        blocks.push({ ...current });
      }
      // Collect following list items
      const points: string[] = [];
      let j = i + 1;
      while (j < lines.length && (lines[j].match(/^\s*[-*•]\s+/) || lines[j].match(/^\s*\d+\.\s+/) || lines[j].trim() === "")) {
        const item = lines[j].replace(/^\s*[-*•]\s+/, "").replace(/^\s*\d+\.\s+/, "").trim();
        if (item) points.push(item);
        j++;
      }
      if (points.length > 0) {
        blocks.push({ type: "keypoints", content: points.join("|||"), meta: { title: line.replace(/^#+\s*/, "") } });
        i = j - 1;
        current = { type: "text", content: "" };
        continue;
      }
    }

    // Definition: detect "**term**: definition" or "Definition:" pattern
    if (line.match(/^\*\*(.+?)\*\*:\s+(.+)/) && !lines[i + 1]?.match(/^\*\*/)) {
      if (current.content.trim()) {
        blocks.push({ ...current });
        current = { type: "text", content: "" };
      }
      const match = line.match(/^\*\*(.+?)\*\*:\s+(.+)/);
      if (match) {
        blocks.push({ type: "definition", content: match[2], meta: { term: match[1] } });
        continue;
      }
    }

    // Example detection
    if (line.match(/^#{1,3}\s*(example|real.world|analogy|scenario)/i)) {
      if (current.content.trim()) {
        blocks.push({ ...current });
      }
      const exampleContent: string[] = [];
      let j = i + 1;
      while (j < lines.length && !lines[j].match(/^#{1,3}\s/)) {
        exampleContent.push(lines[j]);
        j++;
      }
      blocks.push({
        type: "example",
        content: exampleContent.join("\n").trim(),
        meta: { title: line.replace(/^#+\s*/, ""), type: line.match(/analogy/i) ? "analogy" : line.match(/scenario/i) ? "scenario" : "real-world" }
      });
      i = j - 1;
      current = { type: "text", content: "" };
      continue;
    }

    // Steps/timeline detection
    if (line.match(/^#{1,3}\s*(step|process|how\s*(it|to)|timeline|workflow)/i)) {
      if (current.content.trim()) {
        blocks.push({ ...current });
      }
      const steps: string[] = [];
      let j = i + 1;
      while (j < lines.length && (lines[j].match(/^\s*\d+\.\s+/) || lines[j].match(/^\s*[-*]\s+/) || lines[j].trim() === "")) {
        const item = lines[j].replace(/^\s*\d+\.\s+/, "").replace(/^\s*[-*]\s+/, "").trim();
        if (item) steps.push(item);
        j++;
      }
      if (steps.length > 0) {
        blocks.push({ type: "timeline", content: steps.join("|||"), meta: { title: line.replace(/^#+\s*/, "") } });
        i = j - 1;
        current = { type: "text", content: "" };
        continue;
      }
    }

    // Regular text accumulation
    current.content += line + "\n";
  }

  // Flush remaining
  if (current.content.trim()) {
    blocks.push(current);
  }

  return blocks;
}

export default function ContentRenderer({ content, isUser, showActions = true }: ContentRendererProps) {
  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] rounded-3xl rounded-br-lg px-5 py-3.5 bg-agni-green text-white">
          <p className="text-[14px] font-semibold leading-relaxed">{content}</p>
        </div>
      </div>
    );
  }

  // Empty content = loading
  if (!content.trim()) {
    return (
      <div className="flex justify-start mb-4">
        <div className="flex items-center gap-2 px-5 py-4 rounded-3xl bg-card border border-border/20">
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-agni-purple animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 rounded-full bg-agni-purple animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 rounded-full bg-agni-purple animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-[12px] font-bold text-muted-foreground">AGNI is thinking...</span>
        </div>
      </div>
    );
  }

  const blocks = parseContentBlocks(content);

  return (
    <div className="space-y-4 mb-4">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "code":
            return <CodeCard key={i} code={block.content} language={block.meta?.language} />;
          case "keypoints":
            return <KeyPointsCard key={i} points={block.content.split("|||")} title={block.meta?.title} />;
          case "definition":
            return <DefinitionCard key={i} term={block.meta?.term || ""} definition={block.content} />;
          case "example":
            return <ExampleCard key={i} content={block.content} title={block.meta?.title} type={block.meta?.type as any} />;
          case "timeline":
            return <TimelineCard key={i} steps={block.content.split("|||").map(s => ({ label: s }))} title={block.meta?.title} />;
          case "text":
          default:
            return (
              <div key={i} className="rounded-3xl bg-card border border-border/20 px-5 py-4">
                <div className="prose prose-sm prose-invert max-w-none text-[14px] leading-[1.7] [&_p]:mb-3 [&_ul]:mb-3 [&_ol]:mb-3 [&_h1]:text-lg [&_h1]:font-black [&_h2]:text-base [&_h2]:font-black [&_h3]:text-sm [&_h3]:font-black [&_code]:text-[12px] [&_code]:bg-muted/30 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_pre]:bg-muted/20 [&_pre]:rounded-xl [&_pre]:p-3 [&_strong]:text-agni-green [&_li]:mb-1.5 [&_li]:text-[13px] [&_a]:text-agni-blue [&_blockquote]:border-l-agni-purple [&_blockquote]:bg-agni-purple/5 [&_blockquote]:py-2 [&_blockquote]:px-4 [&_blockquote]:rounded-r-xl">
                  <ReactMarkdown>{block.content}</ReactMarkdown>
                </div>
              </div>
            );
        }
      })}
      {showActions && <MessageActions content={content} />}
    </div>
  );
}

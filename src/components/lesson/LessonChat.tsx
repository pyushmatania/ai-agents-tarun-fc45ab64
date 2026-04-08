import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Zap, X, Brain, Flame, ChevronRight, ChevronDown, UserCircle, Pencil } from "lucide-react";
import Agni from "@/components/Agni";
import type { AgniExpression } from "@/components/Agni";
import { SFX } from "@/lib/sounds";
import { getAIConfig } from "@/lib/aiConfig";
import { getPersona } from "@/lib/neuralOS";
import { InterestPill } from "@/components/InterestPill";
import MascotProfileModal from "@/components/MascotProfileModal";
import { TEACHING_CATEGORIES, getTeachingSelection, getTeachingContext, getTeachingLabel, getUniverseVibe } from "@/lib/teachingConfig";
import { getCurrentScopedStorage } from "@/lib/scopedStorage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export type { Message as ChatMessage };

interface LessonChatProps {
  lessonTitle: string;
  lessonTopic: string;
  teachingMode: string;
  onQuizReady: (conversation: Message[]) => void;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Build MODES from all teaching categories
const MODES = TEACHING_CATEGORIES.flatMap(cat =>
  cat.options.map((opt: any) => ({ key: opt.id, label: opt.label, emoji: opt.emoji }))
).slice(0, 15); // Keep it manageable

interface PowerUp {
  id: string;
  label: string;
  prompt: string;
  emoji: string;
  color: string;
  shadowColor: string;
  soundColor: string;
}

const POWERUPS: Record<string, PowerUp[]> = {
  class5: [
    { id: "s1", label: "Simpler!", emoji: "🧸", prompt: "Explain that in even simpler terms, like I'm 5 years old.", color: "bg-[hsl(100,95%,40%)]", shadowColor: "shadow-[0_4px_0_0_hsl(100,100%,31%)]", soundColor: "green" },
    { id: "s2", label: "Fun Example", emoji: "🎮", prompt: "__INTEREST_DECK_FUN__", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
    { id: "s3", label: "Story Time", emoji: "📖", prompt: "__INTEREST_DECK_STORY__", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  ],
  engineer: [
    { id: "e1", label: "Show Code", emoji: "💻", prompt: "Show me a code example for this concept.", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
    { id: "e2", label: "Real Example", emoji: "🏗️", prompt: "Give me a real-world production example.", color: "bg-[hsl(100,95%,40%)]", shadowColor: "shadow-[0_4px_0_0_hsl(100,100%,31%)]", soundColor: "green" },
    { id: "e3", label: "Deep Dive", emoji: "🔬", prompt: "Go deeper into the technical details.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  ],
  founder: [
    { id: "f1", label: "Business Case", emoji: "💰", prompt: "What's the business case / ROI for this?", color: "bg-[hsl(46,100%,49%)]", shadowColor: "shadow-[0_4px_0_0_hsl(44,100%,38%)]", soundColor: "gold" },
    { id: "f2", label: "Build What?", emoji: "🚀", prompt: "What products or startups could I build with this?", color: "bg-[hsl(100,95%,40%)]", shadowColor: "shadow-[0_4px_0_0_hsl(100,100%,31%)]", soundColor: "green" },
    { id: "f3", label: "Strategy", emoji: "♟️", prompt: "Go deeper into the strategic implications.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  ],
  hacker: [
    { id: "h1", label: "Just Code", emoji: "⌨️", prompt: "Just show me the code, skip the theory.", color: "bg-[hsl(100,95%,40%)]", shadowColor: "shadow-[0_4px_0_0_hsl(100,100%,31%)]", soundColor: "green" },
    { id: "h2", label: "Quick Start", emoji: "🏃", prompt: "How do I get started with this RIGHT NOW?", color: "bg-[hsl(33,100%,50%)]", shadowColor: "shadow-[0_4px_0_0_hsl(33,100%,38%)]", soundColor: "orange" },
    { id: "h3", label: "Advanced", emoji: "🧠", prompt: "Go deeper, show me advanced patterns.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  ],
  crazy: [
    { id: "c1", label: "Mind Blow", emoji: "🤯", prompt: "Give me the most mind-blowing implication of this!", color: "bg-[hsl(323,100%,76%)]", shadowColor: "shadow-[0_4px_0_0_hsl(323,100%,60%)]", soundColor: "pink" },
    { id: "c2", label: "Sci-Fi Mode", emoji: "🌌", prompt: "Paint a wild sci-fi scenario with this tech.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
    { id: "c3", label: "Rabbit Hole", emoji: "🕳️", prompt: "Go even deeper into the rabbit hole.", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
  ],
  semiconductor: [
    { id: "sc1", label: "HCL Link", emoji: "🏭", prompt: "How does this connect to semiconductor manufacturing / HCL?", color: "bg-[hsl(33,100%,50%)]", shadowColor: "shadow-[0_4px_0_0_hsl(33,100%,38%)]", soundColor: "orange" },
    { id: "sc2", label: "Fab Example", emoji: "⚙️", prompt: "Give me a specific fab/manufacturing example.", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
    { id: "sc3", label: "Technical", emoji: "🔬", prompt: "Go deeper into the technical details.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  ],
};

// Add powerups for new modes
POWERUPS["fun"] = [
  { id: "fn1", label: "Fun Example", emoji: "🎮", prompt: "__INTEREST_DECK_FUN__", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
  { id: "fn2", label: "Meme It", emoji: "😂", prompt: "Turn this concept into a meme-worthy analogy!", color: "bg-[hsl(323,100%,76%)]", shadowColor: "shadow-[0_4px_0_0_hsl(323,100%,60%)]", soundColor: "pink" },
  { id: "fn3", label: "Quiz Me", emoji: "🧩", prompt: "Give me a fun quick quiz on this!", color: "bg-[hsl(100,95%,40%)]", shadowColor: "shadow-[0_4px_0_0_hsl(100,100%,31%)]", soundColor: "green" },
];
POWERUPS["story"] = [
  { id: "st1", label: "Story Time", emoji: "📖", prompt: "__INTEREST_DECK_STORY__", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  { id: "st2", label: "Plot Twist", emoji: "🌀", prompt: "Add a plot twist to the story that reveals a deeper concept!", color: "bg-[hsl(323,100%,76%)]", shadowColor: "shadow-[0_4px_0_0_hsl(323,100%,60%)]", soundColor: "pink" },
  { id: "st3", label: "Continue", emoji: "➡️", prompt: "Continue the story with the next concept.", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
];
POWERUPS["visual"] = [
  { id: "v1", label: "Diagram", emoji: "📊", prompt: "Draw me an ASCII diagram of this concept.", color: "bg-[hsl(170,70%,45%)]", shadowColor: "shadow-[0_4px_0_0_hsl(170,70%,35%)]", soundColor: "green" },
  { id: "v2", label: "Flowchart", emoji: "🔀", prompt: "Show me a flowchart of how this works.", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
  { id: "v3", label: "Compare", emoji: "⚖️", prompt: "Create a visual comparison table.", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
];
POWERUPS["eli5"] = [
  { id: "el1", label: "Even Simpler", emoji: "🍼", prompt: "Explain like I'm literally 5 years old. Use toys and candy.", color: "bg-[hsl(199,90%,60%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,48%)]", soundColor: "blue" },
  { id: "el2", label: "Analogy", emoji: "🎈", prompt: "Give me a simple everyday analogy for this.", color: "bg-[hsl(100,95%,40%)]", shadowColor: "shadow-[0_4px_0_0_hsl(100,100%,31%)]", soundColor: "green" },
  { id: "el3", label: "Why?", emoji: "🤷", prompt: "But why does this matter? Explain simply.", color: "bg-[hsl(46,100%,49%)]", shadowColor: "shadow-[0_4px_0_0_hsl(44,100%,38%)]", soundColor: "gold" },
];
POWERUPS["debate"] = [
  { id: "d1", label: "Challenge", emoji: "🥊", prompt: "Push back on this! What are the counterarguments?", color: "bg-[hsl(0,80%,55%)]", shadowColor: "shadow-[0_4px_0_0_hsl(0,80%,42%)]", soundColor: "orange" },
  { id: "d2", label: "Devil's Advocate", emoji: "😈", prompt: "Play devil's advocate — why might this NOT work?", color: "bg-[hsl(270,100%,75%)]", shadowColor: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", soundColor: "purple" },
  { id: "d3", label: "Both Sides", emoji: "⚖️", prompt: "Give me a balanced view — pros vs cons.", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
];
POWERUPS["researcher"] = [
  { id: "r1", label: "Papers", emoji: "📄", prompt: "What research papers should I read about this?", color: "bg-[hsl(323,100%,76%)]", shadowColor: "shadow-[0_4px_0_0_hsl(323,100%,60%)]", soundColor: "pink" },
  { id: "r2", label: "Math", emoji: "∑", prompt: "Show me the mathematical formulation.", color: "bg-[hsl(199,92%,54%)]", shadowColor: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", soundColor: "blue" },
  { id: "r3", label: "State of Art", emoji: "🏆", prompt: "What's the state-of-the-art in this area?", color: "bg-[hsl(46,100%,49%)]", shadowColor: "shadow-[0_4px_0_0_hsl(44,100%,38%)]", soundColor: "gold" },
];

// Interest Deck — group persona interests by category for dropdown selection
interface InterestCategory {
  id: string;
  emoji: string;
  label: string;
  items: string[];
}

function getInterestDeck(): InterestCategory[] {
  const p = getPersona();
  const cats: InterestCategory[] = [];
  if (p.shows?.length) cats.push({ id: "shows", emoji: "🎬", label: "Shows", items: p.shows });
  if (p.sports?.length) cats.push({ id: "sports", emoji: "⚽", label: "Sports", items: p.sports });
  if (p.gaming?.length) cats.push({ id: "gaming", emoji: "🎮", label: "Gaming", items: p.gaming });
  if (p.music?.length) cats.push({ id: "music", emoji: "🎵", label: "Music", items: p.music });
  if (p.news?.length) cats.push({ id: "news", emoji: "📰", label: "News", items: p.news });
  if (p.hobbies?.length) cats.push({ id: "hobbies", emoji: "🎯", label: "Hobbies", items: p.hobbies });
  if (p.books?.length) cats.push({ id: "books", emoji: "📚", label: "Books", items: p.books });
  return cats;
}

// Neural OS powered suggestions based on persona (legacy — now also used for role)
function getNeuralSuggestions(): PowerUp[] {
  const p = getPersona();
  const extras: PowerUp[] = [];
  if (p.currentRole) {
    extras.push({ id: "nos-role", label: "My Job", emoji: "💼", prompt: `How would this apply to my work as a ${p.currentRole}? Give me a practical example I can use tomorrow.`, color: "bg-[hsl(33,100%,50%)]", shadowColor: "shadow-[0_4px_0_0_hsl(33,100%,38%)]", soundColor: "orange" });
  }
  return extras;
}

function parseSuggestions(text: string): { clean: string; suggestions: string[] } {
  const match = text.match(/\[SUGGESTIONS\](.*?)\[\/SUGGESTIONS\]/s);
  if (!match) return { clean: text, suggestions: [] };
  const clean = text.replace(/\[SUGGESTIONS\].*?\[\/SUGGESTIONS\]/s, "").trim();
  const suggestions = match[1].split("|").map(s => s.trim()).filter(Boolean).slice(0, 3);
  return { clean, suggestions };
}

const PersonaBadge = ({ items, categories }: { items: string[]; categories: { catId: string; items: string[] }[] }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-1">
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileTap={{ scale: 0.95 }}
        className="text-[8px] font-black text-agni-purple bg-agni-purple/10 px-2 py-0.5 rounded-full inline-flex items-center gap-1"
      >
        ✨ Personalized for you ({items.length})
      </motion.button>
      <AnimatePresence>
        {expanded && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-1 mt-1">
              {categories.map(cat =>
                cat.items.slice(0, 3).map((item, idx) => (
                  <InterestPill
                    key={`${cat.catId}-${item}`}
                    name={item}
                    categoryId={cat.catId}
                    index={idx}
                    compact
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Interest Deck Dropdown Component
const InterestDropdown = ({ category, selectedItem, onSelect, disabled }: {
  category: InterestCategory;
  selectedItem: string;
  onSelect: (item: string) => void;
  disabled: boolean;
}) => {
  const [open, setOpen] = useState(false);
  
  const handlePress = () => {
    if (category.items.length <= 1) {
      onSelect(selectedItem);
      return;
    }
    setOpen(!open);
  };

  const CATEGORY_COLORS: Record<string, { bg: string; shadow: string; sound: string }> = {
    shows: { bg: "bg-[hsl(323,100%,76%)]", shadow: "shadow-[0_4px_0_0_hsl(323,100%,60%)]", sound: "pink" },
    sports: { bg: "bg-[hsl(46,100%,49%)]", shadow: "shadow-[0_4px_0_0_hsl(44,100%,38%)]", sound: "gold" },
    gaming: { bg: "bg-[hsl(270,100%,75%)]", shadow: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", sound: "purple" },
    music: { bg: "bg-[hsl(199,92%,54%)]", shadow: "shadow-[0_4px_0_0_hsl(199,80%,42%)]", sound: "blue" },
    news: { bg: "bg-[hsl(33,100%,50%)]", shadow: "shadow-[0_4px_0_0_hsl(33,100%,38%)]", sound: "orange" },
    hobbies: { bg: "bg-[hsl(100,95%,40%)]", shadow: "shadow-[0_4px_0_0_hsl(100,100%,31%)]", sound: "green" },
    books: { bg: "bg-[hsl(270,100%,75%)]", shadow: "shadow-[0_4px_0_0_hsl(270,80%,60%)]", sound: "purple" },
  };

  const colors = CATEGORY_COLORS[category.id] || CATEGORY_COLORS.shows;

  return (
    <div className="relative shrink-0">
      <motion.button
        whileTap={{ scale: 0.93, y: 2 }}
        onClick={handlePress}
        disabled={disabled}
        className={`shrink-0 rounded-xl px-3 py-2 ${colors.bg} ${colors.shadow} transition-all disabled:opacity-40 flex items-center gap-1 min-w-fit`}
      >
        <span className="text-[12px]">{category.emoji}</span>
        <span className="text-[9px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] max-w-[80px] truncate">{selectedItem}</span>
        {category.items.length > 1 && (
          <ChevronDown size={10} className={`text-white/70 transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-1.5 bg-card border border-border/50 rounded-xl shadow-xl z-50 min-w-[140px] max-h-[180px] overflow-y-auto scrollbar-none"
          >
            {category.items.map((item) => (
              <motion.button
                key={item}
                whileTap={{ scale: 0.97 }}
                onClick={() => { onSelect(item); setOpen(false); SFX.tap(); }}
                className={`w-full text-left px-3 py-2 text-[10px] font-bold flex items-center gap-1.5 transition-colors ${
                  item === selectedItem
                    ? "text-agni-green bg-agni-green/10"
                    : "text-foreground hover:bg-muted/50"
                }`}
              >
                <span>{category.emoji}</span>
                <span className="truncate">{item}</span>
                {item === selectedItem && <span className="ml-auto text-agni-green">✓</span>}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LessonChat = ({ lessonTitle, lessonTopic, teachingMode: initialMode, onQuizReady }: LessonChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const [activeMode, setActiveMode] = useState(initialMode);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [pressedBtn, setPressedBtn] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const powerRowRef = useRef<HTMLDivElement>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [showPersonaModal, setShowPersonaModal] = useState(false);
  // Interest Deck state — track selected item per category
  const interestDeck = getInterestDeck();
  const [selectedInterests, setSelectedInterests] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    interestDeck.forEach(cat => { initial[cat.id] = cat.items[0]; });
    return initial;
  });
  // Track used interests to rotate on re-tap
  const [usedInterests, setUsedInterests] = useState<Record<string, Set<string>>>({});

  const persona = getPersona();
  const agniExpr: AgniExpression = isLoading ? "thinking" : messages.length === 0 ? "teaching" : "happy";
  const basePowerups = POWERUPS[activeMode] || POWERUPS.engineer;
  const neuralPowerups = getNeuralSuggestions();

  // Handle interest selection and send as prompt
  const handleInterestSelect = (catId: string, item: string) => {
    setSelectedInterests(prev => ({ ...prev, [catId]: item }));
    const cat = interestDeck.find(c => c.id === catId);
    const promptMap: Record<string, string> = {
      shows: `Explain this using an analogy from "${item}" (the show/movie I love). Make it vivid and relatable!`,
      sports: `Explain this using a sports analogy involving "${item}". Make it feel like a match commentary!`,
      gaming: `Explain this like a game mechanic from "${item}". Use gaming language I'd understand!`,
      music: `Explain this using a musical analogy with "${item}". Make it rhythmic and memorable!`,
      news: `Explain this the way "${item}" would cover it. Match their style!`,
      hobbies: `Explain this through the lens of "${item}" as a hobby. Connect it to something I do!`,
      books: `Explain this using concepts or characters from "${item}". Make it literary!`,
    };
    const prompt = promptMap[catId] || `Explain this using "${item}" as an analogy.`;
    SFX.powerup("pink");
    handleSend(prompt);
  };

  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    // Throttle scroll-to-bottom during streaming to prevent jank
    if (scrollTimerRef.current) return;
    scrollTimerRef.current = setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }
      scrollTimerRef.current = null;
    }, 80);
  }, [messages, isLoading]);

  useEffect(() => {
    const p = persona;
    const personaBits: string[] = [];
    if (p.name) personaBits.push(`My name is ${p.name}.`);
    if (p.currentRole) personaBits.push(`I work as a ${p.currentRole}.`);
    if (p.currentCompany) personaBits.push(`I work at ${p.currentCompany}.`);
    if (p.shows?.length) personaBits.push(`I love watching ${p.shows.join(", ")}.`);
    if (p.sports?.length) personaBits.push(`I follow ${p.sports.join(", ")}.`);
    if (p.curious?.length) personaBits.push(`I'm curious about ${p.curious.join(", ")}.`);
    if (p.hobbies?.length) personaBits.push(`My hobbies include ${p.hobbies.join(", ")}.`);
    if (p.music?.length) personaBits.push(`I listen to ${p.music.join(", ")}.`);
    if (p.gaming?.length) personaBits.push(`I play ${p.gaming.join(", ")}.`);
    if (p.news?.length) personaBits.push(`I follow ${p.news.join(", ")}.`);
    if (p.books?.length) personaBits.push(`I read ${p.books.join(", ")}.`);

    const personaContext = personaBits.length > 0
      ? `\n\nAbout me: ${personaBits.join(" ")} Use my interests and role to make analogies and examples relatable to me.`
      : "";

    sendToAI([{ role: "user", content: `Start teaching me about "${lessonTitle}". Topic: ${lessonTopic}. Begin with an engaging introduction.${personaContext}` }], true);
  }, []);

  const sendToAI = useCallback(async (chatMessages: Message[], isInitial = false) => {
    setIsLoading(true);
    setIsStreaming(true);
    setAiSuggestions([]);

    const aiConfig = getAIConfig();
    
    // Build 4-dimension teaching context for AGNI v2
    const identityLabel = getTeachingLabel("identity");
    const missionLabel = getTeachingLabel("mission");
    const vibeLabel = getTeachingLabel("vibe");
    const brainLabel = getTeachingLabel("brain");
    const universeVibe = getUniverseVibe();
    
    const teachingContext = {
      identity: identityLabel ? `${identityLabel.label} — ${identityLabel.desc || ""}` : undefined,
      mission: missionLabel ? `${missionLabel.label} — ${missionLabel.desc || ""}` : undefined,
      vibe: vibeLabel ? `${vibeLabel.label} — ${vibeLabel.desc || ""}` : undefined,
      level: brainLabel ? `${brainLabel.label} — ${brainLabel.desc || ""}` : undefined,
      universeVibe: universeVibe || undefined,
    };
    
    const body: any = {
      messages: chatMessages,
      teachingMode: activeMode,
      teachingContext,
      lessonTitle,
      lessonTopic,
      stream: true,
    };

    if (aiConfig.mode === "byok" && aiConfig.byokApiKey) {
      body.customApiKey = aiConfig.byokApiKey;
      body.provider = aiConfig.byokProvider;
      body.model = aiConfig.byokModel;
      body.stream = false;
    } else {
      body.model = aiConfig.builtinModel || "google/gemini-3-flash-preview";
    }

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-tutor`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${SUPABASE_KEY}` },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (body.stream && resp.headers.get("content-type")?.includes("text/event-stream")) {
        let assistantText = "";
        const reader = resp.body!.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";

        setMessages(prev => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (content) {
                assistantText += content;
                const { clean } = parseSuggestions(assistantText);
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: clean };
                  return updated;
                });
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        const { clean: finalClean, suggestions } = parseSuggestions(assistantText);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: finalClean };
          return updated;
        });
        if (suggestions.length > 0) setAiSuggestions(suggestions);

        if (assistantText.includes("QUIZ_READY")) {
          const cleanText = finalClean.replace(/QUIZ_READY/g, "").trim();
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: cleanText };
            setTimeout(() => onQuizReady(updated), 2000);
            return updated;
          });
        }
      } else {
        const data = await resp.json();
        const text = data.text || "I couldn't generate a response. Let's try again!";
        const { clean, suggestions } = parseSuggestions(text);
        const cleanText = clean.replace(/QUIZ_READY/g, "").trim();
        setMessages(prev => [...prev, { role: "assistant", content: cleanText }]);
        if (suggestions.length > 0) setAiSuggestions(suggestions);
        if (text.includes("QUIZ_READY")) {
          const allMsgs = [...messages, { role: "assistant" as const, content: cleanText }];
          setTimeout(() => onQuizReady(allMsgs), 2000);
        }
      }

      if (!isInitial) setExchangeCount(c => c + 1);
      SFX.tap();
    } catch (error: any) {
      console.error("AI chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: `⚠️ ${error.message || "Something went wrong. Try again!"}` }]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
    }
  }, [activeMode, lessonTitle, lessonTopic, onQuizReady]);

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg || isLoading) return;
    const userMsg: Message = { role: "user", content: msg };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    sendToAI(updatedMessages);
  };

  const handlePowerUpPress = (pu: PowerUp) => {
    SFX.powerup(pu.soundColor);
    setPressedBtn(pu.id);
    
    let resolvedPrompt = pu.prompt;
    
    // Resolve Interest Deck placeholders — pick from user's favorites
    if (resolvedPrompt === "__INTEREST_DECK_FUN__" || resolvedPrompt === "__INTEREST_DECK_STORY__") {
      const allInterests: string[] = [];
      const p = getPersona();
      if (p.shows?.length) allInterests.push(...p.shows);
      if (p.sports?.length) allInterests.push(...p.sports);
      if (p.gaming?.length) allInterests.push(...p.gaming);
      if (p.music?.length) allInterests.push(...p.music);
      if (p.hobbies?.length) allInterests.push(...p.hobbies);
      if (p.books?.length) allInterests.push(...p.books);
      
      if (allInterests.length > 0) {
        // Pick 2-3 random interests for AI to choose from
        const shuffled = [...allInterests].sort(() => Math.random() - 0.5);
        const picks = shuffled.slice(0, Math.min(3, shuffled.length));
        const interestList = picks.map(i => `"${i}"`).join(", ");
        
        if (resolvedPrompt === "__INTEREST_DECK_FUN__") {
          resolvedPrompt = `Pick the BEST one from these things I love: ${interestList} — and give me a fun, vivid example of this concept using it. Make it entertaining and memorable! If none fit well, use a general fun example instead.`;
        } else {
          resolvedPrompt = `Pick the BEST one from these things I love: ${interestList} — and tell me a short, engaging story that explains this concept through it. Make it dramatic and memorable! If none fit well, tell an original story.`;
        }
      } else {
        // Fallback if no interests set
        resolvedPrompt = resolvedPrompt === "__INTEREST_DECK_FUN__"
          ? "Give me a fun, real-world example of this!"
          : "Tell me a short story to explain this concept.";
      }
    }
    
    setTimeout(() => { setPressedBtn(null); handleSend(resolvedPrompt); }, 150);
  };

  const handleModeChange = (mode: string) => {
    SFX.tap();
    setActiveMode(mode);
    getCurrentScopedStorage().set("teaching_mode", mode);
    window.dispatchEvent(new Event("storage"));
    const modeInfo = MODES.find(m => m.key === mode);
    if (modeInfo) {
      setMessages(prev => [...prev, { role: "assistant", content: `${modeInfo.emoji} **Mode switched to ${modeInfo.label}!** I'll adjust my teaching style accordingly.` }]);
    }
  };

  const handleSkipToQuiz = () => { SFX.tap(); onQuizReady(messages); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
      {/* Mode selector */}
      <div className="shrink-0 mb-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {MODES.map((m) => (
            <motion.button key={m.key} whileTap={{ scale: 0.92 }} onClick={() => handleModeChange(m.key)}
              className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 transition-all border ${
                activeMode === m.key ? "bg-[hsl(var(--agni-green)/0.15)] text-agni-green border-[hsl(var(--agni-green)/0.5)]" : "bg-card text-muted-foreground border-border/30"
              }`}
            >
              <span>{m.emoji}</span> {m.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat header with Neural OS badge */}
      <div className="flex items-center gap-2 mb-1 px-2 py-1.5 rounded-xl bg-card border border-border/30">
        <div className="relative">
          <Agni expression={agniExpr} size={36} animate />
          <motion.div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-agni-green rounded-full border-2 border-card"
            animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[10px] font-black text-agni-green">AGNI is teaching</p>
            {persona.completedAt && (
              <span className="text-[7px] font-black text-agni-purple bg-agni-purple/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Brain size={7} /> Persona Active
              </span>
            )}
          </div>
          <p className="text-[9px] text-muted-foreground font-semibold truncate">{lessonTitle}</p>
        </div>
        {exchangeCount >= 2 && (
          <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.9 }}
            onClick={handleSkipToQuiz}
            className="text-[9px] font-black text-white bg-agni-green px-3 py-1.5 rounded-full flex items-center gap-1 shadow-[0_3px_0_0_hsl(100,100%,31%)] active:shadow-[0_1px_0_0_hsl(100,100%,31%)] active:translate-y-[2px] transition-all"
          >
            <Zap size={10} /> QUIZ
          </motion.button>
        )}
      </div>

      {/* Persona summary chip row */}
      {(() => {
        const groups: { emoji: string; catId: string; items: string[] }[] = [];
        if (persona.currentRole) groups.push({ emoji: "💼", catId: "hobbies", items: [persona.currentRole] });
        if (persona.shows?.length) groups.push({ emoji: "🎬", catId: "shows", items: persona.shows });
        if (persona.sports?.length) groups.push({ emoji: "⚽", catId: "sports", items: persona.sports });
        if (persona.curious?.length) groups.push({ emoji: "🔍", catId: "curious", items: persona.curious });
        if (persona.hobbies?.length) groups.push({ emoji: "🎯", catId: "hobbies", items: persona.hobbies });
        if (persona.music?.length) groups.push({ emoji: "🎵", catId: "music", items: persona.music });
        if (persona.gaming?.length) groups.push({ emoji: "🎮", catId: "gaming", items: persona.gaming });
        if (persona.news?.length) groups.push({ emoji: "📰", catId: "news", items: persona.news });
        if (persona.books?.length) groups.push({ emoji: "📚", catId: "books", items: persona.books });

        return groups.length > 0 ? (
          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 mb-1.5 overflow-x-auto scrollbar-none">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowPersonaModal(true)}
              className="shrink-0 flex items-center gap-1 text-[8px] font-black text-agni-purple bg-agni-purple/10 border border-agni-purple/20 px-2 py-1 rounded-full"
            >
              <Pencil size={8} /> Edit
            </motion.button>
            {groups.map((g, i) =>
              g.items.slice(0, 2).map((item, idx) => (
                <div key={`${i}-${idx}`} className="shrink-0">
                  <InterestPill
                    name={item}
                    categoryId={g.catId || "shows"}
                    index={idx}
                    compact
                  />
                </div>
              ))
            )}
            {groups.reduce((sum, g) => sum + g.items.length, 0) > groups.length * 2 && (
              <span className="shrink-0 text-[8px] font-bold text-muted-foreground/60">
                +{groups.reduce((sum, g) => sum + Math.max(0, g.items.length - 2), 0)} more
              </span>
            )}
          </motion.div>
        ) : (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.95 }}
            onClick={() => setShowPersonaModal(true)}
            className="flex items-center gap-1.5 mb-1.5 text-[9px] font-bold text-agni-purple/70 bg-agni-purple/5 border border-dashed border-agni-purple/20 px-3 py-1.5 rounded-xl w-full justify-center"
          >
            <UserCircle size={12} /> Set up your persona for personalized teaching
          </motion.button>
        );
      })()}

      {/* Persona Modal */}
      <MascotProfileModal open={showPersonaModal} onClose={() => setShowPersonaModal(false)} />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2.5 px-1 pb-2 scrollbar-none">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
              className={`flex items-end gap-1.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="shrink-0 w-7 h-7 rounded-full bg-card border-2 border-agni-green/30 flex items-center justify-center mb-0.5">
                  <span className="text-[12px]">🤖</span>
                </div>
              )}
              <div>
                {msg.role === "assistant" && i === 0 && persona.completedAt && (() => {
                   const items: string[] = [];
                   const categories: { catId: string; items: string[] }[] = [];
                   if (persona.currentRole) items.push(persona.currentRole);
                   if (persona.shows?.length) { items.push(...persona.shows); categories.push({ catId: "shows", items: persona.shows }); }
                   if (persona.sports?.length) { items.push(...persona.sports); categories.push({ catId: "sports", items: persona.sports }); }
                   if (persona.curious?.length) { items.push(...persona.curious); categories.push({ catId: "curious", items: persona.curious }); }
                   if (persona.hobbies?.length) { items.push(...persona.hobbies); categories.push({ catId: "hobbies", items: persona.hobbies }); }
                   if (persona.music?.length) { items.push(...persona.music); categories.push({ catId: "music", items: persona.music }); }
                   if (persona.gaming?.length) { items.push(...persona.gaming); categories.push({ catId: "gaming", items: persona.gaming }); }
                   if (persona.news?.length) { items.push(...persona.news); categories.push({ catId: "news", items: persona.news }); }
                   if (persona.books?.length) { items.push(...persona.books); categories.push({ catId: "books", items: persona.books }); }
                  return (
                    <PersonaBadge items={items} categories={categories} />
                  );
                })()}
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-[1.6] font-semibold ${
                  msg.role === "user"
                    ? "bg-agni-green text-white rounded-br-sm shadow-[0_2px_0_0_hsl(100,100%,31%)]"
                    : "bg-card border border-border/30 text-foreground rounded-bl-sm"
                }`}>
                  {msg.content.split("\n").map((line, j) => (
                    <p key={j} className={j > 0 ? "mt-1.5" : ""}>
                      {line.startsWith("**") ? (
                        <span className="font-black text-agni-gold">{line.replace(/\*\*/g, "")}</span>
                      ) : line.startsWith("- ") || line.startsWith("• ") ? (
                        <span className="flex items-start gap-1.5 pl-1">
                          <span className="text-agni-green text-[10px] mt-0.5">●</span>
                          <span>{line.replace(/^[-•]\s/, "")}</span>
                        </span>
                      ) : line.startsWith("`") ? (
                        <code className="bg-[hsl(var(--muted)/0.5)] px-1.5 py-0.5 rounded text-[11px] font-mono text-agni-blue border border-agni-blue/20">
                          {line.replace(/`/g, "")}
                        </code>
                      ) : line}
                    </p>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end gap-1.5">
            <div className="w-7 h-7 rounded-full bg-card border-2 border-agni-green/30 flex items-center justify-center">
              <span className="text-[12px]">🤖</span>
            </div>
            <div className="bg-card border border-border/30 rounded-2xl rounded-bl-sm px-4 py-3">
              <motion.div className="flex gap-1.5" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}>
                <div className="w-2 h-2 rounded-full bg-agni-green" />
                <div className="w-2 h-2 rounded-full bg-agni-blue" />
                <div className="w-2 h-2 rounded-full bg-agni-purple" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* === UNIFIED ACTION BAR === */}
      <div className="shrink-0 pt-1 pb-0.5">
        {/* AI Suggestions — inline chips above power-ups */}
        <AnimatePresence>
          {aiSuggestions.length > 0 && !isLoading && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-1.5">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none px-0.5">
                {aiSuggestions.map((suggestion, i) => (
                  <motion.button key={`ai-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                    whileTap={{ scale: 0.95 }} onClick={() => handleSend(suggestion)} disabled={isLoading}
                    className="shrink-0 text-[10px] font-bold text-agni-purple bg-agni-purple/10 border border-agni-purple/25 rounded-full px-3 py-1.5 disabled:opacity-40 flex items-center gap-1 hover:bg-agni-purple/20 transition-colors"
                  >
                    <Sparkles size={8} className="shrink-0" />
                    <span className="truncate max-w-[160px]">{suggestion}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Combined Power-Ups Row with swipe hint */}
        <div className="relative">
          <div ref={powerRowRef} onScroll={() => { if (powerRowRef.current && powerRowRef.current.scrollLeft > 20) setShowSwipeHint(false); }} className="flex gap-1.5 overflow-x-auto scrollbar-none px-0.5 pb-0.5 pr-8">
            {basePowerups.map((pu) => (
              <motion.button key={pu.id} whileTap={{ scale: 0.93, y: 2 }} onClick={() => handlePowerUpPress(pu)} disabled={isLoading}
                className={`shrink-0 rounded-xl px-3 py-2 ${pu.color} ${pressedBtn === pu.id ? "shadow-[0_1px_0_0_rgba(0,0,0,0.3)] translate-y-[3px]" : pu.shadowColor} transition-all disabled:opacity-40 flex items-center gap-1 min-w-fit`}
              >
                <span className="text-[12px]">{pu.emoji}</span>
                <span className="text-[9px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">{pu.label}</span>
              </motion.button>
            ))}

            {neuralPowerups.length > 0 && (
              <div className="shrink-0 flex items-center px-0.5">
                <div className="w-1 h-1 rounded-full bg-agni-purple/50" />
              </div>
            )}

            {neuralPowerups.map((pu) => (
              <motion.button key={pu.id} whileTap={{ scale: 0.93, y: 2 }} onClick={() => handlePowerUpPress(pu)} disabled={isLoading}
                className={`shrink-0 rounded-xl px-3 py-2 bg-agni-purple/15 border border-agni-purple/30 ${pressedBtn === pu.id ? "translate-y-[2px] border-agni-purple/50" : ""} transition-all disabled:opacity-40 flex items-center gap-1 min-w-fit`}
              >
                <span className="text-[12px]">{pu.emoji}</span>
                <span className="text-[9px] font-black text-agni-purple drop-shadow-none">{pu.label}</span>
              </motion.button>
            ))}

            {exchangeCount >= 1 && (
              <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} whileTap={{ scale: 0.93, y: 2 }}
                onClick={handleSkipToQuiz} disabled={isLoading}
                className="shrink-0 rounded-xl px-3 py-2 bg-agni-green shadow-[0_3px_0_0_hsl(100,100%,31%)] active:shadow-[0_1px_0_0_hsl(100,100%,31%)] active:translate-y-[2px] transition-all disabled:opacity-40 flex items-center gap-1"
              >
                <span className="text-[12px]">⚡</span>
                <span className="text-[9px] font-black text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">Quiz Me!</span>
              </motion.button>
            )}
          </div>

          {/* Swipe arrow hint */}
          <AnimatePresence>
            {showSwipeHint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-0 top-0 bottom-0.5 flex items-center pointer-events-none"
              >
                <div className="w-8 h-full bg-gradient-to-l from-background via-background/80 to-transparent flex items-center justify-end pr-0.5">
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  >
                    <ChevronRight size={14} className="text-muted-foreground/60" />
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interest Deck — one item per category with dropdown */}
        {interestDeck.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none px-0.5 pt-1.5 pb-0.5">
            {interestDeck.map((cat) => (
              <InterestDropdown
                key={cat.id}
                category={cat}
                selectedItem={selectedInterests[cat.id] || cat.items[0]}
                onSelect={(item) => handleInterestSelect(cat.id, item)}
                disabled={isLoading}
              />
            ))}
          </div>
        )}

      </div>

      {/* Input */}
      <div className="flex items-center gap-2 pt-1.5">
        <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask AGNI anything..." disabled={isLoading}
          className="flex-1 bg-card border-2 border-border/30 rounded-2xl px-4 py-2.5 text-[12px] font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-agni-green/50 transition-all disabled:opacity-50"
        />
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => handleSend()} disabled={!input.trim() || isLoading}
          className="w-11 h-11 rounded-xl bg-agni-green flex items-center justify-center shadow-[0_4px_0_0_hsl(100,100%,31%)] active:shadow-[0_1px_0_0_hsl(100,100%,31%)] active:translate-y-[3px] transition-all disabled:opacity-30 disabled:shadow-none"
        >
          <Send size={16} className="text-white" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default LessonChat;

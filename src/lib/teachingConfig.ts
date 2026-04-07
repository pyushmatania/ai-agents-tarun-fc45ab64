/**
 * Unified Teaching Configuration — 4 Dimensions (AGNI Mega Prompt v2)
 * 
 * 1. 🪪 IDENTITY — Who they are (real-world background)
 * 2. 🎯 MISSION MODE — WHY they're learning
 * 3. 🎨 TEACHING VIBE — HOW AGNI teaches (style + universe vibes)
 * 4. 🧠 BRAIN LEVEL — Difficulty/depth (Academic + Skill tracks)
 * 
 * Each supports custom user-created options with name + description.
 */

// ─── Custom option type ───
export interface CustomTeachingOption {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  color: string;
  isCustom: true;
}

// ─── Shared option interface ───
export interface TeachingOption {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  color: string;
  isCustom?: boolean;
}

// Keep backward compat aliases
export type MissionOption = TeachingOption;
export type VibeOption = TeachingOption;
export type BrainLevel = TeachingOption;
export type IdentityOption = TeachingOption;

// ═══════════════════════════════════════════════
// 🪪 DIMENSION 1: IDENTITY — Who they are
// ═══════════════════════════════════════════════
export const IDENTITIES: IdentityOption[] = [
  // ── Popular / Top picks ──
  { id: "developer", label: "Developer / Engineer", emoji: "👨‍💻", desc: "Code, APIs, debugging, frameworks", color: "from-blue-500 to-cyan-400" },
  { id: "product_manager", label: "Product Manager", emoji: "🎯", desc: "Roadmaps, sprints, stakeholders", color: "from-violet-500 to-indigo-400" },
  { id: "founder", label: "Founder / CEO", emoji: "💼", desc: "Cap tables, runway, product-market fit", color: "from-violet-500 to-purple-400" },
  { id: "student", label: "Student", emoji: "📚", desc: "Classes, exams, study groups", color: "from-blue-400 to-cyan-300" },
  { id: "marketer", label: "Marketer", emoji: "📊", desc: "Funnels, campaigns, A/B tests", color: "from-teal-500 to-emerald-400" },
  { id: "sales", label: "Sales", emoji: "💰", desc: "Leads, pipelines, close rates, CRM", color: "from-emerald-500 to-green-400" },
  { id: "designer", label: "Designer / UX", emoji: "🎨", desc: "Wireframes, prototypes, user flows", color: "from-pink-500 to-rose-400" },
  { id: "data_scientist", label: "Data Scientist", emoji: "📉", desc: "Models, datasets, notebooks, ML", color: "from-cyan-500 to-blue-400" },
  { id: "trader", label: "Trader / Investor", emoji: "📈", desc: "Risk, leverage, portfolios, charts", color: "from-indigo-500 to-blue-400" },
  { id: "consultant", label: "Consultant", emoji: "🧑‍💼", desc: "Decks, frameworks, client advisory", color: "from-slate-500 to-blue-400" },
  // ── Engineering specializations ──
  { id: "frontend_dev", label: "Frontend Developer", emoji: "🖥️", desc: "React, CSS, UI components", color: "from-sky-500 to-cyan-400" },
  { id: "backend_dev", label: "Backend Developer", emoji: "⚙️", desc: "APIs, databases, microservices", color: "from-gray-500 to-slate-400" },
  { id: "devops", label: "DevOps / SRE", emoji: "🔧", desc: "CI/CD, infra, monitoring, K8s", color: "from-orange-500 to-amber-400" },
  { id: "ml_engineer", label: "ML / AI Engineer", emoji: "🤖", desc: "Training, inference, MLOps", color: "from-purple-500 to-violet-400" },
  { id: "mobile_dev", label: "Mobile Developer", emoji: "📱", desc: "iOS, Android, React Native, Flutter", color: "from-green-500 to-teal-400" },
  { id: "qa_engineer", label: "QA Engineer", emoji: "🧪", desc: "Testing, automation, CI pipelines", color: "from-amber-500 to-yellow-400" },
  { id: "security_eng", label: "Security Engineer", emoji: "🔒", desc: "Pentesting, audits, threat models", color: "from-red-600 to-rose-400" },
  // ── MBA / Business ──
  { id: "finance", label: "Finance / Analyst", emoji: "💹", desc: "Excel, valuations, P&L, forecasting", color: "from-emerald-600 to-green-400" },
  { id: "operations", label: "Operations Manager", emoji: "📋", desc: "Supply chain, logistics, process", color: "from-blue-500 to-indigo-400" },
  { id: "hr", label: "HR / People Ops", emoji: "🤝", desc: "Hiring, culture, performance reviews", color: "from-pink-400 to-rose-300" },
  { id: "strategy", label: "Strategy / BizDev", emoji: "♟️", desc: "M&A, partnerships, market entry", color: "from-indigo-600 to-violet-400" },
  // ── Creative & Media ──
  { id: "content_creator", label: "Content Creator", emoji: "🎥", desc: "YouTube, Reels, podcasts, editing", color: "from-red-500 to-pink-400" },
  { id: "filmmaker", label: "Filmmaker / Editor", emoji: "🎬", desc: "Shots, cuts, timeline, score", color: "from-purple-500 to-violet-400" },
  { id: "musician", label: "Musician", emoji: "🎵", desc: "Composition, arrangement, mixing", color: "from-fuchsia-500 to-pink-400" },
  { id: "writer", label: "Writer / Journalist", emoji: "✍️", desc: "Articles, stories, copywriting", color: "from-amber-400 to-orange-300" },
  // ── Other professions ──
  { id: "teacher", label: "Teacher", emoji: "👩‍🏫", desc: "Lesson plans, classroom, grading", color: "from-green-500 to-emerald-400" },
  { id: "doctor", label: "Doctor / Nurse", emoji: "👨‍⚕️", desc: "Diagnosis, triage, treatment plans", color: "from-red-500 to-pink-400" },
  { id: "lawyer", label: "Lawyer", emoji: "⚖️", desc: "Contracts, compliance, case law", color: "from-gray-600 to-slate-400" },
  { id: "architect", label: "Architect", emoji: "🏛️", desc: "Blueprints, foundations, scale", color: "from-slate-500 to-gray-400" },
  { id: "chef", label: "Chef / Cook", emoji: "👨‍🍳", desc: "Recipes, ingredients, mise en place", color: "from-orange-500 to-amber-400" },
  { id: "athlete", label: "Athlete / Coach", emoji: "⚽", desc: "Training, drills, game film", color: "from-lime-500 to-green-400" },
  { id: "driver", label: "Driver", emoji: "🚗", desc: "Routes, traffic, GPS, navigation", color: "from-amber-500 to-yellow-400" },
  { id: "painter", label: "Painter / Artist", emoji: "🖌️", desc: "Layers, composition, color theory", color: "from-pink-500 to-rose-400" },
  { id: "healthcare", label: "Healthcare Worker", emoji: "🏥", desc: "Patients, shifts, protocols", color: "from-sky-500 to-blue-400" },
  { id: "military", label: "Military / Defense", emoji: "🪖", desc: "Mission planning, recon, ops", color: "from-gray-600 to-slate-400" },
  { id: "parent", label: "Parent", emoji: "👶", desc: "Routines, schedules, kid logistics", color: "from-rose-400 to-pink-300" },
  { id: "shopowner", label: "Shop Owner / Retailer", emoji: "🛍️", desc: "Inventory, customers, margins", color: "from-yellow-500 to-amber-400" },
  { id: "farmer", label: "Farmer", emoji: "🌾", desc: "Seasons, soil, yield, harvest", color: "from-green-600 to-emerald-400" },
  { id: "builder", label: "Builder / Contractor", emoji: "🏗️", desc: "Foundation, framing, blueprints", color: "from-amber-600 to-orange-400" },
  { id: "craftsperson", label: "Craftsperson", emoji: "🛠️", desc: "Tools, materials, technique", color: "from-orange-500 to-red-400" },
];

// ═══════════════════════════════════════════════
// 🎯 DIMENSION 2: MISSION MODE — Why they learn
// ═══════════════════════════════════════════════
export const MISSION_MODES: MissionOption[] = [
  { id: "job", label: "My Job", emoji: "🏢", desc: "Use agents in my current role", color: "from-amber-500 to-orange-400" },
  { id: "future", label: "Future-Proof", emoji: "🛡️", desc: "Don't get left behind", color: "from-violet-500 to-purple-400" },
  { id: "skill", label: "Skill Up", emoji: "📈", desc: "Get technically strong", color: "from-blue-500 to-cyan-400" },
  { id: "earn", label: "Money Moves", emoji: "💰", desc: "Build income with agents", color: "from-emerald-500 to-green-400" },
  { id: "build", label: "Build Stuff", emoji: "🛠️", desc: "Ship real projects", color: "from-pink-500 to-rose-400" },
  { id: "easier", label: "Go Easier", emoji: "🌊", desc: "Make daily life smoother", color: "from-sky-400 to-blue-300" },
  { id: "explore", label: "Just Vibing", emoji: "🌀", desc: "Curious, no pressure", color: "from-indigo-400 to-violet-300" },
  { id: "impress", label: "Impress Mode", emoji: "✨", desc: "Sound smart in meetings", color: "from-rose-500 to-pink-400" },
  { id: "interview", label: "Interview Prep", emoji: "🎤", desc: "Land an AI/agents job", color: "from-teal-500 to-emerald-400" },
  { id: "switch", label: "Career Switch", emoji: "🔄", desc: "Pivot into AI", color: "from-orange-500 to-amber-400" },
  { id: "curiosity", label: "Curiosity Only", emoji: "🧠", desc: "Just wanna understand", color: "from-purple-400 to-indigo-300" },
  { id: "academic", label: "Academic / Research", emoji: "🎓", desc: "Papers, thesis, citations", color: "from-slate-500 to-gray-400" },
  { id: "startup", label: "Launch a Startup", emoji: "🚀", desc: "Build a company with agents", color: "from-red-500 to-pink-400" },
  { id: "hackathon", label: "Win a Hackathon", emoji: "🏆", desc: "Time-pressured build", color: "from-yellow-500 to-amber-400" },
  { id: "teach", label: "Teach Others", emoji: "👨‍🏫", desc: "Pass it on to others", color: "from-green-500 to-teal-400" },
  { id: "audit", label: "Audit & Govern", emoji: "🛡️", desc: "Risk, compliance, safety", color: "from-gray-500 to-slate-400" },
];

// ═══════════════════════════════════════════════
// 🎨 DIMENSION 3: TEACHING VIBE — How AGNI teaches
// ═══════════════════════════════════════════════

// Style vibes
export const TEACHING_VIBES: VibeOption[] = [
  { id: "fun", label: "Fun & Memes", emoji: "😂", desc: "Jokes, pop refs, light roasting", color: "from-pink-500 to-rose-400" },
  { id: "story", label: "Story-Driven", emoji: "📖", desc: "Characters, conflict, resolution", color: "from-purple-500 to-violet-400" },
  { id: "visual", label: "Visual", emoji: "🎨", desc: "ASCII diagrams, \"picture this\"", color: "from-teal-500 to-emerald-400" },
  { id: "podcast", label: "Podcast", emoji: "🎙️", desc: "Lex Fridman meets MKBHD", color: "from-violet-500 to-fuchsia-400" },
  { id: "lab", label: "Lab Notebook", emoji: "🧪", desc: "Hypothesis → experiment → result", color: "from-blue-500 to-cyan-400" },
  { id: "sensei", label: "Sensei", emoji: "🥋", desc: "Karate Kid energy, discipline", color: "from-amber-500 to-yellow-400" },
  { id: "boardroom", label: "Boardroom", emoji: "💼", desc: "Executive summary, ROI-focused", color: "from-slate-500 to-gray-400" },
  { id: "gamified", label: "Game Mode", emoji: "🎮", desc: "XP, levels, side quests, boss battles", color: "from-indigo-500 to-blue-400" },
  { id: "hype", label: "Hype Mode", emoji: "🚀", desc: "High energy, powerful exclamation", color: "from-red-500 to-orange-400" },
  { id: "news", label: "News Anchor", emoji: "📰", desc: "Breaking news framing", color: "from-sky-500 to-blue-400" },
  { id: "wizard", label: "Wizard", emoji: "🧙", desc: "Mysterious, concepts as spells", color: "from-purple-600 to-indigo-500" },
  { id: "facts", label: "Just the Facts", emoji: "🤖", desc: "Dry technical, fastest info transfer", color: "from-gray-500 to-slate-400" },
];

// Universe vibes — teach through a world
export const UNIVERSE_VIBE_CATEGORIES = [
  { id: "movies", label: "Movies", emoji: "🎬", examples: ["Inception", "Interstellar", "The Matrix", "Avengers", "Iron Man", "Dune"] },
  { id: "tv", label: "TV / Web Series", emoji: "📺", examples: ["Breaking Bad", "Better Call Saul", "Mr. Robot", "Silicon Valley", "The Office"] },
  { id: "anime", label: "Anime", emoji: "🎌", examples: ["Dragon Ball", "Naruto", "One Piece", "Death Note", "Attack on Titan", "JJK", "Demon Slayer"] },
  { id: "books", label: "Books", emoji: "📚", examples: ["Harry Potter", "LOTR", "Foundation", "Hitchhiker's Guide"] },
  { id: "games", label: "Games", emoji: "🎮", examples: ["Witcher", "GTA", "Elden Ring", "Minecraft", "Zelda", "Pokemon"] },
  { id: "music", label: "Music / Artists", emoji: "🎵", examples: ["Kendrick", "Taylor Swift", "Beatles", "BTS", "A.R. Rahman"] },
  { id: "characters", label: "Specific Characters", emoji: "🦸", examples: ["Goku", "Tony Stark", "Sherlock", "Walter White", "Batman", "Geralt"] },
  { id: "bollywood", label: "Bollywood / Indian", emoji: "🇮🇳", examples: ["3 Idiots", "Sacred Games", "Kota Factory", "Scam 1992"] },
  { id: "directors", label: "Directors / Style", emoji: "🎬", examples: ["Tarantino dialogue", "Nolan structure", "Anurag Kashyap raw"] },
];

// ═══════════════════════════════════════════════
// 🧠 DIMENSION 4: BRAIN LEVEL — How deep
// ═══════════════════════════════════════════════

// Classroom track (formerly Academic)
export const BRAIN_LEVELS_ACADEMIC: BrainLevel[] = [
  { id: "class5", label: "Class 5 Student", emoji: "👶", desc: "ELI5 — pure analogies, zero jargon, like explaining to a friend", color: "from-green-300 to-emerald-200" },
  { id: "class8", label: "Class 8 Student", emoji: "🎒", desc: "Simple words, real-world examples, gentle intro to terms", color: "from-green-400 to-emerald-300" },
  { id: "class10", label: "Class 10 Student", emoji: "📓", desc: "Clear definitions + diagrams, exam-style clarity", color: "from-blue-400 to-cyan-300" },
  { id: "class12", label: "Class 12 Student", emoji: "📖", desc: "Abstract thinking, connects dots across topics", color: "from-blue-500 to-indigo-400" },
  { id: "college_fresh", label: "College Freshman", emoji: "🎓", desc: "Building intuition, first principles + light math", color: "from-indigo-400 to-violet-300" },
  { id: "college_senior", label: "College Senior", emoji: "🎓", desc: "Technical depth, interview & placement ready", color: "from-violet-500 to-purple-400" },
  { id: "masters", label: "Master's / PhD", emoji: "🎓", desc: "Research-grade depth, papers & formal proofs", color: "from-purple-500 to-pink-400" },
  { id: "uni_professor", label: "University Professor", emoji: "🏫", desc: "Full landscape — alternatives, trade-offs, open questions", color: "from-slate-500 to-gray-400" },
];

// Skill track
export const BRAIN_LEVELS_SKILL: BrainLevel[] = [
  { id: "sprout", label: "Sprout", emoji: "🌱", desc: "Brand new — never coded, no worries, we start from zero", color: "from-green-400 to-emerald-300" },
  { id: "chill", label: "Chill", emoji: "🌊", desc: "Curious but non-technical — just vibes & concepts", color: "from-sky-400 to-blue-300" },
  { id: "explorer", label: "Explorer", emoji: "🗺️", desc: "Some tech background — knows basics, wants more", color: "from-blue-400 to-cyan-300" },
  { id: "builder", label: "Builder", emoji: "🛠️", desc: "Can code — wants to ship real projects fast", color: "from-amber-500 to-yellow-400" },
  { id: "pro", label: "Pro", emoji: "⚡", desc: "Working dev — production code, best practices", color: "from-purple-500 to-violet-400" },
  { id: "hacker", label: "Hacker", emoji: "🥷", desc: "Edge cases, undocumented tricks, breaking limits", color: "from-emerald-500 to-teal-400" },
  { id: "scientist", label: "Scientist", emoji: "🔬", desc: "The why behind everything — papers, math, ablations", color: "from-pink-500 to-rose-400" },
  { id: "professor", label: "Professor", emoji: "🎓", desc: "Full theory — citations, history, pedagogy", color: "from-slate-500 to-gray-400" },
  { id: "architect_brain", label: "Architect", emoji: "🏛️", desc: "System design — scaling, topology, trade-offs", color: "from-indigo-500 to-blue-400" },
  { id: "researcher", label: "Researcher", emoji: "🧠", desc: "Frontier-pushing — open problems, novel approaches", color: "from-violet-600 to-purple-500" },
  { id: "demon", label: "Demon Mode", emoji: "👹", desc: "Brutal pace, no hand-holding, pure challenge", color: "from-red-600 to-rose-500" },
];

// Combined for backward compat
export const BRAIN_LEVELS: BrainLevel[] = [...BRAIN_LEVELS_SKILL];

// ═══════════════════════════════════════════════
// 💡 EXPLAIN STYLES — How to explain things
// ═══════════════════════════════════════════════
export interface ExplainStyle {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  prompt: string;
  color: string;
  isCustom?: boolean;
}

export const EXPLAIN_STYLES: ExplainStyle[] = [
  { id: "simple", label: "Simple", emoji: "🧸", desc: "ELI5 — no jargon", prompt: "Explain this in the simplest possible terms, like I'm 5 years old. No jargon.", color: "from-green-400 to-emerald-300" },
  { id: "fun", label: "Fun & Quirky", emoji: "🎉", desc: "Jokes, memes, pop refs", prompt: "Explain this in a fun, quirky way with jokes, memes, or pop culture references.", color: "from-pink-500 to-rose-400" },
  { id: "examples", label: "With Examples", emoji: "📦", desc: "Concrete examples first", prompt: "Explain using 3 concrete, real-world examples. Examples first, theory after.", color: "from-blue-500 to-cyan-400" },
  { id: "realworld", label: "Real World", emoji: "🌍", desc: "Industry use cases", prompt: "Explain with real-world industry use cases — how companies actually use this today.", color: "from-emerald-500 to-green-400" },
  { id: "analogy", label: "Analogy", emoji: "🪞", desc: "Compare to everyday things", prompt: "Explain using vivid analogies from everyday life — cooking, sports, driving, etc.", color: "from-amber-500 to-yellow-400" },
  { id: "visual", label: "Visual / Diagram", emoji: "🎨", desc: "ASCII art & diagrams", prompt: "Explain visually with ASCII diagrams, flowcharts, or 'picture this' descriptions.", color: "from-teal-500 to-emerald-400" },
  { id: "story", label: "Story Mode", emoji: "📖", desc: "Narrative with characters", prompt: "Explain as a short story with characters, conflict, and resolution.", color: "from-purple-500 to-violet-400" },
  { id: "compare", label: "Compare", emoji: "⚖️", desc: "A vs B breakdown", prompt: "Compare this to similar concepts — show pros/cons, similarities, differences in a table.", color: "from-indigo-500 to-blue-400" },
  { id: "code", label: "Show Code", emoji: "💻", desc: "Working code snippet", prompt: "Show me a working code example with comments explaining each part.", color: "from-sky-500 to-cyan-400" },
  { id: "step", label: "Step by Step", emoji: "🪜", desc: "Numbered walkthrough", prompt: "Break this down step by step — numbered, clear, one concept per step.", color: "from-orange-500 to-amber-400" },
  { id: "debate", label: "Pros & Cons", emoji: "🤔", desc: "Argue both sides", prompt: "Present the pros and cons of this — argue both sides fairly.", color: "from-rose-500 to-pink-400" },
  { id: "quiz", label: "Quiz Me", emoji: "❓", desc: "Test my understanding", prompt: "Don't explain — quiz me on this topic with 3 questions to test my understanding.", color: "from-violet-500 to-purple-400" },
  { id: "tldr", label: "TL;DR", emoji: "⚡", desc: "3-line summary", prompt: "Give me a 3-line TL;DR — the absolute essence, nothing extra.", color: "from-red-500 to-orange-400" },
  { id: "metaphor", label: "Metaphor", emoji: "🎭", desc: "Deep metaphor", prompt: "Explain using one powerful, extended metaphor that makes the concept click.", color: "from-fuchsia-500 to-pink-400" },
  { id: "timeline", label: "Timeline", emoji: "📅", desc: "Historical evolution", prompt: "Explain the history and evolution of this concept — when it emerged, key milestones.", color: "from-slate-500 to-gray-400" },
  { id: "wrong", label: "Common Mistakes", emoji: "🚫", desc: "What NOT to do", prompt: "What are the most common mistakes and misconceptions about this? Tell me what NOT to do.", color: "from-red-600 to-rose-500" },
];

const EXPLAIN_STYLES_STORAGE_KEY = "explain_styles_custom";
const EXPLAIN_STYLES_ACTIVE_KEY = "explain_styles_active";

export function getCustomExplainStyles(): ExplainStyle[] {
  try {
    const raw = localStorage.getItem(EXPLAIN_STYLES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveCustomExplainStyle(style: { label: string; desc: string; prompt: string; emoji?: string }): ExplainStyle {
  const id = `explain_custom_${Date.now()}`;
  const custom: ExplainStyle = {
    id, label: style.label, emoji: style.emoji || "✨",
    desc: style.desc, prompt: style.prompt,
    color: "from-agni-purple to-agni-pink", isCustom: true,
  };
  const existing = getCustomExplainStyles();
  existing.push(custom);
  localStorage.setItem(EXPLAIN_STYLES_STORAGE_KEY, JSON.stringify(existing));
  return custom;
}

export function removeCustomExplainStyle(id: string) {
  const existing = getCustomExplainStyles().filter(s => s.id !== id);
  localStorage.setItem(EXPLAIN_STYLES_STORAGE_KEY, JSON.stringify(existing));
}

export function getAllExplainStyles(): ExplainStyle[] {
  return [...EXPLAIN_STYLES, ...getCustomExplainStyles()];
}

export function getActiveExplainStyleIds(): string[] {
  try {
    const raw = localStorage.getItem(EXPLAIN_STYLES_ACTIVE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default: first 6
  return EXPLAIN_STYLES.slice(0, 6).map(s => s.id);
}

export function setActiveExplainStyleIds(ids: string[]) {
  localStorage.setItem(EXPLAIN_STYLES_ACTIVE_KEY, JSON.stringify(ids));
}

export function getActiveExplainStyles(): ExplainStyle[] {
  const ids = getActiveExplainStyleIds();
  const all = getAllExplainStyles();
  return ids.map(id => all.find(s => s.id === id)).filter(Boolean) as ExplainStyle[];
}

// ═══════════════════════════════════════════════
// ❓ QUIZ DIFFICULTIES — 10 levels from easy to impossible
// ═══════════════════════════════════════════════
export interface QuizDifficulty {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  color: string;
  promptModifier: string;
}

export const QUIZ_DIFFICULTIES: QuizDifficulty[] = [
  { id: "warmup", label: "Warm Up", emoji: "☀️", desc: "True/false, recall", color: "from-green-300 to-emerald-200", promptModifier: "Make it extremely easy — simple true/false or basic recall questions. A complete beginner should get 100%." },
  { id: "easy", label: "Easy", emoji: "🌱", desc: "Basic concepts", color: "from-green-400 to-emerald-300", promptModifier: "Keep it easy — basic concept checks, straightforward multiple choice." },
  { id: "chill", label: "Chill", emoji: "🌊", desc: "Gentle challenge", color: "from-sky-400 to-blue-300", promptModifier: "Gentle challenge — slightly tricky but fair, requires understanding not just memory." },
  { id: "medium", label: "Medium", emoji: "⚡", desc: "Solid understanding", color: "from-blue-500 to-cyan-400", promptModifier: "Medium difficulty — requires solid understanding, some application questions." },
  { id: "tricky", label: "Tricky", emoji: "🧩", desc: "Think carefully", color: "from-amber-500 to-yellow-400", promptModifier: "Tricky questions — requires careful thinking, edge cases, and connecting multiple concepts." },
  { id: "hard", label: "Hard", emoji: "🔥", desc: "Deep knowledge", color: "from-orange-500 to-amber-400", promptModifier: "Hard difficulty — deep knowledge required, multi-step reasoning, real-world scenarios." },
  { id: "expert", label: "Expert", emoji: "💎", desc: "Production-level", color: "from-purple-500 to-violet-400", promptModifier: "Expert level — production-grade scenarios, architectural decisions, trade-off analysis." },
  { id: "brutal", label: "Brutal", emoji: "💀", desc: "No mercy", color: "from-red-500 to-rose-400", promptModifier: "Brutal difficulty — trick questions, subtle gotchas, requires intimate knowledge of internals." },
  { id: "nightmare", label: "Nightmare", emoji: "👹", desc: "Top 1% only", color: "from-red-600 to-rose-500", promptModifier: "Nightmare mode — only top 1% would pass. Research-level depth, obscure edge cases, multi-domain reasoning." },
  { id: "impossible", label: "Impossible", emoji: "☠️", desc: "Are you sure?", color: "from-gray-800 to-gray-600", promptModifier: "Impossible difficulty — questions even experts would struggle with. Frontier knowledge, unsolved problems, deliberate ambiguity." },
];

export function getQuizDifficultyPrompt(id: string): string {
  return QUIZ_DIFFICULTIES.find(q => q.id === id)?.promptModifier || QUIZ_DIFFICULTIES[3].promptModifier;
}

// ─── CUSTOM OPTIONS STORAGE ───
const CUSTOM_STORAGE_KEY = "teaching_custom_options";

export function getCustomOptions(categoryId: string): CustomTeachingOption[] {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, CustomTeachingOption[]>;
    return all[categoryId] || [];
  } catch { return []; }
}

export function saveCustomOption(categoryId: string, option: { label: string; desc: string; emoji?: string }): CustomTeachingOption {
  const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const customOpt: CustomTeachingOption = {
    id,
    label: option.label,
    emoji: option.emoji || "✨",
    desc: option.desc,
    color: "from-agni-purple to-agni-pink",
    isCustom: true,
  };

  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    const all = raw ? JSON.parse(raw) as Record<string, CustomTeachingOption[]> : {};
    if (!all[categoryId]) all[categoryId] = [];
    all[categoryId].push(customOpt);
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("storage"));
  } catch { /* ignore */ }

  return customOpt;
}

export function removeCustomOption(categoryId: string, optionId: string) {
  try {
    const raw = localStorage.getItem(CUSTOM_STORAGE_KEY);
    if (!raw) return;
    const all = JSON.parse(raw) as Record<string, CustomTeachingOption[]>;
    if (!all[categoryId]) return;
    all[categoryId] = all[categoryId].filter(o => o.id !== optionId);
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("storage"));
  } catch { /* ignore */ }
}

/** Get all options (built-in + custom) for a category */
export function getAllOptions(categoryId: string): TeachingOption[] {
  const cat = TEACHING_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return [];
  const customs = getCustomOptions(categoryId);
  return [...cat.options, ...customs];
}

// ─── CATEGORY METADATA ───
export const TEACHING_CATEGORIES = [
  {
    id: "identity",
    label: "🪪 Identity",
    funName: "Identity",
    desc: "Who are you in real life?",
    storageKey: "teaching_identity",
    options: IDENTITIES as TeachingOption[],
    defaultId: "student",
  },
  {
    id: "mission",
    label: "🎯 Mission Mode",
    funName: "Mission Mode",
    desc: "Why are you learning this?",
    storageKey: "teaching_mission",
    options: MISSION_MODES as TeachingOption[],
    defaultId: "explore",
  },
  {
    id: "vibe",
    label: "🎨 Teaching Vibe",
    funName: "Teaching Vibe",
    desc: "How should AGNI teach you?",
    storageKey: "teaching_vibe",
    options: TEACHING_VIBES as TeachingOption[],
    defaultId: "fun",
  },
  {
    id: "brain",
    label: "🧠 Brain Level",
    funName: "Brain Level",
    desc: "How deep should we go?",
    storageKey: "teaching_brain",
    options: BRAIN_LEVELS as TeachingOption[],
    defaultId: "explorer",
  },
] as const;

// ─── Helpers ───
export function getTeachingSelection(categoryId: string): string {
  const cat = TEACHING_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return "";
  return localStorage.getItem(cat.storageKey) || "";
}

export function setTeachingSelection(categoryId: string, value: string) {
  const cat = TEACHING_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return;
  localStorage.setItem(cat.storageKey, value);
  window.dispatchEvent(new Event("storage"));
}

export function getTeachingLabel(categoryId: string): { label: string; emoji: string; desc?: string } | null {
  const cat = TEACHING_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return null;
  const val = getTeachingSelection(categoryId);
  const opt = cat.options.find((o: any) => o.id === val);
  if (opt) return { label: opt.label, emoji: opt.emoji, desc: opt.desc };
  if (!val) return null;
  const customs = getCustomOptions(categoryId);
  const custom = customs.find(c => c.id === val);
  if (custom) return { label: custom.label, emoji: custom.emoji, desc: custom.desc };
  return { label: val, emoji: "✨", desc: "" };
}

/** Build a context string for AI prompts based on all 4 selections */
export function getTeachingContext(): string {
  const parts: string[] = [];
  for (const cat of TEACHING_CATEGORIES) {
    const label = getTeachingLabel(cat.id);
    if (label) {
      parts.push(`${cat.funName}: ${label.label}${label.desc ? ` (${label.desc})` : ""}`);
    }
  }
  // Also check for universe vibe
  const universeVibe = localStorage.getItem("teaching_universe_vibe");
  if (universeVibe) {
    parts.push(`Universe Vibe: ${universeVibe} (Teach through this world — use characters, plot moments, vocabulary from this universe)`);
  }
  return parts.join(". ");
}

/** Get/set universe vibe (e.g. "Goku", "Naruto", "The Matrix") */
export function getUniverseVibe(): string | null {
  return localStorage.getItem("teaching_universe_vibe");
}

export function setUniverseVibe(vibe: string | null) {
  if (vibe) {
    localStorage.setItem("teaching_universe_vibe", vibe);
  } else {
    localStorage.removeItem("teaching_universe_vibe");
  }
  window.dispatchEvent(new Event("storage"));
}

/** Get brain level track preference */
export function getBrainTrack(): "skill" | "academic" {
  return (localStorage.getItem("teaching_brain_track") as "skill" | "academic") || "skill";
}

export function setBrainTrack(track: "skill" | "academic") {
  localStorage.setItem("teaching_brain_track", track);
  window.dispatchEvent(new Event("storage"));
}

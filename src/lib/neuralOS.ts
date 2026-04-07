/**
 * 🧠 NEURAL OS — SARAS ENGINE (v2)
 * 
 * The mascot's adaptive teaching brain.
 * 
 * Three layers from Neural OS architecture:
 *   - VIDYA   → Knowledge (what they know / want to know)
 *   - ROOPA   → Adaptive form (HOW to teach — personalized to user)
 *   - UTSARGA → Expansion (related rabbit holes)
 * 
 * v2 adds: Twitter-style suggestion catalogs across categories.
 */

const PERSONA_KEY = "neuralos_persona_v2";

export interface NeuralOSPersona {
  // VIDYA — what they know / want
  goal?: string;
  experience?: string;
  name?: string;

  // 🆕 WORK CONTEXT — for future-application quiz questions
  currentCompany?: string;          // "HCL", "TCS", "freelance", etc.
  currentRole?: string;             // "PM", "Engineer", "Founder", etc.
  dailyWork?: string;               // What does their day look like

  // ROOPA — how to teach them
  vibe?: string;                    // "fun" | "story" | "serious" | "fast"
  shows?: string[];                 // Movies/TV/anime they love
  sports?: string[];                // Sports/teams/players
  music?: string[];                 // Music/artists/genres
  gaming?: string[];                // Games they play
  news?: string[];                  // News sources / Twitter follows
  hobbies?: string[];               // Hobbies / interests
  books?: string[];                 // Books/authors

  // UTSARGA — what they want to explore
  curious?: string[];

  // 🆕 ADAPTIVE STATE — track confusion / mastery
  confusionLevel?: number;          // 0 = clear, increases with confusion signals
  preferredDepth?: "basic" | "normal" | "deep";

  // Meta
  completedAt?: string;
  version: number;
}

const DEFAULT_PERSONA: NeuralOSPersona = { version: 2 };

export const getPersona = (): NeuralOSPersona => {
  try {
    const stored = localStorage.getItem(PERSONA_KEY);
    if (stored) return { ...DEFAULT_PERSONA, ...JSON.parse(stored) };
  } catch {}
  return DEFAULT_PERSONA;
};

export const savePersona = (persona: Partial<NeuralOSPersona>) => {
  const current = getPersona();
  const updated = { ...current, ...persona, version: 2 };
  localStorage.setItem(PERSONA_KEY, JSON.stringify(updated));
  return updated;
};

export const hasPersona = (): boolean => {
  return Boolean(getPersona().completedAt);
};

export const clearPersona = () => {
  localStorage.removeItem(PERSONA_KEY);
};

/* ============================================================
 * 🌍 SUGGESTION CATALOGS — Twitter-style onboarding suggestions
 * Users tap to add. Can also search and add custom.
 * ============================================================ */

export interface SuggestionCategory {
  id: string;
  label: string;
  emoji: string;
  description: string;
  field: keyof NeuralOSPersona;
  suggestions: { name: string; tag?: string; emoji?: string }[];
}

export const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    id: "shows",
    label: "Shows & Movies",
    emoji: "🎬",
    description: "Pick shows you love — I'll use them as analogies",
    field: "shows",
    suggestions: [
      { name: "Silicon Valley", tag: "Tech comedy", emoji: "💻" },
      { name: "Mr. Robot", tag: "Hacker drama", emoji: "🖥️" },
      { name: "Money Heist", tag: "Heist thriller", emoji: "🎭" },
      { name: "Breaking Bad", tag: "Crime drama", emoji: "⚗️" },
      { name: "Game of Thrones", tag: "Fantasy", emoji: "🐉" },
      { name: "Stranger Things", tag: "Sci-fi", emoji: "👾" },
      { name: "The Office", tag: "Comedy", emoji: "📎" },
      { name: "Sherlock", tag: "Detective", emoji: "🔍" },
      { name: "Westworld", tag: "Sci-fi", emoji: "🤖" },
      { name: "Peaky Blinders", tag: "Period drama", emoji: "🎩" },
      { name: "Squid Game", tag: "Thriller", emoji: "🦑" },
      { name: "Dark", tag: "Mystery sci-fi", emoji: "🕳️" },
      { name: "Inception", tag: "Mind-bender", emoji: "🌀" },
      { name: "Interstellar", tag: "Space epic", emoji: "🚀" },
      { name: "The Matrix", tag: "Cyberpunk", emoji: "💊" },
      { name: "Ex Machina", tag: "AI thriller", emoji: "🤖" },
      { name: "The Social Network", tag: "Startup", emoji: "📱" },
      { name: "The Big Short", tag: "Finance", emoji: "📉" },
      { name: "Suits", tag: "Legal drama", emoji: "⚖️" },
      { name: "Succession", tag: "Corporate", emoji: "👔" },
      { name: "Black Mirror", tag: "Dystopian", emoji: "📺" },
      { name: "The Wire", tag: "Crime epic", emoji: "📞" },
      { name: "Ted Lasso", tag: "Feel-good", emoji: "⚽" },
      { name: "Naruto", tag: "Anime", emoji: "🍥" },
      { name: "Attack on Titan", tag: "Anime", emoji: "⚔️" },
      { name: "Death Note", tag: "Anime", emoji: "📓" },
      { name: "One Piece", tag: "Anime", emoji: "🏴‍☠️" },
      { name: "Demon Slayer", tag: "Anime", emoji: "🗡️" },
      { name: "Jujutsu Kaisen", tag: "Anime", emoji: "👁️" },
      { name: "Bleach", tag: "Anime", emoji: "⚔️" },
      { name: "Hunter x Hunter", tag: "Anime", emoji: "🎯" },
      { name: "Steins;Gate", tag: "Anime sci-fi", emoji: "⏱️" },
      { name: "Cowboy Bebop", tag: "Classic anime", emoji: "🎷" },
      { name: "3 Idiots", tag: "Bollywood", emoji: "🎓" },
      { name: "Sacred Games", tag: "Indian thriller", emoji: "🇮🇳" },
      { name: "Scam 1992", tag: "Indian drama", emoji: "💰" },
      { name: "Family Man", tag: "Indian thriller", emoji: "🕵️" },
      { name: "Mirzapur", tag: "Indian crime", emoji: "🔫" },
      { name: "Panchayat", tag: "Indian comedy", emoji: "🏘️" },
    ],
  },
  {
    id: "sports",
    label: "Sports & Athletes",
    emoji: "⚽",
    description: "Your favorite sports — for stadium-sized analogies",
    field: "sports",
    suggestions: [
      { name: "Cricket", emoji: "🏏" },
      { name: "Virat Kohli", tag: "Cricket", emoji: "🏏" },
      { name: "MS Dhoni", tag: "Cricket", emoji: "🧤" },
      { name: "Rohit Sharma", tag: "Cricket", emoji: "🏏" },
      { name: "Sachin Tendulkar", tag: "Legend", emoji: "🐐" },
      { name: "Rishabh Pant", tag: "Cricket", emoji: "🏏" },
      { name: "IPL", tag: "T20 League", emoji: "🏆" },
      { name: "RCB", tag: "IPL team", emoji: "🦁" },
      { name: "CSK", tag: "IPL team", emoji: "🦁" },
      { name: "MI", tag: "IPL team", emoji: "🔵" },
      { name: "Football", emoji: "⚽" },
      { name: "Lionel Messi", tag: "Football", emoji: "🐐" },
      { name: "Cristiano Ronaldo", tag: "Football", emoji: "⚽" },
      { name: "Real Madrid", tag: "Club", emoji: "👑" },
      { name: "Barcelona", tag: "Club", emoji: "🔴" },
      { name: "Manchester United", tag: "Club", emoji: "🔴" },
      { name: "FC Bayern", tag: "Club", emoji: "🔴" },
      { name: "F1", emoji: "🏎️" },
      { name: "Max Verstappen", tag: "F1", emoji: "🏁" },
      { name: "Lewis Hamilton", tag: "F1", emoji: "🏎️" },
      { name: "Ferrari", tag: "F1 team", emoji: "🐎" },
      { name: "NBA", emoji: "🏀" },
      { name: "LeBron James", tag: "NBA", emoji: "👑" },
      { name: "Stephen Curry", tag: "NBA", emoji: "🎯" },
      { name: "Tennis", emoji: "🎾" },
      { name: "Novak Djokovic", tag: "Tennis", emoji: "🎾" },
      { name: "Rafael Nadal", tag: "Tennis", emoji: "💪" },
      { name: "MMA", emoji: "🥊" },
      { name: "UFC", emoji: "🥋" },
      { name: "Chess", emoji: "♟️" },
      { name: "Magnus Carlsen", tag: "Chess", emoji: "♛" },
      { name: "Gukesh", tag: "Chess", emoji: "🇮🇳" },
    ],
  },
  {
    id: "music",
    label: "Music",
    emoji: "🎵",
    description: "Tunes you vibe with",
    field: "music",
    suggestions: [
      { name: "Arijit Singh", tag: "Bollywood", emoji: "🎤" },
      { name: "A.R. Rahman", tag: "Composer", emoji: "🎹" },
      { name: "Diljit Dosanjh", tag: "Punjabi", emoji: "🎤" },
      { name: "Pritam", tag: "Bollywood", emoji: "🎼" },
      { name: "Coldplay", tag: "Rock", emoji: "⭐" },
      { name: "Taylor Swift", tag: "Pop", emoji: "💫" },
      { name: "The Weeknd", tag: "R&B", emoji: "🌃" },
      { name: "Ed Sheeran", tag: "Pop", emoji: "🎸" },
      { name: "Drake", tag: "Hip hop", emoji: "🦉" },
      { name: "Kendrick Lamar", tag: "Hip hop", emoji: "🎤" },
      { name: "Imagine Dragons", tag: "Rock", emoji: "🐉" },
      { name: "Linkin Park", tag: "Rock", emoji: "🎸" },
      { name: "BTS", tag: "K-Pop", emoji: "💜" },
      { name: "Travis Scott", tag: "Hip hop", emoji: "🌵" },
      { name: "Eminem", tag: "Hip hop", emoji: "🎤" },
      { name: "Hans Zimmer", tag: "Composer", emoji: "🎻" },
      { name: "Lo-fi beats", tag: "Chill", emoji: "🎧" },
      { name: "Classical", tag: "Orchestral", emoji: "🎻" },
      { name: "EDM", tag: "Electronic", emoji: "🎛️" },
      { name: "Jazz", tag: "Smooth", emoji: "🎷" },
    ],
  },
  {
    id: "gaming",
    label: "Gaming",
    emoji: "🎮",
    description: "Games you play (or watch)",
    field: "gaming",
    suggestions: [
      { name: "Valorant", tag: "FPS", emoji: "🎯" },
      { name: "CS:GO", tag: "FPS", emoji: "💥" },
      { name: "BGMI", tag: "Battle royale", emoji: "🪂" },
      { name: "Call of Duty", tag: "FPS", emoji: "🔫" },
      { name: "Fortnite", tag: "Battle royale", emoji: "🌀" },
      { name: "Minecraft", tag: "Sandbox", emoji: "⛏️" },
      { name: "GTA", tag: "Open world", emoji: "🚗" },
      { name: "Red Dead Redemption", tag: "Open world", emoji: "🤠" },
      { name: "The Witcher 3", tag: "RPG", emoji: "⚔️" },
      { name: "Elden Ring", tag: "Souls-like", emoji: "🌳" },
      { name: "Cyberpunk 2077", tag: "RPG", emoji: "🌃" },
      { name: "League of Legends", tag: "MOBA", emoji: "⚔️" },
      { name: "Dota 2", tag: "MOBA", emoji: "🛡️" },
      { name: "Genshin Impact", tag: "RPG", emoji: "✨" },
      { name: "Hollow Knight", tag: "Indie", emoji: "🪲" },
      { name: "Hades", tag: "Roguelike", emoji: "🔥" },
      { name: "Stardew Valley", tag: "Cozy", emoji: "🌾" },
      { name: "Among Us", tag: "Social", emoji: "🚀" },
      { name: "Chess.com", tag: "Chess", emoji: "♟️" },
      { name: "FIFA / EA FC", tag: "Sports", emoji: "⚽" },
    ],
  },
  {
    id: "news",
    label: "News & Sources",
    emoji: "📰",
    description: "Where you get info — Twitter follows, blogs, podcasts",
    field: "news",
    suggestions: [
      { name: "@elonmusk", tag: "X / Twitter", emoji: "🐦" },
      { name: "@sama", tag: "Sam Altman", emoji: "🐦" },
      { name: "@karpathy", tag: "Andrej Karpathy", emoji: "🐦" },
      { name: "@AndrewYNg", tag: "Andrew Ng", emoji: "🐦" },
      { name: "@ylecun", tag: "Yann LeCun", emoji: "🐦" },
      { name: "@balajis", tag: "Balaji S", emoji: "🐦" },
      { name: "@naval", tag: "Naval", emoji: "🐦" },
      { name: "@paulg", tag: "Paul Graham", emoji: "🐦" },
      { name: "Hacker News", tag: "Tech news", emoji: "🟠" },
      { name: "TechCrunch", tag: "Startup news", emoji: "📱" },
      { name: "The Verge", tag: "Tech", emoji: "📡" },
      { name: "Wired", tag: "Tech", emoji: "🌐" },
      { name: "Bloomberg", tag: "Finance", emoji: "💹" },
      { name: "Reuters", tag: "World news", emoji: "🌍" },
      { name: "The Ken", tag: "India biz", emoji: "🇮🇳" },
      { name: "MoneyControl", tag: "India finance", emoji: "💰" },
      { name: "Inc42", tag: "Indian startup", emoji: "🚀" },
      { name: "Lenny's Newsletter", tag: "PM", emoji: "📬" },
      { name: "Stratechery", tag: "Tech strategy", emoji: "🎯" },
      { name: "The Rundown AI", tag: "AI news", emoji: "🤖" },
      { name: "Ben's Bites", tag: "AI news", emoji: "🍪" },
      { name: "AlphaSignal", tag: "AI research", emoji: "📊" },
      { name: "Latent Space", tag: "AI eng", emoji: "🪐" },
      { name: "Joe Rogan Experience", tag: "Podcast", emoji: "🎙️" },
      { name: "Lex Fridman", tag: "Podcast", emoji: "🎙️" },
      { name: "All-In Podcast", tag: "Tech/biz", emoji: "🎙️" },
      { name: "My First Million", tag: "Startup", emoji: "💰" },
      { name: "Acquired", tag: "Biz history", emoji: "📈" },
    ],
  },
  {
    id: "books",
    label: "Books & Authors",
    emoji: "📚",
    description: "What you read",
    field: "books",
    suggestions: [
      { name: "Sapiens", tag: "Yuval Noah Harari", emoji: "🧠" },
      { name: "Atomic Habits", tag: "James Clear", emoji: "⚛️" },
      { name: "Zero to One", tag: "Peter Thiel", emoji: "0️⃣" },
      { name: "Hooked", tag: "Nir Eyal", emoji: "🪝" },
      { name: "The Lean Startup", tag: "Eric Ries", emoji: "🚀" },
      { name: "Thinking Fast and Slow", tag: "Kahneman", emoji: "🐢" },
      { name: "The Psychology of Money", tag: "Morgan Housel", emoji: "💰" },
      { name: "Rich Dad Poor Dad", tag: "Kiyosaki", emoji: "💵" },
      { name: "Shoe Dog", tag: "Phil Knight", emoji: "👟" },
      { name: "Steve Jobs", tag: "Walter Isaacson", emoji: "🍎" },
      { name: "Elon Musk", tag: "Walter Isaacson", emoji: "🚀" },
      { name: "1984", tag: "Orwell", emoji: "👁️" },
      { name: "Dune", tag: "Frank Herbert", emoji: "🏜️" },
      { name: "The 3 Body Problem", tag: "Liu Cixin", emoji: "🌌" },
      { name: "Foundation", tag: "Asimov", emoji: "🪐" },
      { name: "Bhagavad Gita", tag: "Wisdom", emoji: "🕉️" },
      { name: "Rumi", tag: "Poetry", emoji: "🌹" },
      { name: "Naval's Almanack", tag: "Wisdom", emoji: "📖" },
      { name: "Manga (any)", tag: "Comics", emoji: "🇯🇵" },
    ],
  },
  {
    id: "hobbies",
    label: "Hobbies & Interests",
    emoji: "✨",
    description: "Things you actually love doing",
    field: "hobbies",
    suggestions: [
      { name: "Trading", emoji: "📈" },
      { name: "Crypto", emoji: "🪙" },
      { name: "Cars", emoji: "🚗" },
      { name: "Photography", emoji: "📸" },
      { name: "Cooking", emoji: "🍳" },
      { name: "Coffee", emoji: "☕" },
      { name: "Chai", emoji: "🍵" },
      { name: "Travel", emoji: "✈️" },
      { name: "Fitness", emoji: "💪" },
      { name: "Yoga", emoji: "🧘" },
      { name: "Running", emoji: "🏃" },
      { name: "Cycling", emoji: "🚴" },
      { name: "Writing", emoji: "✍️" },
      { name: "Drawing", emoji: "🎨" },
      { name: "Music production", emoji: "🎹" },
      { name: "Startups", emoji: "🚀" },
      { name: "Investing", emoji: "💰" },
      { name: "Real estate", emoji: "🏠" },
      { name: "Web3", emoji: "⛓️" },
      { name: "Coding", emoji: "💻" },
      { name: "Open source", emoji: "🔓" },
      { name: "Gardening", emoji: "🌱" },
      { name: "Pets / Dogs", emoji: "🐕" },
      { name: "Panipuri", emoji: "🍡" },
      { name: "Biryani", emoji: "🍛" },
    ],
  },
  {
    id: "curious",
    label: "Curious About",
    emoji: "🔮",
    description: "Topics you want to explore deeper",
    field: "curious",
    suggestions: [
      { name: "AI Safety", emoji: "🛡️" },
      { name: "AGI", emoji: "🧠" },
      { name: "AI Agents", emoji: "🤖" },
      { name: "LLMs", emoji: "💬" },
      { name: "RAG", emoji: "📚" },
      { name: "Prompt engineering", emoji: "✍️" },
      { name: "Multi-agent systems", emoji: "🏢" },
      { name: "Computer use", emoji: "🖱️" },
      { name: "Autonomous agents", emoji: "🚀" },
      { name: "MCP protocol", emoji: "🔌" },
      { name: "Blockchain", emoji: "⛓️" },
      { name: "Web3", emoji: "🌐" },
      { name: "DeFi", emoji: "💱" },
      { name: "Fintech", emoji: "💳" },
      { name: "EdTech", emoji: "🎓" },
      { name: "Healthtech", emoji: "🏥" },
      { name: "Climate tech", emoji: "🌍" },
      { name: "Robotics", emoji: "🦾" },
      { name: "Quantum", emoji: "⚛️" },
      { name: "Neuroscience", emoji: "🧠" },
      { name: "Philosophy", emoji: "🤔" },
      { name: "History of tech", emoji: "📜" },
    ],
  },
];

/* ============================================================
 * 🎨 ROOPA: Personalized prompt builder
 * Weaves persona into every AI tutor call.
 * ============================================================ */

export const buildPersonalizedPrompt = (basePrompt: string): string => {
  const p = getPersona();
  if (!p.completedAt) return basePrompt;

  const parts: string[] = [basePrompt];
  parts.push("\n\n## 🧠 NEURAL OS — STUDENT PERSONA");
  parts.push("Use this to make EVERY response feel personally crafted for them.");

  if (p.goal) parts.push(`- Goal: ${p.goal}`);
  if (p.experience) parts.push(`- Experience: ${p.experience}`);
  if (p.vibe) parts.push(`- Learning vibe: ${p.vibe}`);

  if (p.shows && p.shows.length > 0) {
    parts.push(`- 🎬 Loves: ${p.shows.join(", ")} — pull scenes/characters from these as analogies`);
  }
  if (p.sports && p.sports.length > 0) {
    parts.push(`- ⚽ Sports: ${p.sports.join(", ")} — use sports moments and athletes`);
  }
  if (p.music && p.music.length > 0) {
    parts.push(`- 🎵 Music: ${p.music.join(", ")} — reference songs/artists when fitting`);
  }
  if (p.gaming && p.gaming.length > 0) {
    parts.push(`- 🎮 Games: ${p.gaming.join(", ")} — use game mechanics as metaphors`);
  }
  if (p.news && p.news.length > 0) {
    parts.push(`- 📰 Follows: ${p.news.join(", ")} — reference these voices/sources`);
  }
  if (p.books && p.books.length > 0) {
    parts.push(`- 📚 Reads: ${p.books.join(", ")} — connect ideas to these books`);
  }
  if (p.hobbies && p.hobbies.length > 0) {
    parts.push(`- ✨ Hobbies: ${p.hobbies.join(", ")} — weave these into examples`);
  }
  if (p.curious && p.curious.length > 0) {
    parts.push(`- 🔮 Curious about: ${p.curious.join(", ")} — connect lessons to these whenever relevant`);
  }

  // 🆕 WORK CONTEXT — central to all teaching
  if (p.currentCompany || p.currentRole || p.dailyWork) {
    parts.push("\n## 💼 WORK CONTEXT (use this for FUTURE-APPLICATION examples)");
    if (p.currentCompany) parts.push(`- Company: ${p.currentCompany}`);
    if (p.currentRole) parts.push(`- Role: ${p.currentRole}`);
    if (p.dailyWork) parts.push(`- Day-to-day: ${p.dailyWork}`);
    parts.push("CRITICAL: Whenever possible, show how this concept applies to THEIR daily work. Don't say 'in general' — say 'at YOUR company' or 'in YOUR role as X'.");
  }

  parts.push("\n## ROOPA RULES (How to use the persona):");
  parts.push("1. Don't be generic. Make it feel like YOU know this person.");
  parts.push("2. Reference their interests NATURALLY — no forced shoehorning.");
  parts.push("3. Match their vibe: if they like fun, be fun. If serious, be deep.");
  parts.push("4. Pick 1-2 references per response, not all of them at once.");
  parts.push("5. End with a question that ties to their goals or interests.");

  // 🆕 COMPREHENSION CHECKING — every response
  parts.push("\n## 🧠 COMPREHENSION CHECK PROTOCOL (CRITICAL)");
  parts.push("After explaining ANY concept, you MUST end with a comprehension check. Pick ONE:");
  parts.push("  • 'Does that click for you, or should I try a different angle?'");
  parts.push("  • 'Quick check — can you tell me back in your own words what just clicked?'");
  parts.push("  • 'On a scale of 1-5, how clear is this? (1 = lost, 5 = totally got it)'");
  parts.push("  • 'Want to try a tiny example to test it, or should I explain differently?'");
  parts.push("If the user says they don't get it, are confused, or asks 'what?' / 'huh?' / 'I don't understand':");
  parts.push("  → IMMEDIATELY switch tactics. Start over with a simpler analogy.");
  parts.push("  → Use a totally DIFFERENT metaphor (their interests if available).");
  parts.push("  → Break the concept into smaller pieces.");
  parts.push("  → DO NOT just rephrase the same explanation.");

  // 🆕 ADAPTIVE DEPTH
  if (p.confusionLevel && p.confusionLevel >= 2) {
    parts.push("\n⚠️ STUDENT IS CONFUSED — go BACK TO BASICS. Simplest possible language. One concept at a time. Lots of analogies. Short sentences.");
  }
  if (p.preferredDepth === "basic") {
    parts.push("\n⚠️ DEPTH MODE: BASIC. Treat the student like a curious beginner. No jargon.");
  }

  return parts.join("\n");
};

/* ============================================================
 * 🌱 UTSARGA: Smart options chips during lessons
 * Dynamic options that adapt to user persona + lesson topic.
 * ============================================================ */

export interface SmartOption {
  emoji: string;
  label: string;
  prompt: string;
}

export const generateSmartOptions = (lessonTopic: string): SmartOption[] => {
  const p = getPersona();
  const options: SmartOption[] = [];

  // Always available
  options.push({ emoji: "🎯", label: "Make it click", prompt: "I'm not getting it. Explain this in a completely different way using something I already know." });
  options.push({ emoji: "💡", label: "Real example", prompt: "Give me a real-world example from 2026 of how this is used right now." });

  // Personalized based on persona
  if (p.shows && p.shows.length > 0) {
    options.push({ emoji: "🎬", label: `Like ${p.shows[0]}`, prompt: `Explain this using a scene or character from "${p.shows[0]}". Make it memorable.` });
  }
  if (p.sports && p.sports.length > 0) {
    options.push({ emoji: "⚽", label: `${p.sports[0]} analogy`, prompt: `Explain this using ${p.sports[0]} as an analogy.` });
  }
  if (p.gaming && p.gaming.length > 0) {
    options.push({ emoji: "🎮", label: `${p.gaming[0]} style`, prompt: `Explain this using game mechanics from ${p.gaming[0]}.` });
  }
  if (p.hobbies && p.hobbies.length > 0) {
    options.push({ emoji: "✨", label: `${p.hobbies[0]} angle`, prompt: `Connect this concept to ${p.hobbies[0]}.` });
  }
  if (p.vibe === "fun") {
    options.push({ emoji: "😂", label: "Make it fun", prompt: "Explain this in a fun, meme-worthy way. Make me laugh while learning." });
  }
  if (p.vibe === "story") {
    options.push({ emoji: "📖", label: "Tell a story", prompt: "Tell me a 60-second story where this concept is the hero." });
  }
  if (p.experience?.includes("beginner")) {
    options.push({ emoji: "🐣", label: "Even simpler", prompt: "Treat me like a complete beginner. Use the simplest words possible." });
  }
  if (p.experience?.includes("engineer")) {
    options.push({ emoji: "⚙️", label: "Show code", prompt: "Show me production-ready Python code. Include error handling." });
  }

  // Always available — expansion
  options.push({ emoji: "🔗", label: "What's next?", prompt: "What 3 things should I learn AFTER this concept?" });
  options.push({ emoji: "🛠️", label: "Build it", prompt: "Give me a small project I can build TODAY using this. Under 2 hours." });
  options.push({ emoji: "❓", label: "Quiz me", prompt: "Quiz me on this with a hard question. Don't go easy." });

  if (p.goal) {
    options.push({ emoji: "🎯", label: "My goal", prompt: `How does this concept help me with my goal: "${p.goal}"?` });
  }

  return options;
};

/* ============================================================
 * 🎬 VIDYA: Build the opening prompt for a lesson
 * ============================================================ */

export const buildOpeningPrompt = (lessonTopic: string, modePrompt: string): string => {
  const p = getPersona();
  let prompt = `Teach me about: ${lessonTopic}\n\nTeaching style: ${modePrompt}\n\n`;

  if (p.completedAt) {
    prompt += `IMPORTANT: Personalize this for ME using my persona above. Open with a hook tailored to MY interests. `;
    if (p.shows && p.shows.length > 0) {
      prompt += `Bonus if you weave in ${p.shows[0]} naturally. `;
    }
  }

  prompt += `Be engaging. Use examples. End with a question that makes me think.`;
  return prompt;
};

/* ============================================================
 * Helpers for the UI
 * ============================================================ */

export const getPersonaSummary = (): { count: number; topItems: string[] } => {
  const p = getPersona();
  const all: string[] = [];
  if (p.shows) all.push(...p.shows);
  if (p.sports) all.push(...p.sports);
  if (p.gaming) all.push(...p.gaming);
  if (p.music) all.push(...p.music);
  if (p.news) all.push(...p.news);
  if (p.books) all.push(...p.books);
  if (p.hobbies) all.push(...p.hobbies);
  if (p.curious) all.push(...p.curious);
  return { count: all.length, topItems: all.slice(0, 5) };
};

/* ============================================================
 * 🧠 COMPREHENSION DETECTION
 * Scan student messages for confusion signals.
 * ============================================================ */

const CONFUSION_PHRASES = [
  "i don't get it", "i don't understand", "confused", "what?", "huh?",
  "lost", "no idea", "doesn't make sense", "explain again", "i'm lost",
  "what do you mean", "?? ", "wait what", "still don't", "not clear",
  "going over my head", "too complex", "too hard",
];

const CLARITY_PHRASES = [
  "got it", "makes sense", "i understand", "clear now", "i see",
  "ah okay", "ohhh", "right!", "that clicks", "now i get",
];

export const detectComprehension = (message: string): "confused" | "clear" | "neutral" => {
  const m = message.toLowerCase();
  if (CONFUSION_PHRASES.some(p => m.includes(p))) return "confused";
  if (CLARITY_PHRASES.some(p => m.includes(p))) return "clear";
  return "neutral";
};

export const updateComprehension = (signal: "confused" | "clear" | "neutral") => {
  const p = getPersona();
  let level = p.confusionLevel || 0;
  if (signal === "confused") level = Math.min(level + 1, 5);
  if (signal === "clear") level = Math.max(level - 1, 0);
  const newDepth: "basic" | "normal" | "deep" = level >= 2 ? "basic" : level === 0 ? "normal" : "normal";
  savePersona({ confusionLevel: level, preferredDepth: newDepth });
  return level;
};

/* ============================================================
 * 🎯 PRACTICAL QUIZ BUILDER
 * Generates LONG, PRACTICAL quizzes that:
 *  - Use the student's persona (anime, etc.)
 *  - Ask how they would APPLY this in their daily work
 *  - Avoid theoretical multiple choice
 *  - Build remediation prompts when student fails
 * ============================================================ */

export interface PracticalQuizConfig {
  lessonTopic: string;
  lessonInfo: string;
  numQuestions?: number;
}

export const buildQuizPrompt = (cfg: PracticalQuizConfig): string => {
  const p = getPersona();
  const n = cfg.numQuestions || 8;
  const parts: string[] = [];

  parts.push(`Generate a ${n}-question PRACTICAL quiz on this topic: "${cfg.lessonTopic}"`);
  parts.push(`Lesson context: ${cfg.lessonInfo}\n`);

  parts.push("CRITICAL RULES — read carefully:");
  parts.push("1. NO theoretical questions (definitions, terminology, multiple-choice trivia).");
  parts.push("2. EVERY question must be PRACTICAL — scenarios, application, real situations.");
  parts.push("3. At least 3 questions must ask: 'How would you USE this in your daily work?' or 'How would you APPLY this at YOUR company?'");
  parts.push("4. At least 2 questions must use the student's interests as the scenario context.");
  parts.push("5. Mix question types: scenario decision, debug-this, design-this, choose-the-better-approach.");
  parts.push("6. NO trick questions. Each question tests if they can USE the concept, not memorize it.\n");

  if (p.currentCompany || p.dailyWork) {
    parts.push("STUDENT WORK CONTEXT (use this in questions):");
    if (p.currentCompany) parts.push(`- Company: ${p.currentCompany}`);
    if (p.currentRole) parts.push(`- Role: ${p.currentRole}`);
    if (p.dailyWork) parts.push(`- Daily work: ${p.dailyWork}`);
    parts.push("");
  }

  if (p.shows && p.shows.length > 0) {
    parts.push(`STUDENT LOVES: ${p.shows.slice(0, 3).join(", ")} — use these as scenario backdrops in 1-2 questions.`);
  }
  if (p.gaming && p.gaming.length > 0) {
    parts.push(`STUDENT GAMES: ${p.gaming.slice(0, 2).join(", ")} — frame 1 question as a game-mechanics scenario.`);
  }
  if (p.hobbies && p.hobbies.length > 0) {
    parts.push(`STUDENT HOBBIES: ${p.hobbies.slice(0, 3).join(", ")} — use as relatable framing.`);
  }

  parts.push("\nOUTPUT FORMAT — return ONLY a JSON array of question objects, no markdown, no explanation:");
  parts.push(`[
  {
    "type": "scenario" | "application" | "future-use" | "debug" | "design",
    "q": "the full question text — include rich scenario detail",
    "opts": ["option A", "option B", "option C", "option D"],
    "ans": 0,
    "why": "brief explanation of why the correct answer is right",
    "remediate": "if they get this wrong, what concept they need to review"
  }
]`);
  parts.push(`\nGenerate exactly ${n} questions. JSON array only. No text before or after.`);

  return parts.join("\n");
};

export const buildRemediationPrompt = (lessonTopic: string, wrongConcept: string): string => {
  const p = getPersona();
  let prompt = `The student just got a quiz question WRONG. They're struggling with: "${wrongConcept}" inside the topic "${lessonTopic}".\n\n`;
  prompt += `Your job: take them BACK TO BASICS on this specific concept. Don't lecture. Don't repeat the original explanation. Use a brand-new analogy. Be patient and encouraging.\n\n`;
  prompt += `Rules:\n`;
  prompt += `1. Start with: "No worries! Let's break this down differently."\n`;
  prompt += `2. Use the SIMPLEST possible analogy.\n`;
  prompt += `3. Connect it to ONE thing they know (use their interests).\n`;
  prompt += `4. Give a tiny concrete example (2-3 sentences max).\n`;
  prompt += `5. End with: "Ready to try a similar question? Or want me to break it down even more?"\n`;
  if (p.shows && p.shows.length > 0) prompt += `\nBonus: try analogizing using ${p.shows[0]} if it fits naturally.`;
  return prompt;
};

export const resetComprehension = () => {
  savePersona({ confusionLevel: 0, preferredDepth: "normal" });
};


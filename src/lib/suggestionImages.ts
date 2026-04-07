/**
 * 🖼️ Dynamic image resolver for onboarding suggestion pills
 * Uses free image services to get real profile pics / logos
 */

// For Twitter/X handles
function twitterAvatar(handle: string): string {
  return `https://unavatar.io/twitter/${handle.replace("@", "")}`;
}

// For YouTube channels
function youtubeAvatar(name: string): string {
  return `https://unavatar.io/youtube/${encodeURIComponent(name)}`;
}

// For well-known brands/entities — use logo.clearbit.com or unavatar
function domainAvatar(domain: string): string {
  return `https://logo.clearbit.com/${domain}`;
}

// Wikipedia-based fallback using DuckDuckGo instant answer
function searchAvatar(name: string): string {
  return `https://unavatar.io/${encodeURIComponent(name)}`;
}

/**
 * Map of well-known items to their image sources
 * Covers shows, sports, music, games, news, books
 */
const KNOWN_IMAGES: Record<string, string> = {
  // ── Shows & Movies ──
  "Silicon Valley": "https://image.tmdb.org/t/p/w92/dc5r71XI1gD4YwIUoEYCLiVvtss.jpg",
  "Mr. Robot": "https://image.tmdb.org/t/p/w92/oKIBhzZzDX07SoE2bOLhq2EE8rf.jpg",
  "Money Heist": "https://image.tmdb.org/t/p/w92/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",
  "Breaking Bad": "https://image.tmdb.org/t/p/w92/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
  "Game of Thrones": "https://image.tmdb.org/t/p/w92/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
  "Stranger Things": "https://image.tmdb.org/t/p/w92/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
  "The Office": "https://image.tmdb.org/t/p/w92/7DJKHzAi83BmQrWLrYYOqcoKfhR.jpg",
  "Naruto": "https://image.tmdb.org/t/p/w92/xppeysfvDKVx775MFuH8Z9BlKMh.jpg",
  "Attack on Titan": "https://image.tmdb.org/t/p/w92/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
  "Death Note": "https://image.tmdb.org/t/p/w92/iigTJJskR1PcjjXqmqAEDJVgjMO.jpg",
  "One Piece": "https://image.tmdb.org/t/p/w92/cMD9Ygz11zjJzAEruEKWEmrc5XQ.jpg",
  "Demon Slayer": "https://image.tmdb.org/t/p/w92/wrCVHdkBlBWdPhsthiyjRqn3mHr.jpg",
  "Squid Game": "https://image.tmdb.org/t/p/w92/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
  "Black Mirror": "https://image.tmdb.org/t/p/w92/5UaYsGZOFhjFDwQh6GuLjjA1WlF.jpg",
  "Inception": "https://image.tmdb.org/t/p/w92/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
  "Interstellar": "https://image.tmdb.org/t/p/w92/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "The Matrix": "https://image.tmdb.org/t/p/w92/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
  // Indian
  "3 Idiots": "https://image.tmdb.org/t/p/w92/66A9MqXOyVFAhO3POKJht4wD1EO.jpg",
  "Sacred Games": "https://image.tmdb.org/t/p/w92/kqjMpRVHlMhHAEOGBFTm7W3BSB9.jpg",
  "Scam 1992": "https://image.tmdb.org/t/p/w92/79oolMCkFyzPnMHvP7kbcjdGSMX.jpg",
  "Family Man": "https://image.tmdb.org/t/p/w92/2CAL2433ZeIihfX1Hb2139CX0pW.jpg",
  "Mirzapur": "https://image.tmdb.org/t/p/w92/cnzT3fgHZH6piiVqgEKkJtaYYBC.jpg",
  "Panchayat": "https://image.tmdb.org/t/p/w92/AuJz8GXQV3sPjMqNHfiOJp40kq5.jpg",

  // ── Music Artists ──
  "Arijit Singh": twitterAvatar("aaborbarivelli"),
  "A.R. Rahman": twitterAvatar("araborbarivelli"),
  "Coldplay": domainAvatar("coldplay.com"),
  "Taylor Swift": searchAvatar("Taylor Swift"),
  "The Weeknd": searchAvatar("The Weeknd"),
  "Ed Sheeran": searchAvatar("Ed Sheeran"),
  "Drake": searchAvatar("Drake rapper"),
  "BTS": searchAvatar("BTS"),
  "BLACKPINK": searchAvatar("BLACKPINK"),
  "Eminem": searchAvatar("Eminem"),
  "Billie Eilish": searchAvatar("Billie Eilish"),
  "Dua Lipa": searchAvatar("Dua Lipa"),
  "Linkin Park": domainAvatar("linkinpark.com"),
  "Imagine Dragons": searchAvatar("Imagine Dragons"),
  "Hans Zimmer": searchAvatar("Hans Zimmer"),

  // ── Sports ──
  "Virat Kohli": searchAvatar("Virat Kohli"),
  "MS Dhoni": searchAvatar("MS Dhoni"),
  "Lionel Messi": searchAvatar("Lionel Messi"),
  "Cristiano Ronaldo": searchAvatar("Cristiano Ronaldo"),
  "LeBron James": searchAvatar("LeBron James"),
  "Real Madrid": domainAvatar("realmadrid.com"),
  "Barcelona": domainAvatar("fcbarcelona.com"),
  "Manchester United": domainAvatar("manutd.com"),
  "Liverpool": domainAvatar("liverpoolfc.com"),
  "Arsenal": domainAvatar("arsenal.com"),
  "Ferrari": domainAvatar("ferrari.com"),

  // ── Games ──
  "Valorant": domainAvatar("playvalorant.com"),
  "Minecraft": domainAvatar("minecraft.net"),
  "Fortnite": domainAvatar("fortnite.com"),
  "GTA V / GTA Online": domainAvatar("rockstargames.com"),
  "League of Legends": domainAvatar("leagueoflegends.com"),
  "Roblox": domainAvatar("roblox.com"),

  // ── News / Creators ──
  "@elonmusk": twitterAvatar("elonmusk"),
  "@sama": twitterAvatar("sama"),
  "@karpathy": twitterAvatar("karpathy"),
  "@AndrewYNg": twitterAvatar("AndrewYNg"),
  "@ylecun": twitterAvatar("ylecun"),
  "@naval": twitterAvatar("naval"),
  "@paulg": twitterAvatar("paulg"),
  "@balajis": twitterAvatar("balajis"),
  "MrBeast": searchAvatar("MrBeast"),
  "MKBHD": searchAvatar("MKBHD"),
  "Fireship": searchAvatar("Fireship YouTube"),
  "Hacker News": domainAvatar("ycombinator.com"),
  "TechCrunch": domainAvatar("techcrunch.com"),
  "The Verge": domainAvatar("theverge.com"),
  "Wired": domainAvatar("wired.com"),
  "Bloomberg": domainAvatar("bloomberg.com"),
  "Reuters": domainAvatar("reuters.com"),
  "The Ken": domainAvatar("the-ken.com"),
  "Inc42": domainAvatar("inc42.com"),
  "Lex Fridman": searchAvatar("Lex Fridman"),

  // ── Books ──
  "Sapiens": searchAvatar("Sapiens Yuval"),
  "Atomic Habits": searchAvatar("Atomic Habits"),
  "Zero to One": searchAvatar("Zero to One Peter Thiel"),
};

/**
 * Get image URL for a suggestion item
 */
export function getSuggestionImage(name: string, categoryId: string): string {
  // Check known images first
  if (KNOWN_IMAGES[name]) return KNOWN_IMAGES[name];

  // For Twitter handles, try unavatar
  if (name.startsWith("@")) return twitterAvatar(name);

  // For news/creator items with known domains
  if (categoryId === "news") return searchAvatar(name);

  // Generic fallback — try unavatar search
  return searchAvatar(name);
}

/**
 * Pill color palettes per category
 * Each suggestion gets a color from this rotating palette
 */
export const PILL_COLORS: Record<string, string[]> = {
  shows: [
    "#FF4B4B", "#CE82FF", "#1CB0F6", "#FF9600", "#FF4B91",
    "#58CC02", "#FFC800", "#E1306C", "#5865F2", "#FF86D8",
    "#00C9A7", "#845EC2", "#D65DB1", "#FF6F91", "#FFC75F",
  ],
  sports: [
    "#FF4B4B", "#1CB0F6", "#58CC02", "#FFC800", "#FF9600",
    "#CE82FF", "#FF4B91", "#00C9A7", "#5865F2", "#E1306C",
    "#845EC2", "#D65DB1", "#FF6F91", "#008F7A", "#C34A36",
  ],
  music: [
    "#E1306C", "#CE82FF", "#FF86D8", "#1CB0F6", "#FFC800",
    "#FF4B91", "#5865F2", "#FF9600", "#00C9A7", "#FF4B4B",
    "#845EC2", "#D65DB1", "#FF6F91", "#FFC75F", "#008F7A",
  ],
  gaming: [
    "#5865F2", "#FF4B4B", "#58CC02", "#FFC800", "#CE82FF",
    "#FF9600", "#1CB0F6", "#FF4B91", "#00C9A7", "#E1306C",
    "#845EC2", "#D65DB1", "#FF6F91", "#FFC75F", "#C34A36",
  ],
  news: [
    "#1DA1F2", "#FF4B4B", "#FF9600", "#58CC02", "#CE82FF",
    "#FFC800", "#5865F2", "#E1306C", "#00C9A7", "#FF4B91",
    "#845EC2", "#D65DB1", "#FF6F91", "#008F7A", "#C34A36",
  ],
  books: [
    "#FF9600", "#CE82FF", "#1CB0F6", "#FF4B4B", "#58CC02",
    "#FFC800", "#FF4B91", "#5865F2", "#E1306C", "#00C9A7",
    "#845EC2", "#D65DB1", "#FF6F91", "#FFC75F", "#008F7A",
  ],
  hobbies: [
    "#58CC02", "#FF9600", "#CE82FF", "#1CB0F6", "#FFC800",
    "#FF4B4B", "#FF4B91", "#5865F2", "#E1306C", "#00C9A7",
    "#845EC2", "#D65DB1", "#FF6F91", "#FFC75F", "#C34A36",
  ],
  curious: [
    "#FFC800", "#CE82FF", "#FF4B4B", "#1CB0F6", "#58CC02",
    "#FF9600", "#FF4B91", "#5865F2", "#E1306C", "#00C9A7",
    "#845EC2", "#D65DB1", "#FF6F91", "#FFC75F", "#008F7A",
  ],
};

export function getPillColor(categoryId: string, index: number): string {
  const palette = PILL_COLORS[categoryId] || PILL_COLORS.shows;
  return palette[index % palette.length];
}

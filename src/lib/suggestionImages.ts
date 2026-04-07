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
  "Sherlock": "https://image.tmdb.org/t/p/w92/7WTsnHkbA0FaG6R9twfFde0I9hl.jpg",
  "Westworld": "https://image.tmdb.org/t/p/w92/y55oBgC298IMl2etR7JaFGxOQEj.jpg",
  "Peaky Blinders": "https://image.tmdb.org/t/p/w92/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg",
  "Dark": "https://image.tmdb.org/t/p/w92/apbrbWs8M9lyOpJYU5WXrpFbk1Z.jpg",
  "Suits": "https://image.tmdb.org/t/p/w92/vQiryp6LioFxQThY3bR4aiKMPIh.jpg",
  "Succession": "https://image.tmdb.org/t/p/w92/7HW47XbkNQ5fiwQFYGWdw9gs7LH.jpg",
  "Ted Lasso": "https://image.tmdb.org/t/p/w92/5fhZdwP1DVJ0FyVH6vrFdHwpXIn.jpg",
  "Severance": "https://image.tmdb.org/t/p/w92/lFf6LLrQjYEuECjBBRGhO3OvRC7.jpg",
  "The Bear": "https://image.tmdb.org/t/p/w92/sHFlYhDRW57TWcMgLMBetWfiYSi.jpg",
  "Jujutsu Kaisen": "https://image.tmdb.org/t/p/w92/hFWP5HkbVEe40hrXgtCeQxoccHE.jpg",
  "Spy x Family": "https://image.tmdb.org/t/p/w92/3r4LYFuXbRCmNxOGZQnPlJg1hVG.jpg",
  "Solo Leveling": "https://image.tmdb.org/t/p/w92/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg",
  "Dragon Ball Z": "https://image.tmdb.org/t/p/w92/6VKOfMSELMPJEqAEHvhKJPlTqlH.jpg",
  "My Hero Academia": "https://image.tmdb.org/t/p/w92/ivOLM47yJt90P19RH1NvJrAJz9F.jpg",
  // Indian shows
  "3 Idiots": "https://image.tmdb.org/t/p/w92/66A9MqXOyVFAhO3POKJht4wD1EO.jpg",
  "Sacred Games": "https://image.tmdb.org/t/p/w92/kqjMpRVHlMhHAEOGBFTm7W3BSB9.jpg",
  "Scam 1992": "https://image.tmdb.org/t/p/w92/79oolMCkFyzPnMHvP7kbcjdGSMX.jpg",
  "Family Man": "https://image.tmdb.org/t/p/w92/2CAL2433ZeIihfX1Hb2139CX0pW.jpg",
  "Mirzapur": "https://image.tmdb.org/t/p/w92/cnzT3fgHZH6piiVqgEKkJtaYYBC.jpg",
  "Panchayat": "https://image.tmdb.org/t/p/w92/AuJz8GXQV3sPjMqNHfiOJp40kq5.jpg",
  "Kota Factory": "https://image.tmdb.org/t/p/w92/dMwCpMl5cSJHiM9YuLK8KU6KvMs.jpg",
  "Dangal": "https://image.tmdb.org/t/p/w92/fwEPaQQFdZQ2sMHYjU7XDMCQ5sI.jpg",
  "RRR": "https://image.tmdb.org/t/p/w92/nEufeZYoDBPKgJvP1BZi24AevUB.jpg",
  "KGF": "https://image.tmdb.org/t/p/w92/h9JfMlRDmHlaNoAvCw9LOzh2GZo.jpg",
  "Bahubali": "https://image.tmdb.org/t/p/w92/y9yX1KBzFC1QFbGbpKG4Zu2FqBo.jpg",
  "Pushpa": "https://image.tmdb.org/t/p/w92/wfJflXJLxDfZlMDamYlGVEHYfQx.jpg",
  "12th Fail": "https://image.tmdb.org/t/p/w92/tpEczLfHIqXdKIqVMC42EP1HdNf.jpg",

  // ── Cricket ──
  "Virat Kohli": twitterAvatar("imVkohli"),
  "MS Dhoni": searchAvatar("MS Dhoni cricketer"),
  "Rohit Sharma": twitterAvatar("ImRo45"),
  "Sachin Tendulkar": twitterAvatar("sacaborbarivelliin_rt"),
  "Rishabh Pant": twitterAvatar("RishabhPant17"),
  "Jasprit Bumrah": twitterAvatar("Jaborbarivellisbumrah93"),
  "Hardik Pandya": twitterAvatar("hardikpandya7"),
  "Suryakumar Yadav": twitterAvatar("suraborbarivelliyakumar"),
  "Shubman Gill": twitterAvatar("ShubmanGill"),
  "Cricket": searchAvatar("cricket sport"),
  // IPL teams
  "RCB": domainAvatar("royalchallengers.com"),
  "CSK": domainAvatar("chennaisuperkings.com"),
  "MI": domainAvatar("mumbaiindians.com"),
  "KKR": domainAvatar("kkr.in"),
  "IPL": domainAvatar("iplt20.com"),

  // ── Football ──
  "Lionel Messi": searchAvatar("Lionel Messi"),
  "Cristiano Ronaldo": searchAvatar("Cristiano Ronaldo"),
  "Kylian Mbappé": searchAvatar("Kylian Mbappe"),
  "Erling Haaland": searchAvatar("Erling Haaland"),
  "Sunil Chhetri": twitterAvatar("caborbarivelliehtrisunil11"),
  "Real Madrid": domainAvatar("realmadrid.com"),
  "Barcelona": domainAvatar("fcbarcelona.com"),
  "Manchester United": domainAvatar("manutd.com"),
  "Manchester City": domainAvatar("mancity.com"),
  "Liverpool": domainAvatar("liverpoolfc.com"),
  "Arsenal": domainAvatar("arsenal.com"),
  "FC Bayern": domainAvatar("fcbayern.com"),
  "PSG": domainAvatar("psg.fr"),

  // ── F1 ──
  "Max Verstappen": searchAvatar("Max Verstappen"),
  "Lewis Hamilton": searchAvatar("Lewis Hamilton"),
  "Lando Norris": searchAvatar("Lando Norris"),
  "Charles Leclerc": searchAvatar("Charles Leclerc"),
  "Ferrari": domainAvatar("ferrari.com"),
  "Red Bull Racing": domainAvatar("redbullracing.com"),
  "McLaren": domainAvatar("mclaren.com"),
  "F1": domainAvatar("formula1.com"),

  // ── NBA ──
  "LeBron James": searchAvatar("LeBron James"),
  "Stephen Curry": searchAvatar("Stephen Curry"),
  "Luka Dončić": searchAvatar("Luka Doncic"),
  "NBA": domainAvatar("nba.com"),

  // ── Tennis ──
  "Novak Djokovic": searchAvatar("Novak Djokovic"),
  "Rafael Nadal": searchAvatar("Rafael Nadal"),
  "Carlos Alcaraz": searchAvatar("Carlos Alcaraz"),
  "PV Sindhu": twitterAvatar("Aborbarivellisindhu2"),
  "Neeraj Chopra": twitterAvatar("Naborbarivellieraj_chopra1"),
  "Magnus Carlsen": searchAvatar("Magnus Carlsen"),
  "Gukesh": searchAvatar("Gukesh chess"),
  "Praggnanandhaa": searchAvatar("Praggnanandhaa chess"),

  // ── Music Artists ──
  "Arijit Singh": searchAvatar("Arijit Singh singer"),
  "A.R. Rahman": twitterAvatar("araborbarivelliraborbarivelli"),
  "Diljit Dosanjh": twitterAvatar("daborbarivelliljitdosanjh"),
  "Pritam": searchAvatar("Pritam Bollywood"),
  "Anuv Jain": searchAvatar("Anuv Jain singer"),
  "AP Dhillon": searchAvatar("AP Dhillon"),
  "Prateek Kuhad": twitterAvatar("prateekkuaborbarivellihad"),
  "Shreya Ghoshal": twitterAvatar("shreyaborbariveghoshal"),
  "Shankar Mahadevan": searchAvatar("Shankar Mahadevan"),
  "Nucleya": twitterAvatar("nucleya"),
  "Ritviz": twitterAvatar("ritviz"),
  "Seedhe Maut": searchAvatar("Seedhe Maut"),
  "Raftaar": twitterAvatar("aborbarivelliraborbarivelli"),
  "King": searchAvatar("King Indian rapper"),
  "Honey Singh": searchAvatar("Yo Yo Honey Singh"),
  "Coldplay": domainAvatar("coldplay.com"),
  "Taylor Swift": searchAvatar("Taylor Swift"),
  "The Weeknd": searchAvatar("The Weeknd"),
  "Ed Sheeran": searchAvatar("Ed Sheeran"),
  "Drake": searchAvatar("Drake rapper"),
  "Kendrick Lamar": searchAvatar("Kendrick Lamar"),
  "Imagine Dragons": searchAvatar("Imagine Dragons"),
  "Linkin Park": domainAvatar("linkinpark.com"),
  "BTS": searchAvatar("BTS"),
  "BLACKPINK": searchAvatar("BLACKPINK"),
  "Travis Scott": searchAvatar("Travis Scott"),
  "Eminem": searchAvatar("Eminem"),
  "Post Malone": searchAvatar("Post Malone"),
  "Bad Bunny": searchAvatar("Bad Bunny"),
  "Billie Eilish": searchAvatar("Billie Eilish"),
  "Dua Lipa": searchAvatar("Dua Lipa"),
  "SZA": searchAvatar("SZA singer"),
  "Hans Zimmer": searchAvatar("Hans Zimmer"),

  // ── Games ──
  "Valorant": domainAvatar("playvalorant.com"),
  "CS2": domainAvatar("counter-strike.net"),
  "BGMI": domainAvatar("battlegroundsmobileindia.com"),
  "Call of Duty": domainAvatar("callofduty.com"),
  "Fortnite": domainAvatar("fortnite.com"),
  "Minecraft": domainAvatar("minecraft.net"),
  "GTA V / GTA Online": domainAvatar("rockstargames.com"),
  "GTA 6": domainAvatar("rockstargames.com"),
  "Red Dead Redemption 2": domainAvatar("rockstargames.com"),
  "League of Legends": domainAvatar("leagueoflegends.com"),
  "Dota 2": domainAvatar("dota2.com"),
  "Genshin Impact": domainAvatar("genshin.hoyoverse.com"),
  "Elden Ring": domainAvatar("eldenring.com"),
  "Cyberpunk 2077": domainAvatar("cyberpunk.net"),
  "Roblox": domainAvatar("roblox.com"),
  "Among Us": domainAvatar("innersloth.com"),
  "Free Fire": domainAvatar("ff.garena.com"),
  "Apex Legends": domainAvatar("ea.com"),
  "FIFA / EA FC": domainAvatar("ea.com"),

  // ── News / Creators ──
  "@elonmusk": twitterAvatar("elonmusk"),
  "@sama": twitterAvatar("sama"),
  "@karpathy": twitterAvatar("karpathy"),
  "@AndrewYNg": twitterAvatar("AndrewYNg"),
  "@ylecun": twitterAvatar("ylecun"),
  "@naval": twitterAvatar("naval"),
  "@paulg": twitterAvatar("paulg"),
  "@balajis": twitterAvatar("balajis"),
  "@demaborin": twitterAvatar("demaborin"),
  "Tanmay Bhat": twitterAvatar("taborbarivellianmayaborbarivelli"),
  "Dhruv Rathee": twitterAvatar("dhruv_raborbarivelliataborbarivellihee"),
  "Technical Guruji": youtubeAvatar("Technical Guruji"),
  "CodeWithHarry": youtubeAvatar("CodeWithHarry"),
  "Varun Mayya": twitterAvatar("vaaborbarivelliunmayya"),
  "Raj Shamani": twitterAvatar("rajshamaborbarivellini"),
  "Sandeep Maheshwari": youtubeAvatar("Sandeep Maheshwari"),
  "MrBeast": searchAvatar("MrBeast"),
  "MKBHD": searchAvatar("MKBHD"),
  "Fireship": searchAvatar("Fireship YouTube"),
  "Lex Fridman": searchAvatar("Lex Fridman"),
  "3Blue1Brown": youtubeAvatar("3Blue1Brown"),
  "Veritasium": youtubeAvatar("Veritasium"),
  "Hacker News": domainAvatar("ycombinator.com"),
  "TechCrunch": domainAvatar("techcrunch.com"),
  "The Verge": domainAvatar("theverge.com"),
  "Wired": domainAvatar("wired.com"),
  "Bloomberg": domainAvatar("bloomberg.com"),
  "Reuters": domainAvatar("reuters.com"),
  "The Ken": domainAvatar("the-ken.com"),
  "Inc42": domainAvatar("inc42.com"),
  "MoneyControl": domainAvatar("moneycontrol.com"),

  // ── Books & Authors ──
  "Sapiens": "https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg",
  "Atomic Habits": "https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg",
  "Zero to One": "https://covers.openlibrary.org/b/isbn/9780804139298-M.jpg",
  "Rich Dad Poor Dad": "https://covers.openlibrary.org/b/isbn/9781612680194-M.jpg",
  "The Alchemist": "https://covers.openlibrary.org/b/isbn/9780062315007-M.jpg",
  "Deep Work": "https://covers.openlibrary.org/b/isbn/9781455586691-M.jpg",
  "Thinking Fast and Slow": "https://covers.openlibrary.org/b/isbn/9780374533557-M.jpg",
  "The Psychology of Money": "https://covers.openlibrary.org/b/isbn/9780857197689-M.jpg",
  "Hooked": "https://covers.openlibrary.org/b/isbn/9781591847786-M.jpg",
  "The Lean Startup": "https://covers.openlibrary.org/b/isbn/9780307887894-M.jpg",
  "Shoe Dog": "https://covers.openlibrary.org/b/isbn/9781501135910-M.jpg",
  "Steve Jobs": "https://covers.openlibrary.org/b/isbn/9781451648539-M.jpg",
  "Ikigai": "https://covers.openlibrary.org/b/isbn/9780143130727-M.jpg",
  "Elon Musk (bio)": "https://covers.openlibrary.org/b/isbn/9781982181284-M.jpg",
  "Start With Why": "https://covers.openlibrary.org/b/isbn/9781591846444-M.jpg",
  "Good to Great": "https://covers.openlibrary.org/b/isbn/9780066620992-M.jpg",
  "The 4-Hour Workweek": "https://covers.openlibrary.org/b/isbn/9780307465351-M.jpg",
  "Rework": "https://covers.openlibrary.org/b/isbn/9780307463746-M.jpg",
  "Man's Search for Meaning": "https://covers.openlibrary.org/b/isbn/9780807014295-M.jpg",
  "The Power of Habit": "https://covers.openlibrary.org/b/isbn/9780812981605-M.jpg",
  "Meditations": "https://covers.openlibrary.org/b/isbn/9780140449334-M.jpg",
  "The Art of War": "https://covers.openlibrary.org/b/isbn/9781590302255-M.jpg",
  "12 Rules for Life": "https://covers.openlibrary.org/b/isbn/9780345816023-M.jpg",
  "Dune (book)": "https://covers.openlibrary.org/b/isbn/9780441013593-M.jpg",
  "1984": "https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg",
  "Brave New World": "https://covers.openlibrary.org/b/isbn/9780060850524-M.jpg",
  "Superintelligence": "https://covers.openlibrary.org/b/isbn/9780199678112-M.jpg",
  "AI Superpowers": "https://covers.openlibrary.org/b/isbn/9781328546395-M.jpg",
  "Life 3.0": "https://covers.openlibrary.org/b/isbn/9781101946596-M.jpg",
  "Hit Refresh": "https://covers.openlibrary.org/b/isbn/9780062652508-M.jpg",
  "The Hard Thing About Hard Things": "https://covers.openlibrary.org/b/isbn/9780062273208-M.jpg",
  "Outliers": "https://covers.openlibrary.org/b/isbn/9780316017923-M.jpg",
  "Blitzscaling": "https://covers.openlibrary.org/b/isbn/9781524761417-M.jpg",
  "Range": "https://covers.openlibrary.org/b/isbn/9780735214484-M.jpg",
  "Thinking in Bets": "https://covers.openlibrary.org/b/isbn/9780735216358-M.jpg",
  "Principles": "https://covers.openlibrary.org/b/isbn/9781501124020-M.jpg",
  "Can't Hurt Me": "https://covers.openlibrary.org/b/isbn/9781544512273-M.jpg",
  "The Monk Who Sold His Ferrari": "https://covers.openlibrary.org/b/isbn/9780062515674-M.jpg",

  // ── More Anime ──
  "Bleach": "https://image.tmdb.org/t/p/w92/2EbBBCsq2dMwKi5pCBnhwnXFCJx.jpg",
  "Hunter x Hunter": "https://image.tmdb.org/t/p/w92/KxR7qbBnOGhXqEKWM1VPS6tbo3.jpg",
  "Steins;Gate": "https://image.tmdb.org/t/p/w92/dOhPMGbrmTCIaETY0PEVRiUXOWF.jpg",
  "Cowboy Bebop": "https://image.tmdb.org/t/p/w92/hbIF0kEfSwaeIYSYACecJ7QujpO.jpg",
  "Chainsaw Man": "https://image.tmdb.org/t/p/w92/yVtx7Xn0JGlsoyiHBMgG0bIoFMB.jpg",
  "Fullmetal Alchemist": "https://image.tmdb.org/t/p/w92/nVN0C0OU45P8AGVdKBrg1VFsZv0.jpg",
  "Code Geass": "https://image.tmdb.org/t/p/w92/a6aGnWBslaDQXe3CXJL3aeQPg8b.jpg",
  "Mob Psycho 100": "https://image.tmdb.org/t/p/w92/l1Yv4EhWzPU0LjffrMYU09DJrb9.jpg",
  "Vinland Saga": "https://image.tmdb.org/t/p/w92/kQJfKHj7TDBFrGMbXQcOh3HY4kO.jpg",
  "Tokyo Ghoul": "https://image.tmdb.org/t/p/w92/7N83cOM9nF6CxdVYU3Dy4E3BijZ.jpg",

  // ── More Indian Shows ──
  "TVF Pitchers": "https://image.tmdb.org/t/p/w92/d0VYpHgOHdWxidRINIIiA8j3YGC.jpg",
  "Aspirants": searchAvatar("TVF Aspirants"),
  "Rocket Boys": "https://image.tmdb.org/t/p/w92/sqWWzA56wnFTvUH1qcUmJpGVJNq.jpg",
  "Gullak": "https://image.tmdb.org/t/p/w92/cCUNzVPFQFvSqn7r0cXnPYkgO6r.jpg",
  "Made in Heaven": "https://image.tmdb.org/t/p/w92/2sWnWQpF17ZbHTVnC3nQXrBFDUh.jpg",
  "Paatal Lok": "https://image.tmdb.org/t/p/w92/9fJEVT9dkMkNjIxlGz2Hpz5y3GX.jpg",
  "Delhi Crime": "https://image.tmdb.org/t/p/w92/64v8AkZsLx2hEkfDj3jmJFKfC4.jpg",

  // ── K-Drama ──
  "Crash Landing on You": "https://image.tmdb.org/t/p/w92/abtxJSCEF5fTLL6HgbGIjhGZR5z.jpg",
  "Vincenzo": "https://image.tmdb.org/t/p/w92/dvXJgEDQXhL93maloYhQRaW7IUq.jpg",
  "All of Us Are Dead": "https://image.tmdb.org/t/p/w92/pTEFqAjLd5YTsMD6NSUxV6Dq7A6.jpg",

  // ── More Movies ──
  "Ex Machina": "https://image.tmdb.org/t/p/w92/4W6PlyvMGejPp4y0QRs9mtEbR43.jpg",
  "The Social Network": "https://image.tmdb.org/t/p/w92/n0ybibhJtQ5icDqTp8eRytcIHJx.jpg",
  "The Big Short": "https://image.tmdb.org/t/p/w92/idk7cowm5p3RaLBv7giOfPAAv4E.jpg",
  "House of the Dragon": "https://image.tmdb.org/t/p/w92/z2yahl2uefxDCl0nogcRBstwgiR.jpg",
  "The Last of Us": "https://image.tmdb.org/t/p/w92/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg",
  "Oppenheimer": "https://image.tmdb.org/t/p/w92/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
  "Dune (2024)": "https://image.tmdb.org/t/p/w92/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  "Shogun": "https://image.tmdb.org/t/p/w92/7O4iVfOMQmdCSxhOg1WnLHnkVb3.jpg",
  "Fallout": "https://image.tmdb.org/t/p/w92/AnsSKR4MVHqlVSKljmPMRkOdMSJ.jpg",
  "The Wire": "https://image.tmdb.org/t/p/w92/4lbclFySvugI51fwsyxBTOm4DqK.jpg",

  // ── Hobbies ──
  "Photography": searchAvatar("photography hobby"),
  "Cooking": searchAvatar("cooking hobby"),
  "Travel": searchAvatar("travel"),
  "Fitness": searchAvatar("fitness workout"),
  "Reading": searchAvatar("reading books"),
  "Gardening": searchAvatar("gardening hobby"),
  "Hiking": searchAvatar("hiking outdoors"),
  "Drawing": searchAvatar("drawing art"),
  "DIY Projects": searchAvatar("DIY maker"),
  "Chess": searchAvatar("chess game"),
  "Meditation": searchAvatar("meditation"),
  "Running": searchAvatar("running sport"),
  "Cycling": searchAvatar("cycling sport"),
  "Investing": searchAvatar("investing stocks"),

  // ── Curious Topics ──
  "How do AI agents work?": searchAvatar("AI agents"),
  "Build my first chatbot": searchAvatar("chatbot"),
  "Can AI replace my job?": searchAvatar("AI future jobs"),
  "What is RAG?": searchAvatar("RAG AI"),
  "How to build AI apps": searchAvatar("AI applications"),
  "AI for my business": searchAvatar("AI business"),

  // ── More Sports ──
  "Football": searchAvatar("football sport"),
  "SRH": domainAvatar("sunrisershyderabad.in"),
  "DC": searchAvatar("Delhi Capitals IPL"),
  "GT": searchAvatar("Gujarat Titans IPL"),
  "LSG": searchAvatar("Lucknow Super Giants IPL"),
  "PBKS": searchAvatar("Punjab Kings IPL"),
  "RR": searchAvatar("Rajasthan Royals IPL"),
  "ISL": searchAvatar("Indian Super League"),

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

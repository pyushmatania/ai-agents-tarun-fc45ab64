import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { ExternalLink, Search, X, Heart, Flame, Zap, User, Star, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/hooks/useGamification";
import { ALL_SOURCES, SOURCE_CATEGORIES, FEATURED_SOURCE_NAMES, type Source, type SourceCategoryId } from "@/lib/sources";
import { useFollowedSources } from "@/hooks/useFollowedSources";
import { getPersona } from "@/lib/neuralOS";

const SourcesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats } = useGamification();
  const { toggle, isFollowed, followed } = useFollowedSources();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SourceCategoryId | "all" | "followed">("all");
  const persona = getPersona();

  // Personalization: auto-pin semiconductor if HCL user
  const isHCL = persona.currentCompany?.toLowerCase().includes("hcl") || persona.currentCompany?.toLowerCase().includes("semiconductor");

  // Featured sources — dynamic based on persona
  const featuredSources = useMemo(() => {
    const featured = ALL_SOURCES.filter(s => FEATURED_SOURCE_NAMES.includes(s.name));
    if (persona.vibe === "fun") {
      const funSources = ALL_SOURCES.filter(s => ["Fireship", "ThePrimeagen", "Matt Wolfe"].includes(s.name));
      return [...funSources, ...featured].slice(0, 5);
    }
    if (persona.vibe === "serious") {
      const seriousSources = ALL_SOURCES.filter(s => ["Yannic Kilcher", "Two Minute Papers", "arXiv cs.AI"].includes(s.name));
      return [...seriousSources, ...featured].slice(0, 5);
    }
    return featured.slice(0, 5);
  }, [persona.vibe]);

  // Filter logic
  const filteredSources = useMemo(() => {
    let sources = ALL_SOURCES;

    if (activeCategory === "followed") {
      sources = sources.filter(s => isFollowed(s.name));
    } else if (activeCategory !== "all") {
      sources = sources.filter(s => s.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      sources = sources.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        s.tags.some(t => t.includes(q)) ||
        (s.handle && s.handle.toLowerCase().includes(q))
      );
    }

    return sources;
  }, [activeCategory, searchQuery, isFollowed, followed]);

  const categoryWithCount = useMemo(() => {
    return SOURCE_CATEGORIES.map(cat => ({
      ...cat,
      count: ALL_SOURCES.filter(s => s.category === cat.id).length,
    }));
  }, []);

  // Prioritize semiconductor if HCL
  const sortedCategories = useMemo(() => {
    if (isHCL) {
      const semi = categoryWithCount.find(c => c.id === "semiconductor");
      const rest = categoryWithCount.filter(c => c.id !== "semiconductor");
      return semi ? [semi, ...rest] : categoryWithCount;
    }
    return categoryWithCount;
  }, [isHCL, categoryWithCount]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
        <div className="max-w-md mx-auto relative z-10">
          {/* Top bar */}
          <FadeIn>
            <div className="px-4 pt-4 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-agni-orange/15 rounded-full px-2 py-1">
                  <Flame size={12} className="text-agni-orange" />
                  <span className="text-[10px] font-black text-agni-orange">{stats.streak}</span>
                </div>
                <div className="flex items-center gap-1 bg-agni-gold/15 rounded-full px-2 py-1">
                  <Zap size={12} className="text-agni-gold" />
                  <span className="text-[10px] font-black text-agni-gold">{stats.gems}</span>
                </div>
              </div>
              <h1 className="text-sm font-black text-foreground">Sources Hub</h1>
              <div className="flex items-center gap-1.5">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate("/settings")} className="w-7 h-7 rounded-xl bg-card flex items-center justify-center border border-border/50">
                  <User size={12} className="text-muted-foreground" />
                </motion.button>
                <div className="flex items-center gap-1 bg-agni-pink/15 rounded-full px-2 py-1">
                  <Heart size={12} className="text-agni-pink fill-agni-pink" />
                  <span className="text-[10px] font-black text-agni-pink">5</span>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Search */}
          <FadeIn delay={0.05}>
            <div className="px-4 mb-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text" placeholder="Search 200+ sources..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-9 pr-4 bg-card border-2 border-border/30 rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-agni-blue/50 transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={14} className="text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>
          </FadeIn>

          {/* Category Filter Chips */}
          <FadeIn delay={0.08}>
            <div className="px-4 mb-4">
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-1">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all ${
                    activeCategory === "all"
                      ? "bg-agni-green/15 text-agni-green border border-agni-green/30"
                      : "bg-muted/30 text-muted-foreground border border-transparent"
                  }`}
                >
                  🌐 All ({ALL_SOURCES.length})
                </button>
                <button
                  onClick={() => setActiveCategory("followed")}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all ${
                    activeCategory === "followed"
                      ? "bg-agni-pink/15 text-agni-pink border border-agni-pink/30"
                      : "bg-muted/30 text-muted-foreground border border-transparent"
                  }`}
                >
                  ❤️ Following ({followed.length})
                </button>
                {sortedCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all ${
                      activeCategory === cat.id
                        ? "border"
                        : "bg-muted/30 text-muted-foreground border border-transparent"
                    }`}
                    style={activeCategory === cat.id ? {
                      background: `${cat.color}15`,
                      color: cat.color,
                      borderColor: `${cat.color}30`,
                    } : undefined}
                  >
                    {cat.emoji} {cat.label} ({cat.count})
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Featured Row */}
          {!searchQuery && activeCategory === "all" && (
            <FadeIn delay={0.1}>
              <div className="px-4 mb-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Star size={12} className="text-agni-gold" />
                  <span className="text-[10px] font-black text-muted-foreground tracking-wider">FEATURED FOR YOU</span>
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {featuredSources.map((s, i) => (
                    <motion.a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="shrink-0 w-[110px] bg-card rounded-2xl p-3 border-2 border-agni-gold/20 text-center"
                      style={{ boxShadow: "0 2px 0 0 hsl(var(--agni-gold) / 0.15)" }}
                    >
                      <div className="text-2xl mb-1">{s.emoji || "⭐"}</div>
                      <p className="text-[10px] font-black text-foreground truncate">{s.name}</p>
                      <p className="text-[7px] text-muted-foreground truncate mt-0.5">{s.desc}</p>
                    </motion.a>
                  ))}
                </div>
              </div>
            </FadeIn>
          )}

          {/* Persona match hint */}
          {!searchQuery && activeCategory === "all" && persona.news && persona.news.length > 0 && (
            <FadeIn delay={0.12}>
              <div className="px-4 mb-3">
                <div className="bg-agni-purple/10 border border-agni-purple/20 rounded-2xl p-2.5">
                  <p className="text-[9px] font-bold text-agni-purple">
                    ✨ You already follow: {persona.news.slice(0, 3).join(", ")}
                    {persona.news.length > 3 && ` +${persona.news.length - 3} more`}
                  </p>
                </div>
              </div>
            </FadeIn>
          )}

          {/* Results count */}
          <div className="px-4 mb-2">
            <p className="text-[9px] font-bold text-muted-foreground">
              {filteredSources.length} source{filteredSources.length !== 1 ? "s" : ""}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {/* Source Cards */}
          <div className="px-4 space-y-1.5">
            <AnimatePresence mode="popLayout">
              {filteredSources.map((source, i) => {
                const catMeta = SOURCE_CATEGORIES.find(c => c.id === source.category);
                const color = catMeta?.color || "#58CC02";
                const following = isFollowed(source.name);

                return (
                  <motion.div
                    key={source.name + source.category}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    layout
                    className="flex items-center gap-2.5 bg-card rounded-2xl p-3 border-2 border-border/20"
                  >
                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0"
                      style={{ background: `${color}15` }}
                    >
                      {source.emoji || catMeta?.emoji || "🔗"}
                    </div>

                    {/* Info */}
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-extrabold text-foreground truncate">{source.name}</p>
                        {source.trustScore && source.trustScore >= 90 && (
                          <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-agni-green/15 text-agni-green shrink-0">TOP</span>
                        )}
                      </div>
                      {source.handle && (
                        <p className="text-[8px] text-muted-foreground/60 font-bold">{source.handle}</p>
                      )}
                      <p className="text-[9px] text-muted-foreground truncate">{source.desc}</p>
                    </a>

                    {/* Follow + Open */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => { e.stopPropagation(); toggle(source.name); }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          following
                            ? "bg-agni-pink/15"
                            : "bg-muted/20"
                        }`}
                      >
                        {following ? (
                          <BookmarkCheck size={12} className="text-agni-pink" />
                        ) : (
                          <BookmarkPlus size={12} className="text-muted-foreground/40" />
                        )}
                      </motion.button>
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-muted/20 flex items-center justify-center">
                        <ExternalLink size={10} className="text-muted-foreground/40" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredSources.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[11px] text-muted-foreground font-bold">No sources found</p>
                <p className="text-[9px] text-muted-foreground/60 mt-1">Try a different search or category</p>
              </div>
            )}
          </div>

          {/* Bottom CTA */}
          <FadeIn delay={0.2}>
            <div className="px-4 py-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/curiosity")}
                className="w-full bg-foreground text-background rounded-2xl py-3.5 text-sm font-black text-center shadow-lg"
              >
                🔥 Explore Curiosity Sparks
              </motion.button>
            </div>
          </FadeIn>
        </div>
        <BottomNav />
      </div>
    </PageTransition>
  );
};

export default SourcesPage;

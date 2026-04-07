import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageTransition, { FadeIn } from "@/components/PageTransition";
import { ExternalLink, Search, X, Heart, Flame, Zap, User, Star, BookmarkPlus, BookmarkCheck, Clock, Eye, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { motion, AnimatePresence } from "framer-motion";
import { useGamification } from "@/hooks/useGamification";
import { ALL_SOURCES, SOURCE_CATEGORIES, FEATURED_SOURCE_NAMES, getSourceAvatar, sourceHasUpdate, type Source, type SourceCategoryId } from "@/lib/sources";
import { useFollowedSources } from "@/hooks/useFollowedSources";
import { useReadSources } from "@/hooks/useReadSources";
import { getPersona } from "@/lib/neuralOS";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const SourcesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { stats } = useGamification();
  const { toggle, isFollowed, followed } = useFollowedSources();
  const { markRead, isRead, recentlyRead } = useReadSources();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SourceCategoryId | "all" | "followed" | "recent" | "updates">("all");
  const persona = getPersona();

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

  // Sources with updates count
  const updatedSourceNames = useMemo(() => ALL_SOURCES.filter(s => sourceHasUpdate(s.name)).map(s => s.name), []);

  // Recently read source names
  const recentNames = useMemo(() => recentlyRead(ALL_SOURCES.map(s => s.name)), [recentlyRead]);

  // Filter logic
  const filteredSources = useMemo(() => {
    let sources = ALL_SOURCES;

    if (activeCategory === "followed") {
      sources = sources.filter(s => isFollowed(s.name));
    } else if (activeCategory === "recent") {
      sources = sources.filter(s => recentNames.includes(s.name));
    } else if (activeCategory === "updates") {
      sources = sources.filter(s => updatedSourceNames.includes(s.name));
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
  }, [activeCategory, searchQuery, isFollowed, followed, recentNames, updatedSourceNames]);

  const categoryWithCount = useMemo(() => {
    return SOURCE_CATEGORIES.map(cat => ({
      ...cat,
      count: ALL_SOURCES.filter(s => s.category === cat.id).length,
      updateCount: ALL_SOURCES.filter(s => s.category === cat.id && updatedSourceNames.includes(s.name)).length,
    }));
  }, [updatedSourceNames]);

  // Prioritize semiconductor if HCL
  const sortedCategories = useMemo(() => {
    if (isHCL) {
      const semi = categoryWithCount.find(c => c.id === "semiconductor");
      const rest = categoryWithCount.filter(c => c.id !== "semiconductor");
      return semi ? [semi, ...rest] : categoryWithCount;
    }
    return categoryWithCount;
  }, [isHCL, categoryWithCount]);

  const handleFollow = (sourceName: string) => {
    const wasFollowing = isFollowed(sourceName);
    toggle(sourceName);
    if (!wasFollowing) {
      toast.success(`Following ${sourceName}`, {
        description: "You'll get updates in Curiosity Sparks ⚡",
        duration: 2000,
      });
    }
  };

  const handleSourceClick = (source: Source) => {
    markRead(source.name);
    window.open(source.url, "_blank", "noopener,noreferrer");
  };

  const getInitials = (name: string) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-24 relative overflow-x-hidden">
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
                  onClick={() => setActiveCategory("updates")}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all relative ${
                    activeCategory === "updates"
                      ? "bg-agni-orange/15 text-agni-orange border border-agni-orange/30"
                      : "bg-muted/30 text-muted-foreground border border-transparent"
                  }`}
                >
                  🔔 New ({updatedSourceNames.length})
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-agni-orange animate-pulse" />
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
                <button
                  onClick={() => setActiveCategory("recent")}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all ${
                    activeCategory === "recent"
                      ? "bg-agni-blue/15 text-agni-blue border border-agni-blue/30"
                      : "bg-muted/30 text-muted-foreground border border-transparent"
                  }`}
                >
                  🕐 Recent ({recentNames.length})
                </button>
                {sortedCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition-all relative ${
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
                    {cat.updateCount > 0 && (
                      <span className="ml-1 inline-flex items-center justify-center w-3.5 h-3.5 text-[7px] font-black rounded-full bg-agni-orange/20 text-agni-orange">
                        {cat.updateCount}
                      </span>
                    )}
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
                    <motion.button
                      key={s.name}
                      onClick={() => handleSourceClick(s)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="shrink-0 w-[110px] bg-card rounded-2xl p-3 border-2 border-agni-gold/20 text-center"
                      style={{ boxShadow: "0 2px 0 0 hsl(var(--agni-gold) / 0.15)" }}
                    >
                      <Avatar className="w-10 h-10 mx-auto mb-1.5 border border-agni-gold/30">
                        <AvatarImage src={getSourceAvatar(s)} alt={s.name} />
                        <AvatarFallback className="text-[10px] font-black bg-card text-agni-gold">{getInitials(s.name)}</AvatarFallback>
                      </Avatar>
                      <p className="text-[10px] font-black text-foreground truncate">{s.name}</p>
                      <p className="text-[7px] text-muted-foreground truncate mt-0.5">{s.desc}</p>
                    </motion.button>
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
              {activeCategory === "updates" && " with new content today"}
            </p>
          </div>

          {/* Source Cards */}
          <div className="px-4 space-y-1.5">
            <AnimatePresence mode="popLayout">
              {filteredSources.map((source, i) => {
                const catMeta = SOURCE_CATEGORIES.find(c => c.id === source.category);
                const color = catMeta?.color || "#58CC02";
                const following = isFollowed(source.name);
                const read = isRead(source.name);
                const hasUpdate = updatedSourceNames.includes(source.name);

                return (
                  <motion.div
                    key={source.name + source.category}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    layout
                    className={`flex items-center gap-2.5 bg-card rounded-2xl p-3 border-2 transition-colors ${
                      hasUpdate ? "border-agni-orange/30" : "border-border/20"
                    } ${read ? "opacity-80" : ""}`}
                  >
                    {/* Avatar */}
                    <button onClick={() => handleSourceClick(source)} className="shrink-0 relative">
                      <Avatar className="w-9 h-9 border border-border/30">
                        <AvatarImage src={getSourceAvatar(source)} alt={source.name} loading="lazy" />
                        <AvatarFallback className="text-[9px] font-black" style={{ background: `${color}15`, color }}>
                          {getInitials(source.name)}
                        </AvatarFallback>
                      </Avatar>
                      {hasUpdate && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-agni-orange border-2 border-card" />
                      )}
                      {read && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-card flex items-center justify-center">
                          <Eye size={7} className="text-muted-foreground/60" />
                        </span>
                      )}
                    </button>

                    {/* Info */}
                    <button onClick={() => handleSourceClick(source)} className="flex-1 min-w-0 text-left">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[11px] font-extrabold text-foreground truncate">{source.name}</p>
                        {source.trustScore && source.trustScore >= 90 && (
                          <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-agni-green/15 text-agni-green shrink-0">TOP</span>
                        )}
                        {hasUpdate && (
                          <span className="text-[7px] font-bold px-1 py-0.5 rounded bg-agni-orange/15 text-agni-orange shrink-0">NEW</span>
                        )}
                      </div>
                      {source.handle && (
                        <p className="text-[8px] text-muted-foreground/60 font-bold">{source.handle}</p>
                      )}
                      <p className="text-[9px] text-muted-foreground truncate">{source.desc}</p>
                    </button>

                    {/* Follow + Open */}
                    <div className="flex items-center gap-1 shrink-0">
                      <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => { e.stopPropagation(); handleFollow(source.name); }}
                        className={`h-7 rounded-lg flex items-center justify-center gap-1 transition-all ${
                          following
                            ? "bg-agni-green/15 px-2"
                            : "bg-muted/20 w-7"
                        }`}
                      >
                        {following ? (
                          <>
                            <Bell size={10} className="text-agni-green" />
                            <span className="text-[8px] font-black text-agni-green">Following</span>
                          </>
                        ) : (
                          <BookmarkPlus size={12} className="text-muted-foreground/40" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredSources.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[11px] text-muted-foreground font-bold">
                  {activeCategory === "recent" ? "No sources visited yet" : "No sources found"}
                </p>
                <p className="text-[9px] text-muted-foreground/60 mt-1">
                  {activeCategory === "recent" ? "Tap on any source to start tracking" : "Try a different search or category"}
                </p>
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

const FloatingShapes = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
    {/* Gradient blobs */}
    <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl animate-float" />
    <div className="absolute top-1/3 -left-16 w-32 h-32 rounded-full bg-secondary/5 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
    <div className="absolute bottom-20 right-0 w-28 h-28 rounded-full bg-primary/3 blur-2xl animate-float" style={{ animationDelay: "3s" }} />
    
    {/* Small geometric shapes */}
    <div className="absolute top-16 right-8 w-3 h-3 rounded-full bg-primary/20 animate-float" style={{ animationDelay: "0.5s" }} />
    <div className="absolute top-32 left-6 w-2 h-2 rounded-sm bg-secondary/25 rotate-45 animate-float" style={{ animationDelay: "2s" }} />
    <div className="absolute top-48 right-16 w-2.5 h-2.5 rounded-full bg-primary/15 animate-float" style={{ animationDelay: "1s" }} />
    <div className="absolute bottom-40 left-10 w-2 h-2 rounded-full bg-secondary/20 animate-float" style={{ animationDelay: "3.5s" }} />
    <div className="absolute bottom-60 right-6 w-1.5 h-1.5 rounded-sm bg-primary/20 rotate-45 animate-float" style={{ animationDelay: "2.5s" }} />
    
    {/* Dotted ring */}
    <svg className="absolute top-24 left-4 w-8 h-8 opacity-10 animate-spin" style={{ animationDuration: "30s" }} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="16" stroke="hsl(var(--primary))" strokeWidth="1" fill="none" strokeDasharray="2 4" />
    </svg>
    <svg className="absolute bottom-32 right-8 w-6 h-6 opacity-10 animate-spin" style={{ animationDuration: "25s", animationDirection: "reverse" }} viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="16" stroke="hsl(var(--secondary))" strokeWidth="1" fill="none" strokeDasharray="2 4" />
    </svg>
  </div>
);

export default FloatingShapes;

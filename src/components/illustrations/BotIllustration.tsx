const BotIllustration = ({ className = "", size = 120 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 200 200" fill="none" className={className}>
    {/* Body */}
    <rect x="50" y="70" width="100" height="90" rx="20" fill="hsl(var(--primary))" opacity="0.9" />
    <rect x="55" y="75" width="90" height="80" rx="16" fill="hsl(var(--primary))" opacity="0.6" />
    
    {/* Head */}
    <rect x="55" y="30" width="90" height="55" rx="18" fill="hsl(var(--secondary))" />
    <rect x="60" y="35" width="80" height="45" rx="14" fill="hsl(var(--secondary))" opacity="0.7" />
    
    {/* Eyes */}
    <circle cx="82" cy="55" r="8" fill="white" />
    <circle cx="118" cy="55" r="8" fill="white" />
    <circle cx="84" cy="53" r="4" fill="hsl(var(--background))" />
    <circle cx="120" cy="53" r="4" fill="hsl(var(--background))" />
    <circle cx="85" cy="52" r="1.5" fill="white" />
    <circle cx="121" cy="52" r="1.5" fill="white" />
    
    {/* Mouth */}
    <path d="M88 68 Q100 78 112 68" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    
    {/* Antenna */}
    <line x1="100" y1="30" x2="100" y2="18" stroke="hsl(var(--secondary))" strokeWidth="3" strokeLinecap="round" />
    <circle cx="100" cy="14" r="5" fill="hsl(var(--primary))" />
    <circle cx="100" cy="14" r="3" fill="hsl(var(--primary))" opacity="0.5">
      <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
    </circle>
    
    {/* Arms */}
    <rect x="30" y="85" width="25" height="12" rx="6" fill="hsl(var(--primary))" opacity="0.7" />
    <rect x="145" y="85" width="25" height="12" rx="6" fill="hsl(var(--primary))" opacity="0.7" />
    
    {/* Legs */}
    <rect x="72" y="155" width="14" height="20" rx="7" fill="hsl(var(--secondary))" opacity="0.6" />
    <rect x="114" y="155" width="14" height="20" rx="7" fill="hsl(var(--secondary))" opacity="0.6" />
    
    {/* Chest light */}
    <circle cx="100" cy="110" r="10" fill="hsl(var(--primary))" opacity="0.3">
      <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="100" cy="110" r="5" fill="hsl(var(--primary-foreground))" opacity="0.8" />
    
    {/* Floating particles */}
    <circle cx="35" cy="45" r="3" fill="hsl(var(--primary))" opacity="0.3">
      <animate attributeName="cy" values="45;38;45" dur="4s" repeatCount="indefinite" />
    </circle>
    <circle cx="170" cy="55" r="2" fill="hsl(var(--secondary))" opacity="0.4">
      <animate attributeName="cy" values="55;48;55" dur="3s" repeatCount="indefinite" />
    </circle>
    <circle cx="25" cy="130" r="2.5" fill="hsl(var(--primary))" opacity="0.2">
      <animate attributeName="cy" values="130;122;130" dur="5s" repeatCount="indefinite" />
    </circle>
    <circle cx="180" cy="120" r="2" fill="hsl(var(--secondary))" opacity="0.3">
      <animate attributeName="cy" values="120;114;120" dur="3.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

export default BotIllustration;

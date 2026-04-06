const NetworkIllustration = ({ className = "", size = 100 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 160 160" fill="none" className={className}>
    {/* Central node */}
    <circle cx="80" cy="80" r="14" fill="hsl(var(--primary))" opacity="0.9" />
    <circle cx="80" cy="80" r="8" fill="hsl(var(--primary-foreground))" opacity="0.8" />
    <circle cx="80" cy="80" r="22" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" strokeDasharray="3 3">
      <animateTransform attributeName="transform" type="rotate" from="0 80 80" to="360 80 80" dur="20s" repeatCount="indefinite" />
    </circle>
    
    {/* Satellite nodes */}
    <circle cx="30" cy="40" r="8" fill="hsl(var(--secondary))" opacity="0.7" />
    <circle cx="130" cy="35" r="6" fill="hsl(var(--primary))" opacity="0.6" />
    <circle cx="140" cy="110" r="9" fill="hsl(var(--secondary))" opacity="0.5" />
    <circle cx="25" cy="120" r="7" fill="hsl(var(--primary))" opacity="0.5" />
    <circle cx="80" cy="20" r="5" fill="hsl(var(--primary))" opacity="0.4" />
    <circle cx="55" cy="145" r="6" fill="hsl(var(--secondary))" opacity="0.4" />
    <circle cx="120" cy="145" r="5" fill="hsl(var(--primary))" opacity="0.3" />
    
    {/* Connection lines */}
    <line x1="80" y1="80" x2="30" y2="40" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.2" />
    <line x1="80" y1="80" x2="130" y2="35" stroke="hsl(var(--secondary))" strokeWidth="1" opacity="0.2" />
    <line x1="80" y1="80" x2="140" y2="110" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.15" />
    <line x1="80" y1="80" x2="25" y2="120" stroke="hsl(var(--secondary))" strokeWidth="1" opacity="0.15" />
    <line x1="80" y1="80" x2="80" y2="20" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.2" />
    <line x1="80" y1="80" x2="55" y2="145" stroke="hsl(var(--secondary))" strokeWidth="1" opacity="0.15" />
    <line x1="30" y1="40" x2="130" y2="35" stroke="hsl(var(--primary))" strokeWidth="0.5" opacity="0.1" />
    <line x1="25" y1="120" x2="55" y2="145" stroke="hsl(var(--secondary))" strokeWidth="0.5" opacity="0.1" />
    
    {/* Pulse on connections */}
    <circle r="2" fill="hsl(var(--primary))" opacity="0.6">
      <animateMotion dur="3s" repeatCount="indefinite" path="M80,80 L30,40" />
    </circle>
    <circle r="2" fill="hsl(var(--secondary))" opacity="0.6">
      <animateMotion dur="4s" repeatCount="indefinite" path="M80,80 L140,110" />
    </circle>
  </svg>
);

export default NetworkIllustration;

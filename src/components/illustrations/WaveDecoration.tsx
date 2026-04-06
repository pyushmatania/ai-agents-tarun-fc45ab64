const WaveDecoration = ({ className = "", variant = "top" }: { className?: string; variant?: "top" | "bottom" }) => (
  <svg viewBox="0 0 400 80" fill="none" preserveAspectRatio="none" className={`w-full ${variant === "bottom" ? "rotate-180" : ""} ${className}`}>
    <path d="M0 40 Q50 10 100 35 Q150 60 200 30 Q250 0 300 25 Q350 50 400 20 L400 80 L0 80 Z" fill="hsl(var(--primary))" opacity="0.05" />
    <path d="M0 50 Q60 20 120 45 Q180 70 240 35 Q300 5 360 30 Q380 40 400 35 L400 80 L0 80 Z" fill="hsl(var(--secondary))" opacity="0.03" />
  </svg>
);

export default WaveDecoration;

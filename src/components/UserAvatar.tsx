import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getFallbackAvatar } from "@/hooks/useAvatar";

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  onClick?: () => void;
}

const sizeMap = {
  sm: "w-7 h-7",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

const textSizeMap = {
  sm: "text-[9px]",
  md: "text-[12px]",
  lg: "text-[16px]",
  xl: "text-[22px]",
};

const emojiSizeMap = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-3xl",
};

export default function UserAvatar({ avatarUrl, name, size = "md", className = "", onClick }: UserAvatarProps) {
  const fallback = getFallbackAvatar(name);

  return (
    <Avatar
      className={`${sizeMap[size]} border border-border/30 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name || "User"} />}
      <AvatarFallback className={`bg-gradient-to-br ${fallback.gradient} ${textSizeMap[size]} font-black text-foreground`}>
        {fallback.initials || <span className={emojiSizeMap[size]}>{fallback.emoji}</span>}
      </AvatarFallback>
    </Avatar>
  );
}

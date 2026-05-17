import { cn } from "@/utils/cn";

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name || "avatar"}
        className={cn("rounded-full object-cover", sizeMap[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-sage-500/20 font-medium text-sage-400",
        sizeMap[size],
        className
      )}
    >
      {initials}
    </div>
  );
}

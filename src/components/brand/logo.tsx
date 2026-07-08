import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "hero";
  className?: string;
  /** Show HoodScope wordmark beside the icon */
  showName?: boolean;
  /** Text color for wordmark — defaults based on context */
  nameClassName?: string;
}

/** Site logo — sources in assets/brand/; public/logo.png is the transparent build */
const sizeMap = {
  sm: 36,
  md: 44,
  lg: 56,
  hero: 88,
};

const nameSizeMap = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-xl",
  hero: "text-2xl",
};

export function Logo({
  size = "md",
  className,
  showName = false,
  nameClassName,
}: LogoProps) {
  const iconSize = sizeMap[size];

  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 shrink-0", className)}
      aria-label="HoodScope — AI token security intelligence"
    >
      <Image
        src="/logo.png"
        alt=""
        width={iconSize}
        height={iconSize}
        unoptimized
        priority
        className="block shrink-0"
        style={{ width: iconSize, height: iconSize }}
      />
      {showName && (
        <span
          className={cn(
            "font-display font-bold tracking-tight",
            nameSizeMap[size],
            nameClassName ?? "text-black font-display font-black"
          )}
        >
          HoodScope
        </span>
      )}
    </Link>
  );
}

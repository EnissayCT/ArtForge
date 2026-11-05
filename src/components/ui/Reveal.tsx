import { cn } from "@/lib/utils";

/**
 * Fades content up as it scrolls into view, using CSS scroll-driven
 * animations. Browsers without support simply show the content.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  return (
    <Tag className={cn("reveal", className)} style={{ "--reveal-shift": `${Math.min(delay, 400) / 20}%` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}

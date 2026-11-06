import { statusInfo } from "@/lib/orders";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const s = statusInfo(status);
  return (
    <span className={cn("inline-flex shrink-0 items-center px-2 py-0.5 text-[11.5px] font-semibold", s.tone, className)} title={s.hint}>
      {s.label}
    </span>
  );
}

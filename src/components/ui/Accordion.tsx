"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function Accordion({
  title,
  children,
  defaultOpen = false,
  className,
  id,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div id={id} className={cn("border-b border-ink/12", className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-[15px] font-semibold">{title}</span>
        <Plus className={cn("size-4 shrink-0 transition-transform duration-500", open && "rotate-45")} strokeWidth={1.6} />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-5 text-[14px] leading-relaxed text-ink/75">{children}</div>
        </div>
      </div>
    </div>
  );
}

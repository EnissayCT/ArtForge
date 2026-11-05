"use client";

import Image from "next/image";
import type { CartItem } from "@/lib/cart";
import { getPhone } from "@/lib/phones";
import { PhoneMockup } from "@/components/phone/PhoneMockup";
import { cn } from "@/lib/utils";

export function CartThumb({ item, className }: { item: CartItem; className?: string }) {
  if (item.kind === "case") {
    return (
      <div className={cn("grid aspect-[4/5] shrink-0 place-items-center bg-paper-2 p-2", className)}>
        <PhoneMockup image={item.thumb} phone={getPhone(item.phone)} className="h-[86%]" />
      </div>
    );
  }
  const frame = item.frame === "chene" ? "#b88a5a" : item.frame === "noir" ? "#1b1a19" : null;
  return (
    <div className={cn("grid aspect-[4/5] shrink-0 place-items-center bg-paper-2", className)}>
      <div
        className={cn("plate-flat relative overflow-hidden", item.landscape ? "aspect-[4/3] w-[80%]" : "aspect-[3/4] w-[66%]")}
        style={frame ? { boxShadow: `0 0 0 3px ${frame}, 0 8px 14px -8px rgba(0,0,0,.4)` } : undefined}
      >
        {item.thumb.startsWith("data:") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.thumb} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <Image src={item.thumb} alt="" fill sizes="96px" className="object-cover" />
        )}
      </div>
    </div>
  );
}

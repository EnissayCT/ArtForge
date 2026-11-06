"use client";

import { Truck } from "lucide-react";
import { deliveryWindow } from "@/lib/pricing";
import { useHydrated } from "@/lib/hooks";
import { useShop } from "@/components/providers/ShopProvider";

export function DeliveryEstimate() {
  const hydrated = useHydrated();
  const { shipping } = useShop();
  const fast = deliveryWindow(new Date(), shipping.fast);
  const other = deliveryWindow(new Date(), shipping.others);
  return (
    <div className="flex gap-3 text-[13.5px]">
      <Truck className="mt-0.5 size-[18px] shrink-0" strokeWidth={1.5} />
      <p className="leading-snug">
        {hydrated ? (
          <>
            Livré <strong>entre le {fast.from} et le {fast.to}</strong> à Casablanca et Rabat,{" "}
            <span className="text-stone">
              {other.from} – {other.to} ailleurs au Maroc.
            </span>
          </>
        ) : (
          <>Livraison en 24 à 72 h partout au Maroc.</>
        )}
      </p>
    </div>
  );
}

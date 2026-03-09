"use client";

import { useMemo } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { calculatePrice, formatPrice } from "@/lib/pricing";
import type { Category, FinishKey, SizeKey } from "@/config/pricing";

export function PriceDisplay() {
  const { category, size, finish, whiteInk, quantity } = useEditorStore();

  const price = useMemo(() => {
    if (!category) return null;
    return calculatePrice({
      category: category as Category,
      size: (category === "METAL_PLATE" ? size : undefined) as SizeKey | undefined,
      finish: finish as FinishKey,
      whiteInk,
      quantity,
    });
  }, [category, size, finish, whiteInk, quantity]);

  if (!price) return null;

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Prix</label>
      <div className="p-4 rounded-lg border border-border bg-card space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Prix unitaire</span>
          <span>{formatPrice(price.unitPrice)}</span>
        </div>

        {price.sizeModifier > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="pl-3">↳ Supplément format</span>
            <span>+{formatPrice(price.sizeModifier)}</span>
          </div>
        )}

        {price.finishSurcharge > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="pl-3">↳ Finition brillante</span>
            <span>+{formatPrice(price.finishSurcharge)}</span>
          </div>
        )}

        {price.whiteInkSurcharge > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="pl-3">↳ Encre blanche</span>
            <span>+{formatPrice(price.whiteInkSurcharge)}</span>
          </div>
        )}

        {quantity > 1 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">× {quantity}</span>
            <span>{formatPrice(price.subtotal)}</span>
          </div>
        )}

        {price.discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Remise ({Math.round(price.discountPercent * 100)}%)</span>
            <span>-{formatPrice(price.discountAmount)}</span>
          </div>
        )}

        <div className="border-t border-border pt-2 flex justify-between text-sm">
          <span className="text-muted-foreground">Livraison</span>
          <span>
            {price.shippingCost === 0 ? (
              <span className="text-green-600 font-medium">Gratuite</span>
            ) : (
              formatPrice(price.shippingCost)
            )}
          </span>
        </div>

        <div className="border-t border-border pt-2 flex justify-between">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold text-accent">
            {formatPrice(price.grandTotal)}
          </span>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          💰 Paiement à la livraison
        </p>
      </div>
    </div>
  );
}

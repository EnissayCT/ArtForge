"use client";

import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/pricing";
import { Minus, Plus, Trash2, Paintbrush } from "lucide-react";

interface CartItemCardProps {
  item: {
    productId: string;
    variantId: string;
    productName: string;
    variantLabel: string;
    previewUrl: string;
    unitPrice: number;
    quantity: number;
  };
  compact?: boolean;
}

export function CartItemCard({ item, compact = false }: CartItemCardProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className={`flex gap-3 ${compact ? "py-3" : "py-4"} border-b border-border last:border-b-0`}>
      {/* Preview */}
      <div
        className={`${
          compact ? "w-16 h-16" : "w-20 h-20"
        } rounded-lg bg-secondary/50 border border-border overflow-hidden flex-shrink-0 flex items-center justify-center`}
      >
        {item.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.previewUrl}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <Paintbrush className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-semibold text-foreground ${compact ? "text-sm" : ""}`}>
          {item.productName}
        </h4>
        <p className="text-xs text-muted-foreground truncate">
          {item.variantLabel}
        </p>
        <p className={`font-medium text-accent ${compact ? "text-sm" : ""} mt-0.5`}>
          {formatPrice(item.unitPrice)}
        </p>
      </div>

      {/* Quantity + Remove */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.variantId)}
          className="text-muted-foreground hover:text-destructive transition-colors p-1"
          aria-label="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              updateQuantity(item.variantId, Math.max(1, item.quantity - 1))
            }
            className="h-6 w-6 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
            disabled={item.quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="text-sm font-medium w-6 text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
            className="h-6 w-6 rounded-md border border-border flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

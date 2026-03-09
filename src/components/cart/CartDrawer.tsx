"use client";

import { Fragment, useEffect, useRef } from "react";
import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/pricing";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { Button } from "@/components/ui/button";
import { X, ShoppingBag, ArrowRight } from "lucide-react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const clearCart = useCartStore((s) => s.clearCart);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const subtotal = getSubtotal();
  const count = getItemCount();
  const shippingFree = subtotal >= 500;
  const shipping = shippingFree ? 0 : 30;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-accent" />
            <h2 className="font-semibold text-lg">
              Panier ({count})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Votre panier est vide
              </p>
              <Link href="/customize" onClick={onClose}>
                <Button variant="accent" size="sm">
                  Créer un produit
                </Button>
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItemCard key={item.variantId} item={item} compact />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className={`font-medium ${shippingFree ? "text-green-600" : ""}`}>
                  {shippingFree ? "Gratuite" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border text-base font-bold">
                <span>Total</span>
                <span className="text-accent">
                  {formatPrice(subtotal + shipping)}
                </span>
              </div>
            </div>

            <Link href="/checkout" onClick={onClose}>
              <Button variant="accent" size="lg" className="w-full">
                Commander (COD)
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <div className="flex items-center justify-between">
              <Link
                href="/cart"
                onClick={onClose}
                className="text-sm text-accent hover:underline"
              >
                Voir le panier complet
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Vider le panier
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

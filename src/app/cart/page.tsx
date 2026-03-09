"use client";

import Link from "next/link";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/pricing";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Paintbrush,
  Truck,
  Banknote,
} from "lucide-react";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const clearCart = useCartStore((s) => s.clearCart);

  const subtotal = getSubtotal();
  const count = getItemCount();
  const shippingFree = subtotal >= 500;
  const shipping = shippingFree ? 0 : 30;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
          <p className="text-muted-foreground mb-6">
            Commencez par personnaliser un produit pour l&apos;ajouter à votre
            panier.
          </p>
          <Link href="/customize">
            <Button variant="accent" size="lg">
              <Paintbrush className="h-5 w-5" />
              Créer un produit
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panier</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {count} article{count > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-muted-foreground hover:text-destructive transition-colors"
        >
          Vider le panier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-0 divide-y divide-border border border-border rounded-xl p-4 bg-card">
          {items.map((item) => (
            <CartItemCard key={item.variantId} item={item} />
          ))}
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="border border-border rounded-xl p-6 bg-card sticky top-20 space-y-4">
            <h2 className="font-bold text-lg">Récapitulatif</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className={shippingFree ? "text-green-600" : ""}>
                  {shippingFree ? "Gratuite" : formatPrice(shipping)}
                </span>
              </div>
              {!shippingFree && (
                <p className="text-xs text-muted-foreground">
                  Livraison gratuite à partir de {formatPrice(500)}
                </p>
              )}
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-accent">{formatPrice(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="block">
              <Button variant="accent" size="lg" className="w-full">
                Passer la commande
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            {/* Trust badges */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Banknote className="h-4 w-4 text-accent" />
                Paiement à la livraison (COD)
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck className="h-4 w-4 text-accent" />
                Livraison partout au Maroc
              </div>
            </div>
          </div>

          {/* Continue shopping */}
          <Link
            href="/shop"
            className="flex items-center gap-1 text-sm text-accent hover:underline mt-4 justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
            Continuer vos achats
          </Link>
        </div>
      </div>
    </main>
  );
}

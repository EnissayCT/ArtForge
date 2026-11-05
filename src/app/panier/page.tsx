"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCart, cartTotals } from "@/lib/cart";
import { BUNDLE, formatDH } from "@/lib/pricing";
import { useHydrated } from "@/lib/hooks";
import { CartLine, ShippingMeter } from "@/components/cart/CartDrawer";
import { ArtCard } from "@/components/product/ArtCard";
import { mixed } from "@/lib/catalog";

export default function CartPage() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const list = hydrated ? items : [];
  const t = cartTotals(list);
  const suggestions = mixed(4, 20);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-10 sm:px-8">
      <h1 className="display text-[60px] sm:text-[96px]">Panier</h1>
      {hydrated && list.length === 0 ? (
        <div className="py-16">
          <p className="text-[17px] text-stone">Votre panier est vide pour l&apos;instant.</p>
          <div className="mt-6 flex gap-4">
            <Link href="/boutique" className="label link-u">Voir la boutique →</Link>
            <Link href="/creer" className="label link-u">Créer la vôtre →</Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="mb-2 max-w-md">
              <ShippingMeter items={list} />
            </div>
            <ul className="divide-y divide-ink/10 border-b border-ink/10">
              {list.map((i) => (
                <CartLine key={i.key} item={i} />
              ))}
            </ul>
          </div>
          <aside className="lg:col-span-4">
            <div className="bg-paper-2 p-6 lg:sticky lg:top-24">
              <dl className="space-y-2 text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-stone">Sous-total ({t.count} article{t.count > 1 ? "s" : ""})</dt>
                  <dd className="tabular-nums">{formatDH(t.subtotal)}</dd>
                </div>
                {t.discount > 0 && (
                  <div className="flex justify-between text-ember-deep">
                    <dt>Pack {BUNDLE.minPlates} plaques (−{BUNDLE.percent} %)</dt>
                    <dd className="tabular-nums">−{formatDH(t.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-stone">Livraison</dt>
                  <dd className="tabular-nums">{t.shipping === 0 ? "Offerte" : formatDH(t.shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-ink/10 pt-3 text-[19px] font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatDH(t.total)}</dd>
                </div>
              </dl>
              <Link href="/commande" className="mt-5 flex items-center justify-between bg-ink px-5 py-4 text-paper transition-colors hover:bg-ember">
                <span className="text-[14px] font-semibold uppercase tracking-wide">Commander</span>
                <ArrowRight className="size-4" />
              </Link>
              <p className="mt-3 text-center text-[12.5px] text-stone">Paiement en espèces à la livraison</p>
            </div>
          </aside>
        </div>
      )}
      <section className="mt-24 border-t border-ink/12 pt-10">
        <h2 className="display mb-8 text-[40px]">Pour compléter le mur</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {suggestions.map((a) => (
            <ArtCard key={a.slug} art={a} />
          ))}
        </div>
      </section>
    </div>
  );
}

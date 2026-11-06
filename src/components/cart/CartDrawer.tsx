"use client";

import Link from "next/link";
import { useCallback } from "react";
import { ArrowRight, Minus, Plus, X } from "lucide-react";
import { useCart, type CartItem } from "@/lib/cart";
import { formatDH } from "@/lib/pricing";
import { useShop } from "@/components/providers/ShopProvider";
import { useEscape, useHydrated, useLockBody } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { CartThumb } from "./CartThumb";

export function CartLine({ item, compact }: { item: CartItem; compact?: boolean }) {
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const shop = useShop();
  return (
    <li className="flex gap-4 py-5">
      <CartThumb item={item} className={compact ? "w-[72px]" : "w-[92px]"} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight">{item.title}</p>
            <p className="mt-1 text-[13px] text-stone">{item.subtitle}</p>
          </div>
          <button onClick={() => remove(item.key)} aria-label="Retirer" className="-mr-1 p-1 text-stone hover:text-ink">
            <X className="size-4" strokeWidth={1.6} />
          </button>
        </div>
        <div className="mt-auto flex items-end justify-between pt-3">
          <div className="flex items-center border border-ink/15">
            <button
              onClick={() => setQty(item.key, item.qty - 1)}
              disabled={item.qty <= 1}
              className="grid size-8 place-items-center disabled:opacity-30"
              aria-label="Diminuer la quantité"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="label w-6 text-center text-[12px]">{item.qty}</span>
            <button
              onClick={() => setQty(item.key, item.qty + 1)}
              className="grid size-8 place-items-center"
              aria-label="Augmenter la quantité"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <p className="text-[15px] font-semibold tabular-nums">{formatDH(shop.unitPrice(item) * item.qty)}</p>
        </div>
      </div>
    </li>
  );
}

export function ShippingMeter({ items }: { items: CartItem[] }) {
  const shop = useShop();
  const t = shop.totals(items);
  const free = Math.max(1, shop.shipping.freeAbove);
  const pct = Math.min(100, ((free - t.toFreeShipping) / free) * 100);
  const platesMissing = shop.bundle.percent > 0 ? shop.bundle.minPlates - t.plateCount : 0;
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[13px]">
          {t.toFreeShipping > 0 ? (
            <>
              Plus que <strong>{formatDH(t.toFreeShipping)}</strong> pour la livraison offerte
            </>
          ) : (
            <strong>Livraison offerte ✓</strong>
          )}
        </p>
        <div className="mt-2 h-[3px] w-full bg-ink/10">
          <div className="h-full bg-ember transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
      {t.plateCount > 0 && platesMissing > 0 && (
        <p className="text-[13px] text-stone">
          Ajoutez {platesMissing} plaque{platesMissing > 1 ? "s" : ""} : −{shop.bundle.percent} % sur toutes vos plaques.
        </p>
      )}
    </div>
  );
}

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const close = useCallback(() => setOpen(false), [setOpen]);
  useLockBody(open);
  useEscape(close, open);
  const shop = useShop();
  const list = hydrated ? items : [];
  const t = shop.totals(list);

  return (
    <div className={cn("fixed inset-0 z-[70]", open ? "visible" : "invisible")} aria-hidden={!open}>
      <div
        onClick={close}
        className={cn("absolute inset-0 bg-ink/50 transition-opacity duration-500", open ? "opacity-100" : "opacity-0")}
      />
      <aside
        role="dialog"
        aria-label="Panier"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col bg-paper shadow-2xl transition-transform duration-500 ease-[var(--ease-out-expo)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-6 py-5">
          <p className="display text-[30px]">
            Panier <span className="text-stone">({t.count})</span>
          </p>
          <button onClick={close} aria-label="Fermer le panier" className="-mr-2 p-2">
            <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center px-6">
            <p className="display text-[44px] leading-[0.9]">Un mur vide,<br />c&apos;est triste.</p>
            <p className="mt-4 text-[15px] text-stone">Trouvez la pièce qui lui manque.</p>
            <div className="mt-8 flex flex-col gap-3 self-stretch">
              <Link href="/boutique" onClick={close} className="flex items-center justify-between bg-ink px-5 py-4 text-paper">
                <span className="text-[14px] font-semibold uppercase tracking-wide">Voir la boutique</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/creer" onClick={close} className="flex items-center justify-between border border-ink/20 px-5 py-4">
                <span className="text-[14px] font-semibold uppercase tracking-wide">Imprimer ma photo</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-ink/10 px-6 py-4">
              <ShippingMeter items={list} />
            </div>
            <ul className="flex-1 divide-y divide-ink/10 overflow-y-auto px-6">
              {list.map((i) => (
                <CartLine key={i.key} item={i} />
              ))}
            </ul>
            <div className="border-t border-ink/10 px-6 pb-6 pt-4">
              <dl className="space-y-1.5 text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-stone">Sous-total</dt>
                  <dd className="tabular-nums">{formatDH(t.subtotal)}</dd>
                </div>
                {t.discount > 0 && (
                  <div className="flex justify-between text-ember-deep">
                    <dt>Pack {shop.bundle.minPlates} plaques et + (−{shop.bundle.percent} %)</dt>
                    <dd className="tabular-nums">−{formatDH(t.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-stone">Livraison</dt>
                  <dd className="tabular-nums">{t.shipping === 0 ? "Offerte" : formatDH(t.shipping)}</dd>
                </div>
                <div className="flex justify-between pt-2 text-[17px] font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatDH(t.total)}</dd>
                </div>
              </dl>
              <Link
                href="/commande"
                onClick={close}
                className="mt-5 flex items-center justify-between bg-ink px-5 py-4 text-paper transition-colors hover:bg-ember"
              >
                <span className="text-[14px] font-semibold uppercase tracking-wide">Commander</span>
                <span className="label text-paper/70">Paiement à la livraison</span>
              </Link>
              <Link href="/panier" onClick={close} className="label mt-3 block text-center text-stone hover:text-ink">
                Voir le panier détaillé
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

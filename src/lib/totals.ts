import type { CaseTypeId, FinishId, FrameId, SizeId } from "./pricing";
import { BUNDLE, PROMOS, SHIPPING, casePrice, platePrice } from "./pricing";

export type PricedItem = { qty: number } & (
  | { kind: "plate"; size: SizeId; finish: FinishId; frame: FrameId }
  | { kind: "case"; caseType: CaseTypeId }
);

/** Shared by the cart UI and the order API so the server never trusts client totals. */
export function cartTotals(items: PricedItem[], promoCode?: string) {
  const price = (i: PricedItem) => (i.kind === "plate" ? platePrice(i.size, i.finish, i.frame) : casePrice(i.caseType));
  const subtotal = items.reduce((sum, i) => sum + price(i) * i.qty, 0);
  const plates = items.filter((i) => i.kind === "plate");
  const plateCount = plates.reduce((n, i) => n + i.qty, 0);
  const plateSubtotal = plates.reduce((sum, i) => sum + price(i) * i.qty, 0);
  const discount = plateCount >= BUNDLE.minPlates ? Math.round((plateSubtotal * BUNDLE.percent) / 100) : 0;
  const promoPercent = promoCode ? (PROMOS[promoCode.trim().toUpperCase()] ?? 0) : 0;
  const promo = Math.round(((subtotal - discount) * promoPercent) / 100);
  const afterDiscount = subtotal - discount - promo;
  const shipping = items.length === 0 || afterDiscount >= SHIPPING.freeAbove ? 0 : SHIPPING.price;
  return {
    subtotal,
    discount,
    promo,
    promoPercent,
    plateCount,
    shipping,
    total: afterDiscount + shipping,
    count: items.reduce((n, i) => n + i.qty, 0),
    toFreeShipping: Math.max(0, SHIPPING.freeAbove - afterDiscount),
  };
}

/** All pricing in MAD (Moroccan Dirham) */

export const PRICING = {
  /** Base prices by product category */
  base: {
    METAL_PLATE: 150, // MAD for A4
    PHONE_CASE: 120,  // MAD per case
  },

  /** Size price modifiers (added to base) */
  sizeModifier: {
    A4: 0,
    A3: 70,
  },

  /** Finish surcharges */
  finishSurcharge: {
    MATTE: 0,
    GLOSS: 20,
  },

  /** White ink / extra layer surcharge */
  whiteInkSurcharge: 30,

  /** Quantity discount tiers */
  quantityDiscounts: [
    { minQty: 1, maxQty: 1, discount: 0 },
    { minQty: 2, maxQty: 4, discount: 0.05 },   // 5%
    { minQty: 5, maxQty: 9, discount: 0.10 },   // 10%
    { minQty: 10, maxQty: Infinity, discount: 0.15 }, // 15%
  ],

  /** Flat shipping cost within Morocco */
  shipping: {
    standard: 30, // MAD
    express: 60,  // MAD
    freeAbove: 500, // Free standard shipping above this total
  },
} as const;

export type Category = "METAL_PLATE" | "PHONE_CASE";
export type SizeKey = "A3" | "A4";
export type FinishKey = "MATTE" | "GLOSS";

export interface PriceCalculationInput {
  category: Category;
  size?: SizeKey;
  finish: FinishKey;
  whiteInk?: boolean;
  quantity: number;
}

export interface PriceBreakdown {
  basePrice: number;
  sizeModifier: number;
  finishSurcharge: number;
  whiteInkSurcharge: number;
  unitPrice: number;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  shippingCost: number;
  grandTotal: number;
}

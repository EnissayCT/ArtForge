import {
  PRICING,
  type PriceCalculationInput,
  type PriceBreakdown,
} from "@/config/pricing";

export function calculatePrice(input: PriceCalculationInput): PriceBreakdown {
  const { category, size, finish, whiteInk = false, quantity } = input;

  // Base price for product category
  const basePrice = PRICING.base[category];

  // Size modifier (only for metal plates)
  const sizeModifier = size ? PRICING.sizeModifier[size] : 0;

  // Finish surcharge
  const finishSurcharge = PRICING.finishSurcharge[finish];

  // White ink surcharge
  const whiteInkSurcharge = whiteInk ? PRICING.whiteInkSurcharge : 0;

  // Unit price
  const unitPrice = basePrice + sizeModifier + finishSurcharge + whiteInkSurcharge;

  // Subtotal before discount
  const subtotal = unitPrice * quantity;

  // Find applicable quantity discount
  const discountTier = PRICING.quantityDiscounts.find(
    (tier) => quantity >= tier.minQty && quantity <= tier.maxQty
  );
  const discountPercent = discountTier?.discount ?? 0;
  const discountAmount = Math.round(subtotal * discountPercent);

  // Total after discount
  const total = subtotal - discountAmount;

  // Shipping
  const shippingCost =
    total >= PRICING.shipping.freeAbove ? 0 : PRICING.shipping.standard;

  // Grand total
  const grandTotal = total + shippingCost;

  return {
    basePrice,
    sizeModifier,
    finishSurcharge,
    whiteInkSurcharge,
    unitPrice,
    subtotal,
    discountPercent,
    discountAmount,
    total,
    shippingCost,
    grandTotal,
  };
}

/** Format price in MAD */
export function formatPrice(amount: number): string {
  return `${amount.toFixed(0)} MAD`;
}

/** Generate a human-friendly variant label */
export function getVariantLabel(variant: {
  size?: string | null;
  finish: string;
  phoneModel?: string | null;
}): string {
  const parts: string[] = [];

  if (variant.phoneModel) {
    const modelLabels: Record<string, string> = {
      "iphone-14": "iPhone 14",
      "iphone-15": "iPhone 15",
      "iphone-16": "iPhone 16",
      "samsung-s23": "Samsung S23",
      "samsung-s24": "Samsung S24",
    };
    parts.push(modelLabels[variant.phoneModel] || variant.phoneModel);
  }

  if (variant.size) {
    parts.push(variant.size);
  }

  parts.push(variant.finish === "GLOSS" ? "Brillant" : "Mat");

  return parts.join(" — ");
}

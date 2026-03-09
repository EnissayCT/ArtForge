export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: "METAL_PLATE" | "PHONE_CASE";
  basePrice: number;
  images: string[];
  modelUrl: string | null;
  templateUrl: string | null;
  active: boolean;
  variants: ProductVariant[];
  createdAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: "A3" | "A4" | null;
  finish: "MATTE" | "GLOSS";
  phoneModel: string | null;
  priceModifier: number;
  sku: string;
  active: boolean;
}

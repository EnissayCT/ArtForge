export type PhoneModelId =
  | "iphone-14"
  | "iphone-15"
  | "iphone-16"
  | "samsung-s23"
  | "samsung-s24";

export interface PrintArea {
  /** Width in mm */
  widthMm: number;
  /** Height in mm */
  heightMm: number;
  /** Minimum pixel width at 300 DPI */
  minPixelWidth: number;
  /** Minimum pixel height at 300 DPI */
  minPixelHeight: number;
}

export interface PhoneModelConfig {
  id: PhoneModelId;
  label: string;
  brand: "Apple" | "Samsung";
  printArea: PrintArea;
  /** Aspect ratio for canvas (width/height) */
  aspectRatio: number;
  /** Dimensions for 3D preview */
  dimensions: { width: number; height: number; depth: number };
}

export interface PlateConfig {
  size: "A3" | "A4";
  label: string;
  printArea: PrintArea;
  aspectRatio: number;
  dimensions: { width: number; height: number; depth: number };
}

export const PHONE_MODELS: Record<PhoneModelId, PhoneModelConfig> = {
  "iphone-14": {
    id: "iphone-14",
    label: "iPhone 14",
    brand: "Apple",
    printArea: { widthMm: 70, heightMm: 145, minPixelWidth: 827, minPixelHeight: 1713 },
    aspectRatio: 70 / 145,
    dimensions: { width: 71.5, height: 146.7, depth: 7.8 },
  },
  "iphone-15": {
    id: "iphone-15",
    label: "iPhone 15",
    brand: "Apple",
    printArea: { widthMm: 71, heightMm: 147, minPixelWidth: 839, minPixelHeight: 1736 },
    aspectRatio: 71 / 147,
    dimensions: { width: 71.6, height: 147.6, depth: 7.8 },
  },
  "iphone-16": {
    id: "iphone-16",
    label: "iPhone 16",
    brand: "Apple",
    printArea: { widthMm: 71.6, heightMm: 147.6, minPixelWidth: 846, minPixelHeight: 1744 },
    aspectRatio: 71.6 / 147.6,
    dimensions: { width: 71.6, height: 147.6, depth: 7.8 },
  },
  "samsung-s23": {
    id: "samsung-s23",
    label: "Samsung Galaxy S23",
    brand: "Samsung",
    printArea: { widthMm: 70.9, heightMm: 146.3, minPixelWidth: 838, minPixelHeight: 1729 },
    aspectRatio: 70.9 / 146.3,
    dimensions: { width: 70.9, height: 146.3, depth: 7.6 },
  },
  "samsung-s24": {
    id: "samsung-s24",
    label: "Samsung Galaxy S24",
    brand: "Samsung",
    printArea: { widthMm: 70.6, heightMm: 147, minPixelWidth: 834, minPixelHeight: 1736 },
    aspectRatio: 70.6 / 147,
    dimensions: { width: 70.6, height: 147, depth: 7.6 },
  },
};

export const PLATE_SIZES: Record<"A3" | "A4", PlateConfig> = {
  A4: {
    size: "A4",
    label: "A4 (210 × 297 mm)",
    printArea: { widthMm: 210, heightMm: 297, minPixelWidth: 2480, minPixelHeight: 3508 },
    aspectRatio: 210 / 297,
    dimensions: { width: 210, height: 297, depth: 2 },
  },
  A3: {
    size: "A3",
    label: "A3 (297 × 420 mm)",
    printArea: { widthMm: 297, heightMm: 420, minPixelWidth: 3508, minPixelHeight: 4961 },
    aspectRatio: 297 / 420,
    dimensions: { width: 297, height: 420, depth: 2 },
  },
};

export const FINISHES = [
  { id: "MATTE" as const, label: "Mat", description: "Fini doux et non réfléchissant" },
  { id: "GLOSS" as const, label: "Brillant", description: "Fini éclatant et réfléchissant" },
];

export const PRODUCT_CATEGORIES = [
  {
    id: "METAL_PLATE" as const,
    slug: "metal-plates",
    label: "Plaques Métal",
    description: "Plaques en aluminium imprimées UV",
    icon: "frame",
  },
  {
    id: "PHONE_CASE" as const,
    slug: "phone-cases",
    label: "Coques Téléphone",
    description: "Coques personnalisées imprimées UV",
    icon: "smartphone",
  },
];

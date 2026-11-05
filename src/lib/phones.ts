/**
 * Phone models for printed cases. Dimensions are in millimetres.
 * The camera layout is drawn on the 2D mockup and the 3D model, measured from
 * the top-left corner of the back of the phone.
 */

export type Brand = "Apple" | "Samsung" | "Xiaomi";

export interface Lens {
  x: number;
  y: number;
  r: number;
}

export interface PhoneModel {
  id: string;
  name: string;
  brand: Brand;
  w: number;
  h: number;
  d: number;
  /** corner radius */
  radius: number;
  /** camera module (omit for phones whose lenses sit straight on the back) */
  module?: { x: number; y: number; w: number; h: number; r: number };
  lenses: Lens[];
  magsafe?: boolean;
}

const iphoneSquare2 = (): Pick<PhoneModel, "module" | "lenses"> => ({
  module: { x: 7, y: 7, w: 30, h: 30, r: 8 },
  lenses: [
    { x: 15, y: 15, r: 6.2 },
    { x: 29, y: 29, r: 6.2 },
  ],
});

const iphonePro3 = (size = 37): Pick<PhoneModel, "module" | "lenses"> => ({
  module: { x: 6, y: 6, w: size, h: size, r: 9 },
  lenses: [
    { x: 6 + size * 0.27, y: 6 + size * 0.27, r: size * 0.19 },
    { x: 6 + size * 0.27, y: 6 + size * 0.73, r: size * 0.19 },
    { x: 6 + size * 0.73, y: 6 + size * 0.5, r: size * 0.19 },
  ],
});

const iphonePill: Pick<PhoneModel, "module" | "lenses"> = {
  module: { x: 8, y: 7, w: 19, h: 38, r: 9.5 },
  lenses: [
    { x: 17.5, y: 16.5, r: 6.2 },
    { x: 17.5, y: 35.5, r: 6.2 },
  ],
};

const iphonePlateau = (w: number): Pick<PhoneModel, "module" | "lenses"> => ({
  module: { x: 3, y: 4, w: w - 6, h: 31, r: 10 },
  lenses: [
    { x: 14, y: 13, r: 6.6 },
    { x: 14, y: 27, r: 6.6 },
    { x: 28, y: 20, r: 6.6 },
  ],
});

const samsungTriple = (x = 13, y = 14, gap = 13.5, r = 5.4): Pick<PhoneModel, "module" | "lenses"> => ({
  lenses: [
    { x, y, r },
    { x, y: y + gap, r },
    { x, y: y + gap * 2, r },
  ],
});

const redmiModule: Pick<PhoneModel, "module" | "lenses"> = {
  module: { x: 6, y: 6, w: 28, h: 40, r: 7 },
  lenses: [
    { x: 14, y: 15, r: 5.6 },
    { x: 14, y: 30, r: 4.4 },
    { x: 26, y: 15, r: 3 },
  ],
};

export const PHONES: PhoneModel[] = [
  { id: "iphone-17-pro-max", name: "iPhone 17 Pro Max", brand: "Apple", w: 78, h: 163.4, d: 8.8, radius: 12, magsafe: true, ...iphonePlateau(78) },
  { id: "iphone-17-pro", name: "iPhone 17 Pro", brand: "Apple", w: 71.9, h: 150, d: 8.8, radius: 11, magsafe: true, ...iphonePlateau(71.9) },
  { id: "iphone-17", name: "iPhone 17", brand: "Apple", w: 71.5, h: 149.6, d: 7.9, radius: 11, magsafe: true, ...iphonePill },
  { id: "iphone-16-pro-max", name: "iPhone 16 Pro Max", brand: "Apple", w: 77.6, h: 163, d: 8.3, radius: 12, magsafe: true, ...iphonePro3(40) },
  { id: "iphone-16-pro", name: "iPhone 16 Pro", brand: "Apple", w: 71.5, h: 149.6, d: 8.3, radius: 11, magsafe: true, ...iphonePro3(37) },
  { id: "iphone-16", name: "iPhone 16", brand: "Apple", w: 71.6, h: 147.6, d: 7.8, radius: 11, magsafe: true, ...iphonePill },
  { id: "iphone-15-pro-max", name: "iPhone 15 Pro Max", brand: "Apple", w: 76.7, h: 159.9, d: 8.3, radius: 12, magsafe: true, ...iphonePro3(39) },
  { id: "iphone-15-pro", name: "iPhone 15 Pro", brand: "Apple", w: 70.6, h: 146.6, d: 8.3, radius: 11, magsafe: true, ...iphonePro3(36) },
  { id: "iphone-15", name: "iPhone 15", brand: "Apple", w: 71.6, h: 147.6, d: 7.8, radius: 11, magsafe: true, ...iphoneSquare2() },
  { id: "iphone-14", name: "iPhone 14", brand: "Apple", w: 71.5, h: 146.7, d: 7.8, radius: 11, magsafe: true, ...iphoneSquare2() },
  { id: "iphone-13", name: "iPhone 13", brand: "Apple", w: 71.5, h: 146.7, d: 7.6, radius: 11, magsafe: true, ...iphoneSquare2() },
  { id: "galaxy-s25-ultra", name: "Galaxy S25 Ultra", brand: "Samsung", w: 77.6, h: 162.8, d: 8.2, radius: 7, lenses: [
    { x: 14, y: 14, r: 5.8 }, { x: 14, y: 28, r: 5.8 }, { x: 14, y: 42, r: 5.8 }, { x: 27, y: 21, r: 4.6 }, { x: 27, y: 35, r: 3 },
  ] },
  { id: "galaxy-s25", name: "Galaxy S25", brand: "Samsung", w: 70.5, h: 146.9, d: 7.2, radius: 10, ...samsungTriple() },
  { id: "galaxy-s24-ultra", name: "Galaxy S24 Ultra", brand: "Samsung", w: 79, h: 162.3, d: 8.6, radius: 6, lenses: [
    { x: 14, y: 14, r: 5.8 }, { x: 14, y: 28, r: 5.8 }, { x: 14, y: 42, r: 5.8 }, { x: 27, y: 21, r: 4.6 }, { x: 27, y: 35, r: 3 },
  ] },
  { id: "galaxy-s24", name: "Galaxy S24", brand: "Samsung", w: 70.6, h: 147, d: 7.6, radius: 10, ...samsungTriple() },
  { id: "galaxy-a55", name: "Galaxy A55", brand: "Samsung", w: 77.4, h: 161.1, d: 8.2, radius: 11, ...samsungTriple(14, 15, 14, 6) },
  { id: "redmi-note-14-pro", name: "Redmi Note 14 Pro", brand: "Xiaomi", w: 74.4, h: 162.3, d: 8.2, radius: 11, ...redmiModule },
  { id: "redmi-note-13", name: "Redmi Note 13", brand: "Xiaomi", w: 75.8, h: 162.2, d: 8, radius: 11, ...redmiModule },
  { id: "xiaomi-14t", name: "Xiaomi 14T", brand: "Xiaomi", w: 75.1, h: 160.5, d: 7.8, radius: 10, ...redmiModule },
];

export const BRANDS: Brand[] = ["Apple", "Samsung", "Xiaomi"];
export const DEFAULT_PHONE = "iphone-16";

export function getPhone(id: string) {
  return PHONES.find((p) => p.id === id) ?? PHONES.find((p) => p.id === DEFAULT_PHONE)!;
}

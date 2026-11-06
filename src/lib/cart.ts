"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CaseTypeId, FinishId, FrameId, SizeId } from "./pricing";

export type CartItem =
  | {
      key: string;
      kind: "plate";
      artSlug?: string;
      /** id of a customer upload in IndexedDB */
      customId?: string;
      title: string;
      subtitle: string;
      thumb: string;
      landscape: boolean;
      size: SizeId;
      finish: FinishId;
      frame: FrameId;
      qty: number;
    }
  | {
      key: string;
      kind: "case";
      artSlug?: string;
      customId?: string;
      title: string;
      subtitle: string;
      thumb: string;
      phone: string;
      caseType: CaseTypeId;
      qty: number;
    };

export type NewCartItem = CartItem extends infer T ? (T extends CartItem ? Omit<T, "key" | "qty"> : never) : never;

function itemKey(i: NewCartItem) {
  return i.kind === "plate"
    ? ["p", i.artSlug ?? i.customId, i.size, i.finish, i.frame].join(":")
    : ["c", i.artSlug ?? i.customId, i.phone, i.caseType].join(":");
}

interface CartState {
  items: CartItem[];
  open: boolean;
  lastAdded?: string;
  add: (item: NewCartItem, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      add: (item, qty = 1) =>
        set((s) => {
          const key = itemKey(item);
          const existing = s.items.find((i) => i.key === key);
          const items = existing
            ? s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(20, i.qty + qty) } : i))
            : [...s.items, { ...item, key, qty } as CartItem];
          return { items, open: true, lastAdded: key };
        }),
      setQty: (key, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(20, qty)) } : i)),
        })),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "artforge-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

"use client";

import { createContext, useContext, useMemo } from "react";
import { makeShop, type PublicSettings, type Shop } from "@/lib/pricing";
import { makeCatalog, type Catalog, type CatalogData } from "@/lib/catalog";

const ShopContext = createContext<{ shop: Shop; catalog: Catalog } | null>(null);

/** Live settings and catalog, loaded on the server for every request. */
export function ShopProvider({
  settings,
  catalog,
  children,
}: {
  settings: PublicSettings;
  catalog: CatalogData;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ shop: makeShop(settings), catalog: makeCatalog(catalog) }), [settings, catalog]);
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

function useCtx() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("ShopProvider missing");
  return ctx;
}

export function useShop() {
  return useCtx().shop;
}

export function useCatalog() {
  return useCtx().catalog;
}

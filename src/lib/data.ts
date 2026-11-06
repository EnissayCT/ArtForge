import "server-only";
import { connection } from "next/server";
import seedArtworks from "@/data/artworks.json";
import seedCollections from "@/data/collections.json";
import { readJson, writeJson } from "./store";
import { DEFAULT_SETTINGS, makeShop, toPublic, type StoreSettings } from "./pricing";
import { makeCatalog, type Artwork, type CatalogData, type Collection } from "./catalog";

/*
 * Live store data. Read once from disk, then served from memory; every admin
 * save writes the file and refreshes the cache. One Node process serves the
 * site, so the cache is always in sync. Calling connection() makes every page
 * that reads this data render per request, so admin edits show up immediately.
 */

let settingsCache: StoreSettings | null = null;
let catalogCache: CatalogData | null = null;

function mergeSettings(saved: Partial<StoreSettings> | null): StoreSettings {
  const d = DEFAULT_SETTINGS;
  if (!saved) return structuredClone(d);
  return {
    ...structuredClone(d),
    ...saved,
    brand: { ...d.brand, ...saved.brand },
    bundle: { ...d.bundle, ...saved.bundle },
    shipping: { ...d.shipping, ...saved.shipping },
    templates: { ...d.templates, ...saved.templates },
  };
}

export async function getSettings(): Promise<StoreSettings> {
  await connection();
  if (!settingsCache) settingsCache = mergeSettings(await readJson<Partial<StoreSettings> | null>("settings.json", null));
  return settingsCache;
}

export async function saveSettings(next: StoreSettings) {
  await writeJson("settings.json", next);
  settingsCache = next;
}

export async function getPublicSettings() {
  return toPublic(await getSettings());
}

export async function getShop() {
  return makeShop(toPublic(await getSettings()));
}

function seed(): CatalogData {
  return {
    artworks: structuredClone(seedArtworks as Artwork[]),
    collections: structuredClone(seedCollections as Collection[]),
  };
}

/** Full catalog including hidden works (admin). */
export async function getCatalogData(): Promise<CatalogData> {
  await connection();
  if (!catalogCache) catalogCache = await readJson<CatalogData>("catalog.json", seed());
  return catalogCache;
}

export async function saveCatalogData(next: CatalogData) {
  await writeJson("catalog.json", next);
  catalogCache = next;
}

/** Public catalog helpers (hidden works removed). */
export async function getCatalog() {
  return makeCatalog(await getCatalogData());
}

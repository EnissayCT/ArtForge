"use server";

import { randomBytes } from "crypto";
import { z } from "zod";
import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { changePassword, login, logout, logoutOthers, requireAdmin } from "@/lib/auth";
import { deleteMedia, imageKind, mutateJson, saveMedia } from "@/lib/store";
import { getCatalogData, getSettings, saveCatalogData, saveSettings } from "@/lib/data";
import { NO_FRAME, type StoreSettings } from "@/lib/pricing";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/orders";
import type { Artwork, Collection } from "@/lib/catalog";
import { toIntlMA } from "@/lib/site";
import { PHONES } from "@/lib/phones";

export type ActionState = { ok?: boolean; error?: string; message?: string } | null;

/** Purges cached pages and re-renders the admin screen the action was called from. */
function refreshAll() {
  revalidatePath("/", "layout");
  refresh();
}

function refreshAdmin() {
  revalidatePath("/admin", "layout");
  refresh();
}

/* ---------------------------------------------------------------- session */

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const res = await login(String(fd.get("password") ?? ""), String(fd.get("code") ?? ""));
  if (!res.ok) return { error: res.error };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

export async function logoutOthersAction(): Promise<ActionState> {
  const session = await requireAdmin();
  await logoutOthers(session);
  refreshAdmin();
  return { ok: true, message: "Les autres appareils ont été déconnectés." };
}

export async function changePasswordAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const session = await requireAdmin();
  const next = String(fd.get("next") ?? "");
  if (next !== String(fd.get("confirm") ?? "")) return { error: "Les deux nouveaux mots de passe ne correspondent pas." };
  const res = await changePassword(session, String(fd.get("current") ?? ""), String(fd.get("code") ?? ""), next);
  if (!res.ok) return { error: res.error };
  return { ok: true, message: "Mot de passe changé. Les autres appareils ont été déconnectés." };
}

/* ---------------------------------------------------------------- orders */

const OrderNumber = z.string().regex(/^(AF|DA)-[A-Z0-9]{6}$/);
const Status = z.enum(ORDER_STATUSES.map((s) => s.id) as [OrderStatus, ...OrderStatus[]]);

async function updateOrder(number: string, fn: (o: Order) => Order) {
  let found = false;
  await mutateJson<Order[]>("orders.json", [], (list) =>
    list.map((o) => {
      if (o.number !== number) return o;
      found = true;
      return fn(o);
    }),
  );
  return found;
}

export async function setOrderStatus(number: string, status: OrderStatus, message?: string): Promise<ActionState> {
  await requireAdmin();
  const n = OrderNumber.safeParse(number);
  const s = Status.safeParse(status);
  if (!n.success || !s.success) return { error: "Requête invalide." };
  const msg = message ? z.string().max(40).parse(message) : undefined;
  const ok = await updateOrder(n.data, (o) => ({
    ...o,
    status: s.data,
    history: [{ at: new Date().toISOString(), status: s.data, message: msg }, ...(o.history ?? [])].slice(0, 50),
  }));
  refreshAdmin();
  return ok ? { ok: true } : { error: "Commande introuvable." };
}

export async function logOrderMessage(number: string, template: string, status?: OrderStatus): Promise<ActionState> {
  await requireAdmin();
  const n = OrderNumber.safeParse(number);
  if (!n.success) return { error: "Requête invalide." };
  const label = z.string().max(40).parse(template);
  const st = status ? Status.parse(status) : undefined;
  await updateOrder(n.data, (o) => {
    // never move an order backwards (e.g. a delivered order stays delivered)
    const order = ORDER_STATUSES.map((x) => x.id) as string[];
    const nextStatus = st && order.indexOf(st) > order.indexOf(o.status) ? st : o.status;
    return {
      ...o,
      status: nextStatus,
      history: [{ at: new Date().toISOString(), status: nextStatus !== o.status ? nextStatus : undefined, message: `WhatsApp : ${label}` }, ...(o.history ?? [])].slice(0, 50),
    };
  });
  refreshAdmin();
  return { ok: true };
}

export async function saveOrderNote(number: string, note: string): Promise<ActionState> {
  await requireAdmin();
  const n = OrderNumber.safeParse(number);
  const text = z.string().max(2000).safeParse(note);
  if (!n.success || !text.success) return { error: "Note trop longue." };
  await updateOrder(n.data, (o) => ({ ...o, note: text.data.trim() || undefined }));
  refreshAdmin();
  return { ok: true, message: "Note enregistrée." };
}

export async function deleteOrder(number: string): Promise<ActionState> {
  await requireAdmin();
  const n = OrderNumber.safeParse(number);
  if (!n.success) return { error: "Requête invalide." };
  await mutateJson<Order[]>("orders.json", [], (list) => list.filter((o) => o.number !== n.data));
  refreshAdmin();
  redirect("/admin/commandes");
}

/* ---------------------------------------------------------------- products */

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "oeuvre"
  );
}

const ArtworkInput = z.object({
  slug: z.string().max(80).optional(),
  title: z.string().trim().min(1, "Titre requis").max(120),
  artist: z.string().trim().max(120).default(""),
  year: z.string().trim().max(20).default(""),
  collection: z.string().min(1, "Choisissez une collection"),
  tags: z.string().max(400).default(""),
  featured: z.boolean(),
  visible: z.boolean(),
  source: z.union([z.literal(""), z.string().url().max(400)]).default(""),
  license: z.string().trim().max(120).default(""),
  w: z.coerce.number().int().min(50).max(20000).optional(),
  h: z.coerce.number().int().min(50).max(20000).optional(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i).optional(),
});

export async function saveArtwork(_prev: ActionState, fd: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = ArtworkInput.safeParse({
    slug: fd.get("slug") || undefined,
    title: fd.get("title"),
    artist: fd.get("artist") ?? "",
    year: fd.get("year") ?? "",
    collection: fd.get("collection"),
    tags: fd.get("tags") ?? "",
    featured: fd.get("featured") === "on",
    visible: fd.get("visible") === "on",
    source: fd.get("source") ?? "",
    license: fd.get("license") ?? "",
    w: fd.get("w") || undefined,
    h: fd.get("h") || undefined,
    color: fd.get("color") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  const input = parsed.data;
  const data = structuredClone(await getCatalogData());
  if (!data.collections.some((c) => c.slug === input.collection)) return { error: "Collection inconnue." };

  const existing = input.slug ? data.artworks.find((a) => a.slug === input.slug) : undefined;
  if (input.slug && !existing) return { error: "Œuvre introuvable." };

  // optional new image (already resized to JPEG in the browser)
  const file = fd.get("image");
  let image: string | undefined;
  const slug = existing?.slug ?? (() => {
    const base = slugify(input.title);
    let s = base;
    for (let i = 2; data.artworks.some((a) => a.slug === s); i++) s = `${base}-${i}`;
    return s;
  })();
  if (file instanceof File && file.size > 0) {
    if (file.size > 10 * 1024 * 1024) return { error: "Image trop lourde (10 Mo max)." };
    const buf = Buffer.from(await file.arrayBuffer());
    if (imageKind(buf) !== "jpg") return { error: "L'image doit être un JPEG." };
    if (!input.w || !input.h || !input.color) return { error: "Dimensions de l'image manquantes, réessayez." };
    const name = `${slug.slice(0, 60)}-${randomBytes(3).toString("hex")}.jpg`;
    await saveMedia(name, buf);
    image = `/media/art/${name}`;
  } else if (!existing) {
    return { error: "Ajoutez une image." };
  }

  const tags = input.tags
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 20)
    .map((t) => t.slice(0, 30));

  const record: Artwork = {
    ...(existing ?? { createdAt: new Date().toISOString() }),
    slug,
    title: input.title,
    artist: input.artist || "Création originale",
    year: input.year,
    collection: input.collection,
    image: image ?? existing!.image,
    w: image ? input.w! : existing!.w,
    h: image ? input.h! : existing!.h,
    color: image ? input.color! : existing!.color,
    tags,
    source: input.source || undefined,
    license: input.license || undefined,
    featured: input.featured || undefined,
    hidden: input.visible ? undefined : true,
  } as Artwork;

  if (existing) {
    const old = existing.image;
    data.artworks = data.artworks.map((a) => (a.slug === slug ? record : a));
    if (image && old.startsWith("/media/art/")) await deleteMedia(old.replace("/media/art/", ""));
  } else {
    data.artworks = [record, ...data.artworks];
  }
  await saveCatalogData(data);
  refreshAll();
  if (!existing) redirect(`/admin/produits/${slug}?cree=1`);
  return { ok: true, message: "Enregistré. La boutique est à jour." };
}

export async function toggleArtwork(slug: string, field: "featured" | "hidden", value: boolean): Promise<ActionState> {
  await requireAdmin();
  const data = structuredClone(await getCatalogData());
  const a = data.artworks.find((x) => x.slug === slug);
  if (!a) return { error: "Œuvre introuvable." };
  if (value) a[field] = true;
  else delete a[field];
  await saveCatalogData(data);
  refreshAll();
  return { ok: true };
}

export async function deleteArtwork(slug: string): Promise<ActionState> {
  await requireAdmin();
  const data = structuredClone(await getCatalogData());
  const a = data.artworks.find((x) => x.slug === slug);
  if (!a) return { error: "Œuvre introuvable." };
  data.artworks = data.artworks.filter((x) => x.slug !== slug);
  await saveCatalogData(data);
  if (a.image.startsWith("/media/art/")) await deleteMedia(a.image.replace("/media/art/", ""));
  refreshAll();
  redirect("/admin/produits?supprime=1");
}

/* ---------------------------------------------------------------- collections */

const CollectionInput = z.object({
  slug: z.string().regex(/^[a-z0-9-]{2,40}$/),
  name: z.string().trim().min(2).max(40),
  kicker: z.string().trim().max(40),
  description: z.string().trim().max(400),
});

export async function saveCollections(list: Collection[]): Promise<ActionState> {
  await requireAdmin();
  const parsed = z.array(CollectionInput).min(1).max(30).safeParse(list);
  if (!parsed.success) return { error: "Chaque collection a besoin d'un nom (2 caractères minimum)." };
  const slugs = parsed.data.map((c) => c.slug);
  if (new Set(slugs).size !== slugs.length) return { error: "Deux collections ont le même identifiant." };
  const data = structuredClone(await getCatalogData());
  const orphan = data.artworks.find((a) => !slugs.includes(a.collection));
  if (orphan) return { error: `Impossible de supprimer une collection qui contient encore des œuvres (ex. « ${orphan.title} »).` };
  data.collections = parsed.data;
  await saveCatalogData(data);
  refreshAll();
  return { ok: true, message: "Collections enregistrées." };
}

/* ---------------------------------------------------------------- pricing & settings */

const Id = z.string().regex(/^[A-Za-z0-9_-]{1,24}$/);
const Money = z.coerce.number().min(0).max(100000);
const Range = z.tuple([z.coerce.number().int().min(0).max(30), z.coerce.number().int().min(0).max(30)]);

const PricingInput = z.object({
  sizes: z
    .array(
      z.object({
        id: Id,
        label: z.string().trim().min(1).max(12),
        w: z.coerce.number().min(5).max(300),
        h: z.coerce.number().min(5).max(300),
        price: Money,
        framePrice: Money,
        note: z.string().trim().max(30).optional(),
        active: z.boolean(),
      }),
    )
    .min(1)
    .max(8),
  defaultSize: Id,
  finishes: z
    .array(
      z.object({
        id: Id,
        label: z.string().trim().min(1).max(30),
        short: z.string().trim().max(40),
        description: z.string().trim().max(240),
        extra: Money,
        look: z.enum(["mat", "brillant", "brosse"]),
        active: z.boolean(),
      }),
    )
    .min(1)
    .max(6),
  frames: z
    .array(
      z.object({
        id: Id,
        label: z.string().trim().min(1).max(30),
        color: z.string().regex(/^(#[0-9a-f]{6}|transparent)$/i),
        active: z.boolean(),
      }),
    )
    .min(1)
    .max(6),
  caseTypes: z
    .array(
      z.object({
        id: Id,
        label: z.string().trim().min(1).max(30),
        description: z.string().trim().max(200),
        price: Money,
        style: z.enum(["slim", "antichoc"]),
        active: z.boolean(),
      }),
    )
    .min(1)
    .max(4),
  bundle: z.object({ minPlates: z.coerce.number().int().min(2).max(20), percent: z.coerce.number().min(0).max(90) }),
  shipping: z.object({ price: Money, freeAbove: Money, fast: Range, others: Range }),
  promos: z
    .array(z.object({ code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,20}$/), percent: z.coerce.number().min(1).max(90), active: z.boolean() }))
    .max(30),
});

export type PricingPayload = z.input<typeof PricingInput>;
export type PricingData = z.output<typeof PricingInput>;

function unique(ids: string[]) {
  return new Set(ids).size === ids.length;
}

export async function savePricing(payload: PricingPayload): Promise<ActionState> {
  await requireAdmin();
  const parsed = PricingInput.safeParse(payload);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { error: `Valeur invalide (${i?.path.join(" › ")}) : ${i?.message}` };
  }
  const p = parsed.data;
  if (!p.sizes.some((s) => s.active)) return { error: "Gardez au moins un format actif." };
  if (!p.finishes.some((s) => s.active)) return { error: "Gardez au moins une finition active." };
  if (!p.caseTypes.some((s) => s.active)) return { error: "Gardez au moins un type de coque actif." };
  if (!p.frames.some((f) => f.id === NO_FRAME)) return { error: "L'option « Sans cadre » ne peut pas être supprimée." };
  if (![p.sizes, p.finishes, p.frames, p.caseTypes].every((l) => unique(l.map((x) => x.id)))) return { error: "Identifiants en double." };
  if (!unique(p.promos.map((x) => x.code))) return { error: "Deux codes promo identiques." };
  for (const r of [p.shipping.fast, p.shipping.others]) if (r[0] > r[1]) return { error: "Délai de livraison : le minimum dépasse le maximum." };
  const defaultSize = p.sizes.find((s) => s.id === p.defaultSize && s.active)?.id ?? p.sizes.find((s) => s.active)!.id;

  const current = await getSettings();
  const next: StoreSettings = {
    ...structuredClone(current),
    sizes: p.sizes.map((s) => ({ ...s, note: s.note || undefined })),
    defaultSize,
    finishes: p.finishes,
    frames: p.frames.map((f) => (f.id === NO_FRAME ? { ...f, color: "transparent", active: true } : f)),
    caseTypes: p.caseTypes,
    bundle: p.bundle,
    shipping: p.shipping,
    promos: p.promos,
  };
  await saveSettings(next);
  refreshAll();
  return { ok: true, message: "Tarifs enregistrés. Les nouveaux prix sont en ligne." };
}

const SettingsInput = z.object({
  brand: z.object({
    name: z.string().trim().min(2).max(30),
    tagline: z.string().trim().max(80),
    email: z.union([z.literal(""), z.string().trim().email().max(120)]),
    instagram: z.union([z.literal(""), z.string().trim().url().max(200)]),
    whatsapp: z.string().trim().max(30),
    city: z.string().trim().min(2).max(40),
  }),
  announcements: z.array(z.string().trim().max(80)).max(8),
  pixelId: z.union([z.literal(""), z.string().trim().regex(/^\d{6,20}$/, "L'identifiant du pixel ne contient que des chiffres")]),
  phonesDisabled: z.array(z.string().max(40)).max(PHONES.length),
  templates: z.object({ confirm: z.string().max(1500), waitlist: z.string().max(1500), shipped: z.string().max(1500) }),
});

export type SettingsPayload = z.input<typeof SettingsInput>;

export async function saveSiteSettings(payload: SettingsPayload): Promise<ActionState> {
  await requireAdmin();
  const parsed = SettingsInput.safeParse(payload);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { error: `Valeur invalide (${i?.path.join(" › ")}) : ${i?.message}` };
  }
  const p = parsed.data;
  const whatsapp = toIntlMA(p.brand.whatsapp);
  if (!/^\d{8,15}$/.test(whatsapp)) return { error: "Numéro WhatsApp invalide (ex. 06 12 34 56 78)." };
  if (p.phonesDisabled.length >= PHONES.length) return { error: "Gardez au moins un modèle de téléphone." };
  const current = await getSettings();
  await saveSettings({
    ...structuredClone(current),
    brand: { ...p.brand, whatsapp },
    announcements: p.announcements.filter(Boolean),
    pixelId: p.pixelId,
    phonesDisabled: p.phonesDisabled.filter((id) => PHONES.some((x) => x.id === id)),
    templates: p.templates,
  });
  refreshAll();
  return { ok: true, message: "Réglages enregistrés." };
}

/* ---------------------------------------------------------------- leads */

export async function deleteLead(at: string, contact: string): Promise<ActionState> {
  await requireAdmin();
  await mutateJson<{ at: string; contact: string }[]>("leads.json", [], (list) =>
    list.filter((l) => !(l.at === at && l.contact === contact)),
  );
  refreshAdmin();
  return { ok: true };
}

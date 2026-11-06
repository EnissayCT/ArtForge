import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { append } from "@/lib/store";
import { getCatalog, getSettings, getShop } from "@/lib/data";
import { recordOrder } from "@/lib/stats";
import { CITIES } from "@/lib/site";
import type { Order } from "@/lib/orders";

const Item = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("plate"),
    artSlug: z.string().max(100).optional(),
    designId: z.string().uuid().optional(),
    title: z.string().max(120),
    size: z.string().max(20),
    finish: z.string().max(30),
    frame: z.string().max(30),
    landscape: z.boolean().optional(),
    qty: z.number().int().min(1).max(20),
  }),
  z.object({
    kind: z.literal("case"),
    artSlug: z.string().max(100).optional(),
    designId: z.string().uuid().optional(),
    title: z.string().max(120),
    phone: z.string().max(40),
    caseType: z.string().max(30),
    qty: z.number().int().min(1).max(20),
  }),
]);

const OrderInput = z.object({
  customer: z.object({
    name: z.string().trim().min(3).max(80),
    phone: z.string().trim().max(20),
    city: z.enum(CITIES as [string, ...string[]]),
    otherCity: z.string().trim().max(60).optional(),
    address: z.string().trim().min(6).max(240),
    email: z.union([z.literal(""), z.string().email().max(120)]).optional(),
    notes: z.string().trim().max(500).optional(),
  }),
  items: z.array(Item).min(1).max(40),
  promo: z.string().trim().max(30).optional(),
  source: z.string().trim().max(40).optional(),
  website: z.string().max(0).optional(), // honeypot: must stay empty
});

function orderNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "AF-";
  for (let i = 0; i < 6; i++) s += chars[randomInt(chars.length)];
  return s;
}

const recentByIp = new Map<string, number[]>();

export async function POST(req: Request) {
  // light flood protection: 6 orders / 10 min / IP
  const ip = req.headers.get("x-real-ip") || "local";
  const now = Date.now();
  const recent = (recentByIp.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 6) return NextResponse.json({ error: "Trop de commandes en peu de temps. Écrivez-nous sur WhatsApp." }, { status: 429 });

  const parsed = OrderInput.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Informations de commande invalides", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }
  const { customer, items, promo, source } = parsed.data;

  const phone = customer.phone.replace(/[\s.-]/g, "");
  if (!/^(\+212|00212|0)[5-7]\d{8}$/.test(phone)) {
    return NextResponse.json({ error: "Numéro de téléphone marocain invalide" }, { status: 400 });
  }

  const [shop, catalog, settings] = await Promise.all([getShop(), getCatalog(), getSettings()]);
  for (const i of items) {
    if (!i.designId && !(i.artSlug && catalog.get(i.artSlug))) {
      return NextResponse.json({ error: `« ${i.title} » n'est plus disponible : retirez-le du panier.` }, { status: 400 });
    }
    const valid =
      i.kind === "plate"
        ? shop.sizes.some((x) => x.id === i.size) && shop.finishes.some((x) => x.id === i.finish) && shop.frames.some((x) => x.id === i.frame)
        : shop.caseTypes.some((x) => x.id === i.caseType) && shop.phones.some((x) => x.id === i.phone);
    if (!valid) {
      return NextResponse.json({ error: `Une option de « ${i.title} » n'est plus proposée : retirez-le du panier et ajoutez-le à nouveau.` }, { status: 400 });
    }
  }

  const code = promo?.toUpperCase();
  const promoPercent = code ? (settings.promos.find((p) => p.active && p.code.toUpperCase() === code)?.percent ?? 0) : 0;
  const totals = shop.totals(items, promoPercent);
  const number = orderNumber();
  const order: Order = {
    number,
    status: "nouvelle",
    createdAt: new Date().toISOString(),
    payment: "COD",
    source: source?.replace(/[^a-z0-9._-]/gi, "").toLowerCase() || undefined,
    customer: { ...customer, phone },
    items: items.map((i) => ({
      ...i,
      unitPrice: shop.unitPrice(i),
      label:
        i.kind === "plate"
          ? `Plaque ${shop.size(i.size).label} · ${shop.plateDims(i.size, !!i.landscape).w}×${shop.plateDims(i.size, !!i.landscape).h} cm · ${shop.finish(i.finish)?.label ?? i.finish}${i.frame !== "aucun" ? ` · ${shop.frame(i.frame)?.label ?? i.frame}` : ""}`
          : `Coque ${shop.caseType(i.caseType)?.label ?? i.caseType} · ${shop.phone(i.phone).name}`,
    })),
    promo: totals.promoPercent ? code : undefined,
    totals,
    history: [{ at: new Date().toISOString(), status: "nouvelle" }],
  };
  await append("orders.json", order);
  recentByIp.set(ip, [...recent, now]);
  await recordOrder(totals.total, order.source);
  console.log(`[order] ${number} — ${totals.total} DH`);
  return NextResponse.json({ number, total: totals.total }, { status: 201 });
}

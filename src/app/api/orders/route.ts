import { NextResponse } from "next/server";
import { z } from "zod";
import { append } from "@/lib/store";
import { cartTotals } from "@/lib/totals";
import { getArtwork } from "@/lib/catalog";
import { PHONES } from "@/lib/phones";
import { CASE_TYPES, FINISHES, FRAMES, SIZES, casePrice, platePrice } from "@/lib/pricing";
import { CITIES } from "@/lib/site";

const ids = <T extends { id: string }>(list: readonly T[]) => list.map((x) => x.id) as [string, ...string[]];

const Item = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("plate"),
    artSlug: z.string().optional(),
    designId: z.string().uuid().optional(),
    title: z.string().max(120),
    size: z.enum(ids(SIZES) as ["S", "M", "L", "XL"]),
    finish: z.enum(ids(FINISHES) as ["mat", "brillant", "brosse"]),
    frame: z.enum(ids(FRAMES) as ["aucun", "chene", "noir"]),
    landscape: z.boolean().optional(),
    qty: z.number().int().min(1).max(20),
  }),
  z.object({
    kind: z.literal("case"),
    artSlug: z.string().optional(),
    designId: z.string().uuid().optional(),
    title: z.string().max(120),
    phone: z.enum(ids(PHONES)),
    caseType: z.enum(ids(CASE_TYPES) as ["slim", "antichoc"]),
    qty: z.number().int().min(1).max(20),
  }),
]);

const Order = z.object({
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
});

function orderNumber() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "AF-";
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function POST(req: Request) {
  const parsed = Order.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Informations de commande invalides", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }
  const { customer, items, promo } = parsed.data;

  const phone = customer.phone.replace(/[\s.-]/g, "");
  if (!/^(\+212|00212|0)[5-7]\d{8}$/.test(phone)) {
    return NextResponse.json({ error: "Numéro de téléphone marocain invalide" }, { status: 400 });
  }
  for (const i of items) {
    if (!i.designId && !(i.artSlug && getArtwork(i.artSlug))) {
      return NextResponse.json({ error: "Article inconnu dans le panier" }, { status: 400 });
    }
  }

  const totals = cartTotals(items, promo);
  const number = orderNumber();
  const order = {
    number,
    status: "nouvelle",
    createdAt: new Date().toISOString(),
    payment: "COD",
    customer: { ...customer, phone },
    items: items.map((i) => ({
      ...i,
      unitPrice: i.kind === "plate" ? platePrice(i.size, i.finish, i.frame) : casePrice(i.caseType),
    })),
    promo: totals.promoPercent ? promo?.toUpperCase() : undefined,
    totals,
  };
  await append("orders.json", order);
  console.log(`[order] ${number} — ${customer.name} — ${totals.total} DH`);
  return NextResponse.json({ number, total: totals.total }, { status: 201 });
}

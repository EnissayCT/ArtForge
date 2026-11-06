import { NextResponse } from "next/server";
import { getSettings } from "@/lib/data";

/* Promo codes stay on the server: the browser can only ask whether one code is valid. */
const hits = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-real-ip") || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 15) return NextResponse.json({ error: "Trop d'essais, patientez une minute." }, { status: 429 });
  hits.set(ip, [...recent, now]);
  if (hits.size > 5000) hits.clear();

  const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase().slice(0, 30) : "";
  const promo = (await getSettings()).promos.find((p) => p.active && p.code.toUpperCase() === code);
  if (!promo) return NextResponse.json({ error: "Ce code n'existe pas ou a expiré." }, { status: 404 });
  return NextResponse.json({ code: promo.code.toUpperCase(), percent: promo.percent });
}

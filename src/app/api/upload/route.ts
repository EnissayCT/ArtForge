import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { imageKind, saveUpload } from "@/lib/store";

/** Customer print files from the studio (always JPEG, max 15 MB; the edge proxy caps bodies at 16 MB). */
const MAX = 15 * 1024 * 1024;
const recentByIp = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-real-ip") || "local";
  const now = Date.now();
  const recent = (recentByIp.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 20) return NextResponse.json({ error: "Trop d'envois, réessayez plus tard." }, { status: 429 });
  recentByIp.set(ip, [...recent, now]);
  if (recentByIp.size > 5000) recentByIp.clear();

  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ error: "Fichier trop lourd" }, { status: 413 });
    const buf = Buffer.from(await file.arrayBuffer());
    if (imageKind(buf) !== "jpg") return NextResponse.json({ error: "Format invalide" }, { status: 415 });
    const id = randomUUID();
    await saveUpload(id, buf);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    console.error("[upload]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

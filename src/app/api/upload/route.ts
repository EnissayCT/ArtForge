import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { saveUpload } from "@/lib/store";

const MAX = 40 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) return NextResponse.json({ error: "Fichier manquant" }, { status: 400 });
    if (file.size > MAX) return NextResponse.json({ error: "Fichier trop lourd" }, { status: 413 });
    const buf = Buffer.from(await file.arrayBuffer());
    // JPEG magic number — the studio always exports JPEG
    if (!(buf[0] === 0xff && buf[1] === 0xd8)) {
      return NextResponse.json({ error: "Format invalide" }, { status: 415 });
    }
    const id = randomUUID();
    await saveUpload(id, buf);
    return NextResponse.json({ id }, { status: 201 });
  } catch (e) {
    console.error("[upload]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

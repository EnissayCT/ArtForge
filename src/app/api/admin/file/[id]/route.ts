import { NextResponse } from "next/server";
import { adminAllowed } from "@/lib/admin";
import { readUpload } from "@/lib/store";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const key = new URL(req.url).searchParams.get("key");
  if (!adminAllowed(key)) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const file = await readUpload(id);
  if (!file) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return new NextResponse(new Uint8Array(file), {
    headers: { "content-type": "image/jpeg", "content-disposition": `inline; filename="${id}.jpg"`, "cache-control": "private, no-store" },
  });
}

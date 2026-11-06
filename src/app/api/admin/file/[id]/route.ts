import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { readUpload } from "@/lib/store";

/** Customer print files (custom designs). Admin session required. */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const file = await readUpload(id);
  if (!file) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  const download = new URL(req.url).searchParams.has("download");
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "content-type": "image/jpeg",
      "content-disposition": `${download ? "attachment" : "inline"}; filename="${id}.jpg"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

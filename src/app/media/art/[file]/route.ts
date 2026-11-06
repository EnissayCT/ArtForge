import { NextResponse } from "next/server";
import { readMedia } from "@/lib/store";

/** Artwork images uploaded from the admin (stored in data/media/art). */
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const data = await readMedia(file);
  if (!data) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(data), {
    headers: {
      "content-type": "image/jpeg",
      // file names are unique per upload, so they can be cached forever
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}

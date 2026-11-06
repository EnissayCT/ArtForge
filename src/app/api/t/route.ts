import { NextResponse } from "next/server";
import { z } from "zod";
import { isBot, record } from "@/lib/stats";

const Event = z.object({
  e: z.enum(["view", "product", "add", "checkout"]),
  s: z.string().max(60).optional(),
  l: z.number().optional(),
});

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  const text = await req.text().catch(() => "");
  if (text.length > 2000 || isBot(ua)) return new NextResponse(null, { status: 204 });
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* ignored */
  }
  const parsed = Event.safeParse(json);
  if (parsed.success) {
    const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
    const source = parsed.data.s?.replace(/[^a-z0-9._-]/gi, "").toLowerCase();
    await record(parsed.data.e, { ip, ua, source, landing: parsed.data.l === 1 });
  }
  return new NextResponse(null, { status: 204 });
}

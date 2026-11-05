import { NextResponse } from "next/server";
import { z } from "zod";
import { append } from "@/lib/store";

const Lead = z.object({
  contact: z.string().trim().min(5).max(120),
  source: z.string().max(40).optional(),
});

export async function POST(req: Request) {
  const parsed = Lead.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Contact invalide" }, { status: 400 });
  const { contact, source } = parsed.data;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
  const isPhone = /^(\+?212|0)[5-7](\s?\d){8}$/.test(contact.replace(/[\s.-]/g, ""));
  if (!isEmail && !isPhone) return NextResponse.json({ error: "E-mail ou numéro invalide" }, { status: 400 });
  await append("leads.json", { contact, type: isEmail ? "email" : "whatsapp", source: source ?? "site", at: new Date().toISOString() });
  return NextResponse.json({ ok: true }, { status: 201 });
}

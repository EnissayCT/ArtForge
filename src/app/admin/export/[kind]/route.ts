import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { orderCity, statusInfo, type Order } from "@/lib/orders";

/** CSV exports for Excel (semicolon separated, UTF-8 with BOM). Admin session required. */
function csv(rows: (string | number | undefined)[][]) {
  const cell = (v: string | number | undefined) => {
    let s = v === undefined ? "" : String(v);
    // neutralise spreadsheet formulas
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
}

export async function GET(_req: Request, { params }: { params: Promise<{ kind: string }> }) {
  if (!(await getAdminSession())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { kind } = await params;
  const stamp = new Date().toISOString().slice(0, 10);
  let body: string;
  if (kind === "commandes") {
    const orders = await readAll<Order>("orders.json");
    body = csv([
      ["Numéro", "Date", "Statut", "Nom", "Téléphone", "Ville", "Adresse", "E-mail", "Articles", "Total DH", "Code promo", "Source", "Note client", "Note interne"],
      ...orders.map((o) => [
        o.number,
        o.createdAt,
        statusInfo(o.status).label,
        o.customer.name,
        o.customer.phone,
        orderCity(o),
        o.customer.address,
        o.customer.email,
        o.items.map((i) => `${i.qty}x ${i.title}${i.label ? ` (${i.label})` : ""}`).join(" | "),
        o.totals.total,
        o.promo,
        o.source,
        o.customer.notes,
        o.note,
      ]),
    ]);
  } else if (kind === "abonnes") {
    const leads = await readAll<{ contact: string; type: string; source: string; at: string }>("leads.json");
    body = csv([["Contact", "Type", "Source", "Date"], ...leads.map((l) => [l.contact, l.type, l.source, l.at])]);
  } else {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }
  return new NextResponse(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${kind}-${stamp}.csv"`,
      "cache-control": "private, no-store",
    },
  });
}

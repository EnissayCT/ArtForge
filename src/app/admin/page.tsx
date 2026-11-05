import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminAllowed } from "@/lib/admin";
import { readAll } from "@/lib/store";
import { formatDH, getSize } from "@/lib/pricing";
import { getPhone } from "@/lib/phones";
import { getArtwork } from "@/lib/catalog";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

interface OrderItem {
  kind: "plate" | "case";
  title: string;
  artSlug?: string;
  designId?: string;
  size?: string;
  finish?: string;
  frame?: string;
  phone?: string;
  caseType?: string;
  qty: number;
  unitPrice: number;
}
interface Order {
  number: string;
  status: string;
  createdAt: string;
  customer: { name: string; phone: string; city: string; otherCity?: string; address: string; email?: string; notes?: string };
  items: OrderItem[];
  promo?: string;
  totals: { total: number; subtotal: number; discount: number; promo: number; shipping: number };
}
interface Lead {
  contact: string;
  type: string;
  source: string;
  at: string;
}

const fmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  if (!adminAllowed(key)) notFound();
  const orders = await readAll<Order>("orders.json");
  const leads = await readAll<Lead>("leads.json");
  const revenue = orders.reduce((s, o) => s + o.totals.total, 0);
  const items = orders.flatMap((o) => o.items);
  const custom = items.filter((i) => i.designId).length;
  const k = key ? `?key=${encodeURIComponent(key)}` : "";

  const bySize = new Map<string, number>();
  items.forEach((i) => {
    const label = i.kind === "plate" ? `Plaque ${i.size}` : "Coque";
    bySize.set(label, (bySize.get(label) ?? 0) + i.qty);
  });

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-10 sm:px-8">
      <p className="label text-stone">Tableau de bord</p>
      <h1 className="display mt-3 text-[56px]">Validation du marché</h1>

      <dl className="mt-8 grid grid-cols-2 gap-px border border-ink/12 bg-ink/12 lg:grid-cols-5">
        {[
          ["Commandes", orders.length],
          ["Chiffre d'affaires", formatDH(revenue)],
          ["Panier moyen", orders.length ? formatDH(revenue / orders.length) : "—"],
          ["Créations perso.", `${custom} / ${items.length} articles`],
          ["Inscrits club", leads.length],
        ].map(([t, v]) => (
          <div key={t as string} className="bg-paper p-5">
            <dt className="label text-stone">{t}</dt>
            <dd className="mt-2 text-[26px] font-semibold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>
      {bySize.size > 0 && (
        <p className="mt-4 text-[13px] text-stone">
          Répartition : {[...bySize.entries()].map(([l, n]) => `${l} × ${n}`).join(" · ")}
        </p>
      )}

      <h2 className="display-semi mt-14 text-[30px]">Commandes</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-stone">Aucune commande pour l&apos;instant. Elles s&apos;enregistrent dans data/orders.json.</p>
      ) : (
        <div className="mt-4 overflow-x-auto border border-ink/12">
          <table className="w-full min-w-[980px] text-left text-[13px]">
            <thead className="bg-paper-2">
              <tr className="label text-stone">
                <th className="p-3 font-normal">N°</th>
                <th className="p-3 font-normal">Date</th>
                <th className="p-3 font-normal">Client</th>
                <th className="p-3 font-normal">Livraison</th>
                <th className="p-3 font-normal">Articles</th>
                <th className="p-3 text-right font-normal">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {orders.map((o) => (
                <tr key={o.number} className="align-top">
                  <td className="p-3 font-semibold">{o.number}</td>
                  <td className="p-3 text-stone">{fmt.format(new Date(o.createdAt))}</td>
                  <td className="p-3">
                    <p className="font-semibold">{o.customer.name}</p>
                    <a href={`tel:${o.customer.phone}`} className="underline">{o.customer.phone}</a>
                    {o.customer.email && <p className="text-stone">{o.customer.email}</p>}
                  </td>
                  <td className="p-3">
                    <p>{o.customer.city === "Autre ville" ? o.customer.otherCity : o.customer.city}</p>
                    <p className="text-stone">{o.customer.address}</p>
                    {o.customer.notes && <p className="mt-1 italic text-stone">« {o.customer.notes} »</p>}
                  </td>
                  <td className="p-3">
                    <ul className="space-y-1.5">
                      {o.items.map((i, n) => (
                        <li key={n}>
                          {i.qty}× {i.artSlug ? getArtwork(i.artSlug)?.title ?? i.title : i.title} —{" "}
                          <span className="text-stone">
                            {i.kind === "plate"
                              ? `${i.size} ${getSize(i.size as "M").w}×${getSize(i.size as "M").h}, ${i.finish}, cadre ${i.frame}`
                              : `${getPhone(i.phone ?? "").name}, ${i.caseType}`}
                          </span>
                          {i.designId && (
                            <a href={`/api/admin/file/${i.designId}${k}`} target="_blank" rel="noreferrer" className="label ml-2 text-ember-deep underline">
                              fichier
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-3 text-right font-semibold tabular-nums">
                    {formatDH(o.totals.total)}
                    {o.promo && <p className="label font-normal text-stone">{o.promo}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="display-semi mt-14 text-[30px]">Club (leads)</h2>
      {leads.length === 0 ? (
        <p className="mt-4 text-stone">Aucune inscription pour l&apos;instant.</p>
      ) : (
        <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10 text-[14px]">
          {leads.map((l, i) => (
            <li key={i} className="flex justify-between gap-4 py-2.5">
              <span>{l.contact}</span>
              <span className="text-stone">
                {l.type} · {l.source} · {fmt.format(new Date(l.at))}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getSettings, getShop } from "@/lib/data";
import { readAll } from "@/lib/store";
import { getStats, today, type DayStats } from "@/lib/stats";
import { formatDH, WHATSAPP_PLACEHOLDER } from "@/lib/pricing";
import { orderCity, type Order } from "@/lib/orders";
import { Columns, Funnel } from "@/components/admin/Charts";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const metadata = { title: "Tableau de bord" };

const dayFmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const shortFmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const when = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Casablanca" });

function lastDays(n: number) {
  const out: string[] = [];
  const now = Date.now();
  for (let i = n - 1; i >= 0; i--) out.push(today(new Date(now - i * 86400000)));
  return out;
}

function sum(days: string[], stats: Record<string, DayStats>, key: keyof Omit<DayStats, "sources" | "orderSources">) {
  return days.reduce((s, d) => s + (stats[d]?.[key] ?? 0), 0);
}

export default async function Dashboard() {
  await requireAdmin();
  const [orders, leads, stats, settings, shop] = await Promise.all([
    readAll<Order>("orders.json"),
    readAll<{ at: string }>("leads.json"),
    getStats(),
    getSettings(),
    getShop(),
  ]);

  const week = lastDays(7);
  const fortnight = lastDays(14);
  const valid = orders.filter((o) => o.status !== "annulee");
  const weekOrders = valid.filter((o) => week.includes(today(new Date(o.createdAt))));
  const revenue = valid.reduce((s, o) => s + o.totals.total, 0);
  const sessions7 = sum(week, stats, "sessions");
  const uniques7 = sum(week, stats, "uniques");
  const conversion = sessions7 ? (weekOrders.length / sessions7) * 100 : 0;

  const sources = new Map<string, { sessions: number; orders: number }>();
  for (const d of week) {
    for (const [k, v] of Object.entries(stats[d]?.sources ?? {})) {
      const e = sources.get(k) ?? { sessions: 0, orders: 0 };
      e.sessions += v;
      sources.set(k, e);
    }
    for (const [k, v] of Object.entries(stats[d]?.orderSources ?? {})) {
      const e = sources.get(k) ?? { sessions: 0, orders: 0 };
      e.orders += v;
      sources.set(k, e);
    }
  }

  const byArt = new Map<string, number>();
  const bySize = new Map<string, number>();
  let custom = 0;
  for (const o of valid)
    for (const i of o.items) {
      byArt.set(i.title, (byArt.get(i.title) ?? 0) + i.qty);
      const k = i.kind === "plate" ? `Plaque ${shop.size(i.size ?? "").label ?? i.size}` : "Coque";
      bySize.set(k, (bySize.get(k) ?? 0) + i.qty);
      if (i.designId) custom += i.qty;
    }
  const topArt = [...byArt.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const fresh = orders.filter((o) => o.status === "nouvelle").length;

  const series = (key: "uniques" | "orders") =>
    fortnight.map((d) => {
      const date = new Date(`${d}T12:00:00Z`);
      return { label: dayFmt.format(date), short: shortFmt.format(date), value: stats[d]?.[key] ?? 0 };
    });

  const tiles: [string, string, string?][] = [
    ["Commandes (7 j)", String(weekOrders.length), `${valid.length} au total`],
    ["Chiffre potentiel", formatDH(revenue), "hors commandes annulées"],
    ["Panier moyen", valid.length ? formatDH(revenue / valid.length) : "—"],
    ["Visiteurs (7 j)", String(uniques7), `${sessions7} visites`],
    ["Conversion (7 j)", sessions7 ? `${conversion.toFixed(1)} %` : "—", "commandes / visites"],
    ["Abonnés club", String(leads.length)],
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-stone">Tableau de bord</p>
          <h1 className="display mt-2 text-[44px] sm:text-[56px]">Test du marché</h1>
        </div>
        {fresh > 0 && (
          <Link href="/admin/commandes?statut=nouvelle" className="flex items-center gap-2 bg-ember px-4 py-2.5 text-[13px] font-semibold text-white">
            {fresh} nouvelle{fresh > 1 ? "s" : ""} commande{fresh > 1 ? "s" : ""} à traiter <ArrowRight className="size-4" />
          </Link>
        )}
      </div>

      {(settings.brand.whatsapp === WHATSAPP_PLACEHOLDER || !settings.pixelId) && (
        <div className="space-y-2">
          {settings.brand.whatsapp === WHATSAPP_PLACEHOLDER && (
            <p className="flex items-start gap-2 border border-ember/40 bg-ember/5 p-3 text-[13.5px]">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-ember-deep" />
              <span>
                Le numéro WhatsApp du site est encore un numéro d&apos;exemple. Les clients ne peuvent pas vous écrire.{" "}
                <Link href="/admin/reglages" className="font-semibold underline">Le régler</Link>
              </span>
            </p>
          )}
          {!settings.pixelId && (
            <p className="flex items-start gap-2 border border-ink/12 bg-paper-2 p-3 text-[13.5px] text-ink/80">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-stone" />
              <span>
                Pixel Meta non configuré : vos publicités Instagram ne verront pas les commandes.{" "}
                <Link href="/admin/reglages#pixel" className="font-semibold underline">Ajouter le pixel</Link>
              </span>
            </p>
          )}
        </div>
      )}

      <dl className="grid grid-cols-2 gap-px border border-ink/12 bg-ink/12 md:grid-cols-3 xl:grid-cols-6">
        {tiles.map(([label, value, hint]) => (
          <div key={label} className="bg-paper p-4">
            <dt className="text-[12.5px] text-stone">{label}</dt>
            <dd className="mt-1.5 text-[24px] font-semibold leading-none tabular-nums sm:text-[26px]">{value}</dd>
            {hint && <dd className="mt-1.5 text-[11.5px] text-stone">{hint}</dd>}
          </div>
        ))}
      </dl>

      <section className="grid gap-4 lg:grid-cols-2">
        <Columns title="Visiteurs uniques par jour (14 j)" data={series("uniques")} />
        <Columns title="Commandes par jour (14 j)" data={series("orders")} tone="ember" />
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="display-semi text-[26px]">Parcours d&apos;achat (7 j)</h2>
          <p className="mb-5 mt-1 text-[13px] text-stone">Combien de visites vont jusqu&apos;à la commande, étape par étape.</p>
          <Funnel
            steps={[
              { label: "Visites", value: sessions7 },
              { label: "Fiches produit vues", value: sum(week, stats, "product") },
              { label: "Ajouts au panier", value: sum(week, stats, "add") },
              { label: "Page commande", value: sum(week, stats, "checkout") },
              { label: "Commandes", value: sum(week, stats, "orders") },
            ]}
          />
        </div>
        <div>
          <h2 className="display-semi text-[26px]">Provenance (7 j)</h2>
          <p className="mb-4 mt-1 text-[13px] text-stone">
            Source des visites. Pour vos pubs, utilisez des liens avec <code className="bg-paper-2 px-1">?utm_source=instagram</code>.
          </p>
          {sources.size === 0 ? (
            <p className="text-[14px] text-stone">Pas encore de visites enregistrées.</p>
          ) : (
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="text-left text-[12px] text-stone">
                  <th className="pb-2 font-normal">Source</th>
                  <th className="pb-2 text-right font-normal">Visites</th>
                  <th className="pb-2 text-right font-normal">Commandes</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {[...sources.entries()]
                  .sort((a, b) => b[1].sessions - a[1].sessions)
                  .slice(0, 10)
                  .map(([k, v]) => (
                    <tr key={k} className="border-t border-ink/10">
                      <td className="py-2">{k}</td>
                      <td className="py-2 text-right">{v.sessions}</td>
                      <td className="py-2 text-right">{v.orders}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="display-semi text-[26px]">Œuvres les plus commandées</h2>
          {topArt.length === 0 ? (
            <p className="mt-3 text-[14px] text-stone">Aucune commande pour l&apos;instant.</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10 text-[14px]">
              {topArt.map(([t, n]) => (
                <li key={t} className="flex justify-between gap-4 py-2">
                  <span className="truncate">{t}</span>
                  <span className="tabular-nums text-stone">× {n}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h2 className="display-semi text-[26px]">Formats demandés</h2>
          {bySize.size === 0 ? (
            <p className="mt-3 text-[14px] text-stone">—</p>
          ) : (
            <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10 text-[14px]">
              {[...bySize.entries()]
                .sort((a, b) => b[1] - a[1])
                .map(([k, n]) => (
                  <li key={k} className="flex justify-between gap-4 py-2">
                    <span>{k}</span>
                    <span className="tabular-nums text-stone">× {n}</span>
                  </li>
                ))}
              <li className="flex justify-between gap-4 py-2">
                <span>dont créations personnalisées</span>
                <span className="tabular-nums text-stone">× {custom}</span>
              </li>
            </ul>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="display-semi text-[26px]">Dernières commandes</h2>
          <Link href="/admin/commandes" className="label link-u">Tout voir</Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-3 text-[14px] text-stone">Les commandes apparaîtront ici dès la première.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
            {orders.slice(0, 6).map((o) => (
              <li key={o.number}>
                <Link href={`/admin/commandes/${o.number}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-paper-2 sm:px-2">
                  <span className="w-24 text-[13px] font-semibold">{o.number}</span>
                  <span className="min-w-0 flex-1 truncate text-[14px]">
                    {o.customer.name} <span className="text-stone">· {orderCity(o)}</span>
                  </span>
                  <span className="text-[13px] tabular-nums">{formatDH(o.totals.total)}</span>
                  <StatusBadge status={o.status} />
                  <span className="w-full text-[12px] text-stone sm:w-32 sm:text-right">{when.format(new Date(o.createdAt))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { Download, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { readAll } from "@/lib/store";
import { formatDH } from "@/lib/pricing";
import { ORDER_STATUSES, fillTemplate, orderCity, type Order } from "@/lib/orders";
import { toIntlMA, waLink } from "@/lib/site";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { QuickWhatsApp } from "@/components/admin/OrderPanel";
import { cn } from "@/lib/utils";

export const metadata = { title: "Commandes" };

const when = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Casablanca" });

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ statut?: string; q?: string }> }) {
  await requireAdmin();
  const { statut, q = "" } = await searchParams;
  const [orders, settings] = await Promise.all([readAll<Order>("orders.json"), getSettings()]);
  const needle = q.trim().toLowerCase();
  const list = orders.filter(
    (o) =>
      (!statut || o.status === statut) &&
      (!needle ||
        [o.number, o.customer.name, o.customer.phone, orderCity(o)].some((v) => v.toLowerCase().includes(needle))),
  );
  const count = (id: string) => orders.filter((o) => o.status === id).length;
  const href = (s?: string) => {
    const p = new URLSearchParams();
    if (s) p.set("statut", s);
    if (q) p.set("q", q);
    const qs = p.toString();
    return qs ? `/admin/commandes?${qs}` : "/admin/commandes";
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-stone">Commandes</p>
          <h1 className="display mt-2 text-[44px] sm:text-[56px]">{orders.length} commande{orders.length > 1 ? "s" : ""}</h1>
        </div>
        <a href="/admin/export/commandes" download className="label flex items-center gap-2 border border-ink/20 px-3 py-2 hover:border-ink">
          <Download className="size-3.5" /> Export CSV
        </a>
      </div>

      <form className="mt-6 flex items-center gap-3 border-b border-ink/25 pb-2 focus-within:border-ink sm:max-w-md" action="/admin/commandes">
        <Search className="size-4 shrink-0 text-stone" />
        <input name="q" defaultValue={q} placeholder="Nom, téléphone, ville, n° de commande" className="w-full bg-transparent py-1 text-[15px] outline-none" />
        {statut && <input type="hidden" name="statut" value={statut} />}
      </form>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Link href={href()} className={cn("shrink-0 px-3 py-1.5 text-[13px] font-medium", !statut ? "bg-ink text-paper" : "bg-paper-2 hover:bg-paper-3")}>
          Toutes · {orders.length}
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s.id}
            href={href(s.id)}
            className={cn("shrink-0 px-3 py-1.5 text-[13px] font-medium", statut === s.id ? "bg-ink text-paper" : "bg-paper-2 hover:bg-paper-3")}
          >
            {s.label} · {count(s.id)}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-[15px] text-stone">{orders.length ? "Aucune commande ne correspond." : "Aucune commande pour l'instant."}</p>
      ) : (
        <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
          {list.map((o) => {
            const wa = toIntlMA(o.customer.phone);
            return (
              <li key={o.number} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-5">
                <Link href={`/admin/commandes/${o.number}`} className="group min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-[13px] font-semibold">{o.number}</span>
                    <StatusBadge status={o.status} />
                    <span className="text-[12px] text-stone">{when.format(new Date(o.createdAt))}</span>
                    {o.source && o.source !== "direct" && <span className="label text-[10px] text-stone">via {o.source}</span>}
                  </div>
                  <p className="mt-1.5 truncate text-[15px] font-semibold group-hover:underline">
                    {o.customer.name} <span className="font-normal text-stone">· {orderCity(o)}</span>
                  </p>
                  <p className="mt-0.5 truncate text-[13px] text-stone">
                    {o.items.map((i) => `${i.qty}× ${i.title}`).join(" · ")}
                  </p>
                </Link>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="text-[15px] font-semibold tabular-nums">{formatDH(o.totals.total)}</span>
                  {o.status === "nouvelle" && (
                    <QuickWhatsApp
                      number={o.number}
                      href={waLink(wa, fillTemplate(settings.templates.waitlist, o, settings.brand.name, formatDH))}
                    />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

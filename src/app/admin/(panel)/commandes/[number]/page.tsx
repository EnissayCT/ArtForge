import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getCatalogData, getSettings } from "@/lib/data";
import { readAll } from "@/lib/store";
import { formatDH } from "@/lib/pricing";
import { fillTemplate, orderCity, statusInfo, type Order } from "@/lib/orders";
import { toIntlMA } from "@/lib/site";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OrderPanel } from "@/components/admin/OrderPanel";

const when = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Casablanca" });

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }) {
  return { title: (await params).number };
}

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  await requireAdmin();
  const { number } = await params;
  const [orders, settings, catalog] = await Promise.all([readAll<Order>("orders.json"), getSettings(), getCatalogData()]);
  const o = orders.find((x) => x.number === number);
  if (!o) notFound();
  const brand = settings.brand.name;
  const templates = [
    { id: "confirm", label: "Confirmer la commande", text: fillTemplate(settings.templates.confirm, o, brand, formatDH), status: "contactee" as const },
    { id: "waitlist", label: "Liste d'attente", text: fillTemplate(settings.templates.waitlist, o, brand, formatDH), status: "attente" as const },
    { id: "shipped", label: "Commande expédiée", text: fillTemplate(settings.templates.shipped, o, brand, formatDH), status: "expediee" as const },
  ];
  const art = (slug?: string) => (slug ? catalog.artworks.find((a) => a.slug === slug) : undefined);

  return (
    <div>
      <Link href="/admin/commandes" className="label flex items-center gap-1.5 text-stone hover:text-ink">
        <ArrowLeft className="size-3.5" /> Commandes
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="display text-[40px] sm:text-[52px]">{o.number}</h1>
        <StatusBadge status={o.status} className="text-[13px]" />
      </div>
      <p className="mt-1 text-[13px] text-stone">
        {when.format(new Date(o.createdAt))} · paiement à la livraison{o.source ? ` · source : ${o.source}` : ""}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-7">
          <section className="bg-paper-2 p-5">
            <p className="text-[17px] font-semibold">{o.customer.name}</p>
            <a href={`tel:${o.customer.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-[15px] underline">
              <Phone className="size-3.5" /> {o.customer.phone}
            </a>
            {o.customer.email && <p className="mt-1 text-[14px] text-stone">{o.customer.email}</p>}
            <p className="mt-3 text-[14px]">
              <strong>{orderCity(o)}</strong> — {o.customer.address}
            </p>
            {o.customer.notes && <p className="mt-2 text-[14px] italic text-stone">« {o.customer.notes} »</p>}
          </section>

          <section>
            <h2 className="text-[13px] font-semibold">Articles</h2>
            <ul className="mt-2 divide-y divide-ink/10 border-y border-ink/10">
              {o.items.map((i, n) => {
                const a = art(i.artSlug);
                return (
                  <li key={n} className="flex gap-4 py-3">
                    <div className="relative size-16 shrink-0 overflow-hidden bg-paper-2">
                      {i.designId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`/api/admin/file/${i.designId}`} alt="" className="size-full object-cover" />
                      ) : a ? (
                        <Image src={a.image} alt="" fill sizes="64px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-semibold">
                        {i.qty}× {i.title}
                      </p>
                      <p className="text-[13px] text-stone">{i.label ?? (i.kind === "plate" ? `${i.size} · ${i.finish} · ${i.frame}` : `${i.phone} · ${i.caseType}`)}</p>
                      {i.designId && (
                        <a href={`/api/admin/file/${i.designId}?download`} className="label mt-1 inline-flex items-center gap-1 text-ember-deep underline">
                          <Download className="size-3" /> Fichier d&apos;impression
                        </a>
                      )}
                    </div>
                    <p className="text-[14px] tabular-nums">{formatDH(i.unitPrice * i.qty)}</p>
                  </li>
                );
              })}
            </ul>
            <dl className="ml-auto mt-3 max-w-xs space-y-1 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-stone">Sous-total</dt>
                <dd className="tabular-nums">{formatDH(o.totals.subtotal)}</dd>
              </div>
              {o.totals.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-stone">Remise pack</dt>
                  <dd className="tabular-nums">−{formatDH(o.totals.discount)}</dd>
                </div>
              )}
              {o.totals.promo > 0 && (
                <div className="flex justify-between">
                  <dt className="text-stone">Code {o.promo}</dt>
                  <dd className="tabular-nums">−{formatDH(o.totals.promo)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone">Livraison</dt>
                <dd className="tabular-nums">{o.totals.shipping ? formatDH(o.totals.shipping) : "Offerte"}</dd>
              </div>
              <div className="flex justify-between border-t border-ink/10 pt-2 text-[16px] font-semibold">
                <dt>À encaisser</dt>
                <dd className="tabular-nums">{formatDH(o.totals.total)}</dd>
              </div>
            </dl>
          </section>

          {o.history && o.history.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold">Historique</h2>
              <ol className="mt-2 space-y-1.5 text-[13px]">
                {o.history.map((h, n) => (
                  <li key={n} className="flex gap-3">
                    <span className="w-36 shrink-0 text-stone">{when.format(new Date(h.at))}</span>
                    <span>
                      {h.status && <>→ {statusInfo(h.status).label}</>}
                      {h.status && h.message && " · "}
                      {h.message}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <div className="lg:col-span-5">
          <OrderPanel number={o.number} status={o.status} note={o.note ?? ""} phoneIntl={toIntlMA(o.customer.phone)} templates={templates} />
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Banknote, ChevronDown, Lock } from "lucide-react";
import { useCart, cartTotals, unitPrice } from "@/lib/cart";
import { BUNDLE, PROMOS, formatDH, SHIPPING } from "@/lib/pricing";
import { CITIES, FAST_CITIES } from "@/lib/site";
import { loadDesign } from "@/lib/uploads";
import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { CartThumb } from "./CartThumb";

interface Form {
  name: string;
  phone: string;
  city: string;
  otherCity: string;
  address: string;
  email: string;
  notes: string;
}

const EMPTY: Form = { name: "", phone: "", city: "", otherCity: "", address: "", email: "", notes: "" };

function validate(f: Form) {
  const e: Partial<Record<keyof Form, string>> = {};
  if (f.name.trim().length < 3) e.name = "Indiquez votre nom complet.";
  if (!/^(\+212|00212|0)[5-7]\d{8}$/.test(f.phone.replace(/[\s.-]/g, ""))) e.phone = "Numéro marocain attendu, ex. 06 12 34 56 78.";
  if (!f.city) e.city = "Choisissez votre ville.";
  if (f.city === "Autre ville" && f.otherCity.trim().length < 2) e.otherCity = "Précisez la ville.";
  if (f.address.trim().length < 6) e.address = "Adresse trop courte : quartier, rue, numéro.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "E-mail invalide.";
  return e;
}

export function Checkout() {
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const [form, setForm] = useState<Form>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState("");
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [step, setStep] = useState<"idle" | "uploading" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);

  const list = hydrated ? items : [];
  const t = cartTotals(list, promo);
  const errors = validate(form);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (PROMOS[code]) {
      setPromo(code);
      setPromoMsg(`Code ${code} appliqué : −${PROMOS[code]} %`);
    } else {
      setPromo("");
      setPromoMsg("Ce code n'existe pas ou a expiré.");
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (Object.keys(errors).length) {
      document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    try {
      // 1. send customer designs
      setStep("uploading");
      const designIds: Record<string, string> = {};
      for (const item of list) {
        if (!item.customId) continue;
        const design = await loadDesign(item.customId);
        if (!design) throw new Error("Une de vos créations est introuvable. Recréez-la dans l'atelier.");
        const fd = new FormData();
        fd.append("file", design.print, `${item.customId}.jpg`);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("L'envoi de votre image a échoué. Vérifiez votre connexion.");
        designIds[item.key] = (await res.json()).id;
      }
      // 2. place the order
      setStep("sending");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          customer: { ...form, otherCity: form.city === "Autre ville" ? form.otherCity : undefined },
          promo: promo || undefined,
          items: list.map((i) =>
            i.kind === "plate"
              ? { kind: "plate", artSlug: i.artSlug, designId: designIds[i.key], title: i.title, size: i.size, finish: i.finish, frame: i.frame, landscape: i.landscape, qty: i.qty }
              : { kind: "case", artSlug: i.artSlug, designId: designIds[i.key], title: i.title, phone: i.phone, caseType: i.caseType, qty: i.qty },
          ),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "La commande n'a pas pu être enregistrée.");
      const summary = list.map((i) => `${i.qty}× ${i.title} (${i.subtitle})`).join("\n");
      sessionStorage.setItem(
        "artforge-last-order",
        JSON.stringify({ number: data.number, total: data.total, name: form.name, city: form.city === "Autre ville" ? form.otherCity : form.city, summary }),
      );
      clear();
      router.push(`/commande/merci?n=${data.number}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
      setStep("idle");
    }
  }

  if (hydrated && list.length === 0 && step === "idle") {
    return (
      <div className="mx-auto max-w-[1440px] px-4 py-28 sm:px-8">
        <p className="display text-[56px]">Votre panier est vide.</p>
        <Link href="/boutique" className="label link-u mt-6 inline-block">
          ← Retour à la boutique
        </Link>
      </div>
    );
  }

  const fast = FAST_CITIES.includes(form.city);
  const err = (k: keyof Form) => (touched ? errors[k] : undefined);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-8 sm:px-8">
      <Link href="/panier" className="label flex items-center gap-2 text-stone hover:text-ink">
        <ArrowLeft className="size-3.5" /> Panier
      </Link>
      <h1 className="display mt-5 text-[56px] sm:text-[80px]">Commande</h1>

      <form onSubmit={submit} noValidate className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-7">
          <fieldset>
            <legend className="label mb-5 text-stone">01 — Vos coordonnées</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nom complet" error={err("name")}>
                <input className="field" autoComplete="name" value={form.name} onChange={set("name")} aria-invalid={!!err("name")} />
              </Field>
              <Field label="Téléphone" hint="Le livreur vous appellera sur ce numéro" error={err("phone")}>
                <input className="field" type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78" value={form.phone} onChange={set("phone")} aria-invalid={!!err("phone")} />
              </Field>
              <Field label="E-mail (facultatif)" error={err("email")} className="sm:col-span-2">
                <input className="field" type="email" autoComplete="email" value={form.email} onChange={set("email")} aria-invalid={!!err("email")} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend className="label mb-5 text-stone">02 — Livraison</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ville" error={err("city")}>
                <div className="relative">
                  <select className="field appearance-none pr-10" value={form.city} onChange={set("city")} aria-invalid={!!err("city")}>
                    <option value="">Choisir…</option>
                    {CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" />
                </div>
              </Field>
              {form.city === "Autre ville" ? (
                <Field label="Précisez la ville" error={err("otherCity")}>
                  <input className="field" value={form.otherCity} onChange={set("otherCity")} aria-invalid={!!err("otherCity")} />
                </Field>
              ) : (
                <div className="hidden sm:block" />
              )}
              <Field label="Adresse" hint="Quartier, rue, numéro, étage…" error={err("address")} className="sm:col-span-2">
                <input className="field" autoComplete="street-address" value={form.address} onChange={set("address")} aria-invalid={!!err("address")} />
              </Field>
              <Field label="Note pour la livraison (facultatif)" className="sm:col-span-2">
                <textarea className="field min-h-[90px] resize-y" value={form.notes} onChange={set("notes")} placeholder="Ex. : appeler avant de passer, disponible après 18 h" />
              </Field>
            </div>
            {form.city && (
              <p className="mt-4 text-[13.5px] text-stone">
                Délai estimé pour {form.city === "Autre ville" ? "votre ville" : form.city} :{" "}
                <strong className="text-ink">{fast ? "24 à 48 h" : "48 à 72 h"}</strong> après production (48 h).
              </p>
            )}
          </fieldset>

          <fieldset>
            <legend className="label mb-5 text-stone">03 — Paiement</legend>
            <div className="flex items-start gap-4 border-2 border-ink p-5">
              <Banknote className="mt-0.5 size-6 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-[15px] font-semibold">Paiement à la livraison</p>
                <p className="mt-1 text-[13.5px] leading-relaxed text-stone">
                  Vous réglez en espèces au livreur, à la réception. Nous vous appelons ou écrivons sur WhatsApp pour confirmer
                  la commande avant impression.
                </p>
              </div>
            </div>
          </fieldset>
        </div>

        <aside className="lg:col-span-5">
          <div className="bg-paper-2 p-6 lg:sticky lg:top-24">
            <p className="display text-[30px]">Récapitulatif</p>
            <ul className="mt-4 divide-y divide-ink/10">
              {list.map((i) => (
                <li key={i.key} className="flex gap-3 py-3">
                  <CartThumb item={i} className="w-14" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">
                      {i.qty > 1 && <span className="text-stone">{i.qty}× </span>}
                      {i.title}
                    </p>
                    <p className="truncate text-[12px] text-stone">{i.subtitle}</p>
                  </div>
                  <p className="text-[14px] tabular-nums">{formatDH(unitPrice(i) * i.qty)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex gap-2">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Code promo"
                className="field py-2.5 uppercase"
                aria-label="Code promo"
              />
              <button type="button" onClick={applyPromo} className="shrink-0 border border-ink px-4 text-[13px] font-semibold uppercase">
                Appliquer
              </button>
            </div>
            {promoMsg && <p className={cn("mt-2 text-[12.5px]", promo ? "text-ok" : "text-ember-deep")}>{promoMsg}</p>}

            <dl className="mt-5 space-y-1.5 border-t border-ink/10 pt-4 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-stone">Sous-total</dt>
                <dd className="tabular-nums">{formatDH(t.subtotal)}</dd>
              </div>
              {t.discount > 0 && (
                <div className="flex justify-between text-ember-deep">
                  <dt>Pack {BUNDLE.minPlates} plaques (−{BUNDLE.percent} %)</dt>
                  <dd className="tabular-nums">−{formatDH(t.discount)}</dd>
                </div>
              )}
              {t.promo > 0 && (
                <div className="flex justify-between text-ember-deep">
                  <dt>Code {promo}</dt>
                  <dd className="tabular-nums">−{formatDH(t.promo)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone">Livraison</dt>
                <dd className="tabular-nums">{t.shipping === 0 ? "Offerte" : formatDH(t.shipping)}</dd>
              </div>
              {t.shipping > 0 && (
                <p className="text-[12px] text-stone">Offerte dès {formatDH(SHIPPING.freeAbove)} — plus que {formatDH(t.toFreeShipping)}.</p>
              )}
              <div className="flex justify-between border-t border-ink/10 pt-3 text-[19px] font-semibold">
                <dt>À payer à la livraison</dt>
                <dd className="tabular-nums">{formatDH(t.total)}</dd>
              </div>
            </dl>

            {error && <p className="mt-4 border border-ember-deep/40 bg-ember/5 p-3 text-[13px] text-ember-deep">{error}</p>}

            <button
              type="submit"
              disabled={step !== "idle" || list.length === 0}
              className="mt-5 flex w-full items-center justify-center gap-3 bg-ink py-4 text-[14px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-ember disabled:opacity-60"
            >
              {step === "uploading" ? "Envoi de vos images…" : step === "sending" ? "Enregistrement…" : "Confirmer la commande"}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-[12px] text-stone">
              <Lock className="size-3" /> Rien à payer maintenant
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-[12.5px] text-ember-deep">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-[12px] text-stone">{hint}</span>
      ) : null}
    </label>
  );
}

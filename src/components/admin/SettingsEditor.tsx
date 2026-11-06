"use client";

import { useState, useTransition } from "react";
import { saveSiteSettings, type ActionState, type SettingsPayload } from "@/app/admin/actions";
import type { PhoneModel } from "@/lib/phones";
import { cn } from "@/lib/utils";

function Field({ label, hint, children, className }: { label: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-stone">{hint}</span>}
    </label>
  );
}

export function SettingsEditor({ initial, phones }: { initial: SettingsPayload; phones: PhoneModel[] }) {
  const [s, setS] = useState(initial);
  const [announce, setAnnounce] = useState(initial.announcements.join("\n"));
  const [state, setState] = useState<ActionState>(null);
  const [pending, start] = useTransition();
  const payload: SettingsPayload = { ...s, announcements: announce.split("\n").map((l) => l.trim()).filter(Boolean) };
  const [saved, setSaved] = useState(initial);
  const dirty = JSON.stringify(payload) !== JSON.stringify(saved);
  const brand = (patch: Partial<SettingsPayload["brand"]>) => setS((x) => ({ ...x, brand: { ...x.brand, ...patch } }));
  const tpl = (patch: Partial<SettingsPayload["templates"]>) => setS((x) => ({ ...x, templates: { ...x.templates, ...patch } }));
  const disabled = new Set(s.phonesDisabled);

  return (
    <div className="mt-8 space-y-10">
      <section className="space-y-4">
        <h2 className="display-semi text-[26px]">Marque & contact</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom de la marque" hint="Affiché dans le logo, les titres, les messages WhatsApp.">
            <input className="field" maxLength={30} value={s.brand.name} onChange={(e) => brand({ name: e.target.value })} />
          </Field>
          <Field label="Slogan (titre des pages)">
            <input className="field" maxLength={80} value={s.brand.tagline} onChange={(e) => brand({ tagline: e.target.value })} />
          </Field>
          <Field label="Numéro WhatsApp" hint="Celui sur lequel les clients vous écrivent. Ex. 06 12 34 56 78.">
            <input className="field" inputMode="tel" maxLength={30} value={s.brand.whatsapp} onChange={(e) => brand({ whatsapp: e.target.value })} />
          </Field>
          <Field label="Ville de l'atelier">
            <input className="field" maxLength={40} value={s.brand.city} onChange={(e) => brand({ city: e.target.value })} />
          </Field>
          <Field label="E-mail de contact">
            <input className="field" type="email" maxLength={120} value={s.brand.email} onChange={(e) => brand({ email: e.target.value })} />
          </Field>
          <Field label="Lien Instagram">
            <input className="field" type="url" maxLength={200} value={s.brand.instagram} onChange={(e) => brand({ instagram: e.target.value })} placeholder="https://instagram.com/…" />
          </Field>
        </div>
      </section>

      <section className="space-y-4 border-t border-ink/12 pt-6">
        <h2 className="display-semi text-[26px]">Bandeau d&apos;annonces</h2>
        <Field label="Messages (un par ligne, ils défilent en haut du site)">
          <textarea className="field min-h-[120px] resize-y" value={announce} onChange={(e) => setAnnounce(e.target.value)} />
        </Field>
      </section>

      <section id="pixel" className="scroll-mt-32 space-y-4 border-t border-ink/12 pt-6">
        <h2 className="display-semi text-[26px]">Publicité Instagram / Facebook</h2>
        <Field
          label="Identifiant du pixel Meta"
          hint={
            <>
              Gestionnaire d&apos;événements Meta → Sources de données → votre pixel (un numéro de 15–16 chiffres). Le site envoie
              alors : vue de page, fiche produit, ajout au panier, début de commande et commande (avec le montant).
            </>
          }
        >
          <input className="field font-mono" inputMode="numeric" maxLength={20} value={s.pixelId} onChange={(e) => setS((x) => ({ ...x, pixelId: e.target.value.replace(/\D/g, "") }))} placeholder="Vide = désactivé" />
        </Field>
      </section>

      <section className="space-y-4 border-t border-ink/12 pt-6">
        <h2 className="display-semi text-[26px]">Messages WhatsApp</h2>
        <p className="text-[13px] text-stone">
          Variables disponibles : <code>{"{prenom}"}</code> <code>{"{nom}"}</code> <code>{"{numero}"}</code> <code>{"{total}"}</code>{" "}
          <code>{"{articles}"}</code> <code>{"{ville}"}</code> <code>{"{marque}"}</code>. Vous pouvez aussi retoucher chaque message avant de
          l&apos;envoyer.
        </p>
        <Field label="Confirmation de commande">
          <textarea className="field min-h-[150px] resize-y text-[14px]" value={s.templates.confirm} onChange={(e) => tpl({ confirm: e.target.value })} />
        </Field>
        <Field label="Liste d'attente (production pas encore lancée)">
          <textarea className="field min-h-[170px] resize-y text-[14px]" value={s.templates.waitlist} onChange={(e) => tpl({ waitlist: e.target.value })} />
        </Field>
        <Field label="Commande expédiée">
          <textarea className="field min-h-[120px] resize-y text-[14px]" value={s.templates.shipped} onChange={(e) => tpl({ shipped: e.target.value })} />
        </Field>
      </section>

      <section className="space-y-4 border-t border-ink/12 pt-6">
        <h2 className="display-semi text-[26px]">Modèles de téléphone proposés</h2>
        {(["Apple", "Samsung", "Xiaomi"] as const).map((b) => (
          <div key={b}>
            <p className="text-[13px] font-semibold">{b}</p>
            <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
              {phones
                .filter((p) => p.brand === b)
                .map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-[14px]">
                    <input
                      type="checkbox"
                      className="size-4 accent-ink"
                      checked={!disabled.has(p.id)}
                      onChange={(e) =>
                        setS((x) => ({
                          ...x,
                          phonesDisabled: e.target.checked ? x.phonesDisabled.filter((id) => id !== p.id) : [...x.phonesDisabled, p.id],
                        }))
                      }
                    />
                    {p.name}
                  </label>
                ))}
            </div>
          </div>
        ))}
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-4 border-t border-ink/10 bg-paper/95 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0">
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={() =>
            start(async () => {
              const res = await saveSiteSettings(payload);
              if (res?.ok) setSaved(payload);
              setState(res);
            })
          }
          className="bg-ink px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.05em] text-paper hover:bg-ember disabled:opacity-40"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {dirty && <p className="text-[13px] text-stone">Modifications non enregistrées</p>}
        {state?.error && <p className="text-[13px] text-ember-deep">{state.error}</p>}
        {state?.message && !dirty && <p className="text-[13px] text-ok">{state.message}</p>}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import {
  deleteOrder,
  logOrderMessage,
  saveOrderNote,
  setOrderStatus,
  type ActionState,
} from "@/app/admin/actions";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import { cn } from "@/lib/utils";

/** One-click "waiting list" message from the orders list. */
export function QuickWhatsApp({ number, href }: { number: string; href: string }) {
  const [pending, start] = useTransition();
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => start(async () => void (await logOrderMessage(number, "liste d'attente", "attente")))}
      className={cn(
        "flex items-center gap-1.5 bg-[#25d366] px-3 py-2 text-[12.5px] font-semibold text-ink transition-opacity hover:opacity-90",
        pending && "opacity-60",
      )}
      title="Ouvre WhatsApp avec le message « liste d'attente » et passe la commande en liste d'attente"
    >
      <MessageCircle className="size-4" /> Liste d&apos;attente
    </a>
  );
}

interface Template {
  id: string;
  label: string;
  text: string;
  status: OrderStatus;
}

export function OrderPanel({
  number,
  status,
  note,
  phoneIntl,
  templates,
}: {
  number: string;
  status: OrderStatus;
  note: string;
  phoneIntl: string;
  templates: Template[];
}) {
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<ActionState>(null);
  const [tpl, setTpl] = useState(templates[0]?.id);
  const current = templates.find((t) => t.id === tpl) ?? templates[0];
  const [texts, setTexts] = useState<Record<string, string>>(() => Object.fromEntries(templates.map((t) => [t.id, t.text])));
  const [noteText, setNoteText] = useState(note);
  const message = current ? texts[current.id] : "";
  const href = `https://wa.me/${phoneIntl}?text=${encodeURIComponent(message)}`;

  const run = (fn: () => Promise<ActionState>) =>
    start(async () => {
      const res = await fn();
      setFeedback(res);
    });

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-[13px] font-semibold">Statut</h2>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {ORDER_STATUSES.map((s) => (
            <button
              key={s.id}
              type="button"
              disabled={pending}
              onClick={() => run(() => setOrderStatus(number, s.id))}
              title={s.hint}
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium transition-colors",
                status === s.id ? "bg-ink text-paper" : "bg-paper-2 hover:bg-paper-3",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[13px] font-semibold">Écrire au client sur WhatsApp</h2>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTpl(t.id)}
              className={cn(
                "border px-3 py-1.5 text-[13px] transition-colors",
                tpl === t.id ? "border-ink font-semibold" : "border-ink/15 hover:border-ink/50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        {current && (
          <>
            <textarea
              value={message}
              onChange={(e) => setTexts((m) => ({ ...m, [current.id]: e.target.value }))}
              rows={8}
              className="field mt-3 min-h-[180px] resize-y text-[14px] leading-relaxed"
              aria-label="Message WhatsApp"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                onClick={() => run(() => logOrderMessage(number, current.label, current.status))}
                className="flex items-center gap-2 bg-[#25d366] px-4 py-2.5 text-[13px] font-semibold text-ink hover:opacity-90"
              >
                <MessageCircle className="size-4" /> Ouvrir WhatsApp
              </a>
              <p className="text-[12px] text-stone">
                Le statut passe à « {ORDER_STATUSES.find((s) => s.id === current.status)?.label} » (sauf si la commande est déjà plus loin).
              </p>
            </div>
          </>
        )}
      </section>

      <section>
        <h2 className="text-[13px] font-semibold">Note interne</h2>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Ex. : rappeler samedi, veut le cadre noir…"
          className="field mt-2.5 resize-y text-[14px]"
        />
        <button
          type="button"
          disabled={pending || noteText === note}
          onClick={() => run(() => saveOrderNote(number, noteText))}
          className="mt-2 border border-ink px-4 py-2 text-[13px] font-semibold disabled:opacity-40"
        >
          Enregistrer la note
        </button>
      </section>

      {feedback?.error && <p className="border border-ember-deep/40 bg-ember/5 p-3 text-[13px] text-ember-deep">{feedback.error}</p>}
      {feedback?.message && <p className="text-[13px] text-ok">{feedback.message}</p>}

      <section className="border-t border-ink/10 pt-6">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            if (confirm(`Supprimer définitivement la commande ${number} ? Cette action est irréversible.`)) run(() => deleteOrder(number));
          }}
          className="flex items-center gap-2 text-[13px] text-ember-deep hover:underline"
        >
          <Trash2 className="size-4" /> Supprimer la commande
        </button>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function NewsletterForm({ tone = "ink", source = "footer" }: { tone?: "ink" | "paper"; source?: string }) {
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contact: value.trim(), source }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className={cn("mt-8 flex items-center gap-3 text-[15px]", tone === "ink" ? "text-paper" : "text-ink")}>
        <span className="grid size-7 place-items-center rounded-full bg-ember text-white">
          <Check className="size-4" />
        </span>
        Bienvenue au club. Votre code −10 % : <strong className="label text-[13px]">DARART10</strong>
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 max-w-md">
      <div
        className={cn(
          "flex items-center border-b pb-2 transition-colors",
          tone === "ink" ? "border-paper/30 focus-within:border-paper" : "border-ink/30 focus-within:border-ink",
        )}
      >
        <input
          type="text"
          inputMode="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="E-mail ou numéro WhatsApp"
          aria-label="E-mail ou numéro WhatsApp"
          className={cn(
            "w-full bg-transparent py-2 text-[16px] outline-none",
            tone === "ink" ? "placeholder:text-paper/35" : "placeholder:text-stone",
          )}
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className={cn(
            "label flex shrink-0 items-center gap-2 py-2 pl-4 transition-opacity disabled:opacity-50",
          )}
        >
          Rejoindre <ArrowRight className="size-3.5" />
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-[13px] text-ember">Oups, réessayez dans un instant.</p>}
    </form>
  );
}

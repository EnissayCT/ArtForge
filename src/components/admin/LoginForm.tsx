"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { loginAction, type ActionState } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, null);
  return (
    <form action={action} className="mt-10 space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-paper/80">Mot de passe</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={200}
          className="w-full border border-paper/20 bg-paper/5 px-3.5 py-3 text-[15px] text-paper outline-none transition-colors focus:border-paper/60"
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold text-paper/80">Code de l&apos;application d&apos;authentification</span>
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]{6,7}"
          maxLength={7}
          placeholder="123 456"
          required
          className="w-full border border-paper/20 bg-paper/5 px-3.5 py-3 font-mono text-[18px] tracking-[0.3em] text-paper outline-none transition-colors placeholder:text-paper/20 focus:border-paper/60"
        />
      </label>
      {state?.error && <p className="border border-ember/50 bg-ember/10 p-3 text-[13px] text-paper">{state.error}</p>}
      <button
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 bg-paper py-3.5 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-ember hover:text-white disabled:opacity-60"
      >
        <Lock className="size-4" /> {pending ? "Vérification…" : "Se connecter"}
      </button>
    </form>
  );
}

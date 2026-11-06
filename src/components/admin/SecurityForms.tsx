"use client";

import { useActionState, useState, useTransition } from "react";
import { changePasswordAction, logoutOthersAction, type ActionState } from "@/app/admin/actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(changePasswordAction, null);
  return (
    <form action={action} className="mt-4 grid gap-4 sm:max-w-md">
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Mot de passe actuel</span>
        <input name="current" type="password" autoComplete="current-password" required className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Nouveau mot de passe</span>
        <input name="next" type="password" autoComplete="new-password" minLength={12} required className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Confirmer le nouveau mot de passe</span>
        <input name="confirm" type="password" autoComplete="new-password" minLength={12} required className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-semibold">Code de l&apos;application d&apos;authentification</span>
        <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required className="field font-mono tracking-[0.3em]" />
      </label>
      {state?.error && <p className="text-[13px] text-ember-deep">{state.error}</p>}
      {state?.message && <p className="text-[13px] text-ok">{state.message}</p>}
      <button disabled={pending} className="justify-self-start bg-ink px-5 py-3 text-[13px] font-semibold uppercase tracking-[0.05em] text-paper hover:bg-ember disabled:opacity-50">
        {pending ? "…" : "Changer le mot de passe"}
      </button>
    </form>
  );
}

export function SignOutOthers() {
  const [pending, start] = useTransition();
  const [state, setState] = useState<ActionState>(null);
  return (
    <div className="mt-3 flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setState(await logoutOthersAction()))}
        className="border border-ink px-4 py-2 text-[13px] font-semibold disabled:opacity-50"
      >
        Déconnecter les autres appareils
      </button>
      {state?.message && <p className="text-[13px] text-ok">{state.message}</p>}
    </div>
  );
}

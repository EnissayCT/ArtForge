"use client";

import { useTransition } from "react";
import { X } from "lucide-react";
import { deleteLead } from "@/app/admin/actions";

export function LeadDelete({ at, contact }: { at: string; contact: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => confirm(`Supprimer ${contact} ?`) && start(async () => void (await deleteLead(at, contact)))}
      className="p-1.5 text-stone hover:text-ember-deep disabled:opacity-40"
      aria-label={`Supprimer ${contact}`}
    >
      <X className="size-4" />
    </button>
  );
}

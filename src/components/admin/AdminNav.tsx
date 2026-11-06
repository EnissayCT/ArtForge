"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/collections", label: "Collections" },
  { href: "/admin/tarifs", label: "Tarifs" },
  { href: "/admin/reglages", label: "Réglages" },
  { href: "/admin/abonnes", label: "Abonnés" },
  { href: "/admin/securite", label: "Sécurité" },
];

export function AdminNav({ newOrders }: { newOrders: number }) {
  const pathname = usePathname();
  return (
    <nav className="no-scrollbar mx-auto flex max-w-[1280px] gap-1 overflow-x-auto px-3 pb-2 sm:px-5" aria-label="Administration">
      {ITEMS.map((i) => {
        const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[13px] font-medium transition-colors",
              active ? "bg-ink text-paper" : "text-ink/70 hover:bg-paper-2 hover:text-ink",
            )}
          >
            {i.label}
            {i.href === "/admin/commandes" && newOrders > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-ember px-1.5 text-[11px] font-semibold leading-5 text-white">
                {newOrders}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

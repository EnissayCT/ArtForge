import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { Mark } from "@/components/brand/Logo";
import { requireAdmin } from "@/lib/auth";
import { getShop } from "@/lib/data";
import { readAll } from "@/lib/store";
import type { Order } from "@/lib/orders";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [{ brand }, orders] = await Promise.all([getShop(), readAll<Order>("orders.json")]);
  const fresh = orders.filter((o) => o.status === "nouvelle").length;
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-3 px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <Mark className="h-6 w-auto" />
            <span className="display-semi text-[19px] leading-none">{brand.name}</span>
            <span className="label hidden text-stone sm:inline">Admin</span>
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <a href="/" target="_blank" rel="noreferrer" className="label flex items-center gap-1.5 px-2.5 py-2 text-stone hover:text-ink">
              <span className="hidden sm:inline">Voir le site</span> <ExternalLink className="size-3.5" />
            </a>
            <form action={logoutAction}>
              <button className="label flex items-center gap-1.5 px-2.5 py-2 text-stone hover:text-ember-deep" aria-label="Se déconnecter">
                <span className="hidden sm:inline">Déconnexion</span> <LogOut className="size-3.5" />
              </button>
            </form>
          </div>
        </div>
        <AdminNav newOrders={fresh} />
      </header>
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-24 pt-6 sm:px-6 sm:pt-8">{children}</main>
    </>
  );
}

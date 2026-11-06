"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { NAV, waLink } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useHydrated, useLockBody } from "@/lib/hooks";
import { useCatalog, useShop } from "@/components/providers/ShopProvider";
import { SearchOverlay } from "./SearchOverlay";
import { cn } from "@/lib/utils";

function AnnouncementBar() {
  const { announcements, brand } = useShop();
  const MESSAGES = announcements.length ? announcements : [""];
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 4200);
    return () => clearInterval(t);
  }, [MESSAGES.length]);
  return (
    <div className="bg-ink text-paper/85">
      <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-center px-4 sm:justify-between sm:px-8">
        <span className="label hidden text-paper/50 sm:inline">Imprimé à {brand.city}</span>
        <div className="relative h-4 w-full overflow-hidden text-center sm:w-[420px]">
          {MESSAGES.map((m, n) => (
            <span
              key={`${n}-${m}`}
              className={cn(
                "label absolute inset-0 transition-all duration-700 ease-[var(--ease-out-expo)]",
                n === i ? "translate-y-0 opacity-100" : n < i ? "-translate-y-full opacity-0" : "translate-y-full opacity-0",
              )}
            >
              {m}
            </span>
          ))}
        </div>
        <a href={waLink(brand.whatsapp)} target="_blank" rel="noreferrer" className="label hidden text-paper/50 hover:text-paper sm:inline">
          Aide WhatsApp
        </a>
      </div>
    </div>
  );
}

function CollectionsPanel({ onNavigate }: { onNavigate: () => void }) {
  const catalog = useCatalog();
  const COLLECTIONS = catalog.collections;
  const preferred = ["japon", "espace", "orient"].filter((s) => COLLECTIONS.some((c) => c.slug === s));
  const picks = [...preferred, ...COLLECTIONS.map((c) => c.slug).filter((s) => !preferred.includes(s))].slice(0, 3);
  const covers = picks.map((s) => ({ c: catalog.collection(s)!, a: catalog.cover(s) }));
  return (
    <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-8 py-10">
      <div className="col-span-4">
        <p className="label mb-5 text-stone">Collections</p>
        <ul className="grid grid-cols-1 gap-y-1">
          {COLLECTIONS.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/collections/${c.slug}`}
                onClick={onNavigate}
                className="group flex items-baseline justify-between border-b rule py-2.5"
              >
                <span className="display-semi text-2xl transition-transform duration-500 group-hover:translate-x-1.5">{c.name}</span>
                <span className="label text-stone">{catalog.byCollection(c.slug).length}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/boutique" onClick={onNavigate} className="label link-u mt-6 inline-flex items-center gap-1">
          Toutes les œuvres <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <div className="col-span-8 grid grid-cols-3 gap-6">
        {covers.map(({ c, a }) =>
          a ? (
            <Link key={c.slug} href={`/collections/${c.slug}`} onClick={onNavigate} className="group block">
              <div className="glint plate relative aspect-[3/4] overflow-hidden bg-paper-3">
                <Image src={a.image} alt={a.title} fill sizes="300px" className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]" />
              </div>
              <p className="label mt-3 text-stone">{c.kicker}</p>
              <p className="display-semi text-xl">{c.name}</p>
            </Link>
          ) : null,
        )}
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const shop = useShop();
  const { collections } = useCatalog();
  const hydrated = useHydrated();
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const wish = useWishlist((s) => s.slugs);
  // menus remember the page they were opened on, so navigating closes them
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const [panelAt, setPanelAt] = useState<string | null>(null);
  const [search, setSearch] = useState(false);
  const menu = menuAt === pathname;
  const panel = panelAt === pathname;
  const setMenu = (open: boolean) => setMenuAt(open ? pathname : null);
  const setPanel = (open: boolean) => setPanelAt(open ? pathname : null);
  const [scrolled, setScrolled] = useState(false);
  const count = hydrated ? items.reduce((n, i) => n + i.qty, 0) : 0;
  useLockBody(menu);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-paper/95 backdrop-saturate-150 transition-[border-color,background-color] duration-300",
          scrolled ? "border-ink/10" : "border-transparent",
        )}
        onMouseLeave={() => setPanel(false)}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-8">
          <button
            className="-ml-1 p-1 lg:hidden"
            aria-label="Ouvrir le menu"
            onClick={() => setMenu(true)}
          >
            <Menu className="size-5" strokeWidth={1.6} />
          </button>
          <Link href="/" aria-label={`${shop.brand.name}, accueil`} className="shrink-0">
            <Logo name={shop.brand.name} />
          </Link>

          <nav className="ml-6 hidden items-center gap-7 lg:flex" aria-label="Navigation principale">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onMouseEnter={() => setPanel(n.href === "/collections")}
                aria-current={pathname.startsWith(n.href) ? "page" : undefined}
                className="link-u text-[14px] font-medium tracking-[0.01em] py-1"
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setSearch(true)}
              className="group flex items-center gap-2 p-2 text-[14px] sm:border sm:border-ink/15 sm:px-3 sm:py-1.5 hover:border-ink/40 transition-colors"
              aria-label="Rechercher"
            >
              <Search className="size-[18px]" strokeWidth={1.6} />
              <span className="hidden text-stone xl:inline">Hokusai, nébuleuse, Van Gogh…</span>
            </button>
            <Link href="/favoris" className="relative p-2" aria-label="Favoris">
              <Heart className="size-[19px]" strokeWidth={1.6} />
              {hydrated && wish.length > 0 && (
                <span className="absolute right-0.5 top-0.5 grid size-4 place-items-center rounded-full bg-ink text-[10px] font-semibold text-paper">
                  {wish.length}
                </span>
              )}
            </Link>
            <button onClick={() => setOpen(true)} className="relative p-2" aria-label={`Panier, ${count} article(s)`}>
              <ShoppingBag className="size-[19px]" strokeWidth={1.6} />
              {count > 0 && (
                <span className="absolute right-0 top-0.5 grid size-4 place-items-center rounded-full bg-ember text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "absolute inset-x-0 top-full hidden overflow-hidden border-b border-ink/10 bg-paper shadow-[0_30px_60px_-30px_rgba(0,0,0,0.25)] transition-all duration-500 ease-[var(--ease-out-expo)] lg:block",
            panel ? "visible max-h-[560px] opacity-100" : "invisible max-h-0 opacity-0",
          )}
        >
          <CollectionsPanel onNavigate={() => setPanel(false)} />
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-ink text-paper transition-[opacity,visibility] duration-500 lg:hidden",
          menu ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <Logo name={shop.brand.name} />
          <button onClick={() => setMenu(false)} aria-label="Fermer le menu" className="p-2">
            <X className="size-6" strokeWidth={1.5} />
          </button>
        </div>
        <nav className="px-4 pt-6">
          {NAV.map((n, i) => (
            <Link
              key={n.href}
              href={n.href}
              className="display block border-b border-paper/10 py-4 text-[44px]"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {n.label}
            </Link>
          ))}
          <div className="mt-8 grid grid-cols-2 gap-2">
            {collections.map((c) => (
              <Link key={c.slug} href={`/collections/${c.slug}`} className="label py-2 text-paper/60">
                {c.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </>
  );
}

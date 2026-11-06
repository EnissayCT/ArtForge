import Link from "next/link";
import { Mark } from "@/components/brand/Logo";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="relative overflow-hidden bg-ink text-paper">
          <Mark className="pointer-events-none absolute -right-16 -top-10 h-[620px] w-auto text-paper/[0.04]" />
          <div className="relative mx-auto max-w-[1440px] px-4 py-32 sm:px-8 sm:py-44">
            <p className="label text-paper/50">Erreur 404</p>
            <h1 className="display mt-4 text-[80px] sm:text-[160px]">Mur vide.</h1>
            <p className="mt-6 max-w-md text-[17px] text-paper/70">
              Cette page n&apos;existe pas, ou l&apos;œuvre a quitté le catalogue.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/boutique"
                className="bg-paper px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink hover:bg-ember hover:text-white"
              >
                La boutique
              </Link>
              <Link
                href="/"
                className="border border-paper/30 px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] hover:border-paper"
              >
                Accueil
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}

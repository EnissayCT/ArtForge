import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  Palette,
  Truck,
  Frame,
  Smartphone,
  Sparkles,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Eye,
  CheckCircle,
  MapPin,
} from "lucide-react";

const FEATURED_DESIGNS = [
  {
    src: "https://cdn.displate.com/artwork/324x454/2026-01-10/a1e3af49-900e-40c6-a0fc-13bf21708c2e.jpg",
    title: "Arc Riders",
    category: "Gaming",
  },
  {
    src: "https://cdn.displate.com/artwork/324x454/2025-11-25/52a2cb1b-882a-4c71-980b-5716e3229fb8.jpg",
    title: "Gaming Cat",
    category: "Gaming",
  },
  {
    src: "https://cdn.displate.com/artwork/324x454/2025-10-17/19f6fc80-ecc7-4327-b039-a453b51f1369.jpg",
    title: "Tattooed Girl",
    category: "Anime",
  },
  {
    src: "https://cdn.displate.com/artwork/324x454/2026-01-14/e6e001ad-54d1-4248-a77e-bc53fdfa62ac.jpg",
    title: "Tokyo Drift",
    category: "Anime",
  },
  {
    src: "https://cdn.displate.com/artwork/324x454/2025-09-26/689c3a1a-7350-4380-8638-679e27c38177.jpg",
    title: "Invincible",
    category: "Comics",
  },
  {
    src: "https://cdn.displate.com/artwork/324x454/2024-10-31/611278ce-067a-4ac8-bf7f-f226662b7f17.jpg",
    title: "Tintin",
    category: "Comics",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        {/* Background gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
        <div className="absolute top-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 mb-6 border border-accent/20">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">
                  Impression UV Premium
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]">
                Vos designs,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                  imprimés
                </span>{" "}
                sur mesure
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Créez vos plaques métal et coques de téléphone personnalisées avec
                la technologie d&apos;impression UV. Qualité professionnelle, livré
                partout au Maroc.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/customize">
                  <Button variant="accent" size="xl" className="w-full sm:w-auto text-base px-8">
                    Commencer à créer
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/examples">
                  <Button variant="outline" size="xl" className="w-full sm:w-auto text-base px-8">
                    Voir les exemples
                  </Button>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-accent" /> Livraison Maroc
                </span>
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" /> Paiement à la livraison
                </span>
                <span className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent" /> Qualité HD
                </span>
              </div>
            </div>

            {/* Hero visual — real example images mosaic */}
            <div className="relative hidden lg:block">
              <div className="grid grid-cols-2 gap-3 max-w-md ml-auto">
                <div className="space-y-3">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 transform hover:scale-[1.02] transition-transform">
                    <Image
                      src={FEATURED_DESIGNS[0].src}
                      alt={FEATURED_DESIGNS[0].title}
                      width={324}
                      height={454}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 transform hover:scale-[1.02] transition-transform">
                    <Image
                      src={FEATURED_DESIGNS[2].src}
                      alt={FEATURED_DESIGNS[2].title}
                      width={324}
                      height={454}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="space-y-3 pt-8">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 transform hover:scale-[1.02] transition-transform">
                    <Image
                      src={FEATURED_DESIGNS[4].src}
                      alt={FEATURED_DESIGNS[4].title}
                      width={324}
                      height={454}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 transform hover:scale-[1.02] transition-transform">
                    <Image
                      src={FEATURED_DESIGNS[1].src}
                      alt={FEATURED_DESIGNS[1].title}
                      width={324}
                      height={454}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-2 -right-2 bg-card border border-border rounded-xl shadow-lg px-4 py-2.5 text-xs font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                +200 designs créés
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Showcase: Video + Collections ── */}
      <section className="py-0 bg-background border-b border-border">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] min-h-[520px]">
            {/* Left — Seamless looping video */}
            <div className="relative bg-black overflow-hidden">
              {/* YouTube embed scaled up to hide all player UI */}
              <div className="absolute inset-[-15%] pointer-events-none">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/vnQGXozyKU8?autoplay=1&mute=1&loop=1&playlist=vnQGXozyKU8&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1"
                  title="ArtForge — Impression UV sur métal"
                  allow="autoplay; encrypted-media"
                  className="w-full h-full border-0"
                />
              </div>
              {/* Overlay text */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                <h2 className="text-white text-2xl sm:text-3xl font-bold leading-tight">
                  Magnetic by design&nbsp;:<br />
                  trouvez vos posters métal
                </h2>
                <Link href="/shop" className="pointer-events-auto">
                  <Button variant="accent" size="sm" className="mt-4">
                    Voir la boutique
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — Scrollable collection cards */}
            <div className="border-l border-border overflow-y-auto max-h-[520px] divide-y divide-border bg-background">
              {[
                {
                  img: "https://cdn.displate.com/artwork/454x301/2026-02-12/428778b18d6a9c8e654607c3ba6a87b9_f879fce0208eca191d41a75994e0a9e9.jpg",
                  badge: "NOUVEAUTÉ",
                  title: "The Apothecary Diaries sur métal",
                  sub: "The Apothecary Diaries",
                },
                {
                  img: "https://cdn.displate.com/artwork/454x301/2026-02-17/7c620da93b9cb16b78bd2b8276d8e5f9_a387f345fb3d2f868d0542b651fc8da4.jpg",
                  badge: "NOUVEAUTÉ",
                  title: "Surpassez vos limites ! Black Clover arrive",
                  sub: "Black Clover",
                },
                {
                  img: "https://cdn.displate.com/artwork/454x301/2024-03-03/685e23763758644881725e21a664c69b_93507c7eb6e3222bdcd758e1a86253e8.jpg",
                  badge: "COLLECTION",
                  title: "Moments iconiques One Piece sur métal",
                  sub: "One Piece",
                },
                {
                  img: "https://cdn.displate.com/artwork/454x301/2025-12-03/0f139f091e69c8017746ef4a794d77b7_7d6beadbe74d4eac66ec13bdb4d2e419.jpg",
                  badge: "NOUVELLE COLLECTION",
                  title: "Clair Obscur: Expedition 33",
                  sub: "Clair Obscur: Expedition 33",
                },
              ].map((col) => (
                <Link
                  key={col.title}
                  href="/examples"
                  className="flex gap-4 p-4 hover:bg-secondary/40 transition-colors group"
                >
                  <div className="w-[180px] shrink-0 aspect-[3/2] rounded-lg overflow-hidden bg-secondary">
                    <Image
                      src={col.img}
                      alt={col.title}
                      width={454}
                      height={301}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="text-[10px] font-bold text-accent uppercase tracking-wider">
                      {col.badge}
                    </span>
                    <h3 className="text-sm font-semibold mt-1 leading-snug line-clamp-2">
                      {col.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-accent/20 inline-flex items-center justify-center text-[8px]">🎨</span>
                      {col.sub}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Brands bar — infinite carousel */}
        <div className="border-t border-border py-8 overflow-hidden">
          <p className="text-center text-sm font-semibold mb-6">
            Découvrez des designs inspirés de vos univers préférés
          </p>
          <div className="relative mx-auto" style={{ width: "80%" }}>
            {/* Fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
            {/* Marquee track — two identical copies for seamless loop */}
            <div className="flex overflow-hidden">
              <div className="flex shrink-0 animate-marquee">
                {[
                  { name: "Marvel", icon: "🦸" },
                  { name: "DC", icon: "🦇" },
                  { name: "Star Wars", icon: "⚔️" },
                  { name: "Disney", icon: "🏰" },
                  { name: "One Piece", icon: "🏴‍☠️" },
                  { name: "Naruto", icon: "🍥" },
                  { name: "Dragon Ball", icon: "🐉" },
                  { name: "Godzilla", icon: "🦎" },
                  { name: "Fallout", icon: "☢️" },
                  { name: "Cyberpunk", icon: "🤖" },
                  { name: "Pokemon", icon: "⚡" },
                  { name: "Zelda", icon: "🗡️" },
                ].map((brand) => (
                  <div
                    key={`a-${brand.name}`}
                    className="flex flex-col items-center gap-1.5 text-center mx-6 sm:mx-8 shrink-0"
                  >
                    <span className="text-2xl sm:text-3xl">{brand.icon}</span>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                      {brand.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex shrink-0 animate-marquee" aria-hidden>
                {[
                  { name: "Marvel", icon: "🦸" },
                  { name: "DC", icon: "🦇" },
                  { name: "Star Wars", icon: "⚔️" },
                  { name: "Disney", icon: "🏰" },
                  { name: "One Piece", icon: "🏴‍☠️" },
                  { name: "Naruto", icon: "🍥" },
                  { name: "Dragon Ball", icon: "🐉" },
                  { name: "Godzilla", icon: "🦎" },
                  { name: "Fallout", icon: "☢️" },
                  { name: "Cyberpunk", icon: "🤖" },
                  { name: "Pokemon", icon: "⚡" },
                  { name: "Zelda", icon: "🗡️" },
                ].map((brand) => (
                  <div
                    key={`b-${brand.name}`}
                    className="flex flex-col items-center gap-1.5 text-center mx-6 sm:mx-8 shrink-0"
                  >
                    <span className="text-2xl sm:text-3xl">{brand.icon}</span>
                    <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                      {brand.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Designs Gallery ── */}
      <section className="py-16 sm:py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold">Designs Populaires</h2>
              <p className="mt-2 text-muted-foreground">
                Inspirez-vous et créez votre propre chef-d&apos;œuvre
              </p>
            </div>
            <Link
              href="/examples"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              Voir tous <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {FEATURED_DESIGNS.map((design) => (
              <Link
                key={design.title}
                href={`/customize?image=${encodeURIComponent(design.src)}`}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <Image
                  src={design.src}
                  alt={design.title}
                  width={324}
                  height={454}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-semibold">{design.title}</p>
                  <p className="text-white/70 text-xs">{design.category}</p>
                </div>
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-3 w-3 text-white" />
                </div>
              </Link>
            ))}
          </div>
          <div className="sm:hidden text-center mt-6">
            <Link href="/examples">
              <Button variant="outline" size="sm">
                Voir tous les exemples <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Products ── */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Nos Produits</h2>
            <p className="mt-3 text-muted-foreground">
              Choisissez votre support, uploadez votre design
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/shop/metal-plates">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-md">
                <div className="aspect-[4/3] bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center relative">
                  <div className="w-36 h-48 rounded-lg overflow-hidden shadow-xl group-hover:scale-105 transition-transform">
                    <Image
                      src={FEATURED_DESIGNS[3].src}
                      alt="Plaque métal exemple"
                      width={324}
                      height={454}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                    À partir de 150 MAD
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Frame className="h-5 w-5 text-accent" /> Plaques Métal
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Aluminium premium, formats A3 et A4. Finitions mat ou brillant.
                    Parfait pour la déco murale.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/shop/phone-cases">
              <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 shadow-md">
                <div className="aspect-[4/3] bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center relative">
                  <div className="w-28 h-48 rounded-2xl overflow-hidden shadow-xl group-hover:scale-105 transition-transform">
                    <Image
                      src={FEATURED_DESIGNS[5].src}
                      alt="Coque téléphone exemple"
                      width={324}
                      height={454}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
                    À partir de 120 MAD
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-accent" /> Coques Téléphone
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    iPhone 14/15/16 et Samsung S23/S24. Impression UV résistante
                    aux rayures.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        {/* Rich layered background */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-secondary/60 to-secondary/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,_var(--tw-gradient-stops))] from-accent/[0.07] via-transparent to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 mb-5 border border-accent/20">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-bold tracking-widest text-accent uppercase">
                Simple & Rapide
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Comment ça marche ?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-lg mx-auto">
              De l&apos;idée à la livraison, en 3 étapes simples
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Upload,
                title: "Uploadez votre image",
                description:
                  "Glissez-déposez votre design ou parcourez nos collections. Notre système vérifie automatiquement la résolution et la qualité.",
                tags: ["JPG, PNG, WebP", "Min. 150 DPI"],
                gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
                iconBg: "from-orange-500 to-amber-500",
              },
              {
                icon: Palette,
                title: "Personnalisez en 3D",
                description:
                  "Ajustez la position, appliquez des filtres, choisissez votre finition. Prévisualisez en temps réel sur le produit 3D.",
                tags: ["Filtres & Effets", "Rotation", "Recadrage"],
                gradient: "from-rose-500/20 via-pink-500/10 to-transparent",
                iconBg: "from-rose-500 to-orange-500",
              },
              {
                icon: Truck,
                title: "Recevez chez vous",
                description:
                  "Validez avec paiement à la livraison. Votre création est imprimée en UV et livrée partout au Maroc.",
                tags: ["Paiement COD", "Tout le Maroc"],
                gradient: "from-violet-500/20 via-purple-500/10 to-transparent",
                iconBg: "from-violet-500 to-indigo-500",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="group relative"
              >
                {/* Card */}
                <div className="relative h-full bg-card/80 backdrop-blur-sm rounded-3xl border border-border/60 p-8 overflow-hidden transition-all duration-500 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1">
                  {/* Gradient glow at top */}
                  <div className={`absolute top-0 inset-x-0 h-32 bg-gradient-to-b ${item.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-500`} />

                  <div className="relative">
                    {/* Step number + Icon row */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                        <item.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold tracking-widest text-muted-foreground/60 uppercase">
                          Étape
                        </span>
                        <span className="text-3xl font-black text-foreground/10 leading-none group-hover:text-accent/20 transition-colors">
                          0{i + 1}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                      {item.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium text-foreground/60 bg-foreground/[0.04] border border-foreground/[0.06] px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Connector arrow (mobile) */}
                {i < 2 && (
                  <div className="flex justify-center py-4 md:hidden">
                    <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-accent rotate-90" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop connector dots */}
          <div className="hidden md:flex justify-center mt-10 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === 0 ? "bg-accent" : "bg-accent/20"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 sm:py-32 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,_var(--tw-gradient-stops))] from-accent/[0.04] via-transparent to-transparent" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 mb-5 border border-accent/20">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="text-xs font-bold tracking-widest text-accent uppercase">
                  Avis clients
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                Ce que disent{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
                  nos clients
                </span>
              </h2>
              <p className="mt-3 text-muted-foreground text-lg">
                +200 créateurs satisfaits à travers le Maroc
              </p>
            </div>
            {/* Aggregate rating */}
            <div className="flex items-center gap-4 bg-card border border-border/60 rounded-2xl px-6 py-4 shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-black text-foreground">4.9</div>
                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">sur 5</div>
              </div>
              <div className="w-px h-10 bg-border" />
              <div>
                <div className="flex items-center gap-0.5 mb-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground">200+ avis vérifiés</div>
              </div>
            </div>
          </div>

          {/* Review cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: "Yasmine B.",
                city: "Casablanca",
                text: "La qualité d'impression est incroyable ! Ma plaque métal est magnifique en déco. Les couleurs sont éclatantes et le rendu est très professionnel.",
                product: "Plaque Métal A3 — Brillant",
                rating: 5,
                color: "from-orange-500 to-amber-500",
                ago: "Il y a 2 semaines",
              },
              {
                name: "Ahmed K.",
                city: "Rabat",
                text: "J'ai commandé une coque pour mon iPhone 15, les couleurs sont fidèles au design original. Le paiement à la livraison m'a mis en confiance.",
                product: "Coque iPhone 15 — Mat",
                rating: 5,
                color: "from-rose-500 to-pink-500",
                ago: "Il y a 1 mois",
              },
              {
                name: "Sara M.",
                city: "Marrakech",
                text: "Livraison rapide et le paiement à la livraison est très pratique. Le configurateur 3D est super bien fait. Je recommande à 100% !",
                product: "Plaque Métal A4 — Mat",
                rating: 5,
                color: "from-violet-500 to-indigo-500",
                ago: "Il y a 3 semaines",
              },
            ].map((review) => (
              <div
                key={review.name}
                className="group relative bg-card rounded-3xl border border-border/60 overflow-hidden transition-all duration-500 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 hover:-translate-y-1"
              >
                {/* Top accent bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${review.color}`} />

                <div className="p-7">
                  {/* Stars + time */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-muted-foreground/60">{review.ago}</span>
                  </div>

                  {/* Large quote */}
                  <div className="text-5xl font-serif text-accent/15 leading-none mb-2 select-none">&ldquo;</div>

                  <p className="text-[15px] text-foreground/85 leading-relaxed mb-6 -mt-4">
                    {review.text}
                  </p>

                  {/* Product tag */}
                  <div className="text-[11px] text-accent font-semibold bg-accent/[0.06] border border-accent/10 rounded-lg px-3 py-1.5 inline-flex items-center gap-1.5 mb-6">
                    <CheckCircle className="h-3 w-3" />
                    Achat vérifié — {review.product}
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-5 border-t border-border/40">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${review.color} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {review.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold">{review.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {review.city}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à créer votre design ?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Lancez-vous maintenant et recevez votre produit personnalisé chez
            vous au Maroc.
          </p>
          <Link href="/customize">
            <Button variant="accent" size="xl" className="text-base px-10">
              Commencer maintenant
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

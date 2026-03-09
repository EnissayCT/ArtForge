import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Target,
  Heart,
  Lightbulb,
  Users,
  MapPin,
  Sparkles,
  Printer,
  Palette,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "À Propos | ArtForge Studio",
  description:
    "Découvrez ArtForge Studio — impression UV premium sur métal et coques de téléphone, fabriqué au Maroc avec passion.",
};

const VALUES = [
  {
    icon: Lightbulb,
    title: "Innovation",
    description:
      "Nous utilisons la technologie d'impression UV de dernière génération pour des résultats incomparables en précision et durabilité.",
  },
  {
    icon: Heart,
    title: "Passion",
    description:
      "Chaque produit est traité avec soin. De la vérification de l'image à l'emballage final, nous visons la perfection.",
  },
  {
    icon: ShieldCheck,
    title: "Qualité",
    description:
      "Matériaux premium, encres résistantes aux UV et aux rayures. Nos produits sont conçus pour durer des années.",
  },
  {
    icon: Users,
    title: "Proximité",
    description:
      "Basés au Maroc, nous connaissons nos clients. Support réactif et livraison adaptée à tout le territoire.",
  },
];

const STATS = [
  { value: "200+", label: "Designs créés" },
  { value: "150+", label: "Clients satisfaits" },
  { value: "4.9/5", label: "Note moyenne" },
  { value: "48h", label: "Délai production" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-orange-500/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 mb-6 border border-accent/20">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Notre histoire</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            L&apos;art de l&apos;impression,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              réinventé
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            ArtForge Studio est né d&apos;une idée simple : permettre à chacun de
            transformer ses images préférées en objets d&apos;art premium. Basés au
            Maroc, nous combinons technologie de pointe et savoir-faire artisanal.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border bg-secondary/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {STATS.map((stat) => (
              <div key={stat.label} className="py-8 px-4 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-accent">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-bold tracking-widest text-accent uppercase">
                Notre mission
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-3 leading-tight">
                Rendre l&apos;art personnalisé{" "}
                <span className="text-accent">accessible à tous</span>
              </h2>
              <p className="mt-6 text-muted-foreground leading-relaxed">
                Nous croyons que chaque espace mérite une touche personnelle. Que
                ce soit un poster gaming pour votre setup, une illustration anime
                pour votre chambre, ou une coque unique pour votre téléphone —
                nous rendons cela possible en quelques clics.
              </p>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Notre configurateur 3D vous permet de visualiser le résultat final
                avant de commander, et notre technologie d&apos;impression UV garantit
                des couleurs éclatantes qui résistent au temps.
              </p>
              <Link href="/customize" className="inline-block mt-8">
                <Button variant="accent" size="lg">
                  Créer mon design
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  icon: Printer,
                  title: "Impression UV",
                  text: "Technologie d'encre UV haute définition, résistante aux rayures et aux UV.",
                },
                {
                  icon: Palette,
                  title: "Configurateur 3D",
                  text: "Visualisez votre design en temps réel sur le produit final avant d'acheter.",
                },
                {
                  icon: MapPin,
                  title: "Made in Morocco",
                  text: "Produit et expédié depuis le Maroc. Livraison partout dans le pays.",
                },
                {
                  icon: Target,
                  title: "Qualité garantie",
                  text: "Aluminium premium, coques en polycarbonate. Matériaux durables et premium.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-card border border-border/50 rounded-2xl p-5 hover:border-accent/20 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                    <item.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-28 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest text-accent uppercase">
              Nos valeurs
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">
              Ce qui nous définit
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="relative bg-card rounded-2xl p-6 border border-border/50 hover:border-accent/20 transition-all duration-300 group text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <v.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-accent/10 to-accent/5" />
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Prêt à créer quelque chose d&apos;unique ?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Rejoignez des centaines de créateurs et transformez vos images en
            œuvres d&apos;art tangibles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/customize">
              <Button variant="accent" size="xl" className="text-base px-10">
                Commencer à créer
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="xl" className="text-base px-10">
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

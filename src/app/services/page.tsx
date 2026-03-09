import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Frame,
  Smartphone,
  Sparkles,
  Layers,
  Paintbrush,
  Box,
  Truck,
  CheckCircle2,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Nos Services | ArtForge Studio",
  description:
    "Découvrez nos services d'impression UV premium : plaques métal personnalisées et coques de téléphone sur mesure.",
};

const SERVICES = [
  {
    icon: Frame,
    title: "Plaques Métal Personnalisées",
    tagline: "Décoration murale premium",
    description:
      "Transformez vos images en plaques d'aluminium imprimées en UV haute définition. Idéal pour la décoration murale, gaming setup, ou comme cadeau unique.",
    features: [
      "Formats A4 (210×297mm) et A3 (297×420mm)",
      "Finition Mat ou Brillant au choix",
      "Aluminium premium 1.2mm d'épaisseur",
      "Impression UV résistante aux rayures",
      "Option encre blanche pour couleurs vibrantes",
    ],
    price: "À partir de 150 MAD",
    link: "/customize?product=metal-plate",
  },
  {
    icon: Smartphone,
    title: "Coques de Téléphone",
    tagline: "Protection personnalisée",
    description:
      "Protégez votre téléphone avec style. Impression UV directe sur polycarbonate rigide avec un rendu photo haute fidélité.",
    features: [
      "iPhone 14, 15, 16 (toutes variantes)",
      "Samsung Galaxy S23 & S24",
      "Polycarbonate haute résistance",
      "Impression UV anti-rayures",
      "Bords renforcés pour protection maximale",
    ],
    price: "À partir de 120 MAD",
    link: "/customize?product=phone-case",
  },
];

const PROCESS_STEPS = [
  {
    icon: Paintbrush,
    title: "Configurateur 3D en ligne",
    description:
      "Notre éditeur en ligne vous permet d'uploader votre image, ajuster la position, appliquer des filtres et prévisualiser le résultat en 3D avant de commander.",
  },
  {
    icon: Layers,
    title: "Impression UV professionnelle",
    description:
      "Technologie d'impression UV à haute résolution directement sur le support. Les encres UV polymérisent instantanément pour un rendu net et durable.",
  },
  {
    icon: Box,
    title: "Emballage soigné",
    description:
      "Chaque produit est emballé individuellement avec des protections adaptées pour garantir une livraison sans dommage.",
  },
  {
    icon: Truck,
    title: "Livraison partout au Maroc",
    description:
      "Livraison à domicile ou en point relais partout au Maroc, avec paiement à la livraison (COD) disponible.",
  },
];

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5" />
        <div className="absolute top-20 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 mb-6 border border-accent/20">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">Impression UV Premium</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Nos{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">
              Services
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            De l&apos;image au produit fini, nous vous accompagnons à chaque étape
            avec une qualité professionnelle et un service personnalisé.
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-20">
          {SERVICES.map((service, i) => (
            <div
              key={service.title}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                i % 2 !== 0 ? "lg:direction-rtl" : ""
              }`}
            >
              {/* Info */}
              <div className={i % 2 !== 0 ? "lg:order-2" : ""}>
                <div className="inline-flex items-center gap-2 text-accent mb-4">
                  <service.icon className="h-5 w-5" />
                  <span className="text-xs font-bold tracking-widest uppercase">
                    {service.tagline}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  {service.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {service.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {service.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center gap-4">
                  <Link href={service.link}>
                    <Button variant="accent" size="lg">
                      Personnaliser
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <span className="text-sm font-semibold text-accent">
                    {service.price}
                  </span>
                </div>
              </div>

              {/* Visual card */}
              <div className={`${i % 2 !== 0 ? "lg:order-1" : ""}`}>
                <div className="relative bg-gradient-to-br from-secondary/50 to-secondary/30 rounded-3xl p-8 sm:p-12 border border-border/50">
                  <div className="absolute -top-3 -right-3 bg-accent text-accent-foreground text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    {service.price}
                  </div>
                  <div className="flex items-center justify-center h-48 sm:h-64">
                    <div className="relative">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <service.icon className="h-16 w-16 sm:h-20 sm:w-20 text-accent/60" />
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-accent" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Process */}
      <section className="py-20 sm:py-28 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest text-accent uppercase">
              Notre processus
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">
              De la conception à la livraison
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Un processus optimisé pour une qualité maximale
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((step, i) => (
              <div
                key={step.title}
                className="relative bg-card border border-border/50 rounded-2xl p-6 hover:border-accent/20 hover:shadow-md transition-all duration-300 group"
              >
                <div className="absolute -top-3 left-6 w-7 h-7 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {i + 1}
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 mt-2 group-hover:bg-accent/20 transition-colors">
                  <step.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest text-accent uppercase">
              Nos garanties
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">
              Commandez en toute confiance
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                emoji: "🎨",
                title: "Couleurs fidèles",
                text: "Nos encres UV restituent les couleurs avec une précision remarquable. Le résultat correspond à l'aperçu 3D.",
              },
              {
                emoji: "🛡️",
                title: "Matériaux premium",
                text: "Aluminium de qualité, polycarbonate résistant. Nos produits sont conçus pour durer des années.",
              },
              {
                emoji: "🚚",
                title: "Paiement à la livraison",
                text: "Payez uniquement à la réception. Livraison assurée dans tout le Maroc.",
              },
            ].map((g) => (
              <div key={g.title} className="text-center">
                <div className="text-4xl mb-4">{g.emoji}</div>
                <h3 className="font-semibold mb-2">{g.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {g.text}
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
            Prêt à lancer votre commande ?
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Créez votre design personnalisé en quelques minutes.
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

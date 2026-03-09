"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Paintbrush, Filter, X, Eye } from "lucide-react";

interface ExampleDesign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: "METAL_PLATE" | "PHONE_CASE";
  tags: string[];
}

const EXAMPLE_DESIGNS: ExampleDesign[] = [
  {
    id: "1",
    title: "Arc Riders",
    description: "Scène futuriste cyberpunk sur plaque métal A3 brillante",
    imageUrl: "https://cdn.displate.com/artwork/324x454/2026-01-10/a1e3af49-900e-40c6-a0fc-13bf21708c2e.jpg",
    category: "METAL_PLATE",
    tags: ["gaming", "sci-fi", "futuriste"],
  },
  {
    id: "2",
    title: "Gaming Cat",
    description: "Chat gamer néon sur plaque métal A4 mate",
    imageUrl: "https://cdn.displate.com/artwork/324x454/2025-11-25/52a2cb1b-882a-4c71-980b-5716e3229fb8.jpg",
    category: "METAL_PLATE",
    tags: ["gaming", "animal", "néon"],
  },
  {
    id: "3",
    title: "Balatro",
    description: "Design de jeu rétro coloré sur plaque métal A3",
    imageUrl: "https://cdn.displate.com/artwork/324x454/2025-12-30/9a40e48c-431f-4e19-9d6d-0d32bd68af0d.jpg",
    category: "METAL_PLATE",
    tags: ["gaming", "rétro", "coloré"],
  },
  {
    id: "4",
    title: "Tattooed Girl",
    description: "Illustration anime stylisée sur plaque A4 brillante",
    imageUrl: "https://cdn.displate.com/artwork/324x454/2025-10-17/19f6fc80-ecc7-4327-b039-a453b51f1369.jpg",
    category: "METAL_PLATE",
    tags: ["anime", "portrait", "stylisé"],
  },
  {
    id: "5",
    title: "Tokyo Drift",
    description: "Scène de drift urbaine style manga sur coque iPhone 15",
    imageUrl: "https://cdn.displate.com/artwork/324x454/2026-01-14/e6e001ad-54d1-4248-a77e-bc53fdfa62ac.jpg",
    category: "PHONE_CASE",
    tags: ["anime", "voiture", "urbain"],
  },
  {
    id: "6",
    title: "Coffee Shop",
    description: "Ambiance café cozy style anime sur coque Samsung S24",
    imageUrl: "https://cdn.displate.com/artwork/324x454/2025-01-25/d40f034e-a432-432f-b3bd-310bb696fe3d.jpg",
    category: "PHONE_CASE",
    tags: ["anime", "cozy", "lifestyle"],
  },
  {
    id: "7",
    title: "Invincible",
    description: "Illustration héroïque comics sur plaque métal A3",
    imageUrl: "https://cdn.displate.com/artwork/324x454/2025-09-26/689c3a1a-7350-4380-8638-679e27c38177.jpg",
    category: "METAL_PLATE",
    tags: ["comics", "super-héros", "action"],
  },
  {
    id: "8",
    title: "Tintin",
    description: "Hommage à la bande dessinée classique sur plaque A4 mate",
    imageUrl: "https://cdn.displate.com/artwork/324x454/2024-10-31/611278ce-067a-4ac8-bf7f-f226662b7f17.jpg",
    category: "METAL_PLATE",
    tags: ["comics", "classique", "aventure"],
  },
];

const CATEGORIES = [
  { key: "all", label: "Tout" },
  { key: "METAL_PLATE", label: "Plaques Métal" },
  { key: "PHONE_CASE", label: "Coques Téléphone" },
] as const;

const ALL_TAGS = Array.from(
  new Set(EXAMPLE_DESIGNS.flatMap((d) => d.tags))
).sort();

export default function ExamplesPage() {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = EXAMPLE_DESIGNS.filter((d) => {
    if (filterCategory !== "all" && d.category !== filterCategory) return false;
    if (filterTag && !d.tags.includes(filterTag)) return false;
    return true;
  });

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-accent/10 via-background to-secondary/30 py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Galerie d&apos;Exemples
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez ce qui est possible avec ArtForge. Inspirez-vous de ces
            créations et lancez-vous dans la personnalisation de votre produit.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Category tabs */}
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setFilterCategory(cat.key)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    filterCategory === cat.key
                      ? "bg-accent text-white"
                      : "bg-secondary hover:bg-secondary/80 text-foreground"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Tag filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="ml-auto flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Filter className="h-4 w-4" />
              Tags
            </button>

            {/* Active tag */}
            {filterTag && (
              <button
                onClick={() => setFilterTag(null)}
                className="flex items-center gap-1 text-xs bg-accent/10 text-accent px-2 py-1 rounded-full"
              >
                {filterTag}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Tag drawer */}
          {showFilters && (
            <div className="flex flex-wrap gap-2 mt-3 pb-1">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setFilterTag(filterTag === tag ? null : tag);
                  }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    filterTag === tag
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border hover:border-accent/50 text-muted-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              Aucun design trouvé avec ces filtres.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setFilterCategory("all");
                setFilterTag(null);
              }}
            >
              Réinitialiser
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((design) => (
              <div
                key={design.id}
                className="group rounded-xl border border-border overflow-hidden bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Real image */}
                <div className="aspect-[3/4] relative overflow-hidden bg-secondary">
                  <Image
                    src={design.imageUrl}
                    alt={design.title}
                    width={324}
                    height={454}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 flex-col">
                    <Link
                      href={`/customize?product=${
                        design.category === "METAL_PLATE"
                          ? "metal-plate"
                          : "phone-case"
                      }`}
                    >
                      <Button variant="accent" size="sm">
                        <Paintbrush className="h-4 w-4" />
                        Créer similaire
                      </Button>
                    </Link>
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 backdrop-blur-sm rounded-full p-1.5">
                      <Eye className="h-3.5 w-3.5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">
                      {design.title}
                    </h3>
                    <Badge
                      variant={
                        design.category === "METAL_PLATE"
                          ? "accent"
                          : "secondary"
                      }
                      className="text-[10px] shrink-0"
                    >
                      {design.category === "METAL_PLATE" ? "Métal" : "Coque"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {design.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {design.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16 text-center px-4">
        <h2 className="text-2xl font-bold mb-3">
          Prêt à créer votre propre design ?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Utilisez notre éditeur pour personnaliser votre plaque métal ou coque
          de téléphone.
        </p>
        <Link href="/customize">
          <Button variant="accent" size="xl">
            <Paintbrush className="h-5 w-5" />
            Commencer maintenant
          </Button>
        </Link>
      </section>
    </main>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Frame, Smartphone, ArrowRight } from "lucide-react";

const products = [
  {
    slug: "metal-plates",
    name: "Plaques Métal",
    description:
      "Plaques en aluminium premium avec impression UV haute définition. Formats A3 et A4, finitions mat ou brillant.",
    price: "À partir de 150 MAD",
    icon: Frame,
    gradient: "from-zinc-400 to-zinc-300 dark:from-zinc-600 dark:to-zinc-700",
    aspect: "aspect-[3/4] w-32",
  },
  {
    slug: "phone-cases",
    name: "Coques Téléphone",
    description:
      "Coques personnalisées avec impression UV résistante. Disponible pour iPhone 14/15/16 et Samsung S23/S24.",
    price: "À partir de 120 MAD",
    icon: Smartphone,
    gradient: "from-zinc-400 to-zinc-300 dark:from-zinc-600 dark:to-zinc-700",
    aspect: "aspect-[9/19] w-24 rounded-2xl",
  },
];

export default function ShopPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Boutique</h1>
        <p className="mt-2 text-muted-foreground">
          Choisissez un produit et créez votre design personnalisé
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {products.map((product) => (
          <Link key={product.slug} href={`/shop/${product.slug}`}>
            <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden h-full">
              <div className="aspect-[16/10] bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center relative">
                <div
                  className={`${product.aspect} bg-gradient-to-br ${product.gradient} shadow-xl flex items-center justify-center group-hover:scale-105 transition-transform rounded-lg`}
                >
                  <product.icon className="h-10 w-10 text-accent" />
                </div>
                <div className="absolute top-3 right-3 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-md">
                  {product.price}
                </div>
              </div>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                  {product.name}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {product.description}
                </p>
                <Button variant="accent" size="sm" className="gap-2">
                  Personnaliser <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

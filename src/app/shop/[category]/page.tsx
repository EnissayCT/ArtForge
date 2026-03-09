import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Frame, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { PLATE_SIZES, PHONE_MODELS } from "@/config/products";

interface PageProps {
  params: Promise<{ category: string }>;
}

const categoryData: Record<string, {
  name: string;
  description: string;
  items: Array<{
    label: string;
    sublabel: string;
    price: string;
    customize: string;
  }>;
}> = {
  "metal-plates": {
    name: "Plaques Métal",
    description: "Plaques en aluminium premium avec impression UV",
    items: [
      {
        label: PLATE_SIZES.A4.label,
        sublabel: `Min. ${PLATE_SIZES.A4.printArea.minPixelWidth}×${PLATE_SIZES.A4.printArea.minPixelHeight}px`,
        price: "150 MAD",
        customize: "/customize?product=metal-plate&size=A4",
      },
      {
        label: PLATE_SIZES.A3.label,
        sublabel: `Min. ${PLATE_SIZES.A3.printArea.minPixelWidth}×${PLATE_SIZES.A3.printArea.minPixelHeight}px`,
        price: "220 MAD",
        customize: "/customize?product=metal-plate&size=A3",
      },
    ],
  },
  "phone-cases": {
    name: "Coques Téléphone",
    description:
      "Coques personnalisées avec impression UV résistante aux rayures",
    items: Object.values(PHONE_MODELS).map((model) => ({
      label: model.label,
      sublabel: `Zone d'impression: ${model.printArea.widthMm}×${model.printArea.heightMm}mm`,
      price: "120 MAD",
      customize: `/customize?product=phone-case&phone=${model.id}`,
    })),
  },
};

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const data = categoryData[category];

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-2">
        <Link
          href="/shop"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Retour à la boutique
        </Link>
      </div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{data.name}</h1>
        <p className="mt-2 text-muted-foreground">{data.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.items.map((item) => (
          <Card
            key={item.label}
            className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="aspect-square bg-gradient-to-br from-zinc-200 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center rounded-t-xl">
              <Frame className="h-16 w-16 text-accent/60 group-hover:text-accent transition-colors" />
            </div>
            <CardContent className="p-5">
              <h3 className="font-semibold text-lg">{item.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {item.sublabel}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold text-accent">
                  {item.price}
                </span>
                <Link href={item.customize}>
                  <Button variant="accent" size="sm" className="gap-1">
                    Créer <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

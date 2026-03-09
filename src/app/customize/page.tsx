import { Suspense } from "react";
import type { Metadata } from "next";
import { CustomizerClient } from "@/components/customizer/CustomizerClient";

export const metadata: Metadata = {
  title: "Personnaliser votre produit | ArtForge Studio",
  description:
    "Créez votre design unique sur plaque métal ou coque de téléphone avec notre éditeur interactif.",
};

export default function CustomizePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        }
      >
        <CustomizerClient />
      </Suspense>
    </main>
  );
}

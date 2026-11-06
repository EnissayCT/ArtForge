import type { Metadata } from "next";
import { Studio } from "@/components/studio/Studio";

export const metadata: Metadata = {
  title: "Créer la vôtre — votre image sur métal",
  description:
    "Imprimez votre photo, dessin ou logo sur une plaque en métal ou une coque de téléphone. Cadrage, aperçu 3D et mise en situation dans votre intérieur.",
};

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ support?: string }> }) {
  const { support } = await searchParams;
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-10 sm:px-8">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 border-b border-ink/12 pb-8">
        <div>
          <p className="label text-stone">Atelier sur mesure</p>
          <h1 className="display mt-3 text-[60px] sm:text-[96px]">
            Créer <span className="text-ember">la vôtre</span>
          </h1>
        </div>
        <p className="max-w-md text-[15px] leading-relaxed text-stone">
          Importez une image, cadrez-la au millimètre, puis voyez-la en 3D ou accrochée chez vous avant de commander.
          Même prix que le catalogue.
        </p>
      </div>
      <Studio initialKind={support === "coque" ? "case" : "plate"} />
    </div>
  );
}

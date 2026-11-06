import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { PricingEditor } from "@/components/admin/PricingEditor";

export const metadata = { title: "Tarifs" };

export default async function PricingPage() {
  await requireAdmin();
  const s = await getSettings();
  return (
    <div className="max-w-5xl">
      <p className="label text-stone">Tarifs</p>
      <h1 className="display mt-2 text-[44px] sm:text-[56px]">Prix, formats & livraison</h1>
      <p className="mt-2 max-w-2xl text-[14px] text-stone">
        Tout changement est en ligne dès l&apos;enregistrement. Les commandes déjà passées gardent leur prix. Désactiver une option la
        retire de la boutique sans la supprimer.
      </p>
      <PricingEditor
        initial={{
          sizes: s.sizes.map((x) => ({ ...x, note: x.note ?? "" })),
          defaultSize: s.defaultSize,
          finishes: s.finishes,
          frames: s.frames,
          caseTypes: s.caseTypes,
          bundle: s.bundle,
          shipping: s.shipping,
          promos: s.promos,
        }}
      />
    </div>
  );
}

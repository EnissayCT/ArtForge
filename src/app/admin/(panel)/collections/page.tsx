import { requireAdmin } from "@/lib/auth";
import { getCatalogData } from "@/lib/data";
import { CollectionsEditor } from "@/components/admin/CollectionsEditor";

export const metadata = { title: "Collections" };

export default async function CollectionsAdmin() {
  await requireAdmin();
  const data = await getCatalogData();
  const counts: Record<string, number> = {};
  for (const a of data.artworks) counts[a.collection] = (counts[a.collection] ?? 0) + 1;
  return (
    <div className="max-w-3xl">
      <p className="label text-stone">Collections</p>
      <h1 className="display mt-2 text-[44px] sm:text-[56px]">Collections</h1>
      <p className="mt-2 text-[14px] text-stone">
        L&apos;ordre ici est l&apos;ordre du site (menu, accueil, boutique). Une collection sans œuvre visible n&apos;apparaît pas
        dans la boutique.
      </p>
      <CollectionsEditor initial={data.collections} counts={counts} />
    </div>
  );
}

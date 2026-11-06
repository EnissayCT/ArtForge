import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { PHONES } from "@/lib/phones";
import { SettingsEditor } from "@/components/admin/SettingsEditor";

export const metadata = { title: "Réglages" };

export default async function SettingsPage() {
  await requireAdmin();
  const s = await getSettings();
  return (
    <div className="max-w-4xl">
      <p className="label text-stone">Réglages</p>
      <h1 className="display mt-2 text-[44px] sm:text-[56px]">Réglages du site</h1>
      <SettingsEditor
        phones={PHONES}
        initial={{
          brand: s.brand,
          announcements: s.announcements,
          pixelId: s.pixelId,
          phonesDisabled: s.phonesDisabled,
          templates: s.templates,
        }}
      />
    </div>
  );
}

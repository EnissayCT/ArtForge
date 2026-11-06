import { Download } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { readAll } from "@/lib/store";
import { LeadDelete } from "@/components/admin/LeadDelete";

export const metadata = { title: "Abonnés" };

const when = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Casablanca" });

export default async function LeadsPage() {
  await requireAdmin();
  const leads = await readAll<{ contact: string; type: string; source: string; at: string }>("leads.json");
  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-stone">Abonnés</p>
          <h1 className="display mt-2 text-[44px] sm:text-[56px]">Le club · {leads.length}</h1>
          <p className="mt-1 text-[13px] text-stone">Inscriptions à la lettre (pied de page du site), avec le code de bienvenue.</p>
        </div>
        <a href="/admin/export/abonnes" download className="label flex items-center gap-2 border border-ink/20 px-3 py-2 hover:border-ink">
          <Download className="size-3.5" /> Export CSV
        </a>
      </div>
      {leads.length === 0 ? (
        <p className="mt-10 text-stone">Aucune inscription pour l&apos;instant.</p>
      ) : (
        <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
          {leads.map((l) => (
            <li key={`${l.at}-${l.contact}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <span className="min-w-0 flex-1 truncate text-[14.5px]">{l.contact}</span>
              <span className="text-[12px] text-stone">
                {l.type === "email" ? "E-mail" : "WhatsApp"} · {when.format(new Date(l.at))}
              </span>
              <LeadDelete at={l.at} contact={l.contact} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { ShieldCheck, ShieldAlert } from "lucide-react";
import { requireAdmin, securityOverview } from "@/lib/auth";
import { PasswordForm, SignOutOthers } from "@/components/admin/SecurityForms";

export const metadata = { title: "Sécurité" };

const when = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Casablanca" });

function device(ua: string) {
  const os = /iPhone|iPad/.test(ua) ? "iPhone / iPad" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "Mac" : /Linux/.test(ua) ? "Linux" : "Appareil";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
  return `${os}${browser ? ` · ${browser}` : ""}`;
}

export default async function SecurityPage() {
  const session = await requireAdmin();
  const info = await securityOverview();
  const currentId = session.id.slice(0, 8);

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <p className="label text-stone">Sécurité</p>
        <h1 className="display mt-2 text-[44px] sm:text-[56px]">Accès administrateur</h1>
        <ul className="mt-4 space-y-2 text-[14px]">
          <li className="flex items-center gap-2">
            {info.twoFactor ? <ShieldCheck className="size-4 text-ok" /> : <ShieldAlert className="size-4 text-ember-deep" />}
            Double authentification {info.twoFactor ? "active (application d'authentification)" : "non configurée"}
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-ok" /> Sessions limitées à 2 h d&apos;inactivité et 12 h au total, cookie sécurisé
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-ok" /> Blocage automatique après 5 essais ratés (15 min)
          </li>
        </ul>
        {info.passwordChangedAt && (
          <p className="mt-3 text-[13px] text-stone">Mot de passe changé le {when.format(new Date(info.passwordChangedAt))}.</p>
        )}
      </div>

      <section>
        <h2 className="display-semi text-[26px]">Appareils connectés</h2>
        <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10">
          {info.sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-[14px]">
              <span>
                {device(s.ua)} <span className="text-stone">· {s.ip}</span>
                {s.id === currentId && <span className="label ml-2 bg-ok/15 px-1.5 py-0.5 text-[10px] text-ok">Cet appareil</span>}
              </span>
              <span className="text-[12px] text-stone">actif {when.format(new Date(s.lastSeen))}</span>
            </li>
          ))}
        </ul>
        {info.sessions.length > 1 && <SignOutOthers />}
      </section>

      <section>
        <h2 className="display-semi text-[26px]">Changer le mot de passe</h2>
        <p className="mt-1 text-[13px] text-stone">12 caractères minimum. Les autres appareils seront déconnectés.</p>
        <PasswordForm />
      </section>

      <section>
        <h2 className="display-semi text-[26px]">Dernières connexions</h2>
        <ul className="mt-3 divide-y divide-ink/10 border-y border-ink/10 text-[13.5px]">
          {info.log.length === 0 && <li className="py-3 text-stone">—</li>}
          {info.log.map((l, i) => (
            <li key={i} className="flex flex-wrap justify-between gap-2 py-2">
              <span className={l.ok ? "" : "text-ember-deep"}>
                {l.ok ? "Connexion réussie" : `Échec (${l.reason ?? "?"})`} <span className="text-stone">· {l.ip}</span>
              </span>
              <span className="text-[12px] text-stone">{when.format(new Date(l.at))}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

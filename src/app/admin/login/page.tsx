import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Mark } from "@/components/brand/Logo";
import { adminConfigured, getAdminSession } from "@/lib/auth";
import { getShop } from "@/lib/data";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");
  const [{ brand }, configured] = await Promise.all([getShop(), adminConfigured()]);
  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4 py-16 text-paper">
      <div className="w-full max-w-[380px]">
        <div className="flex items-center gap-3">
          <Mark className="h-9 w-auto text-paper" />
          <div>
            <p className="display-semi text-[26px] leading-none">{brand.name}</p>
            <p className="label mt-1 text-paper/45">Administration</p>
          </div>
        </div>
        {configured ? (
          <LoginForm />
        ) : (
          <p className="mt-10 border border-paper/15 p-4 text-[14px] leading-relaxed text-paper/70">
            L&apos;accès administrateur n&apos;est pas encore configuré sur ce serveur (mot de passe et clé 2FA manquants).
          </p>
        )}
        <p className="mt-10 text-[12px] leading-relaxed text-paper/35">
          Accès réservé. Chaque tentative est enregistrée ; trop d&apos;échecs bloquent la connexion pendant 15 minutes.
        </p>
      </div>
    </div>
  );
}

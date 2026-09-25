import { redirect } from "next/navigation";
import { chargerMoi } from "@/lib/equipe/moi";
import { RUBRIQUES } from "@/lib/navigation";

export const dynamic = "force-dynamic";

/**
 * L'accueil : le poste de supervision (« instruction centrale » du cahier) —
 * ou, pour un rôle qui ne le lit pas, la première rubrique qu'il peut ouvrir.
 */
export default async function Accueil() {
  const moi = await chargerMoi().catch(() => null);
  if (!moi || !moi.membre) redirect("/acces");
  const premiere = RUBRIQUES.find((r) => r.permissions.some((p) => moi.permissions.includes(p)));
  redirect(premiere?.chemin ?? "/acces");
}

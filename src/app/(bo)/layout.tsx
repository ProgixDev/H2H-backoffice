import { redirect } from "next/navigation";
import { BarreHaute } from "@/components/bo/BarreHaute";
import { BarreLaterale } from "@/components/bo/BarreLaterale";
import { FournisseurDonnees } from "@/components/bo/FournisseurDonnees";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FournisseurVerification } from "@/components/bo/VerificationIdentite";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { chargerMoi } from "@/lib/equipe/moi";
import type { Moi } from "@/lib/equipe/types";

// 🔴 RIEN N'EST PRÉ-RENDU NI MIS EN CACHE ICI : chaque page dépend de
// l'équipier qui la demande, et une révocation vaut dès la requête suivante.
export const dynamic = "force-dynamic";

/**
 * Le cadre de toutes les rubriques — et la porte de l'équipe.
 *
 * ⚠️ LA BASE DÉCIDE QUI ENTRE. `bo_moi()` vérifie l'appartenance à l'équipe,
 * le second facteur, la fraîcheur de la connexion et l'origine, dans le jeton.
 * Quiconque n'y est pas admis part vers `/acces`, qui dit pourquoi.
 */
export default async function LayoutBackOffice({ children }: { children: React.ReactNode }) {
  let moi: Moi;
  try {
    moi = await chargerMoi();
  } catch {
    // ⚠️ UNE PANNE N'EST PAS UN REFUS : on ne renvoie pas vers « accès refusé »
    // quand c'est la lecture qui a échoué.
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <LectureEchouee titre="Le back-office ne répond pas" />
      </main>
    );
  }
  if (!moi.membre) redirect("/acces");

  return (
    <FournisseurVerification>
      <FournisseurDonnees>
        <SidebarProvider>
          <BarreLaterale permissions={moi.permissions} />
          <SidebarInset>
            <BarreHaute moi={moi} />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </FournisseurDonnees>
    </FournisseurVerification>
  );
}

import type { Metadata } from "next";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { ListeDemandesDeRole } from "@/components/utilisateurs/ListeDemandesDeRole";
import { peut } from "@/lib/equipe/types";
import { listerDemandesDeRole } from "@/lib/utilisateurs/lectures";
import type { DemandeRole } from "@/lib/utilisateurs/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/utilisateurs");
export const metadata: Metadata = { title: rubrique.titre };

/**
 * Utilisateurs (§8) — la procédure reprise de l'écran mobile du support (P0b) :
 * trancher les demandes de rôle.
 *
 * ⚠️ LA FICHE DE CHAQUE COMPTE, LES VÉRIFICATIONS, LES AVERTISSEMENTS, LES
 * RESTRICTIONS ET LES RECOURS ARRIVENT AVEC LA PHASE 2b. Cette page dit ce
 * qu'elle fait, pas davantage.
 */
export default async function PageUtilisateurs() {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let demandes: DemandeRole[] | null;
  try {
    demandes = await listerDemandesDeRole();
  } catch {
    demandes = null;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <p className="text-corps text-muted-foreground">
        Tranchez les demandes pour devenir vendeur, cotransporteur particulier ou point relais. Chaque
        décision demande un motif et une double authentification récente ; la fiche complète des comptes,
        les restrictions et les recours arriveront avec la phase 2b.
      </p>
      {demandes === null ? (
        <LectureEchouee />
      ) : (
        <ListeDemandesDeRole demandes={demandes} peutTrancher={peut(moi, "roles.trancher")} />
      )}
    </div>
  );
}

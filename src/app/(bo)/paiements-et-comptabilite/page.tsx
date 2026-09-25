import type { Metadata } from "next";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { ReglementTransporteurs } from "@/components/paiements/ReglementTransporteurs";
import { peut } from "@/lib/equipe/types";
import { listerTransporteursARegler } from "@/lib/paiements/lectures";
import type { DuTransporteur } from "@/lib/paiements/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/paiements-et-comptabilite");
export const metadata: Metadata = { title: rubrique.titre };

/**
 * Paiements et comptabilité (§16) — la procédure reprise de l'écran mobile du
 * support (P0b) : enregistrer le règlement des factures des transporteurs tiers.
 *
 * ⚠️ LES FLUX, LES REMBOURSEMENTS, LES COMPENSATIONS, LES VERSEMENTS ET LES
 * JUSTIFICATIFS ARRIVENT AVEC LA PHASE 2a. Cette page dit ce qu'elle fait, pas
 * davantage.
 */
export default async function PagePaiements() {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let dus: DuTransporteur[] | null;
  try {
    dus = await listerTransporteursARegler();
  } catch {
    dus = null;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <p className="text-corps text-muted-foreground">
        Enregistrez le règlement des factures des transporteurs tiers : cochez les commandes couvertes et
        nommez la facture. Les flux, remboursements, compensations, versements et justificatifs arriveront
        avec la phase 2a.
      </p>
      <h2 className="text-h3 font-semibold">Transporteurs tiers à régler</h2>
      {dus === null ? (
        <LectureEchouee />
      ) : (
        <ReglementTransporteurs dus={dus} peutRegler={peut(moi, "versements.gerer")} />
      )}
    </div>
  );
}

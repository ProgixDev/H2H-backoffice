import type { Metadata } from "next";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { ListeLitiges } from "@/components/litiges/ListeLitiges";
import { peut } from "@/lib/equipe/types";
import { listerLitiges } from "@/lib/litiges/lectures";
import type { Litige } from "@/lib/litiges/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/litiges-et-signalements");
export const metadata: Metadata = { title: rubrique.titre };

/**
 * Litiges et signalements (§15) — la première procédure reprise de l'écran
 * mobile du support (P0b) : arbitrer une réclamation, émettre son remboursement.
 *
 * ⚠️ LES SIGNALEMENTS, LE DÉTAIL PAR MOTIF, LES ENQUÊTES TRANSPORTEUR ET LES
 * DÉCISIONS À DEUX CLÉS ARRIVENT AVEC LA PHASE 2a. Cette page dit ce qu'elle
 * fait, pas davantage.
 */
export default async function PageLitiges() {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let litiges: Litige[] | null;
  try {
    litiges = await listerLitiges();
  } catch {
    litiges = null;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <p className="text-corps text-muted-foreground">
        Arbitrez les réclamations des acheteurs et émettez les remboursements décidés. Chaque décision
        demande un motif et une double authentification récente ; les signalements arriveront avec la
        phase 2a.
      </p>
      {litiges === null ? (
        <LectureEchouee />
      ) : (
        <ListeLitiges
          litiges={litiges}
          peutDecider={peut(moi, "litiges.decider")}
          peutRembourser={peut(moi, "remboursements.preparer")}
        />
      )}
    </div>
  );
}

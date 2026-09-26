import type { Metadata } from "next";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { BarreMotifs } from "@/components/litiges/BarreMotifs";
import { ListeLitiges } from "@/components/litiges/ListeLitiges";
import { ListeSignalements } from "@/components/litiges/ListeSignalements";
import { peut } from "@/lib/equipe/types";
import { compterMotifs, listerLitiges, listerSignalements } from "@/lib/litiges/lectures";
import { A_QUALIFIER, type CompteMotif, type Litige, type Signalement } from "@/lib/litiges/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/litiges-et-signalements");
export const metadata: Metadata = { title: rubrique.titre };

/**
 * Litiges et signalements (§15).
 *
 * - Les onze motifs du cahier des charges séparent les dossiers : réclamations,
 *   incidents de co-livraison, signalements (`?motif=`).
 * - Une réclamation s'arbitre ; sa décision ne se revoit qu'après un recours
 *   déclaré recevable, examiné par une autre personne que son auteur. Chaque
 *   décision reste au dossier.
 * - Une enquête s'ouvre chez le transporteur tiers ; sa conclusion précise le motif.
 *
 * ⚠️ LE TRAITEMENT DES INCIDENTS (phase 4) ET DES SIGNALEMENTS (phase 2b) A SA
 * PLACE AILLEURS : cette page les montre et les range, sans les trancher.
 */
export default async function PageLitiges({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const p = await searchParams;
  const filtre = typeof p.motif === "string" && /^[a-z_]+$/.test(p.motif) ? p.motif : null;

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let donnees: { litiges: Litige[]; motifs: CompteMotif[]; signalements: Signalement[] } | null;
  try {
    const [litiges, motifs, signalements] = await Promise.all([
      listerLitiges(),
      compterMotifs(),
      listerSignalements(filtre),
    ]);
    donnees = { litiges, motifs, signalements };
  } catch {
    donnees = null;
  }

  const reclamations =
    donnees && filtre
      ? donnees.litiges.filter((l) => (filtre === A_QUALIFIER ? l.motif_litige === null : l.motif_litige === filtre))
      : donnees?.litiges ?? [];

  return (
    <div className="mx-auto grid max-w-6xl gap-6">
      <p className="text-corps text-muted-foreground">
        Chaque dossier se range sous l’un des onze motifs du cahier des charges. Une décision rendue ne se revoit
        qu’après un recours déclaré recevable, examiné par une autre personne que son auteur ; chaque décision reste
        au dossier.
      </p>
      {donnees === null ? (
        <LectureEchouee />
      ) : (
        <>
          <BarreMotifs motifs={donnees.motifs} filtre={filtre} />
          <section className="grid gap-3">
            <h2 className="text-h3 font-semibold">Réclamations</h2>
            <ListeLitiges
              litiges={reclamations}
              motifs={donnees.motifs}
              peutDecider={peut(moi, "litiges.decider")}
              peutInstruire={peut(moi, "litiges.instruire")}
              peutRembourser={peut(moi, "remboursements.preparer")}
              filtree={filtre !== null}
            />
          </section>
          <section className="grid gap-3">
            <h2 className="text-h3 font-semibold">Incidents de co-livraison et signalements</h2>
            <ListeSignalements
              signalements={donnees.signalements}
              motifs={donnees.motifs}
              peutInstruire={peut(moi, "litiges.instruire")}
            />
          </section>
        </>
      )}
    </div>
  );
}

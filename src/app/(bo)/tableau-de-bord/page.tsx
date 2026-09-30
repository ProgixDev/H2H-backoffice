import type { Metadata } from "next";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FiltresPeriode } from "@/components/tableau/FiltresPeriode";
import { TableauIndicateurs } from "@/components/tableau/TableauIndicateurs";
import { aujourdhuiParis, dateHeure } from "@/lib/dates";
import { RefusBO } from "@/lib/db/rpc";
import { rubriqueObligatoire } from "@/lib/navigation";
import { lireTableau } from "@/lib/tableau/lectures";
import { lireFiltres } from "@/lib/tableau/periodes";
import type { Tableau } from "@/lib/tableau/types";

const rubrique = rubriqueObligatoire("/tableau-de-bord");
export const metadata: Metadata = { title: rubrique.titre };

type Params = Record<string, string | string[] | undefined>;

/**
 * Tableau de bord (§3) — première version : les résultats de HandtoHand sur
 * une période choisie.
 *
 * - Les onze points du cahier des charges, dans son ordre. Ce qui n'existe pas
 *   encore (suspensions de compte, compensations, activité par territoire et
 *   par catégorie) se dit « à venir » avec sa raison — jamais un faux zéro.
 * - Chaque chiffre est la mesure de ses lignes, faite en base, et s'ouvre sur
 *   elles : « chaque indicateur doit permettre d'ouvrir les dossiers qui
 *   composent le chiffre affiché ».
 * - Le monde du test n'entre pas dans les résultats, sauf à le demander.
 *
 * ⚠️ RESTE POUR LE TABLEAU COMPLET (P7) : les filtres par service, département,
 * ville, catégorie et type de publication.
 */
export default async function PageTableauDeBord({ searchParams }: { searchParams: Promise<Params> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const f = lireFiltres(await searchParams, !moi.est_test);
  const aujourdhui = aujourdhuiParis();

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let tableau: Tableau | null = null;
  let refus: string | null = null;
  try {
    tableau = await lireTableau(f);
  } catch (e) {
    // Une période refusée se dit avec les mots de la base ; une panne reste une panne.
    refus = e instanceof RefusBO && e.indice === "BO_PERIODE" ? e.message : null;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <p className="max-w-4xl text-corps text-muted-foreground">
        Les résultats de HandtoHand sur la période choisie. Chaque chiffre dit ce qu’il compte, se compare à la période
        précédente, et s’ouvre sur ce qui le compose.
      </p>
      <FiltresPeriode f={f} periode={tableau?.periode ?? null} aujourdhui={aujourdhui} testVisible={!moi.est_test} />
      {tableau ? (
        <>
          <TableauIndicateurs tableau={tableau} f={f} />
          <p className="text-legende text-muted-foreground">
            Lu le {dateHeure(tableau.lu_le)}. Les filtres par service, département, ville, catégorie et type de
            publication arrivent avec le tableau de bord complet.
          </p>
        </>
      ) : refus ? (
        <LectureEchouee titre="Cette période ne se lit pas" message={`${refus.charAt(0).toUpperCase()}${refus.slice(1)}.`} />
      ) : (
        <LectureEchouee />
      )}
    </div>
  );
}

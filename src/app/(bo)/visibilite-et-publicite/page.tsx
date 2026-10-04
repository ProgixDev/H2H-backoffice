import type { Metadata } from "next";
import { Megaphone } from "lucide-react";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FiltresListeOptions } from "@/components/visibilite/FiltresOptions";
import { ListeOptions } from "@/components/visibilite/ListeOptions";
import { compterOptions, listerOptions } from "@/lib/visibilite/lectures";
import {
  FILTRES_OPTION,
  type CompteursOptions,
  type FiltreOption,
  type FiltresOptions,
  type OptionLigne,
} from "@/lib/visibilite/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/visibilite-et-publicite");
export const metadata: Metadata = { title: rubrique.titre };

type Params = Record<string, string | string[] | undefined>;
const texte = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");

/** Les filtres lus dans l'adresse ; une valeur inconnue est ignorée, pas transmise. */
function lireFiltres(p: Params, testPermis: boolean): FiltresOptions {
  const filtre = texte(p.filtre);
  const q = texte(p.q).slice(0, 80);
  return {
    filtre: (FILTRES_OPTION as string[]).includes(filtre) ? (filtre as FiltreOption) : null,
    q: q || null,
    test: testPermis && texte(p.test) === "1",
  };
}

/**
 * Visibilité et publicité (§17).
 *
 * - Chaque option de visibilité achetée — remontées et badge Urgent, sur une
 *   annonce ou une demande — : son état, son exécution, ce qu'elle a coûté et ce
 *   qui en a été rendu, sa rétractation, ses anomalies, que la base nomme
 *   (R17.1). Les compteurs comptent ce que la liste montre.
 * - Sa fiche : le tarif appliqué, chaque remontée, chaque pause, la preuve de
 *   l'accord, le calcul du remboursement et ses avoirs — et l'arrêter, ou la
 *   rembourser, quand la base le permet.
 *
 * ⚠️ LA PUBLICITÉ (R17.2) N'EXISTE PAS ENCORE DANS LE PRODUIT : elle attend sa
 * décision (D11). L'écran le dit, sans tableau inventé.
 */
export default async function PageVisibilite({ searchParams }: { searchParams: Promise<Params> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const f = lireFiltres(await searchParams, !moi.est_test);

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let options: OptionLigne[] | null;
  let compteurs: CompteursOptions | null;
  try {
    options = await listerOptions(f);
  } catch {
    options = null;
  }
  try {
    compteurs = await compterOptions(f);
  } catch {
    compteurs = null;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <p className="max-w-4xl text-corps text-muted-foreground">
        Chaque option de visibilité achetée : ce qu’elle met en avant et pour qui, son exécution — les remontées faites,
        les pauses pendant que l’annonce n’est pas visible —, ce qu’elle a coûté et ce qui en a été rendu. Les anomalies
        passent d’abord.
      </p>
      <FiltresListeOptions f={f} compteurs={compteurs} testVisible={!moi.est_test} />
      {options === null ? (
        <LectureEchouee />
      ) : (
        <>
          <ListeOptions options={options} filtree={Boolean(f.filtre || f.q)} />
          {options.length >= 300 && (
            <p className="text-legende text-muted-foreground">
              Les 300 premières sont affichées. Précisez la recherche ou le filtre pour en lire d’autres.
            </p>
          )}
        </>
      )}
      <section className="flex items-start gap-3 rounded-xl border border-dashed p-4">
        <Megaphone className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <div className="grid gap-1">
          <h3 className="text-h3 font-semibold">Publicité</h3>
          <p className="text-corps text-muted-foreground">
            Les emplacements publicitaires, leurs impressions, leurs revenus et leur attribution n’existent pas encore
            dans l’application : ils attendent leur décision (D11). Rien n’est affiché ici tant qu’ils n’existent pas.
          </p>
        </div>
      </section>
    </div>
  );
}

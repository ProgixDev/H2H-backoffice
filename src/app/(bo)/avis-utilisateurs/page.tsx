import type { Metadata } from "next";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FiltresListeAvis } from "@/components/avis/FiltresAvis";
import { ListeAvis } from "@/components/avis/ListeAvis";
import { compterAvis, listerAvis } from "@/lib/avis/lectures";
import { FILTRES_AVIS, type AvisLigne, type CompteursAvis, type FiltreAvis, type FiltresAvis } from "@/lib/avis/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/avis-utilisateurs");
export const metadata: Metadata = { title: rubrique.titre };

type Params = Record<string, string | string[] | undefined>;
const texte = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");

/** Les filtres lus dans l'adresse ; une valeur inconnue est ignorée, pas transmise. */
function lireFiltres(p: Params, testPermis: boolean): FiltresAvis {
  const filtre = texte(p.filtre);
  const q = texte(p.q).slice(0, 80);
  return {
    filtre: (FILTRES_AVIS as string[]).includes(filtre) ? (filtre as FiltreAvis) : null,
    q: q || null,
    test: testPermis && texte(p.test) === "1",
  };
}

/**
 * Avis utilisateurs (§19).
 *
 * - Chaque avis : qui a noté qui, en tant que quoi, sur quelle transaction, la
 *   note et le commentaire, publié ou retiré, ses signalements (R19.1). Les
 *   compteurs comptent ce que la liste montre.
 * - Sa fiche : l'effet sur la moyenne affichée, les décisions, et « Retirer » ou
 *   « Rétablir » quand la base le permet (R19.2).
 *
 * ⚠️ L'EXAMEN DES SIGNALEMENTS D'UN AVIS ET LA CONTESTATION D'UN RETRAIT arrivent
 * avec la suite de cette rubrique. Les avis de H2H Logistic attendent leurs règles
 * (R19.3).
 */
export default async function PageAvisUtilisateurs({ searchParams }: { searchParams: Promise<Params> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const f = lireFiltres(await searchParams, !moi.est_test);

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let avis: AvisLigne[] | null;
  let compteurs: CompteursAvis | null;
  try {
    avis = await listerAvis(f);
  } catch {
    avis = null;
  }
  try {
    compteurs = await compterAvis(f);
  } catch {
    compteurs = null;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <p className="max-w-4xl text-corps text-muted-foreground">
        Chaque avis déposé après une transaction : qui a noté qui, la note et le commentaire, ses signalements. Un avis
        retiré ne se lit plus dans l’application et ne compte plus dans la moyenne du profil noté ; il n’est pas effacé.
      </p>
      <FiltresListeAvis f={f} compteurs={compteurs} testVisible={!moi.est_test} />
      {avis === null ? (
        <LectureEchouee />
      ) : (
        <>
          <ListeAvis avis={avis} filtree={Boolean(f.filtre || f.q)} />
          {avis.length >= 300 && (
            <p className="text-legende text-muted-foreground">
              Les 300 premiers sont affichés. Précisez la recherche ou le filtre pour en lire d’autres.
            </p>
          )}
        </>
      )}
    </div>
  );
}

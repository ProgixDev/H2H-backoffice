import type { Metadata } from "next";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FiltresOffresFlash } from "@/components/flash/FiltresFlash";
import { ListeFlash } from "@/components/flash/ListeFlash";
import { peut } from "@/lib/equipe/types";
import { compterFlash, listerFlash } from "@/lib/flash/lectures";
import {
  FILTRES_FLASH,
  type CompteursFlash,
  type FiltreFlash,
  type FiltresFlash,
  type OffreFlash,
} from "@/lib/flash/types";
import { rubriqueObligatoire } from "@/lib/navigation";

const rubrique = rubriqueObligatoire("/offres-flash");
export const metadata: Metadata = { title: rubrique.titre };

type Params = Record<string, string | string[] | undefined>;
const texte = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");

/** Les filtres lus dans l'adresse ; une valeur inconnue est ignorée, pas transmise. */
function lireFiltres(p: Params, testPermis: boolean): FiltresFlash {
  const filtre = texte(p.filtre);
  const q = texte(p.q).slice(0, 80);
  return {
    filtre: (FILTRES_FLASH as string[]).includes(filtre) ? (filtre as FiltreFlash) : null,
    q: q || null,
    test: testPermis && texte(p.test) === "1",
  };
}

/**
 * Offres Flash (§13).
 *
 * - Chaque offre sous son étape : les offres publiques de 24 heures, le choix
 *   du vendeur, les fenêtres d'achat (Exclu ou Accès Flash), la confirmation du
 *   vendeur quand le paiement est autorisé, puis « Paiement confirmé » ou
 *   « Non vendu » (R13.1). Les compteurs comptent ce que la liste montre.
 * - Voir les offres, les accès d'achat et le paiement : la fiche complète.
 *   Retirer un contenu : la modération de l'annonce. Examiner une anomalie :
 *   un ticket sur l'offre (R13.2).
 *
 * 🔴 PERSONNE N'Y CHOISIT D'ACHETEUR (R13.3) : ni le système, ni l'équipe.
 */
export default async function PageOffresFlash({ searchParams }: { searchParams: Promise<Params> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const f = lireFiltres(await searchParams, !moi.est_test);

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let offres: OffreFlash[] | null;
  let compteurs: CompteursFlash | null;
  try {
    offres = await listerFlash(f);
  } catch {
    offres = null;
  }
  try {
    compteurs = await compterFlash(f);
  } catch {
    compteurs = null;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <p className="max-w-4xl text-corps text-muted-foreground">
        Chaque offre Flash sous son étape : les offres publiques de 24 heures, le choix du vendeur, les fenêtres
        d’achat (Exclu ou Accès Flash), le paiement, puis « Paiement confirmé » ou « Non vendu ». Le système ne choisit
        jamais — ni le meilleur offrant, ni un acheteur suivant : le vendeur choisit, et l’équipe n’y choisit personne.
      </p>
      <FiltresOffresFlash f={f} compteurs={compteurs} testVisible={!moi.est_test} />
      {offres === null ? (
        <LectureEchouee />
      ) : (
        <>
          <ListeFlash
            offres={offres}
            filtree={Boolean(f.filtre || f.q)}
            lienCompte={peut(moi, "utilisateurs.lire")}
            lienAnnonce={peut(moi, "annonces.lire")}
            peutModerer={peut(moi, "annonces.moderer")}
            peutTraiter={peut(moi, "dossiers.traiter")}
          />
          {offres.length >= 300 && (
            <p className="text-legende text-muted-foreground">
              Les 300 premières sont affichées. Précisez la recherche ou le filtre pour en lire d’autres.
            </p>
          )}
        </>
      )}
    </div>
  );
}

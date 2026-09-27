import type { Metadata } from "next";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { FiltresTransactions } from "@/components/transactions/FiltresTransactions";
import { ListeTransactions } from "@/components/transactions/ListeTransactions";
import { peut } from "@/lib/equipe/types";
import { rubriqueObligatoire } from "@/lib/navigation";
import { LIBELLE_MODE } from "@/lib/operations/libelles";
import { listerTransactions } from "@/lib/transactions/lectures";
import {
  ETATS_TRANSACTION,
  type EtatTransaction,
  type FiltresTransactions as Filtres,
  type Transaction,
} from "@/lib/transactions/types";

const rubrique = rubriqueObligatoire("/transactions");
export const metadata: Metadata = { title: rubrique.titre };

type Params = Record<string, string | string[] | undefined>;
const texte = (v: string | string[] | undefined) => (typeof v === "string" ? v.trim() : "");
const JOUR = /^\d{4}-\d{2}-\d{2}$/;

/** Les filtres lus dans l'adresse ; une valeur inconnue est ignorée, pas transmise. */
function lireFiltres(p: Params): Filtres {
  const etat = texte(p.etat);
  const mode = texte(p.mode);
  const du = texte(p.du);
  const au = texte(p.au);
  const q = texte(p.q).slice(0, 80);
  return {
    etat: (ETATS_TRANSACTION as string[]).includes(etat) ? (etat as EtatTransaction) : null,
    mode: mode in LIBELLE_MODE ? (mode as Filtres["mode"]) : null,
    du: JOUR.test(du) ? du : null,
    au: JOUR.test(au) ? au : null,
    q: q || null,
    test: texte(p.test) === "1",
  };
}

/**
 * Transactions Marketplace (§10).
 *
 * - Un achat se suit piste par piste, de la négociation au versement, « sans
 *   imposer une séquence unique » : la piste qu'un parcours ne connaît pas se
 *   dit sans objet.
 * - Chaque piste mène à l'onglet de la fiche qui la détaille : l'offre et les
 *   conditions acceptées, le paiement, la réception, le versement.
 * - Annuler suit la procédure, avant l'encaissement seulement.
 */
export default async function PageTransactions({ searchParams }: { searchParams: Promise<Params> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const f = lireFiltres(await searchParams);

  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let lignes: Transaction[] | null;
  try {
    lignes = await listerTransactions(f);
  } catch {
    lignes = null;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      <p className="text-corps text-muted-foreground">
        Chaque achat se suit piste par piste : la négociation, l’accord, l’attestation, le paiement, la confirmation
        du vendeur, l’acheminement, la réception, les fonds et le versement. Une piste que le parcours ne connaît pas
        se dit sans objet ; aucune n’est déduite d’une autre.
      </p>
      <FiltresTransactions f={f} testVisible={!moi.est_test} />
      {lignes === null ? (
        <LectureEchouee />
      ) : (
        <ListeTransactions
          lignes={lignes}
          peutAnnuler={peut(moi, "transactions.annuler")}
          peutTraiter={peut(moi, "dossiers.traiter")}
          filtree={Boolean(f.etat || f.mode || f.du || f.au || f.q)}
        />
      )}
    </div>
  );
}

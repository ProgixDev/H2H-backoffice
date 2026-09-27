import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "cn";
import { ListeAttestations } from "@/components/attestations/ListeAttestations";
import { AccesRefuse, equipierPourRubrique } from "@/components/bo/PageRubrique";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { Reserve } from "@/components/operations/commun";
import { FiltresTransactions } from "@/components/transactions/FiltresTransactions";
import { ListeTransactions } from "@/components/transactions/ListeTransactions";
import { listerAttestations } from "@/lib/attestations/lectures";
import { FILTRES_ATTESTATION, type AttestationLigne, type FiltreAttestation } from "@/lib/attestations/types";
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

const VUES = [
  { code: "transactions", libelle: "Transactions", chemin: "/transactions" },
  { code: "attestations", libelle: "Attestations de vente", chemin: "/transactions?vue=attestations" },
] as const;

/**
 * Transactions Marketplace (§10) et attestations de vente (§11).
 *
 * - Un achat se suit piste par piste, de la négociation au versement, « sans
 *   imposer une séquence unique » ; chaque piste mène à l'onglet de la fiche
 *   qui la détaille. Annuler suit la procédure, avant l'encaissement seulement.
 * - Une attestation se lit sous les états du cahier des charges ; ses versions
 *   se comparent ; l'équipe relance la partie attendue et demande un
 *   remplacement, que les parties refont — une version signée ne se modifie
 *   jamais.
 */
export default async function PageTransactions({ searchParams }: { searchParams: Promise<Params> }) {
  const moi = await equipierPourRubrique(rubrique);
  if (!moi) return <AccesRefuse rubrique={rubrique} />;

  const p = await searchParams;
  const vue = texte(p.vue) === "attestations" ? "attestations" : "transactions";

  const onglets = (
    <nav className="flex gap-1 border-b" aria-label="Vues">
      {VUES.map((v) => (
        <Link
          key={v.code}
          href={v.chemin}
          className={cn(
            "-mb-px border-b-2 px-3 py-2 text-corps font-medium transition-colors",
            v.code === vue ? "border-h2h-primary text-h2h-primary" : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {v.libelle}
        </Link>
      ))}
    </nav>
  );

  if (vue === "attestations") {
    if (!peut(moi, "attestations.lire")) {
      return (
        <div className="mx-auto grid max-w-7xl gap-6">
          {onglets}
          <Reserve quoi="aux attestations" permission="attestations.lire" />
        </div>
      );
    }
    const f = texte(p.filtre);
    const filtre = (FILTRES_ATTESTATION as string[]).includes(f) ? (f as FiltreAttestation) : null;
    const test = texte(p.test) === "1" && !moi.est_test;
    let lignes: AttestationLigne[] | null;
    try {
      lignes = await listerAttestations(filtre, test);
    } catch {
      lignes = null;
    }
    return (
      <div className="mx-auto grid max-w-7xl gap-6">
        {onglets}
        <p className="text-corps text-muted-foreground">
          Chaque attestation se lit sous l’état du cahier des charges et dit qui est attendu. Une version signée ne se
          modifie jamais : l’équipe relance la partie attendue, ou demande un remplacement que les parties refont.
        </p>
        {lignes === null ? (
          <LectureEchouee />
        ) : (
          <ListeAttestations
            lignes={lignes}
            filtre={filtre}
            test={test}
            peutRelancer={peut(moi, "attestations.relancer")}
            peutReveler={peut(moi, "donnees.reveler")}
          />
        )}
      </div>
    );
  }

  const f = lireFiltres(p);
  // On LIT dans le try, on construit l'écran après (règle `react-hooks/error-boundaries`).
  let lignes: Transaction[] | null;
  try {
    lignes = await listerTransactions(f);
  } catch {
    lignes = null;
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6">
      {onglets}
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

// Les transactions telles que le back-office les lit (`bo_transactions_lister`) :
// un achat suivi piste par piste (§10), chacune lue dans la table qui la porte.
import type { Database } from "@/lib/db/contrat/database.types";
import type { Onglet } from "@/lib/operations/types";

type E = Database["public"]["Enums"];

export type EtatPiste = "fait" | "en_cours" | "a_venir" | "bloque" | "echoue" | "annule" | "sans_objet";

export type CodePiste =
  | "negociation"
  | "accord"
  | "attestation"
  | "paiement"
  | "disponibilite"
  | "acheminement"
  | "reception"
  | "fonds"
  | "versement";

/**
 * Une piste d'un achat (R10.1). `le` : ce qui l'a fait avancer ; `echeance` :
 * ce qu'elle attend, quand il y a une date.
 */
export type Piste = {
  code: CodePiste;
  libelle: string;
  etat: EtatPiste;
  le: string | null;
  echeance: string | null;
  detail: string;
};

/** en_cours : une piste reste à faire ; terminee : plus rien ; annulee : annulée ou remboursée. */
export type EtatTransaction = "en_cours" | "terminee" | "annulee";
export const ETATS_TRANSACTION: EtatTransaction[] = ["en_cours", "terminee", "annulee"];

export type Transaction = {
  id: string;
  numero: string;
  cree_le: string;
  statut: E["order_status"];
  etat: EtatTransaction;
  mode: E["shipping_method"];
  /** Le transporteur, la co-livraison ou la remise en main propre, dans les mots de l'Activité en direct. */
  acheminement: string;
  modele_frais: string;
  type_annonce: E["listing_type"] | null;
  bien_titre: string | null;
  bien_image: string | null;
  acheteur: string | null;
  vendeur: string | null;
  total_cents: number;
  pistes: Piste[];
  /** La première piste en cours, bloquée ou en échec ; nulle quand rien n'attend l'équipe. */
  piste_courante: CodePiste | null;
  alerte: string | null;
  /** Avant l'encaissement seulement ; sinon `annulation_bloquee` dit pourquoi. */
  annulable: boolean;
  annulation_bloquee: string | null;
  est_test: boolean;
};

export type FiltresTransactions = {
  etat: EtatTransaction | null;
  mode: E["shipping_method"] | null;
  /** Des jours (AAAA-MM-JJ), à l'heure de Paris. */
  du: string | null;
  au: string | null;
  q: string | null;
  test: boolean;
};

export const LIBELLE_ETAT_TRANSACTION: Record<EtatTransaction, string> = {
  en_cours: "En cours",
  terminee: "Terminées",
  annulee: "Annulées ou remboursées",
};

export const LIBELLE_ETAT_PISTE: Record<EtatPiste, string> = {
  fait: "Fait",
  en_cours: "En cours",
  a_venir: "À venir",
  bloque: "Bloqué",
  echoue: "En échec",
  annule: "Annulé",
  sans_objet: "Sans objet",
};

/**
 * Où la fiche complète montre ce que dit une piste (R10.3 : voir l'offre, les
 * conditions acceptées, le paiement, la réception, le versement).
 */
export const ONGLET_PISTE: Record<CodePiste, Onglet> = {
  negociation: "bien-et-accord",
  accord: "bien-et-accord",
  attestation: "documents",
  paiement: "paiements",
  disponibilite: "chronologie",
  acheminement: "livraison",
  reception: "livraison",
  fonds: "paiements",
  versement: "paiements",
};

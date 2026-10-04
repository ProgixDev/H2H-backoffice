// Le remboursement d'une option de visibilité, tel que le bureau le lit
// (`bo_option_remboursement_lire`, migration 20261004003000).
//
// 🔴 LA BASE CALCULE TOUT : ce qui a été payé, rendu, ce qui peut encore partir,
// le minimum qu'impose une rétractation, la suggestion au prorata. L'écran ne
// fait que le montrer, et la base refuse ce qui sort de ces bornes.

import type { StatutOrdre } from "@/lib/paiements/types";

export type FamilleOption = "annonce" | "demande";

export type OrdreOption = {
  id: string;
  /** OF-000042. */
  ref: string;
  statut: StatutOrdre;
  montant_cents: number;
  /** Le motif INTERNE de l'équipe — jamais montré à l'acheteur. */
  motif: string;
  demande_par: string | null;
  cree_le: string;
  termine_le: string | null;
  erreur: string | null;
  stripe: string | null;
  /** HTH-A-… : l'avoir émis à la réussite. */
  avoir: string | null;
};

export type AvoirOption = {
  numero: string;
  /** La facture que l'avoir corrige. */
  facture: string;
  montant_cents: number;
  emis_le: string;
  /** Ce que l'acheteur lit sur l'avoir. */
  raison: string;
};

export type PartExecutee = {
  part: number;
  methode: "remontees" | "duree" | "pas_commencee";
  faites?: number;
  prevues?: number;
  ecoule_secondes?: number;
  duree_secondes?: number;
};

export type RemboursementOption = {
  famille: FamilleOption;
  boost: string;
  option: {
    option: string;
    prix_cents: number;
    /** L'annonce ou la demande. */
    cible: string;
    titre: string | null;
    etat: "reservee" | "en_cours" | "en_pause" | "terminee";
    active_depuis: string | null;
    expires_at: string | null;
    termine_le: string | null;
    fin_motif: string | null;
  };
  paiement: { montant_cents: number | null; statut: string | null; reel: boolean | null; intention: string | null };
  facture: { numero: string; total_cents: number; emise_le: string } | null;
  retractation: {
    ref: string;
    demandee_le: string;
    execute_cents: number;
    a_rembourser_cents: number;
    deja_rembourse_cents: number;
    rembourser_avant: string;
    /** Ce qui reste à rendre : le dû, moins les remboursements réussis. */
    reste_cents: number;
  } | null;
  part: PartExecutee;
  rembourse_cents: number;
  /** Ce qui peut encore partir : le payé, moins le rendu, moins ce qui est en route. */
  disponible_cents: number;
  /** Ce qu'une rétractation impose de rendre ; zéro sans rétractation. */
  minimum_cents: number;
  suggestion_cents: number;
  ordres: OrdreOption[];
  avoirs: AvoirOption[];
  possible: boolean;
  raison: string | null;
  est_test: boolean;
};

export const LIBELLE_OPTION: Record<string, string> = {
  bump: "Remontée immédiate",
  daily7: "Chaque jour pendant 7 jours",
  daily14: "Chaque jour pendant 14 jours",
  daily30: "Chaque jour pendant 30 jours",
  urgent: "Badge Urgent",
  courtage: "Boost d’une Offre Flash",
};

export const LIBELLE_ETAT_OPTION: Record<RemboursementOption["option"]["etat"], string> = {
  reservee: "Réservée, pas payée",
  en_cours: "En cours",
  en_pause: "En pause — l’annonce n’est pas visible",
  terminee: "Terminée",
};

const JOURS = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

/** Ce que la part exécutée veut dire, en mots. */
export function partEnMots(p: PartExecutee): string {
  if (p.methode === "pas_commencee") return "Pas encore commencée";
  if (p.methode === "remontees") return `${p.faites ?? 0} remontée(s) faite(s) sur ${p.prevues ?? 0}`;
  const jours = (s: number | undefined) => JOURS.format(Number(s ?? 0) / 86_400);
  return `${jours(p.ecoule_secondes)} j d’affichage sur ${jours(p.duree_secondes)} j, pauses déduites`;
}

// ── Les options, telles que la rubrique les lit (`bo_options_lister`, `bo_options_compteurs`,
// `bo_option_lire`, `bo_option_arreter`) — hand-to-hand `20261004005000`. ─────────────────────

export type EtatOption = RemboursementOption["option"]["etat"];

/**
 * Ce que la base appelle une anomalie (R17.1 « examiner une anomalie ») — elle les nomme, l'écran
 * les dit.
 */
export type AnomalieOption =
  | "remontee_en_retard"
  | "remontee_manquee"
  | "non_demarree"
  | "contestation_ouverte"
  | "contestation_perdue"
  | "remboursement_echoue"
  | "retractation_en_retard";

export const LIBELLE_ANOMALIE: Record<AnomalieOption, string> = {
  remontee_en_retard: "Remontée en retard",
  remontee_manquee: "Remontée manquée",
  non_demarree: "Payée, jamais démarrée",
  contestation_ouverte: "Paiement contesté",
  contestation_perdue: "Contestation perdue, l’option court",
  remboursement_echoue: "Remboursement échoué",
  retractation_en_retard: "Rétractation rendue en retard",
};

/** Ce que l'anomalie veut dire, et ce qui l'éteint. */
export const EXPLICATION_ANOMALIE: Record<AnomalieOption, string> = {
  remontee_en_retard:
    "Une remontée est due depuis plus de dix minutes alors que l’option court : le travail « Remontées des annonces » ne passe plus. Voyez son journal dans Activité en direct.",
  remontee_manquee:
    "Le travail des remontées a pris du retard : une remontée due n’a jamais été faite. Elle compte dans la part non exécutée, et donc dans ce qui se rembourse.",
  non_demarree:
    "Le paiement est encaissé depuis plus de dix minutes, mais l’option n’a jamais démarré. Remboursez-la, ou arrêtez-la en proposant de la rembourser.",
  contestation_ouverte:
    "L’acheteur conteste le paiement auprès de sa banque : les preuves se fournissent dans le tableau de bord Stripe, avant l’échéance du dossier de la Finance.",
  contestation_perdue:
    "La banque a gardé l’argent, et l’option court encore : arrêtez-la, sans proposer de remboursement.",
  remboursement_echoue:
    "Stripe a refusé le dernier remboursement : relancez-le ou annulez-le depuis Paiements et comptabilité.",
  retractation_en_retard:
    "L’acheteur s’est rétracté, et l’échéance légale du remboursement (quatorze jours) est passée : rendez ce qui reste, sans attendre.",
};

export type FiltreOption =
  | "anomalies"
  | "retractations"
  | "en_cours"
  | "en_pause"
  | "reservees"
  | "terminees"
  | "remboursements";

/** Dans l'ordre du bandeau : ce qui attend d'abord. */
export const FILTRES_OPTION: FiltreOption[] = [
  "anomalies",
  "retractations",
  "en_cours",
  "en_pause",
  "reservees",
  "terminees",
  "remboursements",
];

export const LIBELLE_FILTRE_OPTION: Record<FiltreOption, string> = {
  anomalies: "Anomalies",
  retractations: "Rétractations",
  en_cours: "En cours",
  en_pause: "En pause",
  reservees: "Réservées",
  terminees: "Terminées",
  remboursements: "Remboursements",
};

export const LIBELLE_FIN_OPTION: Record<string, string> = {
  echue: "arrivée à son terme",
  executee: "exécutée",
  vendue: "arrêtée par la vente",
  paiement_abandonne: "jamais payée",
  retractation: "rétractée par l’acheteur",
  arretee: "arrêtée par l’équipe",
};

export type StatutRemontee = "prevue" | "executee" | "manquee" | "annulee";

export const LIBELLE_STATUT_REMONTEE: Record<StatutRemontee, string> = {
  prevue: "Prévue",
  executee: "Exécutée",
  manquee: "Manquée",
  annulee: "Annulée",
};

export type ContestationLue = "ouverte" | "gagnee" | "perdue" | "close";

export const LIBELLE_CONTESTATION: Record<ContestationLue, string> = {
  ouverte: "Contestée",
  gagnee: "Contestation gagnée",
  perdue: "Contestation perdue",
  close: "Contestation close",
};

const CAUSE_PAUSE: Record<string, string> = {
  annonce_draft: "l’annonce est en brouillon",
  annonce_reserved: "l’annonce est réservée",
  annonce_expired: "l’annonce a expiré",
  moderation_masquee: "l’annonce est masquée par la modération",
  moderation_retiree: "l’annonce est retirée par la modération",
  moderation_en_verification: "l’annonce attend sa vérification",
  moderation_refusee: "la publication de l’annonce est refusée",
  compte_suspendu: "le compte du vendeur est suspendu",
};

/** Pourquoi une option est en pause : ce qui a rendu l'annonce invisible. */
export const causePauseDite = (cause: string | null) => (cause ? (CAUSE_PAUSE[cause] ?? cause) : "—");

/** Une option dans la liste (`public.bo_option`). */
export type OptionLigne = {
  id: string;
  famille: FamilleOption;
  /** OPT-1A2B3C4D. */
  ref: string;
  option: string;
  prix_cents: number;
  etat: EtatOption;
  fin_motif: string | null;
  reservee_le: string;
  active_depuis: string | null;
  fin_prevue: string | null;
  termine_le: string | null;
  /** L'annonce, ou la demande, que l'option met en avant. */
  cible_id: string;
  cible_titre: string | null;
  cible_statut: string | null;
  acheteur_id: string;
  acheteur: string | null;
  paiement_id: string | null;
  paiement_statut: string | null;
  /** Faux : un paiement en mode test de Stripe. */
  paiement_reel: boolean | null;
  remontees_faites: number;
  remontees_prevues: number;
  remontees_manquees: number;
  pause_depuis: string | null;
  pause_cause: string | null;
  /** Le nombre de pauses ; la fiche en donne la liste. */
  pauses: number;
  /** La version du texte accepté à l'achat ; nul : aucun accord recueilli. */
  accord: string | null;
  retractation_ref: string | null;
  retractation_reste_cents: number | null;
  rembourser_avant: string | null;
  rembourse_cents: number;
  remboursement_statut: StatutOrdre | null;
  contestation: ContestationLue | null;
  arrete_le: string | null;
  anomalies: AnomalieOption[];
  est_test: boolean;
};

export type CompteursOptions = Record<FiltreOption | "tous", number>;

export type FiltresOptions = { filtre: FiltreOption | null; q: string | null; test: boolean };

export type TarifOption = {
  grille: string | null;
  rang: number | null;
  option: string;
  calcul: string | null;
  assiette_cents: number | null;
  taux: number | null;
  minimum_cents: number | null;
  plafond_cents: number | null;
  forfait_cents: number | null;
  duree_jours: number | null;
  prix_cents: number | null;
};

export type ContestationOption = {
  dispute: string;
  montant_cents: number;
  frais_cents: number;
  motif: string | null;
  statut: string | null;
  issue: "won" | "lost" | "warning_closed" | null;
  preuves_avant: string | null;
  ouverte_le: string;
  reprise_le: string | null;
  retablie_le: string | null;
  close_le: string | null;
};

/** Un arrêt par l'équipe. Ne change plus. */
export type ArretOption = {
  /** ARO-000042. */
  reference: string;
  le: string;
  par: string | null;
  /** Ce que l'équipe garde pour elle. */
  motif: string;
  /** Ce que l'acheteur a lu. */
  message: string;
  part: PartExecutee;
  propose_cents: number | null;
  /** L'ordre du remboursement proposé : OF-000042. */
  ordre: string | null;
};

type Possible = { possible: boolean; raison: string | null };

/**
 * La fiche d'une option (`bo_option_lire`).
 * ⚠️ `pauses` Y EST LA LISTE, PAS LE NOMBRE : la base la pose par-dessus le compte de la ligne.
 */
export type FicheOption = Omit<OptionLigne, "pauses"> & {
  libelle: string;
  tarif: TarifOption | null;
  cible: { id: string; titre: string | null; statut: string | null; moderation: string | null };
  acheteur_compte: string | null;
  paiement: RemboursementOption["paiement"] | null;
  facture: RemboursementOption["facture"];
  part: PartExecutee;
  remontees: { numero: number; prevue_le: string; executee_le: string | null; statut: StatutRemontee }[];
  pauses: { debut: string; fin: string | null; cause: string }[];
  /** 🔴 LA PREUVE DE L'ACCORD : le texte accepté, mot pour mot, et son empreinte. */
  accord_detail: {
    version: string;
    donne_le: string;
    particulier: boolean;
    texte: string;
    empreinte: string;
    a_valider: boolean;
  } | null;
  retractation: RemboursementOption["retractation"];
  /** Sans rétractation : peut-elle encore se faire, jusqu'à quand, pour combien. */
  retractation_possible: {
    possible: boolean;
    raison: string | null;
    delai_jusqu_au: string | null;
    a_rembourser_cents?: number;
    execute_cents?: number;
  } | null;
  remboursement: Pick<
    RemboursementOption,
    "rembourse_cents" | "disponible_cents" | "minimum_cents" | "suggestion_cents" | "ordres" | "avoirs" | "possible" | "raison"
  >;
  contestations: ContestationOption[];
  arrets: ArretOption[];
  dossiers: { id: string; source: string; statut: string; titre: string }[];
  possibles: {
    /** Ce que l'arrêt proposerait de rendre, s'il se faisait maintenant — et pourquoi rien, sinon. */
    arreter: Possible & { remboursement_cents: number; remboursement_raison: string | null };
    rembourser: Possible;
  };
};

/** Ce que rend un arrêt. */
export type OptionArretee = {
  option: string;
  reference: string;
  part: PartExecutee;
  remboursement: { ordre: string; ref: string; statut: StatutOrdre; montant_cents: number; validation: string } | null;
};

export const cheminOption = (id: string) => `/visibilite-et-publicite/${encodeURIComponent(id)}`;

/** L'adresse d'une liste filtrée : les filtres restent dans l'adresse (R4.10). */
export function adresseOptions(f: FiltresOptions): string {
  const p = new URLSearchParams();
  if (f.filtre) p.set("filtre", f.filtre);
  if (f.q) p.set("q", f.q);
  if (f.test) p.set("test", "1");
  const s = p.toString();
  return s ? `/visibilite-et-publicite?${s}` : "/visibilite-et-publicite";
}

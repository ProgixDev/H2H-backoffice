// Les litiges tels que le back-office les lit (`bo_litiges_lister`) et les
// libellés de l'application, repris mot pour mot : le support et l'acheteur
// doivent lire le même mot pour la même chose.

export type Decision =
  | "refund_full"
  | "refund_partial"
  | "return_full_refund"
  | "return_partial_refund"
  | "pay_seller"
  | "rejected"
  | "other";

export type Litige = {
  id: string;
  commande_id: string;
  numero_commande: string;
  total_cents: number;
  famille: string;
  phase: string;
  motif: string;
  description: string;
  solution_demandee: string;
  decision: Decision | null;
  decision_cents: number | null;
  deja_rendu_cents: number;
  restant_cents: number;
  /** Ce qui partirait vraiment si l'on émettait maintenant. */
  a_emettre_cents: number;
  /** Une réservation de l'écran mobile du support, pas encore aboutie. */
  reservation_cents: number | null;
  reservation_depuis: string | null;
  /** Le dernier ordre financier du litige (annulés exclus) : son statut dit où en est l'argent. */
  ordre_id: string | null;
  ordre_ref: string | null;
  ordre_statut: "en_validation" | "demande" | "en_cours" | "reussi" | "echoue" | null;
  ordre_cents: number | null;
  ordre_depuis: string | null;
  ordre_erreur: string | null;
  acheteur: string | null;
  vendeur: string | null;
  est_test: boolean;
  ouvert_le: string;
  // ── Le dossier (migration 20260926015000) ──
  /** L'un des onze motifs du cahier des charges ; `null` : à qualifier. */
  motif_litige: string | null;
  motif_litige_libelle: string | null;
  /** L'équipe a rangé le dossier elle-même. */
  motif_qualifie: boolean;
  /** Combien de décisions le dossier a connues (la première, les suivantes). */
  decisions: number;
  /** Le recours en cours, sinon le dernier examiné. */
  recours_id: string | null;
  recours_statut: StatutRecours | null;
  recours_partie: Partie | null;
  recours_canal: Canal | null;
  recours_texte: string | null;
  recours_recu_le: string | null;
  recours_decision_rang: number | null;
  /** À examiner, et pas par l'auteur de la décision contestée. */
  recours_examinable: boolean;
  /** L'enquête ouverte, sinon la dernière conclue. */
  enquete_id: string | null;
  enquete_statut: StatutEnquete | null;
  enquete_reference: string | null;
  enquete_echeance: string | null;
  enquete_issue: IssueEnquete | null;
  enquete_ouverte_le: string | null;
  /** Le transporteur tiers de la commande ; `null` : pas d'enquête possible. */
  transporteur: string | null;
};

// ── Le dossier : motifs, recours, enquêtes (§15) ────────────────────────────

export type GenreDossier =
  | "reclamation"
  | "incident"
  | "signalement_utilisateur"
  | "signalement_annonce"
  | "signalement_recherche"
  | "signalement_live";
export type Partie = "buyer" | "seller";
export type Canal = "e_mail" | "telephone" | "messagerie" | "courrier" | "autre";
export type StatutRecours = "a_examiner" | "recevable" | "irrecevable" | "tranche";
export type StatutEnquete = "ouverte" | "conclue";
export type IssueEnquete = "perdu" | "livre_confirme" | "endommage" | "retrouve" | "sans_suite";

/** Le filtre des dossiers sans motif. */
export const A_QUALIFIER = "a_qualifier";

/** Un motif et ses dossiers ouverts (`bo_litiges_motifs`) ; `motif` nul : à qualifier. */
export type CompteMotif = {
  motif: string | null;
  libelle: string;
  ordre: number;
  a_confirmer: boolean;
  definition: string | null;
  reclamations: number;
  incidents: number;
  signalements: number;
};

/** Un dossier qui n'est pas une réclamation : incident de co-livraison ou signalement. */
export type Signalement = {
  genre: Exclude<GenreDossier, "reclamation">;
  id: string;
  motif: string | null;
  motif_libelle: string | null;
  motif_qualifie: boolean;
  titre: string;
  etat: string;
  ouvert: boolean;
  ouvert_le: string;
  commande_id: string | null;
  reference: string | null;
  participants: string;
  /** Ce qu'un signalement vise : l'annonce, la recherche, le compte ou le live ; nul pour un incident. */
  cible: string | null;
  est_test: boolean;
};

export const LIBELLE_GENRE: Record<Signalement["genre"], string> = {
  incident: "Incident de co-livraison",
  signalement_utilisateur: "Signalement d’un utilisateur",
  signalement_annonce: "Signalement d’une annonce",
  signalement_recherche: "Signalement d’une recherche",
  signalement_live: "Signalement d’un live",
};

export const LIBELLE_ETAT_SIGNALEMENT: Record<string, string> = {
  pending: "Déclaré",
  blocked: "Bloqué",
  support_review: "Transmis au support",
  closed: "Clos",
  // Un signalement attend son examen, puis se dit fondé ou non (20260930009000).
  a_examiner: "À examiner",
  fonde: "Fondé",
  non_fonde: "Non fondé",
};

export const LIBELLE_PARTIE: Record<Partie, string> = { buyer: "L’acheteur", seller: "Le vendeur" };

export const CANAUX: { canal: Canal; libelle: string }[] = [
  { canal: "e_mail", libelle: "E-mail" },
  { canal: "telephone", libelle: "Téléphone" },
  { canal: "messagerie", libelle: "Messagerie" },
  { canal: "courrier", libelle: "Courrier" },
  { canal: "autre", libelle: "Autre canal" },
];
export const LIBELLE_CANAL = Object.fromEntries(CANAUX.map((c) => [c.canal, c.libelle])) as Record<Canal, string>;

export const LIBELLE_STATUT_RECOURS: Record<StatutRecours, string> = {
  a_examiner: "Recours à examiner",
  recevable: "Recours recevable — décision à rendre",
  irrecevable: "Recours irrecevable",
  tranche: "Recours tranché",
};

export const ISSUES: { issue: IssueEnquete; libelle: string }[] = [
  { issue: "perdu", libelle: "Colis perdu" },
  { issue: "livre_confirme", libelle: "Livraison confirmée par le transporteur" },
  { issue: "endommage", libelle: "Avarie constatée" },
  { issue: "retrouve", libelle: "Colis retrouvé, en route" },
  { issue: "sans_suite", libelle: "Sans suite" },
];
export const LIBELLE_ISSUE = Object.fromEntries(ISSUES.map((i) => [i.issue, i.libelle])) as Record<IssueEnquete, string>;

export const LIBELLE_SOURCE_DECISION: Record<string, string> = {
  back_office: "back-office",
  support_mobile: "écran mobile du support",
  reprise: "décision antérieure à l’historique",
};

// `src/i18n/fr.ts` de l'application : `components_claim_status.dec*`.
export const LIBELLE_DECISION: Record<Decision, string> = {
  refund_full: "Remboursement total",
  refund_partial: "Remboursement partiel",
  return_full_refund: "Retour + remboursement total",
  return_partial_refund: "Retour + remboursement partiel",
  pay_seller: "Transfert du paiement au vendeur",
  rejected: "Rejet de la réclamation",
  other: "Autre",
};

// Les quatre gestes de l'écran d'arbitrage de l'application (`app_support_litiges`).
export const DECISIONS_PROPOSEES: { decision: Decision; libelle: string; montant: boolean }[] = [
  { decision: "refund_full", libelle: "Rembourser en entier", montant: false },
  { decision: "refund_partial", libelle: "Rembourser en partie", montant: true },
  { decision: "pay_seller", libelle: "Payer le vendeur", montant: false },
  { decision: "rejected", libelle: "Rejeter", montant: false },
];

// `components_claim_status.phase_*`.
export const LIBELLE_PHASE: Record<string, string> = {
  open: "Ouverte",
  support_direct: "Transmise au support",
  seller_response: "Réponse du vendeur",
  amicable: "Phase amiable",
  support_review: "Analyse du support",
  decided: "Décision rendue",
  return_pending: "Retour à organiser",
  return_in_transit: "Retour en cours",
  return_validation: "Validation du retour",
  closed: "Clôturée",
  rejected: "Rejetée",
};

// `src/types/claim.ts` : CLAIM_FAMILY_FR et les motifs de chaque famille.
export const LIBELLE_FAMILLE: Record<string, string> = {
  not_received_damaged: "Article non reçu ou endommagé",
  received_non_conforme: "Article reçu mais non conforme",
  authenticity: "Article reçu mais problème d’authenticité",
  other: "Autre problème avec la commande",
};

export const LIBELLE_MOTIF: Record<string, string> = {
  not_received: "Article non reçu",
  damaged_undeliverable: "Colis endommagé ou non livrable",
  carrier_reported_damage: "Avarie signalée par le transporteur",
  wrongly_marked_delivered: "Colis déclaré à tort comme réceptionné",
  delay: "Retard de livraison",
  possibly_lost: "Colis potentiellement perdu",
  non_conforme: "Article non conforme à l’annonce",
  damaged: "Article abîmé ou endommagé",
  incomplete: "Article incomplet",
  wrong_item: "Mauvais article reçu",
  defective: "Article défectueux",
  empty_parcel: "Colis reçu vide ou partiellement vide",
  counterfeit_suspicion: "Suspicion de contrefaçon",
};

export function libelleMotif(motif: string): string {
  return LIBELLE_MOTIF[motif] ?? motif.replaceAll("_", " ");
}

const FORMAT = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export const euros = (cents: number | null | undefined) => FORMAT.format((cents ?? 0) / 100);

/** « 12,50 » ou « 12.5 » → 1250 ; `null` si ce n'est pas un montant. */
export function enCentimes(saisie: string): number | null {
  const n = Number(saisie.replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

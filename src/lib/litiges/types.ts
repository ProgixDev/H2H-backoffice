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

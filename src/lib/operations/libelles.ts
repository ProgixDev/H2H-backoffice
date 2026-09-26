// Les mots de la fiche complète. Chaque table couvre TOUTES les valeurs de son
// type en base (le contrat généré) : une valeur ajoutée là-bas casse la
// vérification de types ici, au lieu d'afficher un code brut à l'équipe.
//
// Les états du colis et des attestations reprennent mot pour mot l'application
// (`components_logistics_journalexpedition.etat`, `app_checkout_attestation.statuses`),
// les phases du litige aussi (`components_claim_status`).
import type { Database } from "@/lib/db/contrat/database.types";
import type { SourceFait } from "./types";

type E = Database["public"]["Enums"];

export const LIBELLE_SOURCE: Record<SourceFait, string> = {
  etat: "État",
  remise: "Remise",
  litige: "Litige",
  incident: "Incident",
  paiement: "Argent",
  document: "Document",
  annonce: "Annonce",
  notification: "Notification",
  equipe: "Équipe",
  dossier: "Dossier",
  offre: "Offre",
  acces: "Accès",
  achat: "Achat",
};

export const LIBELLE_OBJET_PAIEMENT: Record<string, string> = {
  order: "Achat",
  seller_share: "Part du vendeur",
  absence: "Frais d’absence",
  redelivery: "Nouvelle remise",
};

export const LIBELLE_PAIEMENT: Record<E["payment_status"], string> = {
  requires_action: "Action requise",
  pre_authorized: "Autorisé",
  captured: "Encaissé",
  released: "Autorisation libérée",
  refunded: "Remboursé",
  failed: "Échoué",
  canceled: "Annulé",
};

export const LIBELLE_MODE: Record<E["shipping_method"], string> = {
  h2h_logistic: "H2H Logistic (co-livraison)",
  mondial_relay: "Mondial Relay",
  colissimo: "Colissimo",
  chronopost: "Chronopost",
  ups: "UPS",
  pickup: "Remise en main propre",
};

export const LIBELLE_TRANSPORTEUR: Record<E["carrier_key"], string> = {
  colissimo_home: "Colissimo · domicile",
  mondial_home: "Mondial Relay · domicile",
  mondial_locker: "Mondial Relay · consigne",
  chronopost_home: "Chronopost · domicile",
  chronopost_shop2shop: "Chronopost · Shop2Shop",
  ups: "UPS",
};

export const LIBELLE_ETAT_COLIS: Record<E["shipment_state"], string> = {
  created: "Commande créée",
  awaiting_transporter: "Recherche d’un cotransporteur particulier",
  accepted: "Co-livraison acceptée",
  seller_confirmed: "Rendez-vous confirmé par le vendeur",
  pickup_pending: "Récupération à venir",
  picked_up: "Colis récupéré chez le vendeur",
  in_transit: "Colis en route",
  at_relay: "Colis déposé en point relais",
  awaiting_collection: "À retirer par l’acheteur",
  out_for_delivery: "En cours de remise",
  delivered: "Colis remis à l’acheteur",
  completed: "Transaction terminée",
  redelivery_pending: "Nouvelle remise à programmer",
  return_pending: "Retour au vendeur à organiser",
  returned: "Colis retourné au vendeur",
  cancelled: "Co-livraison annulée",
  disputed: "Litige ouvert",
  expired: "Proposition expirée",
};

export const LIBELLE_MISSION: Record<E["mission_status"], string> = {
  proposal: "Proposée à un cotransporteur particulier",
  accepted: "Acceptée",
  seller_pending: "Confirmation du vendeur attendue",
  group_created: "Groupe de co-livraison créé",
  pickup_pending: "Collecte à venir",
  picked_up: "Colis récupéré",
  in_transit: "En route",
  deposited: "Déposé",
  delivery_pending: "Remise à venir",
  delivered: "Remis",
  completed: "Terminée",
  cancelled: "Annulée",
  expired: "Expirée",
};

export const LIBELLE_ANNULATION: Record<E["cancellation_reason"], string> = {
  seller_no_show: "Vendeur absent au rendez-vous",
  buyer_no_show: "Acheteur absent au rendez-vous",
  transporter_cancelled_before_pickup: "Annulée par le cotransporteur avant la collecte",
  transporter_cancelled_after_pickup: "Annulée par le cotransporteur après la collecte",
  seller_timer_expired: "Le vendeur n’a pas confirmé à temps",
  other: "Autre motif",
};

export const LIBELLE_ASSURANCE: Record<E["insurance_tier"], string> = {
  basic: "Protection de base",
  premium: "Protection renforcée",
};

export const LIBELLE_ATTESTATION: Record<E["attestation_status"], string> = {
  required: "Attestation requise",
  identities_to_verify: "Identités à vérifier",
  data_frozen: "Données figées",
  photos_required: "Photos obligatoires à prendre",
  seller_declarations: "Déclarations vendeur à confirmer",
  draft_generated: "Version provisoire générée",
  awaiting_seller_signature: "En attente de signature vendeur",
  signed_by_seller: "Signé par le vendeur",
  awaiting_buyer_decision: "En attente de décision acheteur",
  refused_by_buyer: "Refusée par l’acheteur",
  accepted_by_buyer: "Acceptée par l’acheteur",
  signed_by_both: "Signée par les deux parties",
  final_available: "Attestation définitive disponible",
  cancelled_or_replaced: "Annulée ou remplacée",
};

export const LIBELLE_DECISION_ACHETEUR: Record<E["buyer_decision"], string> = {
  accepted: "Acceptée",
  refused: "Refusée",
};

export const LIBELLE_RECU: Record<E["receipt_status"], string> = {
  purchase_initiated: "Achat initié",
  payment_in_progress: "Paiement en cours",
  payment_secured: "Paiement sécurisé",
  transaction_in_progress: "Transaction en cours",
  transaction_finalized: "Transaction finalisée",
  receipt_generating: "Reçu en préparation",
  receipt_available: "Reçu disponible",
  receipt_amended: "Reçu rectifié",
  transaction_cancelled: "Transaction annulée",
};

export const LIBELLE_ECRITURE: Record<E["ledger_event"], string> = {
  buyer_charge: "Paiement de l’acheteur",
  platform_commission: "Commission de la plateforme",
  insurance_contribution: "Contribution à la protection",
  stripe_fee: "Frais du prestataire de paiement",
  seller_payout: "Versement au vendeur",
  courier_participation: "Participation de co-livraison",
  relais_participation: "Participation du point relais",
  relay_deposit_commission: "Commission de dépôt en relais",
  third_party_return_billing: "Retour facturé par un tiers",
  external_carrier_cost: "Coût du transporteur",
  refund: "Remboursement",
  insurance_claim_payout: "Indemnisation",
  reserve_funding: "Mise en réserve",
  reserve_release: "Sortie de réserve",
  exchange_soulte: "Soulte d’échange",
  courier_payout: "Versement au cotransporteur",
  payout_reversal: "Versement annulé",
  external_carrier_settlement: "Règlement du transporteur",
};

export const LIBELLE_COMPTE: Record<E["ledger_account_kind"], string> = {
  buyer_funds: "Fonds de l’acheteur",
  platform_revenue: "Revenus de la plateforme",
  insurance_pool: "Fonds de protection",
  refund_reserve: "Réserve de remboursement",
  stripe_fee_expense: "Frais de paiement",
  seller_payable: "Dû au vendeur",
  courier_payable: "Dû au cotransporteur",
  relais_payable: "Dû au point relais",
  external_carrier: "Transporteur",
  buyer_receivable: "Dû par l’acheteur",
  courier_pool: "Fonds de co-livraison",
  platform_cash: "Trésorerie de la plateforme",
};

export const LIBELLE_ECRITURE_STATUT: Record<E["tx_status"], string> = {
  pending: "En attente",
  available: "Disponible",
  completed: "Passée",
  paid: "Versée",
  failed: "Échouée",
};

export const LIBELLE_FAMILLE: Record<E["claim_family"], string> = {
  not_received_damaged: "Non reçu ou endommagé",
  received_non_conforme: "Reçu non conforme",
  authenticity: "Authenticité",
  other: "Autre motif",
};

export const LIBELLE_PARCOURS: Record<E["claim_journey"], string> = {
  support_direct: "Transmis directement au support",
  seller_response: "Réponse du vendeur d’abord",
};

export const LIBELLE_PHASE: Record<E["claim_phase"], string> = {
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

export const LIBELLE_SOLUTION: Record<E["requested_solution"], string> = {
  refund_full: "Remboursement total",
  refund_partial: "Remboursement partiel",
  return_partial_refund: "Retour et remboursement partiel",
  return_full_refund: "Retour et remboursement total",
};

export const LIBELLE_DECISION: Record<E["support_decision"], string> = {
  ...LIBELLE_SOLUTION,
  pay_seller: "Paiement du vendeur",
  rejected: "Réclamation rejetée",
  other: "Autre décision",
};

export const LIBELLE_ETAT_PAQUET: Record<E["package_state"], string> = {
  yes: "Colis endommagé",
  no: "Colis intact",
  unknown: "L’acheteur ne sait pas",
  not_received: "Colis non reçu",
};

export const LIBELLE_FRAIS_RETOUR: Record<E["return_fee_payer"], string> = {
  buyer: "À la charge de l’acheteur",
  seller: "À la charge du vendeur",
  shared: "Partagés",
};

export const LIBELLE_EXCEPTION_RETOUR: Record<E["return_fee_exception"], string> = {
  agreement: "Accord entre les parties",
  seller_commitment: "Engagement du vendeur",
  counterfeit: "Contrefaçon",
  specific_decision: "Décision particulière",
};

export const LIBELLE_SUIVI_RETOUR: Record<E["return_tracking_mode"], string> = {
  tracked: "Suivi",
  registered: "Recommandé",
};

export const LIBELLE_PARTIE: Record<E["claim_party"], string> = { buyer: "Acheteur", seller: "Vendeur" };

export const LIBELLE_DECLARANT: Record<E["declarant_role"], string> = {
  buyer: "Acheteur",
  seller: "Vendeur",
  transporter: "Cotransporteur particulier",
};

export const LIBELLE_INCIDENT: Record<E["mission_form_status"], string> = {
  pending: "Contestation possible",
  closed: "Clos",
  blocked: "Bloqué",
  support_review: "Au support",
};

export const LIBELLE_CONVERSATION: Record<E["conversation_kind"], string> = {
  dm: "Messages entre les parties",
  mission_group: "Groupe de co-livraison",
  support: "Support",
  live: "Live",
};

export const LIBELLE_ETAT_ARTICLE: Record<E["product_condition"], string> = {
  new: "Neuf",
  like_new: "Comme neuf",
  good: "Bon état",
  fair: "État correct",
  poor: "Usé",
};

export const LIBELLE_ANNONCE: Record<E["product_status"], string> = {
  draft: "Brouillon",
  active: "En ligne",
  reserved: "Réservée",
  sold: "Vendue",
  expired: "Expirée",
};

export const LIBELLE_TYPE_ANNONCE: Record<E["listing_type"], string> = {
  fixed: "Prix fixe",
  offer: "Offres",
  flash: "Offre Flash",
};

export const LIBELLE_FLASH: Record<E["courtage_status"], string> = {
  propositions_open: "Offres ouvertes",
  cap_reached: "Plafond atteint",
  propositions_closed: "Offres terminées",
  seller_choosing: "Choix du vendeur",
  exclu_active: "Exclu accordée",
  flash_active: "Accès Flash ouverts",
  payment_validated: "Paiement validé",
  sold: "Vendu",
  unsold: "Non vendu",
  cancelled: "Annulée par le vendeur",
  disputed: "Litige ou paiement à vérifier",
};

export const LIBELLE_SELECTION: Record<E["courtage_selection_mode"], string> = { exclu: "Exclu", flash: "Accès Flash" };

export const LIBELLE_REMISE_PREFEREE: Record<E["courtage_handover"], string> = {
  hand_to_hand: "Main propre",
  h2h_logistic: "Co-livraison",
  relay: "Point relais",
  postal: "Envoi postal",
};

export const LIBELLE_ACCES: Record<E["purchase_access_status"], string> = {
  active: "Actif",
  paid: "Payé",
  expired: "Expiré",
};

export const LIBELLE_FORMAT_LIVE: Record<E["live_format"], string> = {
  classic: "Classique",
  exclusive: "Exclusif",
  vip: "VIP",
};

export const LIBELLE_LIVE: Record<E["live_status"], string> = {
  upcoming: "Programmé",
  live: "En direct",
  ended: "Terminé",
};

export const LIBELLE_DIFFUSION: Record<E["live_stream_state"], string> = {
  idle: "Pas encore diffusé",
  connecting: "Connexion du flux",
  live: "À l’antenne",
  ended: "Diffusion terminée",
};

export const LIBELLE_PHASE_ARTICLE: Record<E["live_article_phase"], string> = {
  presentation: "Présentation",
  propositions: "Offres",
  choix: "Choix du vendeur",
  pause: "Pause",
};

export const LIBELLE_ISSUE_ARTICLE: Record<E["live_article_outcome"], string> = {
  pending: "En cours",
  exclu_active: "Exclu Live accordée",
  flash_active: "Accès Flash ouverts",
  sold: "Vendu",
  unsold: "Non vendu",
  cancelled: "Retiré",
};

export const LIBELLE_SELECTION_LIVE: Record<E["live_selection_mode"], string> = {
  exclu_live: "Exclu Live",
  flash_access: "Accès Flash",
};

export const LIBELLE_SIEGE: Record<E["live_seat_role"], Record<E["live_seat_state"], string>> = {
  buyer: {
    reserved: "Places acheteur réservées",
    confirmed: "Places acheteur confirmées",
    waitlisted: "Acheteurs en liste d’attente",
    released: "Places acheteur libérées",
    no_show: "Acheteurs absents",
  },
  spectator: {
    reserved: "Places spectateur réservées",
    confirmed: "Places spectateur confirmées",
    waitlisted: "Spectateurs en liste d’attente",
    released: "Places spectateur libérées",
    no_show: "Spectateurs absents",
  },
};

/** « buyer.confirmed » → « Places acheteur confirmées » ; la clé brute si elle est inconnue. */
export function libelleSiege(cle: string): string {
  const [role, etat] = cle.split(".");
  return (LIBELLE_SIEGE as Record<string, Record<string, string>>)[role]?.[etat] ?? cle;
}

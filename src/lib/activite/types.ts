// Les formes que rendent `bo_operations_lister`, `bo_operations_compteurs` et
// `bo_evenements_lister` (migration 20260926005000 de hand-to-hand).

import type { Database } from "@/lib/db/contrat/database.types";

/** Les services qu'on filtre. Une ligne peut aussi être « plateforme » : un travail planifié en échec. */
export const SERVICES = ["marketplace", "logistic", "flash", "live"] as const;
export type Service = (typeof SERVICES)[number] | "plateforme";

export type Acteur =
  | "acheteur"
  | "vendeur"
  | "cotransporteur"
  | "acheteur_vendeur"
  | "support"
  | "prestataire"
  | "plateforme";

export type Participant = { role: "acheteur" | "vendeur" | "cotransporteur"; pseudo: string | null };

export type Operation = {
  ref: string;
  type: string;
  service: Service;
  objet_table: "orders" | "courtage_listings" | "live_sessions" | "taches";
  objet_id: string;
  bien_titre: string | null;
  bien_image: string | null;
  participants: Participant[];
  etape: string;
  etape_libelle: string;
  finance: string;
  finance_libelle: string;
  action_attendue: string | null;
  acteur_attendu: Acteur | null;
  echeance: string | null;
  localisation: string | null;
  dernier_evenement: string;
  dernier_evenement_le: string;
  alerte: "erreur" | "incident" | "retard" | null;
  alerte_libelle: string | null;
  montant_cents: number | null;
  paiement_en_attente: boolean;
  est_test: boolean;
  termine_le: string | null;
};

export type Compteur = {
  code: string;
  libelle: string;
  description: string;
  nombre: number;
  /** L'heure de la base : les comptes à rebours s'y calent. */
  calcule_le: string;
};

export type Evenement = {
  id: number;
  le: string;
  objet_table: Operation["objet_table"];
  objet_id: string;
  ref: string | null;
  service: Service;
  entite: string;
  libelle: string;
  acteur_type: "utilisateur" | "equipe" | "prestataire" | "plateforme";
  acteur: string | null;
  est_test: boolean;
};

/** Un travail planifié et sa santé (`bo_taches_automatiques`). */
export type Tache = {
  code: string;
  libelle: string;
  description: string;
  periode_minutes: number;
  etat: "ok" | "erreur" | "muette";
  dernier_passage: string | null;
  dernier_succes: string | null;
  derniere_erreur: string | null;
  derniere_erreur_le: string | null;
  executions_24h: number;
  erreurs_24h: number;
};

export type FiltresActivite = {
  compteur: string | null;
  service: Service | null;
  recherche: string | null;
  termines: boolean;
  inclureTest: boolean;
};

/** Ce que la route `/api/activite` rend. */
export type ReponseOperations = { compteurs: Compteur[]; operations: Operation[] };
export type ReponseEvenements = { evenements: Evenement[] };
export type ReponseTaches = { taches: Tache[] };

/** Une échéance en cours (`bo_echeances_lister`). */
export type Echeance = {
  regle: string;
  regle_libelle: string;
  genre: "utilisateur" | "interne" | "prestataire";
  objet_table: "orders" | "courtage_listings" | "live_sessions" | "dossiers";
  objet_id: string;
  ref: string;
  fin: string;
  statut: "a_venir" | "echue" | "non_executee";
  executeur: string | null;
  acteur: string;
  est_test: boolean;
};

/** Une règle du registre des délais (`bo_regles_delai`, §7). */
export type RegleDelai = {
  code: string;
  version: number;
  libelle: string;
  genre: Echeance["genre"];
  duree: number | null;
  unite: "minutes" | "heures" | "jours_calendaires" | "jours_ouvres" | null;
  parametre: string | null;
  declencheur: string;
  rappels: string | null;
  arret: string | null;
  action_echeance: string;
  executeur: string | null;
  grace_minutes: number | null;
  acteur: string;
  document: string | null;
  effective_from: string;
};

export type ReponseEcheances = { echeances: Echeance[]; regles: RegleDelai[] };

/** L'état d'une notification tel que l'équipe le lit (R20.5, `app.notification_etat`). */
export type EtatNotification =
  | "prevue"
  | "envoyee"
  | "distribuee"
  | "consultee"
  | "echec"
  | "application"
  | "avant_suivi"
  | "ecartee";

export const FILTRES_NOTIFICATIONS = ["non_parvenues", "echecs", "obligatoires_non_lues", "ecartees"] as const;
export type FiltreNotifications = (typeof FILTRES_NOTIFICATIONS)[number];

/**
 * Une notification des sept derniers jours et son suivi (`bo_notifications_lister`,
 * migration 20260926010000 de hand-to-hand).
 *
 * 🔴 NI SON CORPS, NI LE JETON D'UN APPAREIL, NI LES MESSAGES : la base ne les
 * rend pas. Le titre dit de quoi il s'agit ; le reste appartient au destinataire.
 */
export type NotificationSuivie = {
  id: string;
  le: string;
  type: Database["public"]["Enums"]["notification_type"];
  titre: string;
  destinataire: string | null;
  obligatoire: boolean;
  modele: string | null;
  etat: EtatNotification;
  push_statut: "prevu" | "envoye" | "distribue" | "echec" | "expire" | "sans_appareil" | null;
  push_erreur: string | null;
  push_tentatives: number | null;
  push_appareils: number | null;
  consultee_le: string | null;
  /** Obligatoire, ni poussée ni lue : elle remonte dans « À traiter ». */
  non_parvenue: boolean;
  objet_table: "orders" | "courtage_listings" | "live_sessions" | null;
  objet_id: string | null;
  objet_ref: string | null;
  est_test: boolean;
};

export type ReponseNotifications = { notifications: NotificationSuivie[] };

export const LIBELLE_SERVICE: Record<Service, string> = {
  marketplace: "Marketplace",
  logistic: "H2H Logistic",
  flash: "Offre Flash",
  live: "Live",
  plateforme: "Plateforme",
};

export const LIBELLE_TYPE: Record<string, string> = {
  achat: "Achat",
  attestation: "Attestation",
  envoi: "Envoi",
  remise: "Remise",
  recherche: "Recherche",
  colivraison: "Co-livraison",
  incident: "Incident",
  litige: "Litige",
  flash: "Offre Flash",
  live: "Live",
  automatique: "Travail automatique",
};

export const LIBELLE_ACTEUR: Record<Acteur, string> = {
  acheteur: "Acheteur",
  vendeur: "Vendeur",
  cotransporteur: "Cotransporteur",
  acheteur_vendeur: "Acheteur et vendeur",
  support: "Support",
  prestataire: "Prestataire",
  plateforme: "Par la plateforme",
};

/** Les filtres d'une adresse : la page, la route et l'écran lisent les mêmes. */
export function filtresDepuis(p: { get(cle: string): string | null }): FiltresActivite {
  const service = p.get("service");
  const q = p.get("q")?.trim();
  return {
    compteur: p.get("compteur") || null,
    service: (SERVICES as readonly string[]).includes(service ?? "") ? (service as Service) : null,
    recherche: q ? q.slice(0, 80) : null,
    termines: p.get("termines") === "true",
    inclureTest: p.get("test") === "true",
  };
}

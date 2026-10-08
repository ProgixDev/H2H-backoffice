// Les formes que rendent `bo_dossiers_lister`, `bo_dossiers_compteurs` et
// `bo_dossier_lire` (migration 20260926007000 de hand-to-hand).

export const PERIMETRES = ["miens", "equipe", "tous"] as const;
export type Perimetre = (typeof PERIMETRES)[number];

export const LIBELLE_PERIMETRE: Record<Perimetre, string> = {
  miens: "Mes dossiers",
  equipe: "Mon équipe",
  tous: "Tous les dossiers",
};

export type Priorite = "normale" | "haute" | "urgence";
export const LIBELLE_PRIORITE: Record<Priorite, string> = { normale: "Normale", haute: "Haute", urgence: "Urgence" };

// Les libellés courts des groupes du §5.1, pour la pastille (le bandeau a les longs).
export const CATEGORIE_COURTE: Record<string, string> = {
  urgence_securite: "Urgence sécurité",
  echec: "En échec",
  contestation: "Contestation",
  echeance_depassee: "Échéance dépassée",
  reponse_recue: "Réponse reçue",
  echeance_proche: "Échéance proche",
  sans_responsable: "Sans responsable",
  pret_decision: "Prêt pour décision",
};

export const EQUIPES = ["support", "logistique", "finance", "moderation", "direction"] as const;
export const LIBELLE_EQUIPE: Record<string, string> = {
  support: "Support",
  logistique: "Logistique",
  finance: "Finance",
  moderation: "Modération",
  direction: "Direction",
  publicite: "Publicité",
  analyste: "Analyste",
};

export type Dossier = {
  id: string;
  ref: string;
  source:
    | "operation"
    | "tache"
    | "echeance"
    | "notification"
    | "manuel"
    | "securite"
    | "rapprochement"
    | "recours"
    | "verification"
    | "signalement"
    | "support"
    | "verification_compte"
    | "retractation"
    | "contestation"
    /** La contestation d'un refus du colis (hand-to-hand 20261008009000). */
    | "incident";
  titre: string;
  motif: string | null;
  categorie: string;
  priorite: Priorite;
  securite: boolean;
  equipe: string;
  responsable: string | null;
  responsable_nom: string | null;
  escalade_vers: string | null;
  echeance_traitement: string;
  reponse_recue_le: string | null;
  statut: "ouvert" | "clos";
  cree_le: string;
  clos_le: string | null;
  /**
   * Une opération, un travail automatique — ou une annonce : celle d'un recours contre une décision de
   * modération, celle qui attend sa vérification avant publication, celle qu'on a signalée. Nul avec un
   * `objet_id` : un compte (un recours contre une sanction, des signalements).
   */
  objet_table: "orders" | "courtage_listings" | "live_sessions" | "taches" | "products" | "je_cherche_demandes" | null;
  objet_id: string | null;
  objet_ref: string | null;
  etape_libelle: string | null;
  action_attendue: string | null;
  acteur_attendu: string | null;
  echeance: string | null;
  alerte_libelle: string | null;
  dernier_evenement_le: string;
  est_test: boolean;
};

/** Ce qui clôt tout seul un dossier né d'une source automatique. Un ticket et une alerte de sécurité se closent à la main. */
export const CLOTURE_AUTOMATIQUE: Record<Exclude<Dossier["source"], "manuel" | "securite">, string> = {
  operation: "Ce dossier se clôt tout seul quand l’opération n’attend plus l’équipe.",
  tache: "Ce dossier se clôt tout seul quand le travail tourne de nouveau normalement.",
  echeance: "Ce dossier se clôt tout seul quand l’échéance est exécutée.",
  notification:
    "Ce dossier se clôt tout seul dès que l’avis est lu, remis ou renvoyé — un push se renvoie depuis Documents et paramètres › Notifications (« Non parvenues »). S’il échoue encore, le dossier se rouvre.",
  rapprochement:
    "Ce dossier se clôt tout seul quand l’écart disparaît d’un rapprochement suivant, ou quand la Finance l’explique (Paiements et comptabilité › Rapprochement).",
  recours:
    "Ce dossier se clôt tout seul quand le recours est examiné : sur la fiche du compte (Utilisateurs) pour une sanction, sur celle de l’annonce (Annonces) pour une décision de modération, sur celle de ce qui a été signalé pour l’examen d’un signalement.",
  verification:
    "Ce dossier se clôt tout seul quand l’équipe autorise ou refuse la publication, sur la fiche de l’annonce (Annonces).",
  support:
    "Ce dossier se clôt tout seul quand l’équipe répond, sur la fiche du compte (Utilisateurs). Un nouveau message de la personne le rouvre.",
  verification_compte:
    "Ce dossier se clôt tout seul quand l’équipe clôt la demande de vérification, sur la fiche du compte (Utilisateurs). La réponse de la personne arrive dans son fil avec le support.",
  retractation:
    "Ce dossier se clôturera tout seul quand le remboursement sera exécuté : le remboursement d’une option, et son avoir, arrivent avec la tranche suivante de Visibilité et publicité. La somme due et l’échéance légale sont dans le motif.",
  contestation:
    "Ce dossier se clôt tout seul avec l’issue de la contestation, que Stripe annonce : gagnée, la somme est rétablie ; perdue, la banque la garde. Les preuves se fournissent dans le tableau de bord Stripe, avant l’échéance du motif.",
  incident:
    "Ce dossier se clôt tout seul quand l’équipe examine la contestation du refus du colis, dans l’onglet Livraison de la fiche de l’opération : refus maintenu, ou dit injustifié.",
  signalement:
    "Ce dossier se clôt tout seul quand plus aucun signalement n’attend : ils s’examinent sur la fiche de ce qu’ils visent — l’annonce, la recherche ou le compte. Un nouveau signalement le rouvre.",
};

export type CompteurDossier = { code: string; libelle: string; description: string; nombre: number };

export type EvenementDossier = {
  id: number;
  le: string;
  genre: "ouverture" | "reouverture" | "cloture" | "attribution" | "priorite" | "note" | "demande_preuve" | "escalade" | "reponse";
  texte: string | null;
  detail: Record<string, unknown>;
  acteur: string;
};

export type DetailDossier = {
  dossier: Dossier;
  evenements: EvenementDossier[];
  equipiers: { profil: string; nom: string }[];
};

export type ReponseFile = { compteurs: CompteurDossier[]; dossiers: Dossier[] };

export type FiltresFile = { perimetre: Perimetre; categorie: string | null; clos: boolean; inclureTest: boolean };

export function filtresFileDepuis(p: { get(cle: string): string | null }): FiltresFile {
  const perimetre = p.get("perimetre");
  return {
    perimetre: (PERIMETRES as readonly string[]).includes(perimetre ?? "") ? (perimetre as Perimetre) : "tous",
    categorie: p.get("categorie") || null,
    clos: p.get("clos") === "true",
    inclureTest: p.get("test") === "true",
  };
}

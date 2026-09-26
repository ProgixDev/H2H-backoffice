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
  source: "operation" | "tache" | "echeance" | "notification" | "manuel" | "securite";
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
  objet_table: "orders" | "courtage_listings" | "live_sessions" | "taches" | null;
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
  notification: "Ce dossier se clôt tout seul dès que l’avis est lu, ou remis.",
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

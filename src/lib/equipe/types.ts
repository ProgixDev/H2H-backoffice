// Les formes que rendent les fonctions `bo_*` de la base (migrations
// 20260925172000 et 20260925173000 de hand-to-hand).

export const ROLES = [
  "direction",
  "support",
  "moderation",
  "logistique",
  "finance",
  "publicite",
  "analyste",
] as const;
export type Role = (typeof ROLES)[number];

export const LIBELLE_ROLE: Record<Role, string> = {
  direction: "Direction",
  support: "Support",
  moderation: "Modération",
  logistique: "Logistique",
  finance: "Finance",
  publicite: "Publicité",
  analyste: "Analyste (lecture seule)",
};

export type MoiMembre = {
  membre: true;
  profil: string;
  email: string | null;
  equipe: string | null;
  est_test: boolean;
  origine: "production" | "apercu" | "developpement";
  emetteur: "production" | "test";
  roles: Role[];
  permissions: string[];
};

export type MoiRefuse = {
  membre: false;
  /** L'indice de `app.bo_evaluer` : BO_AUTHENTIFICATION, BO_EQUIPE, BO_2FA… */
  raison: string;
  /** Un équipier reconnu mais bloqué (second facteur, origine…). */
  equipier: boolean;
  /** Une invitation validée attend l'adresse de ce compte. */
  invitation: boolean;
};

export type Moi = MoiMembre | MoiRefuse;

export type Membre = {
  profil: string;
  email: string | null;
  nom: string | null;
  statut: "actif" | "suspendu" | "sorti";
  equipe: string | null;
  est_test: boolean;
  comptes_personnels: number;
  depuis: string;
  statut_motif: string | null;
  roles: Role[];
};

export type Invitation = {
  id: string;
  email: string;
  roles: Role[];
  statut: "en_validation" | "valide";
  est_test: boolean;
  expire_le: string;
  motif: string;
  validation: string | null;
};

export type Equipe = { membres: Membre[]; invitations: Invitation[] };

export type Validation = {
  id: string;
  action: string;
  libelle: string;
  cible: string | null;
  cible_id: string | null;
  parametres: Record<string, unknown>;
  motif: string;
  demandeur: string;
  demandeur_email: string | null;
  demande_le: string;
  expire_le: string;
  est_test: boolean;
  peut_decider: boolean;
};

export type LigneJournal = {
  id: number;
  le: string;
  genre: "action" | "consultation" | "decision" | "financier" | "parametre" | "acces";
  action: string;
  entite: string;
  entite_id: string | null;
  entite_ref: string | null;
  motif: string | null;
  resultat: string | null;
  avant: unknown;
  apres: unknown;
  validation: string | null;
  acteur: string | null;
  acteur_email: string | null;
};

export function peut(moi: MoiMembre, permission: string): boolean {
  return moi.permissions.includes(permission);
}

// Les avis tels que le back-office les lit (`bo_avis_lister`, `bo_avis_compteurs`,
// `bo_avis_lire`) — hand-to-hand `20261003001000` : chaque avis publié ou retiré,
// ses signalements, les décisions de l'équipe, son effet sur la moyenne affichée.

/** Publié, ou retiré par l'équipe (il ne se lit plus et ne compte plus dans la moyenne). */
export type StatutAvis = "publie" | "retire";

/** En tant que quoi la personne notée l'a été. */
export type RoleAvis = "seller" | "buyer" | "transporter" | "relais";

export type FiltreAvis = "publies" | "retires" | "signales";

/** Dans l'ordre du bandeau : ce qui attend d'abord. */
export const FILTRES_AVIS: FiltreAvis[] = ["signales", "publies", "retires"];

export const LIBELLE_FILTRE_AVIS: Record<FiltreAvis, string> = {
  signales: "Signalés",
  publies: "Publiés",
  retires: "Retirés",
};

export const LIBELLE_STATUT_AVIS: Record<StatutAvis, string> = {
  publie: "Publié",
  retire: "Retiré",
};

export const LIBELLE_ROLE_AVIS: Record<RoleAvis, string> = {
  seller: "vendeur",
  buyer: "acheteur",
  transporter: "cotransporteur",
  relais: "point relais",
};

/** Un avis dans la liste (`public.bo_avis`). */
export type AvisLigne = {
  id: string;
  ref: string;
  depose_le: string;
  retire_le: string | null;
  statut: StatutAvis;
  note: number;
  commentaire: string | null;
  role: RoleAvis;
  auteur: string | null;
  auteur_id: string;
  destinataire: string | null;
  destinataire_id: string;
  commande_id: string | null;
  commande_ref: string | null;
  mission_id: string | null;
  signalements: number;
  signalements_ouverts: number;
  est_test: boolean;
};

export type CompteursAvis = Record<FiltreAvis | "tous", number>;

export type FiltresAvis = { filtre: FiltreAvis | null; q: string | null; test: boolean };

/** Une décision de l'équipe sur un avis. Ne change plus. */
export type DecisionAvis = {
  reference: string;
  decision: "retirer" | "retablir";
  /** Ce que l'auteur a lu ; rien pour un rétablissement. */
  message: string | null;
  /** Ce que l'équipe garde pour elle. */
  motif: string;
  par: string | null;
  le: string;
};

/** Un signalement de l'avis. Son examen arrive avec la tranche suivante. */
export type SignalementAvis = {
  id: string;
  raison: string;
  raison_libelle: string | null;
  explication: string;
  le: string;
  /** Qui a signalé — nul pour qui ne peut pas modérer. */
  signale_par: string | null;
};

type Possible = { possible: boolean; raison: string | null };

/**
 * La fiche d'un avis (`bo_avis_lire`).
 * ⚠️ `signalements` Y EST LA LISTE, PAS LE NOMBRE : la base la pose par-dessus le compte de la ligne
 * (`to_jsonb(a) || {signalements: [...]}`).
 */
export type FicheAvis = Omit<AvisLigne, "signalements"> & {
  commande_statut: string | null;
  /** La moyenne affichée du profil noté, et ce qu'elle serait sans cet avis, ou avec lui (R19.1). */
  moyenne: {
    affichee: number | null;
    nombre: number;
    sans_cet_avis: number | null;
    avec_cet_avis: number | null;
  } | null;
  decisions: DecisionAvis[];
  signalements: SignalementAvis[];
  possibles: { retirer: Possible; retablir: Possible };
};

/** Ce que rend une décision. */
export type AvisModere = {
  avis: string;
  decision: "retirer" | "retablir";
  reference: string;
  moyenne_avant: number | null;
  moyenne_apres: number | null;
  nombre_apres: number;
};

export const cheminAvis = (id: string) => `/avis-utilisateurs/${encodeURIComponent(id)}`;

/** L'adresse d'une liste filtrée : les filtres restent dans l'adresse (R4.10). */
export function adresseAvis(f: FiltresAvis): string {
  const p = new URLSearchParams();
  if (f.filtre) p.set("filtre", f.filtre);
  if (f.q) p.set("q", f.q);
  if (f.test) p.set("test", "1");
  const s = p.toString();
  return s ? `/avis-utilisateurs?${s}` : "/avis-utilisateurs";
}

const DIXIEMES = new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Une moyenne en mots : « 4,5 / 5 », ou « aucune note » quand il n'y a plus d'avis — jamais zéro. */
export const moyenneDite = (m: number | null) => (m === null ? "aucune note" : `${DIXIEMES.format(Number(m))} / 5`);

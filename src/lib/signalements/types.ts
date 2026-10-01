// LES SIGNALEMENTS D'UNE ANNONCE, D'UNE RECHERCHE OU D'UN COMPTE, ET LEUR EXAMEN
// (hand-to-hand `20260930009000`) : la base dit tout — leurs mots, leur priorité,
// leur examen, ce que l'équipier qui lit peut en faire. L'écran le montre.

/** Ce qu'un signalement vise. */
export type GenreSignale = "annonce" | "recherche" | "utilisateur";
export type IssueSignalement = "fonde" | "non_fonde";
export type PrioriteSignalement = "normale" | "elevee" | "tres_elevee" | "critique";

/** Un signalement tel que l'équipe le lit (`bo_signalements_cible`). */
export type SignalementLu = {
  id: string;
  raison: string;
  raison_libelle: string | null;
  explication: string | null;
  /** Les preuves écrites : un lien, un message recopié, une précision. Les captures ne quittent pas encore le téléphone. */
  preuves: { genre: string | null; texte: string | null }[];
  priorite: PrioriteSignalement;
  bonne_foi: boolean;
  le: string;
  /** Qui a signalé — nul pour qui ne peut pas examiner. */
  signale_par: string | null;
  examen: {
    id: string;
    reference: string;
    issue: IssueSignalement;
    /** Ce que chaque personne qui a signalé a lu. */
    reponse: string;
    /** Ce que l'équipe garde pour elle. */
    motif: string;
    par: string | null;
    le: string;
  } | null;
};

/** Les signalements d'une cible, son dossier « À traiter », et ce que l'équipier peut faire. */
export type SignalementsCible = {
  signalements: SignalementLu[];
  a_examiner: number;
  dossier: { id: string; reference: string; statut: "ouvert" | "clos" } | null;
  possibles: { examiner: boolean; raison: string | null };
};

/** Ce que rend l'examen. */
export type ExamenSignalements = {
  examen: string;
  reference: string;
  genre: GenreSignale;
  cible: string;
  issue: IssueSignalement;
  signalements: number;
  restants: number;
};

export const LIBELLE_ISSUE_SIGNALEMENT: Record<IssueSignalement, string> = {
  fonde: "Fondé",
  non_fonde: "Non fondé",
};

/** Ce qu'un signalement vise, dit dans une phrase. */
export const CIBLE_DITE: Record<GenreSignale, string> = {
  annonce: "cette annonce",
  recherche: "cette recherche",
  utilisateur: "ce compte",
};

/** Ce que l'avis de l'examen dit à chaque personne qui a signalé, selon l'issue — les mots de la base. */
export const PHRASE_ISSUE: Record<IssueSignalement, string> = {
  fonde: "L’équipe HandtoHand a constaté un manquement à ses règles et a pris les mesures nécessaires.",
  non_fonde: "L’équipe HandtoHand n’a pas constaté de manquement à ses règles.",
};

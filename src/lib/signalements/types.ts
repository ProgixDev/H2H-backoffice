// LES SIGNALEMENTS D'UNE ANNONCE, D'UNE RECHERCHE OU D'UN COMPTE, ET LEUR EXAMEN
// (hand-to-hand `20260930009000`) : la base dit tout — leurs mots, leur priorité,
// leur examen, ce que l'équipier qui lit peut en faire. L'écran le montre.
// Un examen « non fondé » se conteste par la personne qui a signalé
// (`20261001001000`) : son recours se lit avec son signalement.
import { cheminAnnonce } from "@/lib/annonces/types";
import { cheminLive } from "@/lib/lives/types";
import { cheminCompte, type DecisionRecours, type RecoursLu } from "@/lib/utilisateurs/types";

/** Ce qu'un signalement vise — un live aussi (20261002007000). */
export type GenreSignale = "annonce" | "recherche" | "utilisateur" | "live";

/**
 * Le moment du live où la personne a signalé (20261002007000), gelé par la base :
 * un live ne se revoit pas, et c'est ce qui dit à l'équipe quel article était à
 * l'écran.
 */
export type ContexteLive = {
  moment: "attente" | "intro" | "article" | "conclusion" | "termine" | null;
  article_position: number | null;
  article_titre: string | null;
  article_phase: "presentation" | "propositions" | "choix" | "pause" | null;
};
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
    /** Revu sur le recours d'une personne qui avait signalé (20261001001000). */
    revu: boolean;
  } | null;
  /**
   * Le recours de la personne qui a fait ce signalement contre son examen « non fondé »
   * (20261001001000) — le même que contre une sanction ou une décision de modération.
   */
  recours: RecoursLu | null;
  /** Le moment du live quand elle l'a signalé — nul pour ce qui n'est pas un live. */
  contexte: ContexteLive | null;
};

/** Les signalements d'une cible, son dossier « À traiter », et ce que l'équipier peut faire. */
export type SignalementsCible = {
  signalements: SignalementLu[];
  a_examiner: number;
  /** Les recours contre leurs examens qui attendent une réponse. */
  recours_a_examiner: number;
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
  live: "ce live",
};

/** La mesure qui suit un examen « fondé » : un autre geste, sur la même fiche. */
export const MESURE_DITE: Record<GenreSignale, string> = {
  annonce: "masquer, retirer, sanctionner",
  recherche: "masquer, retirer, sanctionner",
  utilisateur: "masquer, retirer, sanctionner",
  live: "retirer un article, arrêter la diffusion, sanctionner l’hôte",
};

const PHASE_DITE: Record<NonNullable<ContexteLive["article_phase"]>, string> = {
  presentation: "présentation",
  propositions: "offres",
  choix: "choix du vendeur",
  pause: "pause",
};

/** Le moment d'un live, dit en une ligne : « Pendant l'article 2 « Montre » · offres ». */
export function momentLive(c: ContexteLive): string {
  switch (c.moment) {
    case "attente":
      return "Avant le direct";
    case "intro":
      return "Pendant l’introduction";
    case "conclusion":
      return "Pendant la conclusion";
    case "termine":
      return "Après la fin du live";
    case "article":
      return [
        `Pendant l’article ${c.article_position ?? "?"}`,
        c.article_titre ? ` « ${c.article_titre} »` : "",
        c.article_phase ? ` · ${PHASE_DITE[c.article_phase]}` : "",
      ].join("");
    default:
      return "Moment inconnu";
  }
}

/** La fiche de ce qu'un signalement vise : là où il s'examine, et où son examen se relit. */
export function cheminCible(genre: GenreSignale, cible: string): string {
  return genre === "utilisateur" ? cheminCompte(cible) : genre === "live" ? cheminLive(cible) : cheminAnnonce(cible);
}

/** Ce que l'avis de l'examen dit à chaque personne qui a signalé, selon l'issue — les mots de la base. */
export const PHRASE_ISSUE: Record<IssueSignalement, string> = {
  fonde: "L’équipe HandtoHand a constaté un manquement à ses règles et a pris les mesures nécessaires.",
  non_fonde: "L’équipe HandtoHand n’a pas constaté de manquement à ses règles.",
};

/** Un examen « non fondé » se conteste : l'avis le dit, après la réponse de l'équipe (20261001001000). */
export const PHRASE_CONTESTER = "Vous pouvez contester cette décision pendant six mois, depuis l’état de votre compte.";

/** Ce que rend l'examen d'un recours contre l'examen de signalements. */
export type RecoursSignalementExamine = {
  recours: string;
  examen: string;
  genre: GenreSignale;
  cible: string;
  decision: DecisionRecours;
};

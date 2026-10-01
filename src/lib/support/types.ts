// LE FIL D'UN COMPTE AVEC LE SUPPORT (hand-to-hand `20261001002000`) : la base dit
// tout — les messages, qui les a écrits, l'équipier derrière chaque réponse, le
// dossier « À traiter », ce que l'équipier qui lit peut en faire. L'écran le montre.
//
// ⚠️ LA PERSONNE LIT « Support HandtoHand » : l'équipier qui écrit n'est qu'au
// journal — et ici, pour l'équipe.

/** Un message du fil : de la personne, ou du support — et alors, quel équipier l'a écrit. */
export type MessageSupport = {
  id: string;
  de: "personne" | "support";
  texte: string | null;
  genre: string;
  le: string;
  /** La personne l'a lu (pour un message du support). */
  lu: boolean;
  /** L'équipier qui a écrit, pour un message du support ; nul sinon. */
  par: string | null;
};

/** Le fil d'un compte avec le support, son dossier, et ce que l'équipier peut faire. */
export type FilSupportLu = {
  /** Nul : aucun fil encore — le premier message de l'équipe l'ouvre. */
  conversation: string | null;
  /** Les deux cents derniers messages, du plus ancien au plus récent. */
  messages: MessageSupport[];
  tronque: boolean;
  dossier: { id: string; reference: string; statut: "ouvert" | "clos" } | null;
  possibles: { ecrire: boolean; raison: string | null };
};

/** Ce que rend un message écrit au nom du support. */
export type MessageSupportEcrit = { conversation: string; message: string; le: string };

/** Le nom sous lequel la personne lit l'équipe (décision D28, à confirmer avec le client). */
export const NOM_SUPPORT = "Support HandtoHand";

/** Les bornes que la base impose à un message. */
export const MESSAGE_MIN = 2;
export const MESSAGE_MAX = 4000;

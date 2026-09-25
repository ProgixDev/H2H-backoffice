import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

// Les refus de connexion, en français et sans nommer le prestataire : les
// messages bruts arrivent en anglais et parlent de Clerk.
const MESSAGES: Record<string, string> = {
  form_param_format_invalid: "Cette adresse e-mail n’est pas valide.",
  form_param_nil: "Ce champ est obligatoire.",
  form_identifier_not_found: "Aucun compte ne correspond à cette adresse.",
  form_identifier_exists: "Un compte existe déjà pour cette adresse.",
  form_code_incorrect: "Code incorrect.",
  verification_expired: "Ce code a expiré : demandez-en un nouveau.",
  verification_failed: "Trop d’essais pour ce code : demandez-en un nouveau.",
  too_many_requests: "Trop de tentatives : patientez un instant avant de réessayer.",
  session_exists: "Vous êtes déjà connecté.",
  not_allowed_access: "Cette adresse n’est pas autorisée à se connecter.",
  captcha_invalid: "La vérification anti-robot a échoué : rechargez la page.",
  captcha_unavailable: "La vérification anti-robot est indisponible : rechargez la page.",
};

export const MESSAGE_PAR_DEFAUT = "La connexion n’a pas abouti. Réessayez dans un instant.";

/** Le message à montrer pour un code d'erreur du service d'authentification. */
export function messagePourCode(code: string | null | undefined): string {
  return (code && MESSAGES[code]) || MESSAGE_PAR_DEFAUT;
}

/** Le code d'erreur d'une réponse du service d'authentification, s'il y en a un. */
export function codeErreur(erreur: unknown): string | null {
  return isClerkAPIResponseError(erreur) ? (erreur.errors[0]?.code ?? null) : null;
}

export const messageErreur = (erreur: unknown) => messagePourCode(codeErreur(erreur));

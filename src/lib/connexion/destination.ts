/**
 * La page où revenir après la connexion — sur ce site, et nulle part ailleurs.
 *
 * ⚠️ `redirect_url` ARRIVE PAR L'ADRESSE, DONC DE N'IMPORTE QUI. Un lien piégé
 * `…/sign-in?redirect_url=https://ailleurs.example` renverrait un équipier
 * fraîchement connecté vers un site tiers. On ne garde qu'un chemin de ce site :
 * relatif, ou absolu mais sur le même hôte.
 */
export function destinationSure(brut: string | string[] | undefined, hote: string | null): string {
  const valeur = Array.isArray(brut) ? brut[0] : brut;
  if (!valeur) return "/";

  let url: URL;
  try {
    url = new URL(valeur, "http://hote.invalide");
  } catch {
    return "/";
  }

  const relatif = valeur.startsWith("/") && !valeur.startsWith("//") && !valeur.startsWith("/\\");
  const memeHote = !relatif && hote !== null && url.host === hote && /^https?:$/.test(url.protocol);
  if (!relatif && !memeHote) return "/";

  // Revenir à la connexion ferait tourner en rond.
  if (/^\/(sign-in|sign-up)(\/|$)/.test(url.pathname)) return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}

import { redirect } from "next/navigation";

/**
 * Plus de page d'inscription à part : le formulaire de connexion crée le compte
 * d'une adresse invitée à sa première connexion. Cette adresse reste celle que
 * le service d'authentification connaît (`NEXT_PUBLIC_CLERK_SIGN_UP_URL`).
 */
export default async function Inscription({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const retour = typeof p.redirect_url === "string" ? `?redirect_url=${encodeURIComponent(p.redirect_url)}` : "";
  redirect(`/sign-in${retour}`);
}

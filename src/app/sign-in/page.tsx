import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { FormulaireConnexion } from "@/components/connexion/FormulaireConnexion";
import { CadreConnexion } from "@/components/marque/CadreConnexion";
import { destinationSure } from "@/lib/connexion/destination";

export const metadata: Metadata = { title: "Connexion" };

/**
 * La connexion au back-office — notre formulaire, pas celui du prestataire
 * d'authentification. Le même formulaire crée le compte d'une adresse invitée
 * à sa première connexion.
 */
export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const destination = destinationSure(p.redirect_url, (await headers()).get("host"));

  // Déjà connecté : rien à faire ici.
  const { userId } = await auth();
  if (userId) redirect(destination);

  return (
    <CadreConnexion note="Réservé à l’équipe HandtoHand. À la première connexion, votre compte se crée avec le code reçu ; seule une invitation de la Direction ouvre le back-office.">
      <FormulaireConnexion destination={destination} />
    </CadreConnexion>
  );
}

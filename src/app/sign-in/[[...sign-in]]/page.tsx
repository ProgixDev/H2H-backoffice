import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { CadreConnexion } from "@/components/marque/CadreConnexion";

export const metadata: Metadata = { title: "Connexion" };

/**
 * ⚠️ `withSignUp` : UNE ADRESSE D'ÉQUIPE N'A PAS DE COMPTE À SA PREMIÈRE VISITE.
 * La Direction invite une adresse dédiée ; le compte Clerk n'existe qu'après la
 * première connexion. Sans ce réglage, la personne invitée lisait « nous
 * n'avons pas trouvé de compte » ; avec, la même page crée le compte par le
 * code reçu. Créer un compte n'ouvre rien : c'est l'invitation, validée à deux,
 * qui ouvre le back-office (`bo_rejoindre`).
 */
export default function Connexion() {
  return (
    <CadreConnexion note="Réservé à l’équipe HandtoHand : connectez-vous avec votre adresse d’équipe. À la première connexion, le compte se crée avec le code reçu.">
      <SignIn withSignUp />
    </CadreConnexion>
  );
}

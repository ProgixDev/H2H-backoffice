import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { CadreConnexion } from "@/components/marque/CadreConnexion";

export const metadata: Metadata = { title: "Connexion" };

export default function Connexion() {
  return (
    <CadreConnexion note="Réservé à l’équipe HandtoHand : connectez-vous avec votre adresse d’équipe.">
      <SignIn />
    </CadreConnexion>
  );
}

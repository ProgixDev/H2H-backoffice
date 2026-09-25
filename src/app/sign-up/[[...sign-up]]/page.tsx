import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { CadreConnexion } from "@/components/marque/CadreConnexion";

export const metadata: Metadata = { title: "Créer mon compte d’équipe" };

/**
 * La création du compte d'équipe DÉDIÉ, avec l'adresse que la Direction a
 * invitée. Créer un compte ici ne donne aucun accès : c'est l'invitation,
 * validée à deux, qui ouvre le back-office (`bo_rejoindre`).
 */
export default function CreationCompte() {
  return (
    <CadreConnexion note="Utilisez l’adresse à laquelle la Direction vous a invité. Sans invitation validée, le compte n’ouvre rien.">
      <SignUp />
    </CadreConnexion>
  );
}

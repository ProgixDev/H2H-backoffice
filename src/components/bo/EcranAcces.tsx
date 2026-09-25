"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SignOutButton, useClerk } from "@clerk/nextjs";
import { KeyRound, LogOut, ShieldAlert, UserPlus } from "lucide-react";
import { LogoBadge } from "@/components/marque/LogoBadge";
import { Button } from "@/components/ui/button";
import { rejoindreEquipe } from "@/lib/equipe/actions";

type Props = { raison: string; invitation: boolean; equipier: boolean; email: string | null };

/**
 * L'écran de ceux qui n'entrent pas — ou pas encore.
 *
 * ⚠️ CHAQUE RAISON A SON GESTE. Un « accès refusé » sans suite laisserait un
 * équipier légitime bloqué devant une porte dont il ne connaît pas la clé : pas
 * de second facteur, connexion trop ancienne, invitation qui l'attend.
 */
export function EcranAcces({ raison, invitation, equipier, email }: Props) {
  const router = useRouter();
  const { openUserProfile } = useClerk();
  const [enCours, demarrer] = useTransition();
  const [erreur, setErreur] = useState<{ indice: string | null; message: string } | null>(null);

  const doubleAuthentification = raison === "BO_2FA" || erreur?.indice === "BO_2FA";

  const rejoindre = () =>
    demarrer(async () => {
      setErreur(null);
      const r = await rejoindreEquipe();
      if (r.ok) router.replace("/");
      else setErreur({ indice: r.indice, message: r.message });
    });

  let titre: string;
  let texte: React.ReactNode;
  let actions: React.ReactNode;

  if (doubleAuthentification) {
    titre = "Activez la double authentification";
    texte = (
      <>
        Le back-office exige une application d’authentification (Google Authenticator, 1Password,
        Microsoft Authenticator…). Ajoutez-la dans votre compte, rubrique <strong>Sécurité</strong>,
        puis déconnectez-vous et reconnectez-vous pour l’utiliser.
      </>
    );
    actions = (
      <>
        <Button onClick={() => openUserProfile()}>
          <KeyRound /> Ouvrir mon compte
        </Button>
        <SignOutButton>
          <Button variant="outline">
            <LogOut /> Se reconnecter
          </Button>
        </SignOutButton>
      </>
    );
  } else if (invitation) {
    titre = "Une invitation vous attend";
    texte = (
      <>
        La Direction a invité <strong>{email}</strong> à rejoindre l’équipe HandtoHand. Rejoindre crée
        votre accès au back-office avec les rôles décidés.
      </>
    );
    actions = (
      <Button onClick={rejoindre} disabled={enCours}>
        <UserPlus /> {enCours ? "Un instant…" : "Rejoindre l’équipe"}
      </Button>
    );
  } else if (raison === "BO_RECONNEXION") {
    titre = "Reconnectez-vous";
    texte = "Votre dernière connexion date de plus de douze heures. Par sécurité, le back-office demande de la refaire.";
    actions = (
      <SignOutButton>
        <Button>
          <LogOut /> Se reconnecter
        </Button>
      </SignOutButton>
    );
  } else if (raison === "BO_ORIGINE" || raison === "BO_EMETTEUR") {
    titre = "Pas depuis cet environnement";
    texte =
      "Ce compte d’équipe agit sur des données réelles : il ne peut ouvrir le back-office que depuis son adresse de production. Les environnements de test sont réservés aux comptes de test.";
    actions = null;
  } else if (raison === "BO_SESSION") {
    titre = "Terminez la connexion";
    texte = "Votre session attend encore une étape de connexion.";
    actions = (
      <Button onClick={() => router.push("/sign-in")}>Reprendre la connexion</Button>
    );
  } else {
    titre = equipier ? "Accès suspendu" : "Réservé à l’équipe HandtoHand";
    texte = equipier
      ? "Votre accès au back-office est suspendu. Rapprochez-vous de la Direction."
      : "Le back-office s’ouvre avec un compte d’équipe dédié, invité par la Direction. Ce compte n’en est pas un.";
    actions = (
      <SignOutButton>
        <Button variant="outline">
          <LogOut /> Se déconnecter
        </Button>
      </SignOutButton>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center" style={{ boxShadow: "var(--ombre-carte)" }}>
        <div className="flex justify-center">
          <LogoBadge taille={56} />
        </div>
        <h1 className="mt-5 text-h2 font-semibold">{titre}</h1>
        <p className="mt-2 text-corps text-muted-foreground">{texte}</p>
        {erreur && !doubleAuthentification && (
          <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-h2h-error-light p-3 text-left text-legende text-h2h-error">
            <ShieldAlert className="size-4 shrink-0" /> {erreur.message}
          </p>
        )}
        {actions && <div className="mt-6 flex flex-wrap justify-center gap-2">{actions}</div>}
        {email && <p className="mt-6 text-[11px] text-muted-foreground">Connecté en tant que {email}</p>}
      </div>
    </main>
  );
}

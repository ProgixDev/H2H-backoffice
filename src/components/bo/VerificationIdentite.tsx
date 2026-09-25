"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useSession } from "@clerk/nextjs";
import { KeyRound, Mail, ShieldCheck } from "lucide-react";
import { BoutonPrincipal } from "@/components/connexion/BoutonPrincipal";
import { ChampCode } from "@/components/connexion/ChampCode";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { messageErreur } from "@/lib/connexion/erreurs";

// Les types de la session, tirés du hook plutôt que d'un paquet non déclaré.
type Session = NonNullable<ReturnType<typeof useSession>["session"]>;
type Verification = Awaited<ReturnType<Session["startVerification"]>>;
type Niveau = Parameters<Session["startVerification"]>[0]["level"];

export type DemandeVerification = {
  level: Niveau | undefined;
  complete: () => void;
  cancel: () => void;
};

const Contexte = createContext<((d: DemandeVerification) => void) | null>(null);

/** Ouvre notre fenêtre de vérification ; `null` hors du back-office. */
export const useDemandeVerification = () => useContext(Contexte);

/**
 * La vérification d'identité avant un geste sensible — notre fenêtre, pas celle
 * du prestataire d'authentification.
 *
 * ⚠️ LA BASE DÉCIDE DE CE QUI EST DEMANDÉ. Un geste refusé `BO_REVERIF` revient
 * avec ce qu'il faut revérifier (`reverificationError`) ; cette fenêtre le fait
 * vérifier, puis le geste repart avec la MÊME clé d'action : la base rend le
 * résultat du premier essai s'il était passé.
 */
export function FournisseurVerification({ children }: { children: React.ReactNode }) {
  const [demande, setDemande] = useState<{ n: number; d: DemandeVerification } | null>(null);
  const demander = useCallback(
    (d: DemandeVerification) => setDemande((avant) => ({ n: (avant?.n ?? 0) + 1, d })),
    [],
  );
  return (
    <Contexte.Provider value={demander}>
      {children}
      {demande && <FenetreVerification key={demande.n} demande={demande.d} fermer={() => setDemande(null)} />}
    </Contexte.Provider>
  );
}

type Etape = { nom: "second"; secours: boolean } | { nom: "email-envoi" } | { nom: "email-code" };

function FenetreVerification({ demande, fermer }: { demande: DemandeVerification; fermer: () => void }) {
  const { session } = useSession();
  const niveau: Niveau = demande.level ?? "second_factor";
  const [etape, setEtape] = useState<Etape>(
    niveau === "second_factor" ? { nom: "second", secours: false } : { nom: "email-envoi" },
  );
  const [verification, setVerification] = useState<Verification | null>(null);
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);

  const annuler = () => {
    demande.cancel();
    fermer();
  };

  // Chaque étape passe par ici : un appel au service, ses refus en français.
  const executer = async (tache: (s: Session) => Promise<void>) => {
    if (!session) return setErreur("Votre session a expiré : reconnectez-vous.");
    setErreur(null);
    setEnCours(true);
    try {
      await tache(session);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnCours(false);
    }
  };

  const demarree = async (s: Session) => {
    if (verification) return verification;
    const v = await s.startVerification({ level: niveau });
    setVerification(v);
    return v;
  };

  const suivre = async (s: Session, v: Verification) => {
    setVerification(v);
    setCode("");
    if (v.status === "complete") {
      // ⚠️ LE JETON SE RAFRAÎCHIT AVANT LA REPRISE : le geste repart vers le
      // serveur, qui lit la fraîcheur du second facteur dans ce jeton.
      await s.getToken({ skipCache: true }).catch(() => null);
      demande.complete();
      fermer();
    } else if (v.status === "needs_first_factor") {
      setEtape({ nom: "email-envoi" });
    } else {
      const strategies = (v.supportedSecondFactors ?? []).map((f) => f.strategy);
      setEtape({ nom: "second", secours: !strategies.includes("totp") });
    }
  };

  const envoyerEmail = () =>
    executer(async (s) => {
      const v = await demarree(s);
      if (v.status !== "needs_first_factor") return suivre(s, v);
      const facteur = (v.supportedFirstFactors ?? []).find((f) => f.strategy === "email_code");
      if (!facteur || !("emailAddressId" in facteur)) {
        throw new Error("aucun code par e-mail possible");
      }
      await s.prepareFirstFactorVerification({ strategy: "email_code", emailAddressId: facteur.emailAddressId });
      setEtape({ nom: "email-code" });
    });

  const verifierEmail = (e: React.FormEvent) => {
    e.preventDefault();
    return executer(async (s) => suivre(s, await s.attemptFirstFactorVerification({ strategy: "email_code", code })));
  };

  const verifierSecond = (e: React.FormEvent) => {
    e.preventDefault();
    if (etape.nom !== "second") return;
    return executer(async (s) => {
      const v = await demarree(s);
      if (v.status !== "needs_second_factor") return suivre(s, v);
      const suite = await s.attemptSecondFactorVerification(
        etape.secours ? { strategy: "backup_code", code } : { strategy: "totp", code },
      );
      await suivre(s, suite);
    });
  };

  let description: string;
  let corps: React.ReactNode;
  if (etape.nom === "second") {
    description = etape.secours
      ? "Saisissez l’un de vos codes de secours pour confirmer ce geste."
      : "Saisissez le code de votre application d’authentification pour confirmer ce geste.";
    corps = (
      <form onSubmit={verifierSecond} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="code-verification">{etape.secours ? "Code de secours" : "Code de l’application"}</Label>
          <ChampCode
            id="code-verification"
            valeur={code}
            surChangement={setCode}
            secours={etape.secours}
            autoFocus
            invalide={!!erreur}
          />
        </div>
        <BoutonPrincipal type="submit" enCours={enCours} desactive={etape.secours ? code.length < 6 : code.length !== 6}>
          <ShieldCheck /> Confirmer
        </BoutonPrincipal>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => {
            setCode("");
            setErreur(null);
            setEtape({ nom: "second", secours: !etape.secours });
          }}
        >
          <KeyRound /> {etape.secours ? "Utiliser l’application" : "Utiliser un code de secours"}
        </Button>
      </form>
    );
  } else if (etape.nom === "email-envoi") {
    description = "Pour ce geste, confirmez aussi votre adresse : un code va vous être envoyé.";
    corps = (
      <BoutonPrincipal onClick={envoyerEmail} enCours={enCours}>
        <Mail /> Recevoir le code
      </BoutonPrincipal>
    );
  } else {
    description = "Saisissez le code à 6 chiffres reçu par e-mail.";
    corps = (
      <form onSubmit={verifierEmail} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="code-email-verification">Code reçu</Label>
          <ChampCode id="code-email-verification" valeur={code} surChangement={setCode} autoFocus invalide={!!erreur} />
        </div>
        <BoutonPrincipal type="submit" enCours={enCours} desactive={code.length !== 6}>
          Continuer
        </BoutonPrincipal>
      </form>
    );
  }

  return (
    <Dialog open onOpenChange={(ouvert) => !ouvert && annuler()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirmez votre identité</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {erreur && (
          <p role="alert" className="rounded-xl bg-h2h-error-light px-3 py-2 text-legende text-h2h-error">
            {erreur}
          </p>
        )}
        {corps}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { ArrowLeft, KeyRound, Mail, RotateCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BoutonPrincipal } from "@/components/connexion/BoutonPrincipal";
import { ChampCode } from "@/components/connexion/ChampCode";
import { codeErreur, messageErreur } from "@/lib/connexion/erreurs";

type Etape =
  | { nom: "adresse" }
  | { nom: "code" }
  | { nom: "second-facteur"; secours: boolean; secoursPossible: boolean; appPossible: boolean }
  | { nom: "complements"; champs: string[] };

// Ce que le service peut encore demander pour créer un compte, et que ce
// formulaire sait recueillir.
const COMPLEMENTS_GERES = ["first_name", "last_name"];

/**
 * La connexion au back-office, dans nos couleurs : l'adresse d'équipe, le code
 * reçu par e-mail, puis le code de l'application d'authentification.
 *
 * ⚠️ UNE SEULE PORTE POUR SE CONNECTER ET POUR CRÉER SON COMPTE. La Direction
 * invite une adresse dédiée, dont le compte n'existe qu'après la première
 * connexion : une adresse inconnue passe donc à la création du compte avec le
 * même code (`signUpIfMissing`). Créer un compte n'ouvre rien — c'est
 * l'invitation, validée à deux, qui ouvre le back-office.
 *
 * ⚠️ LE SECOND FACTEUR SE DEMANDE ICI, pas après : sans lui, la base refuse tout
 * (`BO_2FA`). Un compte qui n'en a pas encore passe par l'écran d'accès, qui
 * l'installe.
 */
export function FormulaireConnexion({ destination }: { destination: string }) {
  const { isLoaded } = useAuth();
  const { signIn, fetchStatus } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();

  const [etape, setEtape] = useState<Etape>({ nom: "adresse" });
  const [adresse, setAdresse] = useState("");
  const [code, setCode] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const occupe = !isLoaded || fetchStatus === "fetching";

  // Une fois la session créée : aller où l'on voulait aller.
  const naviguer = ({ session, decorateUrl }: { session: { currentTask?: unknown } | null; decorateUrl: (u: string) => string }) => {
    if (session?.currentTask) {
      setErreur("Votre compte demande une étape de sécurité supplémentaire : rapprochez-vous de la Direction.");
      return;
    }
    const url = decorateUrl(destination);
    if (url.startsWith("http")) window.location.href = url;
    else router.push(url);
  };

  const recommencer = async () => {
    await signIn.reset();
    await signUp.reset();
    setCode("");
    setErreur(null);
    setInfo(null);
    setEtape({ nom: "adresse" });
  };

  // ── 1. L'adresse ─────────────────────────────────────────────────────────
  async function envoyerAdresse(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setInfo(null);
    const { error } = await signIn.create({ identifier: adresse.trim(), signUpIfMissing: true });
    if (error) return setErreur(messageErreur(error));
    const { error: envoi } = await signIn.emailCode.sendCode();
    if (envoi) return setErreur(messageErreur(envoi));
    setCode("");
    setEtape({ nom: "code" });
  }

  async function renvoyerCode() {
    setErreur(null);
    const { error } = await signIn.emailCode.sendCode();
    if (error) return setErreur(messageErreur(error));
    setInfo("Un nouveau code vient de partir.");
  }

  // ── 2. Le code reçu par e-mail ───────────────────────────────────────────
  async function verifierCode(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setInfo(null);
    const { error } = await signIn.emailCode.verifyCode({ code });
    if (error) {
      // Une adresse sans compte : le code l'a vérifiée, le compte se crée.
      if (codeErreur(error) === "sign_up_if_missing_transfer") return creerLeCompte();
      return setErreur(messageErreur(error));
    }
    await apresPremierFacteur();
  }

  async function apresPremierFacteur() {
    if (signIn.status === "complete") return finaliserConnexion();
    if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
      const strategies = signIn.supportedSecondFactors.map((f) => f.strategy);
      const appPossible = strategies.includes("totp");
      const secoursPossible = strategies.includes("backup_code");
      if (!appPossible && !secoursPossible) {
        return setErreur("Ce compte n’a pas de second facteur utilisable ici : rapprochez-vous de la Direction.");
      }
      setCode("");
      setEtape({ nom: "second-facteur", secours: !appPossible, secoursPossible, appPossible });
      return;
    }
    setErreur("La connexion n’a pas abouti. Recommencez depuis votre adresse.");
  }

  // ── 3. Le second facteur ─────────────────────────────────────────────────
  async function verifierSecondFacteur(e: React.FormEvent) {
    e.preventDefault();
    if (etape.nom !== "second-facteur") return;
    setErreur(null);
    const { error } = etape.secours
      ? await signIn.mfa.verifyBackupCode({ code })
      : await signIn.mfa.verifyTOTP({ code });
    if (error) return setErreur(messageErreur(error));
    if (signIn.status === "complete") return finaliserConnexion();
    setErreur("La connexion n’a pas abouti. Recommencez depuis votre adresse.");
  }

  async function finaliserConnexion() {
    const { error } = await signIn.finalize({ navigate: naviguer });
    if (error) setErreur(messageErreur(error));
  }

  // ── La création du compte, quand l'adresse n'en avait pas ────────────────
  async function creerLeCompte() {
    const { error } = await signUp.create({ transfer: true });
    if (error) return setErreur(messageErreur(error));
    await apresCreation();
  }

  async function apresCreation() {
    if (signUp.status === "complete") {
      const { error } = await signUp.finalize({ navigate: naviguer });
      if (error) setErreur(messageErreur(error));
      return;
    }
    if (signUp.status === "missing_requirements") {
      const champs = signUp.missingFields;
      if (champs.every((c) => COMPLEMENTS_GERES.includes(c))) {
        setEtape({ nom: "complements", champs });
        return;
      }
    }
    setErreur("Le compte n’a pas pu être créé. Rapprochez-vous de la Direction.");
  }

  async function envoyerComplements(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const { error } = await signUp.update({
      firstName: prenom.trim() || undefined,
      lastName: nom.trim() || undefined,
    });
    if (error) return setErreur(messageErreur(error));
    await apresCreation();
  }

  // ── L'écran ──────────────────────────────────────────────────────────────
  let titre: string;
  let sousTitre: React.ReactNode;
  let corps: React.ReactNode;

  if (etape.nom === "adresse") {
    titre = "Connexion";
    sousTitre = "Votre adresse d’équipe HandtoHand";
    corps = (
      <form onSubmit={envoyerAdresse} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="adresse">Adresse e-mail</Label>
          <Input
            id="adresse"
            type="email"
            autoComplete="email"
            autoFocus
            required
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
            placeholder="prenom@handtohand.pro"
            className="h-11"
          />
        </div>
        <BoutonPrincipal type="submit" enCours={occupe} desactive={!adresse.trim()}>
          <Mail /> Recevoir un code
        </BoutonPrincipal>
      </form>
    );
  } else if (etape.nom === "code") {
    titre = "Vérifiez votre e-mail";
    sousTitre = (
      <>
        Saisissez le code à 6 chiffres envoyé à <strong className="text-foreground">{adresse.trim()}</strong>.
      </>
    );
    corps = (
      <form onSubmit={verifierCode} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="code-email">Code reçu</Label>
          <ChampCode id="code-email" valeur={code} surChangement={setCode} autoFocus invalide={!!erreur} />
        </div>
        <BoutonPrincipal type="submit" enCours={occupe} desactive={code.length !== 6}>
          Continuer
        </BoutonPrincipal>
        <div className="flex flex-wrap justify-between gap-2">
          <LienDiscret onClick={recommencer} disabled={occupe}>
            <ArrowLeft /> Changer d’adresse
          </LienDiscret>
          <LienDiscret onClick={renvoyerCode} disabled={occupe}>
            <RotateCw /> Renvoyer le code
          </LienDiscret>
        </div>
      </form>
    );
  } else if (etape.nom === "second-facteur") {
    titre = "Double authentification";
    sousTitre = etape.secours
      ? "Saisissez l’un de vos codes de secours. Chacun ne sert qu’une fois."
      : "Saisissez le code à 6 chiffres affiché par votre application d’authentification.";
    corps = (
      <form onSubmit={verifierSecondFacteur} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="code-second-facteur">{etape.secours ? "Code de secours" : "Code de l’application"}</Label>
          <ChampCode
            id="code-second-facteur"
            valeur={code}
            surChangement={setCode}
            secours={etape.secours}
            autoFocus
            invalide={!!erreur}
          />
        </div>
        <BoutonPrincipal type="submit" enCours={occupe} desactive={etape.secours ? code.length < 6 : code.length !== 6}>
          <ShieldCheck /> Se connecter
        </BoutonPrincipal>
        <div className="flex flex-wrap justify-between gap-2">
          <LienDiscret onClick={recommencer} disabled={occupe}>
            <ArrowLeft /> Recommencer
          </LienDiscret>
          {etape.secours && etape.appPossible && (
            <LienDiscret
              onClick={() => {
                setCode("");
                setErreur(null);
                setEtape({ ...etape, secours: false });
              }}
            >
              <ShieldCheck /> Utiliser l’application
            </LienDiscret>
          )}
          {!etape.secours && etape.secoursPossible && (
            <LienDiscret
              onClick={() => {
                setCode("");
                setErreur(null);
                setEtape({ ...etape, secours: true });
              }}
            >
              <KeyRound /> Utiliser un code de secours
            </LienDiscret>
          )}
        </div>
      </form>
    );
  } else {
    titre = "Votre compte d’équipe";
    sousTitre = "Votre adresse est vérifiée. Indiquez votre nom pour terminer.";
    corps = (
      <form onSubmit={envoyerComplements} className="grid gap-4">
        {etape.champs.includes("first_name") && (
          <div className="grid gap-2">
            <Label htmlFor="prenom">Prénom</Label>
            <Input id="prenom" autoComplete="given-name" required value={prenom} onChange={(e) => setPrenom(e.target.value)} className="h-11" />
          </div>
        )}
        {etape.champs.includes("last_name") && (
          <div className="grid gap-2">
            <Label htmlFor="nom">Nom</Label>
            <Input id="nom" autoComplete="family-name" required value={nom} onChange={(e) => setNom(e.target.value)} className="h-11" />
          </div>
        )}
        <BoutonPrincipal type="submit" enCours={occupe}>Créer mon compte</BoutonPrincipal>
        <LienDiscret onClick={recommencer} disabled={occupe}>
          <ArrowLeft /> Recommencer
        </LienDiscret>
      </form>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border bg-card p-8" style={{ boxShadow: "var(--ombre-flottante)" }}>
      <h1 className="text-center text-h2 font-semibold">{titre}</h1>
      <p className="mt-1 text-center text-corps text-muted-foreground">{sousTitre}</p>
      {erreur && (
        <p role="alert" className="mt-5 rounded-xl bg-h2h-error-light px-3 py-2 text-legende text-h2h-error">
          {erreur}
        </p>
      )}
      {info && !erreur && (
        <p role="status" className="mt-5 rounded-xl bg-h2h-primary-light px-3 py-2 text-legende text-h2h-primary">
          {info}
        </p>
      )}
      <div className="mt-6">{corps}</div>
      {/* ⚠️ LA VÉRIFICATION ANTI-ROBOT DE LA CRÉATION DE COMPTE s'insère ici
          quand le service la demande ; sans cet emplacement, elle échoue. */}
      <div id="clerk-captcha" className="mt-4 empty:hidden" />
    </div>
  );
}

function LienDiscret({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} disabled={disabled} className="text-muted-foreground">
      {children}
    </Button>
  );
}

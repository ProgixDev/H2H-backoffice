"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import QRCode from "qrcode";
import { Copy, LogIn, LogOut, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BoutonPrincipal } from "@/components/connexion/BoutonPrincipal";
import { ChampCode } from "@/components/connexion/ChampCode";
import { messageErreur } from "@/lib/connexion/erreurs";

type Etat =
  | { nom: "debut" }
  | { nom: "scanner"; image: string; secret: string }
  | { nom: "codes"; codes: string[] };

/**
 * Installer l'application d'authentification — le second facteur que la base
 * exige de chaque équipier (`BO_2FA`) — sans quitter le back-office.
 *
 * ⚠️ UNE FOIS INSTALLÉE, IL FAUT SE RECONNECTER. La session ouverte avant ne
 * porte pas le second facteur : c'est la connexion suivante qui le demande, et
 * c'est elle que la base reconnaît.
 */
export function ActivationDoubleAuthentification() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [etat, setEtat] = useState<Etat>({ nom: "debut" });
  const [code, setCode] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [conserves, setConserves] = useState(false);

  const reconnecter = () => signOut({ redirectUrl: "/sign-in" });

  if (!isLoaded || !user) return null;

  // Installée lors d'une visite précédente : il ne reste qu'à se reconnecter.
  if (user.totpEnabled && etat.nom === "debut") {
    return (
      <div className="grid gap-4">
        <p className="text-corps text-muted-foreground">
          Votre application d’authentification est déjà installée. Reconnectez-vous : son code vous sera
          demandé, et le back-office s’ouvrira.
        </p>
        <BoutonPrincipal onClick={reconnecter}>
          <LogIn /> Me reconnecter
        </BoutonPrincipal>
      </div>
    );
  }

  const commencer = async () => {
    setErreur(null);
    setEnCours(true);
    try {
      const totp = await user.createTOTP();
      if (!totp.uri || !totp.secret) throw new Error("clé absente");
      const image = await QRCode.toDataURL(totp.uri, {
        margin: 1,
        width: 208,
        color: { dark: "#28262C", light: "#FFFFFF" },
      });
      setCode("");
      setEtat({ nom: "scanner", image, secret: totp.secret });
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setEnCours(false);
    }
  };

  const verifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    setEnCours(true);
    try {
      const totp = await user.verifyTOTP({ code });
      let codes = totp.backupCodes ?? [];
      if (codes.length === 0) {
        // Les codes de secours ne viennent pas toujours avec la vérification.
        try {
          codes = (await user.createBackupCode()).codes;
        } catch {
          codes = [];
        }
      }
      setEtat({ nom: "codes", codes });
    } catch (err) {
      setErreur(messageErreur(err));
    } finally {
      setEnCours(false);
    }
  };

  const copier = (codes: string[]) =>
    navigator.clipboard
      .writeText(codes.join("\n"))
      .then(() => toast.success("Codes copiés."))
      .catch(() => toast.error("La copie a échoué : recopiez-les à la main."));

  const alerte = erreur && (
    <p role="alert" className="rounded-xl bg-h2h-error-light px-3 py-2 text-legende text-h2h-error">
      {erreur}
    </p>
  );

  if (etat.nom === "debut") {
    return (
      <div className="grid gap-4">
        <ol className="grid gap-2 text-corps text-muted-foreground">
          <Pas n={1}>Installez une application d’authentification sur votre téléphone (Google Authenticator, Microsoft Authenticator, 1Password…).</Pas>
          <Pas n={2}>Scannez le code qui va s’afficher.</Pas>
          <Pas n={3}>Saisissez le code à 6 chiffres que l’application affiche.</Pas>
        </ol>
        {alerte}
        <BoutonPrincipal onClick={commencer} enCours={enCours}>
          <Smartphone /> Installer mon application
        </BoutonPrincipal>
        <Button type="button" variant="ghost" onClick={reconnecter} className="text-muted-foreground">
          <LogOut /> Se déconnecter
        </Button>
      </div>
    );
  }

  if (etat.nom === "scanner") {
    return (
      <form onSubmit={verifier} className="grid gap-4">
        <div className="mx-auto rounded-2xl bg-white p-3" style={{ boxShadow: "var(--ombre-carte)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- image générée ici même, en data: */}
          <img src={etat.image} alt="Code à scanner avec l’application d’authentification" width={208} height={208} />
        </div>
        <div className="text-center text-legende text-muted-foreground">
          Impossible de scanner ? Saisissez cette clé dans l’application :
          <div className="mt-1 font-mono text-corps tracking-wider text-foreground select-all break-all">
            {etat.secret.match(/.{1,4}/g)?.join(" ")}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="code-installation">Code affiché par l’application</Label>
          <ChampCode id="code-installation" valeur={code} surChangement={setCode} autoFocus invalide={!!erreur} />
        </div>
        {alerte}
        <BoutonPrincipal type="submit" enCours={enCours} desactive={code.length !== 6}>
          <ShieldCheck /> Vérifier le code
        </BoutonPrincipal>
      </form>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-corps text-muted-foreground">
        L’application est installée.
        {etat.codes.length > 0 &&
          " Gardez ces codes de secours en lieu sûr : chacun remplace une fois le code de l’application, si vous perdez votre téléphone."}
      </p>
      {etat.codes.length > 0 && (
        <>
          <ul className="grid grid-cols-2 gap-2 rounded-xl border bg-muted/40 p-3 font-mono text-corps">
            {etat.codes.map((c) => (
              <li key={c} className="text-center tracking-wider">
                {c}
              </li>
            ))}
          </ul>
          <Button type="button" variant="outline" onClick={() => copier(etat.codes)}>
            <Copy /> Copier les codes
          </Button>
          <label className="flex items-start gap-2 text-corps">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-h2h-primary"
              checked={conserves}
              onChange={(e) => setConserves(e.target.checked)}
            />
            J’ai mis ces codes en lieu sûr.
          </label>
        </>
      )}
      <BoutonPrincipal onClick={reconnecter} desactive={etat.codes.length > 0 && !conserves}>
        <LogIn /> Me reconnecter
      </BoutonPrincipal>
    </div>
  );
}

function Pas({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-h2h-primary-light text-legende font-semibold text-h2h-primary">
        {n}
      </span>
      <span>{children}</span>
    </li>
  );
}

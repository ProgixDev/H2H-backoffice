"use client";

import { useState } from "react";
import { cn } from "cn";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGeste } from "@/lib/db/useGeste";
import { avertirCompte, leverSanction, restreindreCompte, suspendreCompte } from "@/lib/utilisateurs/actions";
import {
  DUREES_SANCTION,
  LIBELLE_PORTEE,
  type NatureSanction,
  type PorteeRestriction,
  type SanctionsCompte,
} from "@/lib/utilisateurs/types";

// Les longueurs que la base exige : le message dit à la personne, le motif gardé par l'équipe.
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const MOTIF_MIN = 5;

type Saisie = { portee: PorteeRestriction | null; jours: number | null; message: string; motif: string };

const TITRE: Record<NatureSanction, string> = {
  avertissement: "Avertir",
  restriction: "Restreindre",
  suspension: "Suspendre",
};

const DESCRIPTION: Record<NatureSanction, string> = {
  avertissement: "Un avertissement ne limite pas le compte : la personne reçoit votre message, et il reste inscrit à sa fiche.",
  restriction:
    "Ce qui est restreint ne peut plus commencer. Ses transactions et ses colis déjà engagés vont au bout. La personne reçoit votre message, avec ce qui est arrêté et jusqu’à quand.",
  suspension:
    "Plus rien ne peut commencer, et ses annonces quittent la vitrine. Ses transactions et ses colis déjà engagés vont au bout. La personne reçoit votre message, et jusqu’à quand.",
};

/**
 * Les trois gestes d'une fiche de compte : avertir, restreindre, suspendre.
 *
 * ⚠️ L'ÉCRAN MONTRE CE QUE LA BASE PERMET (`possibles`) — et la base décide
 * encore : la permission, l'identité reconfirmée, un motif, un message, jamais
 * son propre compte. Une fenêtre qui laisserait passer autre chose serait
 * refusée de toute façon.
 */
export function GestesSanction({
  profil,
  pseudo,
  possibles,
}: {
  profil: string;
  pseudo: string | null;
  possibles: SanctionsCompte["possibles"];
}) {
  const [nature, setNature] = useState<NatureSanction | null>(null);
  const avertir = useGeste(avertirCompte);
  const restreindre = useGeste(restreindreCompte);
  const suspendre = useGeste(suspendreCompte);
  const enCours = avertir.enCours || restreindre.enCours || suspendre.enCours;

  if (!possibles.sanctionner) {
    return <p className="text-legende text-muted-foreground">{possibles.raison}</p>;
  }

  async function confirmer(s: Saisie) {
    if (!nature) return;
    const commun = { profil, message: s.message, motif: s.motif };
    const r =
      nature === "avertissement"
        ? await avertir.lancer(commun, "Avertissement envoyé.")
        : nature === "restriction" && s.portee
          ? await restreindre.lancer({ ...commun, portee: s.portee, jours: s.jours }, "Restriction posée.")
          : await suspendre.lancer({ ...commun, jours: s.jours }, "Compte suspendu.");
    if (r?.ok) setNature(null);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setNature("avertissement")}>
          Avertir
        </Button>
        <Button variant="outline" onClick={() => setNature("restriction")} disabled={possibles.portees.length === 0}>
          Restreindre
        </Button>
        <Button variant="destructive" onClick={() => setNature("suspension")} disabled={!possibles.suspendre}>
          Suspendre
        </Button>
      </div>
      {!possibles.suspendre && (
        <p className="text-legende text-muted-foreground">Ce compte est suspendu : tout y est déjà arrêté.</p>
      )}
      <DialogueSanction
        nature={nature}
        pseudo={pseudo}
        portees={possibles.portees}
        enCours={enCours}
        surFermeture={() => setNature(null)}
        surConfirmation={confirmer}
      />
    </>
  );
}

/** Le choix d'un périmètre ou d'une durée : un groupe de boutons, un seul à la fois. */
function Choix<T>({
  etiquette,
  options,
  valeur,
  surChoix,
}: {
  etiquette: string;
  options: { valeur: T; libelle: string; aide?: string }[];
  valeur: T | undefined;
  surChoix: (v: T) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label>{etiquette}</Label>
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label={etiquette}>
        {options.map((o) => (
          <button
            key={String(o.valeur)}
            type="button"
            role="radio"
            aria-checked={valeur === o.valeur}
            onClick={() => surChoix(o.valeur)}
            className={cn(
              "grid gap-0.5 rounded-lg border px-3 py-2 text-left text-corps transition-colors",
              valeur === o.valeur ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
            )}
          >
            <span className="font-medium">{o.libelle}</span>
            {o.aide && <span className="text-legende text-muted-foreground">{o.aide}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function DialogueSanction({
  nature,
  pseudo,
  portees,
  enCours,
  surFermeture,
  surConfirmation,
}: {
  nature: NatureSanction | null;
  pseudo: string | null;
  portees: SanctionsCompte["possibles"]["portees"];
  enCours: boolean;
  surFermeture: () => void;
  surConfirmation: (s: Saisie) => void;
}) {
  const [portee, setPortee] = useState<PorteeRestriction | undefined>(undefined);
  // `undefined` : rien de choisi ; `null` : sans terme, jusqu'à la levée.
  const [jours, setJours] = useState<number | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [motif, setMotif] = useState("");

  const avecDuree = nature === "restriction" || nature === "suspension";
  const longueur = message.trim().length;
  const valide =
    nature !== null &&
    (nature !== "restriction" || portee !== undefined) &&
    (!avecDuree || jours !== undefined) &&
    longueur >= MESSAGE_MIN &&
    longueur <= MESSAGE_MAX &&
    motif.trim().length >= MOTIF_MIN;

  const fermer = () => {
    setPortee(undefined);
    setJours(undefined);
    setMessage("");
    setMotif("");
    surFermeture();
  };

  return (
    <Dialog open={nature !== null} onOpenChange={(o) => !o && fermer()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {nature ? TITRE[nature] : ""} {pseudo ? `@${pseudo}` : "ce compte"}
          </DialogTitle>
          <DialogDescription>{nature ? DESCRIPTION[nature] : ""}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {nature === "restriction" && (
            <Choix
              etiquette="Ce qui est arrêté"
              options={portees.map((p) => ({ valeur: p.code, libelle: LIBELLE_PORTEE[p.code] ?? p.libelle, aide: p.effet }))}
              valeur={portee}
              surChoix={setPortee}
            />
          )}
          {avecDuree && (
            <Choix
              etiquette="Durée"
              options={DUREES_SANCTION.map((d) => ({
                valeur: d.jours,
                libelle: d.libelle,
                aide: d.jours === null ? "Jusqu’à ce qu’un équipier la lève." : undefined,
              }))}
              valeur={jours}
              surChoix={setJours}
            />
          )}
          <div className="grid gap-2">
            <Label htmlFor="message-sanction">Message à la personne</Label>
            <Textarea
              id="message-sanction"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ce qui lui est reproché, en une phrase au moins. Il lui est envoyé tel quel."
              rows={3}
            />
            <span className={cn("text-legende", longueur > MESSAGE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
              {longueur} / {MESSAGE_MAX} caractères
            </span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="motif-sanction">Motif interne</Label>
            <Textarea
              id="motif-sanction"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Il reste au journal d'audit : la personne ne le lit pas."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={fermer} disabled={enCours}>
            Annuler
          </Button>
          <Button
            variant={nature === "suspension" ? "destructive" : "default"}
            disabled={!valide || enCours}
            onClick={() =>
              surConfirmation({
                portee: nature === "restriction" ? (portee ?? null) : null,
                jours: avecDuree ? (jours ?? null) : null,
                message: message.trim(),
                motif: motif.trim(),
              })
            }
          >
            {enCours ? "Un instant…" : nature ? TITRE[nature] : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Lever une restriction ou une suspension en cours : la personne en est
 * prévenue, le motif reste au journal de l'équipe.
 */
export function LeverSanction({
  sanction,
  profil,
  nature,
}: {
  sanction: string;
  profil: string;
  nature: NatureSanction;
}) {
  const [ouvert, setOuvert] = useState(false);
  const lever = useGeste(leverSanction);
  const quoi = nature === "suspension" ? "la suspension" : "la restriction";
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOuvert(true)}>
        Lever
      </Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre={`Lever ${quoi} ?`}
        description="Ce qui était arrêté reprend aussitôt, et la personne en est prévenue. Ce motif reste au journal de l’équipe."
        libelleAction="Lever"
        longueurMin={MOTIF_MIN}
        enCours={lever.enCours}
        surConfirmation={async (motif) => {
          const r = await lever.lancer({ sanction, profil, motif }, nature === "suspension" ? "Suspension levée." : "Restriction levée.");
          if (r?.ok) setOuvert(false);
        }}
      />
    </>
  );
}

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
import { demanderCorrection, masquerAnnonce, retablirAnnonce, retirerAnnonce } from "@/lib/annonces/actions";
import {
  MOTIFS_CORRECTION,
  type ModerationFiche,
  type MotifCorrection,
  type NatureAnnonce,
} from "@/lib/annonces/types";

// Les longueurs que la base exige : le message dit à l'auteur, le motif gardé par l'équipe.
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const MOTIF_MIN = 5;

type Geste = "masquer" | "retirer" | "corriger";
type Saisie = { correction: MotifCorrection | null; message: string; motif: string };

const TITRE: Record<Geste, string> = {
  masquer: "Masquer",
  retirer: "Retirer",
  corriger: "Demander une correction",
};

function description(g: Geste, quoi: string): string {
  switch (g) {
    case "masquer":
      return `Personne d’autre que son auteur ne verra plus ${quoi} : elle ne s’achète, ne s’offre ni ne se discute plus. Ce qui est déjà engagé autour d’elle va au bout. L’auteur reçoit votre message ; l’équipe peut la rétablir.`;
    case "retirer":
      return `C’est définitif : ${quoi} ne reviendra pas, sauf si un recours est accepté, et elle ne se modifie plus. Ce qui est déjà engagé autour d’elle va au bout. L’auteur reçoit votre message.`;
    case "corriger":
      return `${quoi.charAt(0).toUpperCase()}${quoi.slice(1)} reste en ligne. L’auteur reçoit votre demande, et la modification qu’il fait ensuite ne lui est pas facturée.`;
  }
}

/**
 * Les gestes de modération d'une annonce ou d'une recherche : masquer,
 * rétablir, retirer, demander une correction.
 *
 * ⚠️ L'ÉCRAN MONTRE CE QUE LA BASE PERMET (`possibles`) — et la base décide
 * encore : la permission, l'identité reconfirmée pour masquer et retirer, un
 * motif, un message, l'état, jamais sa propre annonce.
 */
export function GestesModeration({
  id,
  nature,
  possibles,
}: {
  id: string;
  nature: NatureAnnonce;
  possibles: ModerationFiche["possibles"];
}) {
  const [geste, setGeste] = useState<Geste | null>(null);
  const [aRetablir, setARetablir] = useState(false);
  const masquer = useGeste(masquerAnnonce);
  const retirer = useGeste(retirerAnnonce);
  const corriger = useGeste(demanderCorrection);
  const retablirGeste = useGeste(retablirAnnonce);
  const enCours = masquer.enCours || retirer.enCours || corriger.enCours;
  const quoi = nature === "annonce" ? "cette annonce" : "cette recherche";

  if (!possibles.moderer) {
    return <p className="text-legende text-muted-foreground">{possibles.raison}</p>;
  }

  async function confirmer(s: Saisie) {
    if (!geste) return;
    const commun = { annonce: id, message: s.message, motif: s.motif };
    const r =
      geste === "masquer"
        ? await masquer.lancer(commun, "Masquée : l’auteur est prévenu.")
        : geste === "retirer"
          ? await retirer.lancer(commun, "Retirée : l’auteur est prévenu.")
          : s.correction
            ? await corriger.lancer({ ...commun, correction: s.correction }, "Correction demandée : l’auteur est prévenu.")
            : null;
    if (r?.ok) setGeste(null);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {possibles.corriger && (
          <Button variant="outline" onClick={() => setGeste("corriger")}>
            Demander une correction
          </Button>
        )}
        {possibles.masquer && (
          <Button variant="outline" onClick={() => setGeste("masquer")}>
            Masquer
          </Button>
        )}
        {possibles.retablir && (
          <Button variant="outline" onClick={() => setARetablir(true)}>
            Rétablir
          </Button>
        )}
        {possibles.retirer && (
          <Button variant="destructive" onClick={() => setGeste("retirer")}>
            Retirer
          </Button>
        )}
      </div>
      <DialogueModeration
        geste={geste}
        quoi={quoi}
        enCours={enCours}
        surFermeture={() => setGeste(null)}
        surConfirmation={confirmer}
      />
      <DialogueMotif
        ouvert={aRetablir}
        surFermeture={() => setARetablir(false)}
        titre={`Rétablir ${quoi} ?`}
        description="Elle se montre de nouveau à tous, et son auteur en est prévenu. Ce motif reste au journal de l’équipe."
        libelleAction="Rétablir"
        longueurMin={MOTIF_MIN}
        enCours={retablirGeste.enCours}
        surConfirmation={async (motif) => {
          const r = await retablirGeste.lancer({ annonce: id, motif }, "Rétablie : l’auteur est prévenu.");
          if (r?.ok) setARetablir(false);
        }}
      />
    </>
  );
}

function DialogueModeration({
  geste,
  quoi,
  enCours,
  surFermeture,
  surConfirmation,
}: {
  geste: Geste | null;
  quoi: string;
  enCours: boolean;
  surFermeture: () => void;
  surConfirmation: (s: Saisie) => void;
}) {
  const [correction, setCorrection] = useState<MotifCorrection | null>(null);
  const [message, setMessage] = useState("");
  const [motif, setMotif] = useState("");

  const longueur = message.trim().length;
  const valide =
    geste !== null &&
    (geste !== "corriger" || correction !== null) &&
    longueur >= MESSAGE_MIN &&
    longueur <= MESSAGE_MAX &&
    motif.trim().length >= MOTIF_MIN;

  const fermer = () => {
    setCorrection(null);
    setMessage("");
    setMotif("");
    surFermeture();
  };

  return (
    <Dialog open={geste !== null} onOpenChange={(o) => !o && fermer()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {geste ? TITRE[geste] : ""}
            {geste && geste !== "corriger" ? ` ${quoi}` : ""}
          </DialogTitle>
          <DialogDescription>{geste ? description(geste, quoi) : ""}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {geste === "corriger" && (
            <div className="grid gap-2">
              <Label>Ce qui est à corriger</Label>
              <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Ce qui est à corriger">
                {MOTIFS_CORRECTION.map((m) => (
                  <button
                    key={m.code}
                    type="button"
                    role="radio"
                    aria-checked={correction === m.code}
                    onClick={() => setCorrection(m.code)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-left text-corps font-medium transition-colors",
                      correction === m.code ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
                    )}
                  >
                    {m.libelle}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="message-moderation">Message à l’auteur</Label>
            <Textarea
              id="message-moderation"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                geste === "corriger"
                  ? "Ce qu’il faut changer, en une phrase au moins. Il lui est envoyé tel quel."
                  : "Ce qui ne va pas, en une phrase au moins. Il lui est envoyé tel quel."
              }
              rows={3}
            />
            <span className={cn("text-legende", longueur > MESSAGE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
              {longueur} / {MESSAGE_MAX} caractères
            </span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="motif-moderation">Motif interne</Label>
            <Textarea
              id="motif-moderation"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Il reste au journal d’audit : l’auteur ne le lit pas."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={fermer} disabled={enCours}>
            Annuler
          </Button>
          <Button
            variant={geste === "retirer" ? "destructive" : "default"}
            disabled={!valide || enCours}
            onClick={() => surConfirmation({ correction, message: message.trim(), motif: motif.trim() })}
          >
            {enCours ? "Un instant…" : geste ? TITRE[geste] : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

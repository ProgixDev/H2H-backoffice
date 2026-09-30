"use client";

import { useState } from "react";
import { cn } from "cn";
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
import type { DecisionRecours } from "@/lib/utilisateurs/types";

// Les longueurs que la base exige : la réponse dite à la personne, le motif gardé par l'équipe.
const REPONSE_MIN = 10;
const REPONSE_MAX = 2000;
const MOTIF_MIN = 5;

export type ExamenSaisi = { decision: DecisionRecours; reponse: string; motif: string };

/**
 * La fenêtre d'examen d'un recours — contre une sanction ou contre une décision
 * de modération : l'accepter ou le rejeter, une réponse à la personne, un motif
 * pour l'équipe. Ce que chaque issue produit est dit par l'appelant.
 *
 * ⚠️ LA BASE DÉCIDE ENCORE : la permission, l'identité reconfirmée, jamais par
 * l'auteur de la décision, jamais sur son propre compte, une seule fois.
 */
export function DialogueExamenRecours({
  ouvert,
  surFermeture,
  reference,
  description,
  aides,
  enCours,
  surConfirmation,
}: {
  ouvert: boolean;
  surFermeture: () => void;
  reference: string;
  description: string;
  /** Ce que produit chaque issue, dit à l'équipier avant qu'il choisisse. */
  aides: Record<DecisionRecours, string>;
  enCours: boolean;
  surConfirmation: (s: ExamenSaisi) => void;
}) {
  const [decision, setDecision] = useState<DecisionRecours | null>(null);
  const [reponse, setReponse] = useState("");
  const [motif, setMotif] = useState("");

  const longueur = reponse.trim().length;
  const valide =
    decision !== null && longueur >= REPONSE_MIN && longueur <= REPONSE_MAX && motif.trim().length >= MOTIF_MIN;

  const fermer = () => {
    setDecision(null);
    setReponse("");
    setMotif("");
    surFermeture();
  };

  const decisions: { valeur: DecisionRecours; libelle: string }[] = [
    { valeur: "accepte", libelle: "Accepter le recours" },
    { valeur: "rejete", libelle: "Rejeter le recours" },
  ];

  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Examiner le recours {reference}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2" role="radiogroup" aria-label="Décision">
            {decisions.map((d) => (
              <button
                key={d.valeur}
                type="button"
                role="radio"
                aria-checked={decision === d.valeur}
                onClick={() => setDecision(d.valeur)}
                className={cn(
                  "grid gap-0.5 rounded-lg border px-3 py-2 text-left text-corps transition-colors",
                  decision === d.valeur ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
                )}
              >
                <span className="font-medium">{d.libelle}</span>
                <span className="text-legende text-muted-foreground">{aides[d.valeur]}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reponse-recours">Réponse à la personne</Label>
            <Textarea
              id="reponse-recours"
              value={reponse}
              onChange={(e) => setReponse(e.target.value)}
              placeholder="Ce que l’équipe a vérifié, et pourquoi elle décide ainsi. Elle lui est envoyée telle quelle."
              rows={4}
            />
            <span className={cn("text-legende", longueur > REPONSE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
              {longueur} / {REPONSE_MAX} caractères
            </span>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="motif-recours">Motif interne</Label>
            <Textarea
              id="motif-recours"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Il reste au journal d’audit : la personne ne le lit pas."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={fermer} disabled={enCours}>
            Annuler
          </Button>
          <Button
            disabled={!valide || enCours}
            onClick={() => decision && surConfirmation({ decision, reponse: reponse.trim(), motif: motif.trim() })}
          >
            {enCours ? "Un instant…" : decision === "rejete" ? "Rejeter" : "Accepter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

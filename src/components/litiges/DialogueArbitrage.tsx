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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DECISIONS_PROPOSEES, enCentimes, euros, type Decision, type Litige } from "@/lib/litiges/types";

type Props = {
  litige: Litige | null;
  enCours: boolean;
  surFermeture: () => void;
  surConfirmation: (d: { decision: Decision; montantCents: number | null; motif: string }) => void;
};

/**
 * Arbitrer un dossier : une décision, un montant si elle est partielle, un motif.
 *
 * ⚠️ L'ÉCRAN NE CALCULE PAS LE MONTANT D'UN REMBOURSEMENT INTÉGRAL : la base
 * l'arrête d'après ce qui reste remboursable. Et elle refuse un « partiel » qui
 * égalerait le total — cette fenêtre ne fait que le dire plus tôt.
 */
export function DialogueArbitrage({ litige, enCours, surFermeture, surConfirmation }: Props) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [montant, setMontant] = useState("");
  const [motif, setMotif] = useState("");

  const choix = DECISIONS_PROPOSEES.find((d) => d.decision === decision);
  const cents = choix?.montant ? enCentimes(montant) : null;
  const montantValide = !choix?.montant || (cents !== null && litige !== null && cents < litige.total_cents);
  const valide = decision !== null && montantValide && motif.trim().length >= 3;

  const fermer = () => {
    setDecision(null);
    setMontant("");
    setMotif("");
    surFermeture();
  };

  return (
    <Dialog open={litige !== null} onOpenChange={(o) => !o && fermer()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Arbitrer la commande {litige?.numero_commande}</DialogTitle>
          <DialogDescription>
            Les deux parties seront prévenues de la décision au même moment. Total payé :{" "}
            {euros(litige?.total_cents)} · encore remboursable : {euros(litige?.restant_cents)}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Décision">
            {DECISIONS_PROPOSEES.map((d) => (
              <button
                key={d.decision}
                type="button"
                role="radio"
                aria-checked={decision === d.decision}
                onClick={() => setDecision(d.decision)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-corps transition-colors",
                  decision === d.decision
                    ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary"
                    : "hover:bg-muted",
                )}
              >
                {d.libelle}
              </button>
            ))}
          </div>
          {choix?.montant && (
            <div className="grid gap-2">
              <Label htmlFor="montant">Montant du remboursement partiel (€)</Label>
              <Input
                id="montant"
                inputMode="decimal"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="Par exemple : 15,00"
              />
              {montant !== "" && !montantValide && (
                <p className="text-legende text-h2h-error">
                  Un montant positif, inférieur au total de la commande.
                </p>
              )}
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="motif-arbitrage">Motif</Label>
            <Textarea
              id="motif-arbitrage"
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Il sera conservé au journal d'audit."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={fermer} disabled={enCours}>
            Annuler
          </Button>
          <Button
            disabled={!valide || enCours}
            onClick={() => decision && surConfirmation({ decision, montantCents: cents, motif: motif.trim() })}
          >
            {enCours ? "Un instant…" : "Enregistrer la décision"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

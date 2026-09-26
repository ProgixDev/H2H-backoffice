"use client";

import { useState } from "react";
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

type Props = {
  ouvert: boolean;
  surFermeture: () => void;
  titre: string;
  description: React.ReactNode;
  libelleAction: string;
  destructif?: boolean;
  /** Le motif est-il obligatoire ? (Un refus, une suspension : toujours.) */
  motifObligatoire?: boolean;
  /** La longueur que la base exige du motif (trois caractères, cinq pour une consultation). */
  longueurMin?: number;
  enCours?: boolean;
  surConfirmation: (motif: string) => void;
};

/**
 * La fenêtre qui demande le motif d'un geste sensible (§6 : « demander un motif
 * pour les actions sensibles »). Le motif va au journal d'audit.
 *
 * ⚠️ LA BASE EXIGE AUSSI LE MOTIF. Cette fenêtre n'est qu'un confort : un motif
 * vide ou trop court est refusé de toute façon (`BO_MOTIF`).
 */
export function DialogueMotif({
  ouvert,
  surFermeture,
  titre,
  description,
  libelleAction,
  destructif,
  motifObligatoire = true,
  longueurMin = 3,
  enCours,
  surConfirmation,
}: Props) {
  const [motif, setMotif] = useState("");
  const valide = !motifObligatoire || motif.trim().length >= longueurMin;

  return (
    <Dialog
      open={ouvert}
      onOpenChange={(o) => {
        if (!o) {
          setMotif("");
          surFermeture();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titre}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="motif">Motif{motifObligatoire ? "" : " (facultatif)"}</Label>
          <Textarea
            id="motif"
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            placeholder="Il sera conservé au journal d'audit."
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={surFermeture} disabled={enCours}>
            Annuler
          </Button>
          <Button
            variant={destructif ? "destructive" : "default"}
            disabled={!valide || enCours}
            onClick={() => surConfirmation(motif.trim())}
          >
            {enCours ? "Un instant…" : libelleAction}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

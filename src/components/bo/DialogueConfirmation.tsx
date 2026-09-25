"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  ouvert: boolean;
  surFermeture: () => void;
  titre: string;
  description: React.ReactNode;
  libelleAction: string;
  destructif?: boolean;
  enCours?: boolean;
  surConfirmation: () => void;
};

/**
 * La confirmation d'un geste irréversible qui ne demande pas de motif — parce
 * que le motif a déjà été donné (l'émission d'un remboursement exécute une
 * décision motivée). Un geste qui porte sa propre raison passe par
 * `DialogueMotif`.
 */
export function DialogueConfirmation({
  ouvert,
  surFermeture,
  titre,
  description,
  libelleAction,
  destructif,
  enCours,
  surConfirmation,
}: Props) {
  return (
    <Dialog open={ouvert} onOpenChange={(o) => !o && surFermeture()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{titre}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={surFermeture} disabled={enCours}>
            Annuler
          </Button>
          <Button variant={destructif ? "destructive" : "default"} disabled={enCours} onClick={surConfirmation}>
            {enCours ? "Un instant…" : libelleAction}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { useGeste } from "@/lib/db/useGeste";
import { modererAvis } from "@/lib/avis/actions";
import { moyenneDite } from "@/lib/avis/types";

// Les longueurs que la base exige : le message dit à l'auteur, le motif gardé par l'équipe.
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const MOTIF_MIN = 5;

/**
 * Retirer ou rétablir un avis (R19.2) — identité reconfirmée. La fenêtre dit
 * l'effet sur la moyenne affichée du profil noté avant de confirmer.
 *
 * ⚠️ RETIRER N'EFFACE PAS : l'avis reste, pour le journal et la contestation ; il
 * ne se lit plus dans l'application et ne compte plus dans la moyenne.
 */
export function GesteModerationAvis({
  avis,
  decision,
  moyenneApres,
}: {
  avis: string;
  decision: "retirer" | "retablir";
  /** La moyenne du profil noté une fois la décision prise. */
  moyenneApres: number | null;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [message, setMessage] = useState("");
  const [motif, setMotif] = useState("");
  const moderer = useGeste(modererAvis);
  const retirer = decision === "retirer";

  const longueur = message.trim().length;
  const valide =
    motif.trim().length >= MOTIF_MIN && (!retirer || (longueur >= MESSAGE_MIN && longueur <= MESSAGE_MAX));
  const fermer = () => {
    setMessage("");
    setMotif("");
    setOuvert(false);
  };

  async function confirmer() {
    const r = await moderer.lancer(
      { avis, decision, message: retirer ? message.trim() : null, motif: motif.trim() },
      retirer ? "Avis retiré : l’auteur est prévenu." : "Avis rétabli : l’auteur est prévenu.",
    );
    if (r?.ok) fermer();
  }

  return (
    <>
      <Button variant={retirer ? "destructive" : "default"} onClick={() => setOuvert(true)}>
        {retirer ? "Retirer l’avis" : "Rétablir l’avis"}
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{retirer ? "Retirer cet avis ?" : "Rétablir cet avis ?"}</DialogTitle>
            <DialogDescription>
              {retirer
                ? "Il ne se lit plus dans l’application et ne compte plus dans la moyenne du profil noté. Il n’est pas effacé : sa note et son commentaire restent ceux de l’auteur, qui reçoit votre message."
                : "Il se lit de nouveau dans l’application et compte de nouveau dans la moyenne du profil noté. L’auteur en est prévenu."}{" "}
              La moyenne affichée deviendra : {moyenneDite(moyenneApres)}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {retirer && (
              <div className="grid gap-2">
                <Label htmlFor="message-avis">Message à l’auteur</Label>
                <Textarea
                  id="message-avis"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Pourquoi son avis est retiré, en une phrase au moins. Il lui est envoyé tel quel."
                  rows={3}
                />
                <span className={cn("text-legende", longueur > MESSAGE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
                  {longueur} / {MESSAGE_MAX} caractères
                </span>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="motif-avis">Motif interne</Label>
              <Textarea
                id="motif-avis"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Il reste au journal d’audit : l’auteur ne le lit pas."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermer} disabled={moderer.enCours}>
              Annuler
            </Button>
            <Button
              variant={retirer ? "destructive" : "default"}
              disabled={!valide || moderer.enCours}
              onClick={confirmer}
            >
              {moderer.enCours ? "Un instant…" : retirer ? "Retirer l’avis" : "Rétablir l’avis"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
import { arreterLive } from "@/lib/lives/actions";

// Les longueurs que la base exige : le message dit à l'hôte, le motif gardé par l'équipe.
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const MOTIF_MIN = 5;

/**
 * « Arrêter la diffusion » (R14.4) : un message à l'hôte, un motif pour l'équipe,
 * l'identité reconfirmée. Le live est terminé pour tout le monde et la vidéo
 * s'arrête chez le prestataire ; ce qui était ouvert va au bout (R14.6).
 */
export function GesteArretLive({ live, titre }: { live: string; titre: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [message, setMessage] = useState("");
  const [motif, setMotif] = useState("");
  const arreter = useGeste(arreterLive);

  const longueur = message.trim().length;
  const valide = longueur >= MESSAGE_MIN && longueur <= MESSAGE_MAX && motif.trim().length >= MOTIF_MIN;
  const fermer = () => {
    setMessage("");
    setMotif("");
    setOuvert(false);
  };

  async function confirmer() {
    const r = await arreter.lancer(
      { live, message: message.trim(), motif: motif.trim() },
      "Live arrêté : l’hôte est prévenu, la vidéo s’arrête chez le prestataire.",
    );
    if (r?.ok) fermer();
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOuvert(true)}>
        Arrêter la diffusion
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Arrêter la diffusion de « {titre} »</DialogTitle>
            <DialogDescription>
              Le live est terminé pour tout le monde : les écrans affichent « Live terminé », les offres s’arrêtent, et
              la vidéo s’arrête chez le prestataire. Les fenêtres d’achat et les paiements déjà ouverts vont au bout.
              L’hôte reçoit votre message. C’est définitif : un live arrêté ne reprend pas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="message-arret">Message à l’hôte</Label>
              <Textarea
                id="message-arret"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Pourquoi le live est arrêté, en une phrase au moins. Il lui est envoyé tel quel."
                rows={3}
              />
              <span className={cn("text-legende", longueur > MESSAGE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
                {longueur} / {MESSAGE_MAX} caractères
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="motif-arret">Motif interne</Label>
              <Textarea
                id="motif-arret"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Il reste au journal d’audit : l’hôte ne le lit pas."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermer} disabled={arreter.enCours}>
              Annuler
            </Button>
            <Button variant="destructive" disabled={!valide || arreter.enCours} onClick={confirmer}>
              {arreter.enCours ? "Un instant…" : "Arrêter la diffusion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

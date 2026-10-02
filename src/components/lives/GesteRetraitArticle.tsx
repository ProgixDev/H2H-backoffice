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
import { retirerArticle } from "@/lib/lives/actions";
import type { ArticleLive } from "@/lib/lives/types";

// Les longueurs que la base exige : le message dit à l'hôte, le motif gardé par l'équipe.
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const MOTIF_MIN = 5;

/**
 * « Retirer l'article » (R14.4) : un message à l'hôte, un motif pour l'équipe,
 * l'identité reconfirmée. Le bouton n'apparaît que si la base le permet ; sinon
 * elle dit pourquoi.
 */
export function GesteRetraitArticle({ live, article }: { live: string; article: ArticleLive }) {
  const [ouvert, setOuvert] = useState(false);
  const [message, setMessage] = useState("");
  const [motif, setMotif] = useState("");
  const retirer = useGeste(retirerArticle);

  if (!article.retrait.possible) {
    return article.retrait.raison ? (
      <span className="block max-w-72 text-legende text-muted-foreground">{article.retrait.raison}</span>
    ) : null;
  }

  const longueur = message.trim().length;
  const valide = longueur >= MESSAGE_MIN && longueur <= MESSAGE_MAX && motif.trim().length >= MOTIF_MIN;
  const fermer = () => {
    setMessage("");
    setMotif("");
    setOuvert(false);
  };

  async function confirmer() {
    const r = await retirer.lancer(
      { live, article: article.id, message: message.trim(), motif: motif.trim() },
      "Article retiré : l’hôte est prévenu.",
    );
    if (r?.ok) fermer();
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOuvert(true)}>
        Retirer l’article
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Retirer « {article.titre ?? `l’article ${article.position}`} » du live</DialogTitle>
            <DialogDescription>
              Il garde sa place dans le déroulé, mais ne reçoit plus d’offre et ne s’achète plus. Les fenêtres d’achat
              ouvertes se closent ; l’hôte reçoit votre message, et les acheteurs concernés sont prévenus.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="message-retrait">Message à l’hôte</Label>
              <Textarea
                id="message-retrait"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Pourquoi l’article est retiré, en une phrase au moins. Il lui est envoyé tel quel."
                rows={3}
              />
              <span className={cn("text-legende", longueur > MESSAGE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
                {longueur} / {MESSAGE_MAX} caractères
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="motif-retrait">Motif interne</Label>
              <Textarea
                id="motif-retrait"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Il reste au journal d’audit : l’hôte ne le lit pas."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermer} disabled={retirer.enCours}>
              Annuler
            </Button>
            <Button variant="destructive" disabled={!valide || retirer.enCours} onClick={confirmer}>
              {retirer.enCours ? "Un instant…" : "Retirer l’article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

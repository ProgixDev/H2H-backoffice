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
import { annulerLive } from "@/lib/lives/actions";
import { euros } from "@/lib/paiements/types";

// Les longueurs que la base exige : le message dit à l'hôte, le motif gardé par l'équipe.
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const MOTIF_MIN = 5;

/**
 * « Annuler le live » : un live programmé est clos avant d'avoir commencé (D24 :
 * aucun live n'attend d'autorisation). Un message à l'hôte, un motif pour
 * l'équipe, l'identité reconfirmée.
 *
 * ⚠️ CE QUE LE GESTE NE FAIT PAS SE DIT AVANT : les rappels posés dans
 * l'application ne sont pas prévenus, et les options payées par l'hôte ne sont pas
 * remboursées.
 */
export function GesteAnnulationLive({
  live,
  titre,
  optionsPayeesCents,
}: {
  live: string;
  titre: string;
  optionsPayeesCents: number;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [message, setMessage] = useState("");
  const [motif, setMotif] = useState("");
  const annuler = useGeste(annulerLive);

  const longueur = message.trim().length;
  const valide = longueur >= MESSAGE_MIN && longueur <= MESSAGE_MAX && motif.trim().length >= MOTIF_MIN;
  const fermer = () => {
    setMessage("");
    setMotif("");
    setOuvert(false);
  };

  async function confirmer() {
    const r = await annuler.lancer(
      { live, message: message.trim(), motif: motif.trim() },
      "Live annulé : l’hôte et les personnes qui avaient une place sont prévenus.",
    );
    if (r?.ok) fermer();
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOuvert(true)}>
        Annuler le live
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Annuler le live « {titre} »</DialogTitle>
            <DialogDescription>
              Le live est clos avant d’avoir commencé : il quitte les lives à venir, l’hôte ne peut plus le lancer et
              personne n’y réserve plus de place. L’hôte reçoit votre message ; chaque personne qui avait une place
              apprend que le live n’aura pas lieu. C’est définitif.
            </DialogDescription>
          </DialogHeader>
          <ul className="grid gap-1 rounded-lg border border-[#B45309]/30 bg-[#B45309]/5 p-3 text-legende">
            <li>Les rappels posés dans l’application ne sont pas prévenus : l’application les garde sur le téléphone.</li>
            <li>
              {optionsPayeesCents > 0
                ? `L’hôte a réglé ${euros(optionsPayeesCents)} d’options pour ce live : ce geste ne les rembourse pas.`
                : "L’hôte n’a réglé aucune option pour ce live."}
            </li>
          </ul>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="message-annulation">Message à l’hôte</Label>
              <Textarea
                id="message-annulation"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Pourquoi le live est annulé, en une phrase au moins. Il lui est envoyé tel quel."
                rows={3}
              />
              <span className={cn("text-legende", longueur > MESSAGE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
                {longueur} / {MESSAGE_MAX} caractères
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="motif-annulation">Motif interne</Label>
              <Textarea
                id="motif-annulation"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Il reste au journal d’audit : ni l’hôte ni les spectateurs ne le lisent."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermer} disabled={annuler.enCours}>
              Ne pas annuler
            </Button>
            <Button variant="destructive" disabled={!valide || annuler.enCours} onClick={confirmer}>
              {annuler.enCours ? "Un instant…" : "Annuler le live"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

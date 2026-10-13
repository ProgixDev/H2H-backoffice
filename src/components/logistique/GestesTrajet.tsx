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
import { reprendreTrajet, suspendreTrajet } from "@/lib/logistique/actions";

// Les longueurs que la base exige : le message dit au cotransporteur, le motif gardé par l'équipe.
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const MOTIF_MIN = 5;

/**
 * « Suspendre les nouvelles propositions » (§ 12.2) : un message au
 * cotransporteur, un motif pour l'équipe. Le trajet n'est plus proposé à aucune
 * recherche ; ce qui est en cours suit son cours.
 */
export function GesteSuspensionTrajet({ trajet, corridor }: { trajet: string; corridor: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [message, setMessage] = useState("");
  const [motif, setMotif] = useState("");
  const suspendre = useGeste(suspendreTrajet);

  const longueur = message.trim().length;
  const valide = longueur >= MESSAGE_MIN && longueur <= MESSAGE_MAX && motif.trim().length >= MOTIF_MIN;
  const fermer = () => {
    setMessage("");
    setMotif("");
    setOuvert(false);
  };

  async function confirmer() {
    const r = await suspendre.lancer(
      { trajet, message: message.trim(), motif: motif.trim() },
      "Nouvelles propositions suspendues : le cotransporteur est prévenu.",
    );
    if (r?.ok) fermer();
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOuvert(true)}>
        Suspendre les nouvelles propositions
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Suspendre les nouvelles propositions du trajet {corridor}</DialogTitle>
            <DialogDescription>
              Ce trajet ne sera plus proposé à aucune recherche de co-livraison, jusqu’à ce que l’équipe rétablisse ses
              propositions. Les propositions déjà envoyées, les candidatures et les co-livraisons en cours suivent leur
              cours. Le cotransporteur reçoit votre message, et garde ses autres trajets.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="message-suspension">Message au cotransporteur</Label>
              <Textarea
                id="message-suspension"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Pourquoi les propositions de ce trajet sont suspendues, en une phrase au moins. Il lui est envoyé tel quel."
                rows={3}
              />
              <span className={cn("text-legende", longueur > MESSAGE_MAX ? "text-h2h-error" : "text-muted-foreground")}>
                {longueur} / {MESSAGE_MAX} caractères
              </span>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="motif-suspension">Motif interne</Label>
              <Textarea
                id="motif-suspension"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Il reste au journal d’audit : le cotransporteur ne le lit pas."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermer} disabled={suspendre.enCours}>
              Annuler
            </Button>
            <Button variant="destructive" disabled={!valide || suspendre.enCours} onClick={confirmer}>
              {suspendre.enCours ? "Un instant…" : "Suspendre"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** « Rétablir les nouvelles propositions » : un motif, et le cotransporteur est prévenu. */
export function GesteRepriseTrajet({ trajet, corridor }: { trajet: string; corridor: string }) {
  const [ouvert, setOuvert] = useState(false);
  const reprendre = useGeste(reprendreTrajet);

  async function confirmer(motif: string) {
    const r = await reprendre.lancer({ trajet, motif }, "Nouvelles propositions rétablies : le cotransporteur est prévenu.");
    if (r?.ok) setOuvert(false);
  }

  return (
    <>
      <Button onClick={() => setOuvert(true)}>Rétablir les nouvelles propositions</Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre={`Rétablir les nouvelles propositions du trajet ${corridor}`}
        description="Le trajet sera de nouveau proposé aux recherches de son corridor, dès le prochain tour d’horloge. Le cotransporteur en est prévenu."
        libelleAction="Rétablir"
        longueurMin={MOTIF_MIN}
        enCours={reprendre.enCours}
        surConfirmation={confirmer}
      />
    </>
  );
}

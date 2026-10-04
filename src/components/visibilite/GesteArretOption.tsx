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
import { euros } from "@/lib/paiements/types";
import { arreterOption } from "@/lib/visibilite/actions";

// Les longueurs que la base exige : le message dit à l'acheteur, le motif gardé par l'équipe.
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;
const MOTIF_MIN = 5;

/**
 * Arrêter une option (Publicité, Direction) — identité reconfirmée. La fenêtre
 * dit ce que l'arrêt fait, et ce qu'il propose de rendre.
 *
 * 🔴 LE MONTANT N'EST PAS SAISI ICI : la part non exécutée, calculée par la base,
 * se propose ou non — et une seconde personne (Finance ou Direction) la valide
 * avant tout envoi à Stripe.
 */
export function GesteArretOption({
  option,
  libelle,
  remboursementCents,
  remboursementRaison,
}: {
  option: string;
  libelle: string;
  /** Ce que l'arrêt proposerait de rendre maintenant ; zéro : rien ne se propose. */
  remboursementCents: number;
  remboursementRaison: string | null;
}) {
  const proposable = remboursementCents > 0;
  const [ouvert, setOuvert] = useState(false);
  const [message, setMessage] = useState("");
  const [motif, setMotif] = useState("");
  const [rembourser, setRembourser] = useState(proposable);
  const arreter = useGeste(arreterOption);

  const longueur = message.trim().length;
  const valide = motif.trim().length >= MOTIF_MIN && longueur >= MESSAGE_MIN && longueur <= MESSAGE_MAX;
  const fermer = () => {
    setMessage("");
    setMotif("");
    setRembourser(proposable);
    setOuvert(false);
  };

  async function confirmer() {
    const r = await arreter.lancer(
      { option, message: message.trim(), motif: motif.trim(), rembourser: proposable && rembourser },
      proposable && rembourser
        ? "Option arrêtée : l’acheteur est prévenu, le remboursement attend sa seconde clé."
        : "Option arrêtée : l’acheteur est prévenu.",
    );
    if (r?.ok) fermer();
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setOuvert(true)}>
        Arrêter l’option
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && fermer()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Arrêter « {libelle} » ?</DialogTitle>
            <DialogDescription>
              Elle s’arrête pour de bon : ses remontées à venir sont annulées, l’annonce ou la demande n’est plus mise
              en avant. L’acheteur reçoit votre message ; le motif reste au journal d’audit. Un arrêt ne se défait pas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="message-arret">Message à l’acheteur</Label>
              <Textarea
                id="message-arret"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Pourquoi son option s’arrête, en une phrase au moins. Il lui est envoyé tel quel."
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
                placeholder="Il reste au journal d’audit : l’acheteur ne le lit pas."
                rows={2}
              />
            </div>
            {proposable ? (
              <label className="flex items-start gap-2 rounded-lg border p-3 text-corps">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={rembourser}
                  onChange={(e) => setRembourser(e.target.checked)}
                />
                <span>
                  Proposer de rembourser la part non exécutée : <strong>{euros(remboursementCents)}</strong>.
                  <span className="block text-legende text-muted-foreground">
                    Une seconde personne de la Finance ou de la Direction la validera avant tout envoi à Stripe ; à la
                    réussite, l’avoir cite la facture.
                  </span>
                </span>
              </label>
            ) : (
              <p className="rounded-lg border p-3 text-legende text-muted-foreground">
                Aucun remboursement ne se propose à l’arrêt{remboursementRaison ? ` : ${remboursementRaison}` : "."}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermer} disabled={arreter.enCours}>
              Annuler
            </Button>
            <Button variant="destructive" disabled={!valide || arreter.enCours} onClick={confirmer}>
              {arreter.enCours ? "Un instant…" : "Arrêter l’option"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

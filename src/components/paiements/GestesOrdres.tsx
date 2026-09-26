"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Ban, Check, HandCoins, RotateCcw, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useGeste } from "@/lib/db/useGeste";
import { deciderValidation } from "@/lib/equipe/actions";
import { annulerOrdre, demanderRemboursement, relancerOrdre } from "@/lib/paiements/actions";
import { euros } from "@/lib/paiements/types";

type Taille = "sm" | "xs";

/** Une demande qui attend une seconde personne le dit, en plus du « demandé ». */
function annoncer(donnees: unknown) {
  const d = donnees as { statut?: string; ref?: string } | undefined;
  if (d?.statut === "en_validation") {
    toast.message("Soumis à validation", {
      description: `${d.ref ?? "L’ordre"} attend une seconde personne (Finance ou Direction) avant tout envoi à Stripe.`,
    });
  }
}

/** « 12,50 » → 1250 ; `null` si ce n'est pas un montant. */
function centimes(saisie: string): number | null {
  const propre = saisie.replace(/\s|€/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(propre)) return null;
  return Math.round(Number(propre) * 100);
}

/**
 * Rembourser HORS litige : un geste commercial, une annulation selon la
 * procédure. ⚠️ TOUJOURS UNE SECONDE PERSONNE : aucune décision ne l'adosse.
 */
export function BoutonRembourser({
  commande,
  restant,
  surGeste,
}: {
  commande: string;
  /** Ce que la commande peut encore rendre, ordres en route déduits. */
  restant: number;
  surGeste?: () => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const [montant, setMontant] = useState("");
  const [motif, setMotif] = useState("");
  const demander = useGeste(demanderRemboursement);
  const cents = centimes(montant);
  const valide = cents !== null && cents > 0 && cents <= restant && motif.trim().length >= 5;

  const fermer = () => {
    setOuvert(false);
    setMontant("");
    setMotif("");
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOuvert(true)} disabled={restant <= 0}>
        <HandCoins /> Rembourser
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => (o ? setOuvert(true) : fermer())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rembourser hors litige</DialogTitle>
            <DialogDescription>
              Il reste {euros(restant)} remboursables sur cette commande. Une seconde personne (Finance ou
              Direction) validera avant tout envoi à Stripe. Le motif reste interne.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="montant">Montant (€)</Label>
              <Input
                id="montant"
                inputMode="decimal"
                value={montant}
                onChange={(e) => setMontant(e.target.value)}
                placeholder="12,50"
              />
              {cents !== null && cents > restant && (
                <span className="text-legende text-h2h-error">Au-delà de ce qui reste remboursable.</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="motif-remboursement">Motif</Label>
              <Textarea
                id="motif-remboursement"
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                placeholder="Il sera conservé au journal d’audit."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={fermer} disabled={demander.enCours}>
              Annuler
            </Button>
            <Button
              disabled={!valide || demander.enCours}
              onClick={async () => {
                if (cents === null) return;
                const r = await demander.lancer(
                  { commande, litige: null, montant: cents, motif: motif.trim() },
                  "Remboursement demandé.",
                );
                if (r?.ok) {
                  annoncer(r.donnees);
                  fermer();
                  surGeste?.();
                }
              }}
            >
              {demander.enCours ? "Un instant…" : "Demander le remboursement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Demander le remboursement décidé sur un litige : le montant est celui de la décision. */
export function BoutonRembourserLitige({
  commande,
  litige,
  montant,
  surGeste,
}: {
  commande: string;
  litige: string;
  montant: number;
  surGeste?: () => void;
}) {
  const [ouvert, setOuvert] = useState(false);
  const demander = useGeste(demanderRemboursement);
  return (
    <>
      <Button onClick={() => setOuvert(true)}>
        <HandCoins /> Rembourser {euros(montant)}
      </Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre="Demander le remboursement"
        description={
          <>
            {euros(montant)} pour l’acheteur, le montant de la décision. Au-delà de 100 €, une seconde personne
            valide ; sinon l’envoi à Stripe part dans la minute.
          </>
        }
        libelleAction="Demander"
        longueurMin={5}
        enCours={demander.enCours}
        surConfirmation={async (motif) => {
          const r = await demander.lancer({ commande, litige, montant: null, motif }, "Remboursement demandé.");
          if (r?.ok) {
            annoncer(r.donnees);
            setOuvert(false);
            surGeste?.();
          }
        }}
      />
    </>
  );
}

/** Relancer un ordre en échec : une tentative de plus, une clé neuve. */
export function BoutonRelancer({ ordre, surGeste, taille = "sm" }: { ordre: string; surGeste?: () => void; taille?: Taille }) {
  const [ouvert, setOuvert] = useState(false);
  const relancer = useGeste(relancerOrdre);
  return (
    <>
      <Button variant="outline" size={taille} onClick={() => setOuvert(true)}>
        <RotateCcw /> Relancer
      </Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre="Relancer le remboursement"
        description="Avant tout nouvel envoi, l’exécuteur cherche chez Stripe un remboursement de cet ordre : il ne partira pas deux fois."
        libelleAction="Relancer"
        longueurMin={5}
        enCours={relancer.enCours}
        surConfirmation={async (motif) => {
          const r = await relancer.lancer({ ordre, motif }, "Remboursement relancé.");
          if (r?.ok) {
            setOuvert(false);
            surGeste?.();
          }
        }}
      />
    </>
  );
}

/** Annuler un ordre qui n'est pas parti. */
export function BoutonAnnulerOrdre({ ordre, surGeste, taille = "sm" }: { ordre: string; surGeste?: () => void; taille?: Taille }) {
  const [ouvert, setOuvert] = useState(false);
  const annuler = useGeste(annulerOrdre);
  return (
    <>
      <Button variant="outline" size={taille} onClick={() => setOuvert(true)}>
        <Ban /> Annuler
      </Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        destructif
        titre="Annuler l’ordre"
        description="Rien n’est parti chez Stripe. L’ordre s’annule, et sa validation éventuelle avec lui."
        libelleAction="Annuler l’ordre"
        longueurMin={5}
        enCours={annuler.enCours}
        surConfirmation={async (motif) => {
          const r = await annuler.lancer({ ordre, motif }, "Ordre annulé.");
          if (r?.ok) {
            setOuvert(false);
            surGeste?.();
          }
        }}
      />
    </>
  );
}

/** La seconde clé : valider ou refuser la demande d'une autre personne. */
export function BoutonsValidation({
  validation,
  surGeste,
  taille = "sm",
}: {
  validation: string;
  surGeste?: () => void;
  taille?: Taille;
}) {
  const [choix, setChoix] = useState<"valider" | "refuser" | null>(null);
  const decider = useGeste(deciderValidation);
  return (
    <>
      <Button variant="outline" size={taille} onClick={() => setChoix("refuser")} disabled={decider.enCours}>
        <X /> Refuser
      </Button>
      <Button size={taille} onClick={() => setChoix("valider")} disabled={decider.enCours}>
        <Check /> Valider
      </Button>
      <DialogueMotif
        ouvert={choix !== null}
        surFermeture={() => setChoix(null)}
        destructif={choix === "refuser"}
        motifObligatoire={choix === "refuser"}
        titre={choix === "refuser" ? "Refuser le remboursement" : "Valider le remboursement"}
        description={
          choix === "refuser"
            ? "L’ordre s’annule. Un refus se motive : le demandeur le lira."
            : "L’état est relu : si le restant a changé depuis la demande, rien ne part. Sinon, l’envoi à Stripe part dans la minute."
        }
        libelleAction={choix === "refuser" ? "Refuser" : "Valider"}
        enCours={decider.enCours}
        surConfirmation={async (motif) => {
          const r = await decider.lancer(
            { validation, approuver: choix === "valider", motif },
            choix === "refuser" ? "Remboursement refusé." : "Remboursement validé.",
          );
          if (r) {
            setChoix(null);
            surGeste?.();
          }
        }}
      />
    </>
  );
}

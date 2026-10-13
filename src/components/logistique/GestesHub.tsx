"use client";

import { useState } from "react";
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
import { reactiverHub, retirerHub, validerHub } from "@/lib/logistique/actions";
import { detailPubliable } from "@/lib/logistique/types";

// Les longueurs que la base exige.
const DETAIL_MIN = 12;
const MOTIF_FERMETURE_MIN = 3;
const MOTIF_REOUVERTURE_MIN = 5;

/**
 * « Valider » une épingle : le point devient un rendez-vous proposé. Le détail
 * n'est pas optionnel, en base comme ici : « à compléter » ou une phrase de moins
 * de douze caractères sont refusés — la personne qui se présente au rendez-vous
 * n'a que ce texte pour trouver le point.
 */
export function GesteValidationHub({
  hub,
  repere,
  detail: detailActuel = null,
}: {
  hub: string;
  repere: string | null;
  /** Le détail déjà écrit : repris quand il dit où se présenter, pas quand il attend encore d'être écrit. */
  detail?: string | null;
}) {
  const propose = detailPubliable(detailActuel) ? (detailActuel ?? "").trim() : "";
  const [ouvert, setOuvert] = useState(false);
  const [detail, setDetail] = useState(propose);
  const [nouveauRepere, setNouveauRepere] = useState(repere ?? "");
  const valider = useGeste(validerHub);
  const detailValide = detail.trim().length >= DETAIL_MIN && !/à compléter|a completer/i.test(detail);

  return (
    <>
      <Button
        onClick={() => {
          setDetail(propose);
          setNouveauRepere(repere ?? "");
          setOuvert(true);
        }}
      >
        Valider
      </Button>
      <Dialog open={ouvert} onOpenChange={(o) => !o && setOuvert(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider l’épingle</DialogTitle>
            <DialogDescription>
              Le point devient un rendez-vous proposé aux utilisateurs. Regardez l’épingle sur la carte, puis écrivez où
              se présenter exactement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor={`detail-${hub}`}>Détail affiché</Label>
              <Textarea
                id={`detail-${hub}`}
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Par exemple : parking du port, côté capitainerie"
                rows={2}
              />
              {detail !== "" && !detailValide && (
                <p className="text-legende text-h2h-error">Au moins 12 caractères, qui disent où se présenter.</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`repere-${hub}`}>Repère (facultatif)</Label>
              <Input id={`repere-${hub}`} value={nouveauRepere} onChange={(e) => setNouveauRepere(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOuvert(false)} disabled={valider.enCours}>
              Annuler
            </Button>
            <Button
              disabled={!detailValide || valider.enCours}
              onClick={async () => {
                const r = await valider.lancer(
                  { hub, detail: detail.trim(), repere: nouveauRepere.trim() || null },
                  "Épingle validée : le point est proposé.",
                );
                if (r?.ok) setOuvert(false);
              }}
            >
              {valider.enCours ? "Un instant…" : "Valider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * « Désactiver pour les nouvelles recherches » (§ 12.4) — ou écarter une épingle
 * qui n'a jamais été publiée. Le motif est gardé ; un point fermé n'est plus
 * proposé nulle part, et les rendez-vous déjà confirmés y restent.
 */
export function GesteFermetureHub({
  hub,
  publie,
  trajets,
  rendezVous,
  propositions,
}: {
  hub: string;
  /** Le point est-il proposé aujourd'hui ? Sinon, c'est une épingle qu'on écarte. */
  publie: boolean;
  trajets: number;
  rendezVous: number;
  /** Les propositions en cours qui peuvent encore aboutir à ce point : fermer ne les arrête pas. */
  propositions: number;
}) {
  const [ouvert, setOuvert] = useState(false);
  const retirer = useGeste(retirerHub);
  return (
    <>
      <Button variant={publie ? "destructive" : "outline"} onClick={() => setOuvert(true)}>
        {publie ? "Fermer aux nouvelles recherches" : "Écarter"}
      </Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre={publie ? "Fermer ce point aux nouvelles recherches ?" : "Écarter cette épingle ?"}
        description={
          publie ? (
            <>
              Il ne sera plus proposé : ni comme point de collecte (un trajet qui y part ne recevra plus de proposition),
              ni à la remise (un trajet qui n’a plus d’autre point de remise ouvert — ou dont c’est le premier, dans
              l’ancien parcours — n’en recevra plus non plus), ni à la publication d’un trajet.{" "}
              {trajets > 0
                ? `${trajets > 1 ? `Les cotransporteurs de ${trajets} trajets` : "Le cotransporteur d’un trajet"} qui y ${trajets > 1 ? "passent seront prévenus" : "passe sera prévenu"}. `
                : ""}
              {rendezVous > 0
                ? `${rendezVous > 1 ? `${rendezVous} rendez-vous confirmés y restent` : "Un rendez-vous confirmé y reste"} : fermer le point ne les déplace pas et ne les annule pas. `
                : ""}
              {propositions > 0
                ? `${propositions > 1 ? `${propositions} propositions en cours peuvent` : "Une proposition en cours peut"} encore y confirmer un rendez-vous : fermer le point ne ${propositions > 1 ? "les" : "l’"}arrête pas. `
                : ""}
              Le motif reste interne.
            </>
          ) : (
            "Elle quitte les épingles à valider et ne sera pas proposée aux utilisateurs. Le motif évite qu’on la repose à l’identique."
          )
        }
        libelleAction={publie ? "Fermer le point" : "Écarter"}
        destructif
        longueurMin={MOTIF_FERMETURE_MIN}
        enCours={retirer.enCours}
        surConfirmation={async (motif) => {
          const r = await retirer.lancer(
            { hub, motif },
            publie ? "Point fermé : il n’est plus proposé aux nouvelles recherches." : "Épingle écartée.",
          );
          if (r?.ok) setOuvert(false);
        }}
      />
    </>
  );
}

/** « Réactiver » (§ 12.4) : un point fermé est de nouveau proposé ; une épingle écartée revient à valider. */
export function GesteReouvertureHub({ hub, dejaPublie }: { hub: string; dejaPublie: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  const rouvrir = useGeste(reactiverHub);
  return (
    <>
      <Button onClick={() => setOuvert(true)}>{dejaPublie ? "Rouvrir le point" : "Remettre à valider"}</Button>
      <DialogueMotif
        ouvert={ouvert}
        surFermeture={() => setOuvert(false)}
        titre={dejaPublie ? "Rouvrir ce point ?" : "Remettre cette épingle à valider ?"}
        description={
          dejaPublie
            ? "Il sera de nouveau proposé à la collecte, à la remise et à la publication d’un trajet. Les cotransporteurs dont un trajet y passe en seront prévenus."
            : "Elle revient parmi les épingles à valider : elle ne sera proposée aux utilisateurs qu’une fois regardée et validée."
        }
        libelleAction={dejaPublie ? "Rouvrir" : "Remettre à valider"}
        longueurMin={MOTIF_REOUVERTURE_MIN}
        enCours={rouvrir.enCours}
        surConfirmation={async (motif) => {
          const r = await rouvrir.lancer(
            { hub, motif },
            dejaPublie ? "Point rouvert : il est de nouveau proposé." : "Épingle remise à valider.",
          );
          if (r?.ok) setOuvert(false);
        }}
      />
    </>
  );
}

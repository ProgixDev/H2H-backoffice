"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { DialogueMotif } from "@/components/bo/DialogueMotif";
import { StatutPastille } from "@/components/bo/StatutPastille";
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
import { retirerHub, validerHub } from "@/lib/logistique/actions";
import { LIBELLE_LIEU, lienCarte, quand, type HubAValider } from "@/lib/logistique/types";

type Props = { hubs: HubAValider[]; peutGerer: boolean };

/**
 * Les épingles à regarder : valider (avec le sous-texte qui dit où se
 * présenter) ou écarter (avec un motif, désormais gardé).
 *
 * ⚠️ LE DÉTAIL N'EST PAS OPTIONNEL, EN BASE COMME ICI : « à compléter » ou une
 * phrase de moins de 12 caractères sont refusés — la personne qui se présente
 * au rendez-vous n'a que ce texte pour trouver le point.
 */
export function ListeHubs({ hubs, peutGerer }: Props) {
  const [validation, setValidation] = useState<HubAValider | null>(null);
  const [ecart, setEcart] = useState<HubAValider | null>(null);
  const [detail, setDetail] = useState("");
  const [repere, setRepere] = useState("");
  const valider = useGeste(validerHub);
  const retirer = useGeste(retirerHub);

  if (hubs.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="handoff" taille={96} />
        <p className="mt-3 font-semibold">Aucune épingle à regarder</p>
        <p className="text-corps text-muted-foreground">Les nouveaux points de rendez-vous apparaîtront ici.</p>
      </div>
    );
  }

  const detailValide =
    detail.trim().length >= 12 && !/à compléter|a completer/i.test(detail);

  return (
    <>
      <ul className="grid gap-3">
        {hubs.map((h) => (
          <li key={h.id} className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid min-w-0 flex-1 gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{h.nom ?? h.repere ?? "Point sans nom"}</span>
                  <StatutPastille ton="neutre">{LIBELLE_LIEU[h.type_lieu] ?? h.type_lieu}</StatutPastille>
                </div>
                <span className="text-legende text-muted-foreground">
                  {h.ville ?? "—"}
                  {h.region ? ` · ${h.region}` : ""} · posé le {quand(h.cree_le)}
                </span>
                <span className="text-corps">Repère : {h.repere ?? "—"}</span>
                <span className="text-corps text-muted-foreground">
                  Détail affiché : « {h.detail_affiche ?? "—"} »
                </span>
                <a
                  href={lienCarte(h.latitude, h.longitude)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-legende text-h2h-primary hover:underline"
                >
                  Voir l’épingle sur la carte <ExternalLink className="size-3" />
                </a>
              </div>
              {peutGerer && (
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setEcart(h)}>
                    Écarter
                  </Button>
                  <Button
                    onClick={() => {
                      setDetail("");
                      setRepere(h.repere ?? "");
                      setValidation(h);
                    }}
                  >
                    Valider
                  </Button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <Dialog open={validation !== null} onOpenChange={(o) => !o && setValidation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider l’épingle</DialogTitle>
            <DialogDescription>
              Le point devient un rendez-vous proposé aux utilisateurs. Écrivez où se présenter exactement.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="detail-hub">Détail affiché</Label>
              <Textarea
                id="detail-hub"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Par exemple : parking du port, côté capitainerie"
                rows={2}
              />
              {detail !== "" && !detailValide && (
                <p className="text-legende text-h2h-error">
                  Au moins 12 caractères, qui disent où se présenter.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="repere-hub">Repère (facultatif)</Label>
              <Input id="repere-hub" value={repere} onChange={(e) => setRepere(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setValidation(null)} disabled={valider.enCours}>
              Annuler
            </Button>
            <Button
              disabled={!detailValide || valider.enCours}
              onClick={async () => {
                if (!validation) return;
                const r = await valider.lancer(
                  { hub: validation.id, detail: detail.trim(), repere: repere.trim() || null },
                  "Épingle validée.",
                );
                if (r?.ok) setValidation(null);
              }}
            >
              {valider.enCours ? "Un instant…" : "Valider"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DialogueMotif
        ouvert={ecart !== null}
        surFermeture={() => setEcart(null)}
        titre="Écarter cette épingle ?"
        description="Elle quitte la liste et ne sera pas proposée aux utilisateurs. Le motif évite qu’on la repose à l’identique."
        libelleAction="Écarter"
        destructif
        enCours={retirer.enCours}
        surConfirmation={async (motif) => {
          if (!ecart) return;
          const r = await retirer.lancer({ hub: ecart.id, motif }, "Épingle écartée.");
          if (r?.ok) setEcart(null);
        }}
      />
    </>
  );
}

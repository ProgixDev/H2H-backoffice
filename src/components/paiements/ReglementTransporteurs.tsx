"use client";

import { useState } from "react";
import { cn } from "cn";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { DialogueConfirmation } from "@/components/bo/DialogueConfirmation";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { jourMoyen } from "@/lib/dates";
import { useGeste } from "@/lib/db/useGeste";
import { reglerFactureTransporteur } from "@/lib/paiements/actions";
import {
  LIBELLE_TRANSPORTEUR,
  TRANSPORTEURS,
  euros,
  type DuTransporteur,
  type Transporteur,
} from "@/lib/paiements/types";

type Props = { dus: DuTransporteur[]; peutRegler: boolean };

/**
 * Ce que HandToHand doit aux transporteurs tiers, et l'enregistrement du
 * règlement d'une facture payée hors de Stripe.
 *
 * ⚠️ AUCUN MONTANT NE PART D'ICI. On coche des commandes et on nomme la facture ;
 * le total affiché repart comme CONTRÔLE : si le grand livre dit autre chose au
 * moment du règlement, rien ne s'écrit et la liste se recharge.
 *
 * ⚠️ LE TRANSPORTEUR SE NOMME, IL NE SE DÉDUIT PAS : le mode d'envoi d'une
 * commande décrit l'aller, pas un retour facturé après absence.
 */
export function ReglementTransporteurs({ dus, peutRegler }: Props) {
  const [coches, setCoches] = useState<Set<string>>(new Set());
  const [transporteur, setTransporteur] = useState<Transporteur | null>(null);
  const [reference, setReference] = useState("");
  const [confirmation, setConfirmation] = useState(false);
  const regler = useGeste(reglerFactureTransporteur);

  if (dus.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="coin" taille={96} />
        <p className="mt-3 font-semibold">Rien n’est dû aux transporteurs tiers</p>
        <p className="text-corps text-muted-foreground">
          Chaque envoi postal encaissé apparaîtra ici jusqu’au règlement de sa facture.
        </p>
      </div>
    );
  }

  // ⚠️ LA SÉLECTION SE RELIT DANS LA LISTE DU MOMENT : après un rechargement, une
  // commande soldée entre-temps ne compte plus, ni dans le total ni dans l'envoi.
  const selection = dus.filter((d) => coches.has(d.commande_id));
  const total = selection.reduce((s, d) => s + Number(d.du_cents), 0);
  const pret = selection.length > 0 && transporteur !== null && reference.trim() !== "";

  const basculer = (id: string) =>
    setCoches((c) => {
      const n = new Set(c);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  return (
    <div className="grid gap-4">
      <ul className="grid gap-2">
        {dus.map((d) => (
          <li key={d.commande_id}>
            <label
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-card p-3",
                peutRegler && "cursor-pointer hover:bg-muted/50",
              )}
              style={{ boxShadow: "var(--ombre-carte)" }}
            >
              {peutRegler && (
                <input
                  type="checkbox"
                  className="size-4 accent-h2h-primary"
                  checked={coches.has(d.commande_id)}
                  onChange={() => basculer(d.commande_id)}
                />
              )}
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{d.numero}</span>
                  <StatutPastille ton="neutre">{LIBELLE_TRANSPORTEUR[d.mode_envoi] ?? d.mode_envoi}</StatutPastille>
                  {d.retour_inclus && <StatutPastille ton="attention">Retour inclus</StatutPastille>}
                  {d.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                </span>
                <span className="text-legende text-muted-foreground">Dû depuis le {jourMoyen(d.depuis)}</span>
              </span>
              <span className="font-bold">{euros(d.du_cents)}</span>
            </label>
          </li>
        ))}
      </ul>

      {peutRegler && (
        <div className="grid gap-4 rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
          <div className="grid gap-2">
            <Label id="transporteur-facture">Transporteur qui a émis la facture</Label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="transporteur-facture">
              {TRANSPORTEURS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="radio"
                  aria-checked={transporteur === t.id}
                  onClick={() => setTransporteur(t.id)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-corps transition-colors",
                    transporteur === t.id
                      ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary"
                      : "hover:bg-muted",
                  )}
                >
                  {t.libelle}
                </button>
              ))}
            </div>
            <p className="text-legende text-muted-foreground">
              Le mode d’envoi d’une commande décrit l’aller ; un retour facturé après absence peut venir d’un
              autre transporteur.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reference-facture">Numéro de facture</Label>
            <Input
              id="reference-facture"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Par exemple : MR-2026-09-001"
            />
            <p className="text-legende text-muted-foreground">
              Une facture ne s’enregistre qu’une fois par transporteur.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-corps">
              {selection.length} commande{selection.length > 1 ? "s" : ""} ·{" "}
              <span className="font-bold">{euros(total)}</span>
            </span>
            <Button disabled={!pret || regler.enCours} onClick={() => setConfirmation(true)}>
              Enregistrer le règlement
            </Button>
          </div>
        </div>
      )}

      <DialogueConfirmation
        ouvert={confirmation}
        surFermeture={() => setConfirmation(false)}
        titre="Enregistrer ce règlement ?"
        description={`${LIBELLE_TRANSPORTEUR[transporteur ?? ""] ?? "—"} · facture ${reference.trim()} · ${euros(total)} pour ${selection.length} commande${selection.length > 1 ? "s" : ""}. La base relit ce que chaque commande doit : si le montant a changé depuis l’affichage, rien ne s’enregistre et la liste se recharge.`}
        libelleAction="Enregistrer"
        enCours={regler.enCours}
        surConfirmation={async () => {
          if (!transporteur) return;
          const r = await regler.lancer(
            {
              transporteur,
              reference: reference.trim(),
              commandes: selection.map((d) => d.commande_id),
              total,
            },
            "Règlement enregistré.",
          );
          setConfirmation(false);
          if (r?.ok) {
            setCoches(new Set());
            setReference("");
            setTransporteur(null);
          }
        }}
      />
    </div>
  );
}

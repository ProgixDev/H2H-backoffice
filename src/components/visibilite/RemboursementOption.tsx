"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HandCoins } from "lucide-react";
import { ErreurLecture, lireActivite } from "@/components/activite/commun";
import { LectureEchouee } from "@/components/bo/LectureEchouee";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { TON_ORDRE } from "@/components/paiements/OrdresFinanciers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { dateCourte } from "@/lib/activite/temps";
import { useGeste } from "@/lib/db/useGeste";
import { centimes, euros, LIBELLE_STATUT_ORDRE, saisieEuros } from "@/lib/paiements/types";
import { demanderRemboursementOption } from "@/lib/visibilite/actions";
import {
  LIBELLE_ETAT_OPTION,
  LIBELLE_OPTION,
  partEnMots,
  type RemboursementOption as Lecture,
} from "@/lib/visibilite/types";

function Ligne({ libelle, children }: { libelle: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-3 text-corps">
      <span className="text-muted-foreground">{libelle}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

/**
 * Le remboursement d'une option, dans le dossier de sa rétractation : ce qui a
 * été payé, ce que la rétractation impose de rendre, ce qui l'a déjà été, et la
 * demande — à deux clés.
 *
 * 🔴 LA SUGGESTION VIENT DE LA BASE, ET SES BORNES AUSSI : jamais en deçà de ce
 * que la rétractation impose, jamais au-delà de ce qui reste payé. À la réussite,
 * la base émet l'avoir qui cite la facture et clôt ce dossier.
 */
export function RemboursementOption({
  dossier,
  peutAgir,
  maintenant,
  surGeste,
}: {
  dossier: string;
  peutAgir: boolean;
  maintenant: number;
  surGeste?: () => void;
}) {
  const client = useQueryClient();
  const lecture = useQuery({
    queryKey: ["remboursement-option", dossier],
    queryFn: ({ signal }) => lireActivite<Lecture>(new URLSearchParams({ dossier }), signal, "/api/options"),
    refetchInterval: 15_000,
  });
  const demander = useGeste(demanderRemboursementOption);
  const [montant, setMontant] = useState<string | null>(null);
  const [motif, setMotif] = useState("");

  if (lecture.isError) {
    const e = lecture.error;
    if (e instanceof ErreurLecture && e.indice === "BO_PERMISSION") {
      return <p className="text-legende text-muted-foreground">Le remboursement se lit par la Finance et la Direction.</p>;
    }
    return <LectureEchouee message={e.message} />;
  }
  const r = lecture.data;
  if (!r) return <Skeleton className="h-32" />;

  const saisie = montant ?? saisieEuros(r.suggestion_cents);
  const cents = centimes(saisie);
  const valide = cents !== null && cents > 0 && cents >= r.minimum_cents && cents <= r.disponible_cents
    && motif.trim().length >= 5;

  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <Ligne libelle="Option">
          {LIBELLE_OPTION[r.option.option] ?? r.option.option} · « {r.option.titre ?? "—"} »
        </Ligne>
        <Ligne libelle="État">{LIBELLE_ETAT_OPTION[r.option.etat] ?? r.option.etat}</Ligne>
        <Ligne libelle="Part exécutée">{partEnMots(r.part)}</Ligne>
        <Ligne libelle="Payé">
          {euros(r.paiement.montant_cents)}
          {r.paiement.reel === false && <StatutPastille ton="attention" className="ml-2">TEST</StatutPastille>}
        </Ligne>
        {r.facture && <Ligne libelle="Facture">{r.facture.numero}</Ligne>}
        {r.retractation && (
          <>
            <Ligne libelle="Rétractation">
              {r.retractation.ref} · le {dateCourte(r.retractation.demandee_le, maintenant)}
            </Ligne>
            <Ligne libelle="Dû à l’acheteur">
              {euros(r.retractation.a_rembourser_cents)} (part exécutée {euros(r.retractation.execute_cents)}
              {r.retractation.deja_rembourse_cents > 0 && `, déjà rendu ${euros(r.retractation.deja_rembourse_cents)}`})
            </Ligne>
            <Ligne libelle="À rembourser avant">{dateCourte(r.retractation.rembourser_avant, maintenant)}</Ligne>
          </>
        )}
        <Ligne libelle="Déjà remboursé">{euros(r.rembourse_cents)}</Ligne>
        <Ligne libelle="Peut encore partir">{euros(r.disponible_cents)}</Ligne>
      </div>

      {r.ordres.length > 0 && (
        <ul className="grid gap-1.5">
          {r.ordres.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-2 text-legende">
              <StatutPastille ton={TON_ORDRE[o.statut]}>{LIBELLE_STATUT_ORDRE[o.statut]}</StatutPastille>
              <span className="font-medium">{o.ref}</span>
              <span>{euros(o.montant_cents)}</span>
              {o.avoir && <span className="text-muted-foreground">avoir {o.avoir}</span>}
              {o.erreur && <span className="text-h2h-error">{o.erreur}</span>}
            </li>
          ))}
        </ul>
      )}

      {!r.possible ? (
        <p className="text-legende text-muted-foreground">{r.raison}</p>
      ) : peutAgir ? (
        <div className="grid gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor={`montant-${dossier}`}>Montant à rembourser (€)</Label>
            <Input
              id={`montant-${dossier}`}
              inputMode="decimal"
              value={saisie}
              onChange={(e) => setMontant(e.target.value)}
            />
            <span className="text-legende text-muted-foreground">
              Suggestion : {euros(r.suggestion_cents)}
              {r.minimum_cents > 0 && ` · au moins ${euros(r.minimum_cents)} (la rétractation)`} · au plus{" "}
              {euros(r.disponible_cents)}
            </span>
          </div>
          <Textarea
            value={motif}
            onChange={(e) => setMotif(e.target.value)}
            rows={2}
            placeholder="Motif — il reste interne, conservé au journal d’audit."
            aria-label="Motif du remboursement"
          />
          <Button
            size="sm"
            disabled={!valide || demander.enCours}
            onClick={async () => {
              if (cents === null) return;
              const res = await demander.lancer(
                { famille: r.famille, boost: r.boost, montant: cents, motif: motif.trim() },
                "Remboursement demandé.",
              );
              if (res?.ok) {
                toast.message("Soumis à validation", {
                  description: "Une seconde personne (Finance ou Direction) validera avant tout envoi à Stripe.",
                });
                setMontant(null);
                setMotif("");
                void client.invalidateQueries({ queryKey: ["remboursement-option", dossier] });
                surGeste?.();
              }
            }}
          >
            <HandCoins /> {demander.enCours ? "Un instant…" : "Demander le remboursement"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

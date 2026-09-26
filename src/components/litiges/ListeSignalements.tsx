"use client";

import Link from "next/link";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import {
  LIBELLE_ETAT_SIGNALEMENT,
  LIBELLE_GENRE,
  type CompteMotif,
  type Signalement,
} from "@/lib/litiges/types";
import { cheminFiche } from "@/lib/operations/types";
import { BoutonRequalifier } from "./GestesDossier";

/**
 * Les dossiers qui ne sont pas des réclamations : les incidents de
 * co-livraison (absence, refus du colis) et les signalements (fraude,
 * comportement), rangés sous les mêmes motifs.
 *
 * ⚠️ LEUR TRAITEMENT A SA PLACE : un incident se tranche avec la phase 4
 * (H2H Logistic), un signalement avec la phase 2b (Utilisateurs). Ici, on les
 * voit, on ouvre l'achat d'un incident, et on les range.
 */
export function ListeSignalements({ signalements, motifs, peutInstruire }: {
  signalements: Signalement[];
  motifs: CompteMotif[];
  peutInstruire: boolean;
}) {
  if (signalements.length === 0) {
    return <p className="text-corps text-muted-foreground">Aucun incident ni signalement sous ce motif.</p>;
  }
  return (
    <ul className="grid gap-3">
      {signalements.map((s) => (
        <li key={`${s.genre}:${s.id}`} className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid min-w-0 flex-1 gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{s.titre}</span>
                <StatutPastille ton={s.ouvert ? "actif" : "muet"}>{LIBELLE_ETAT_SIGNALEMENT[s.etat] ?? s.etat}</StatutPastille>
                <StatutPastille ton={s.motif ? "neutre" : "attention"}>{s.motif_libelle ?? "À qualifier"}</StatutPastille>
                {s.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
              </div>
              <span className="text-legende text-muted-foreground">
                {LIBELLE_GENRE[s.genre]} · {s.participants} · {dateHeure(s.ouvert_le)}
                {s.motif_qualifie && " · motif qualifié par l’équipe"}
              </span>
              {s.genre === "incident" && s.reference && (
                <span className="text-corps">
                  Achat{" "}
                  <Link href={cheminFiche(s.reference, "litiges")} className="font-medium hover:underline">
                    {s.reference}
                  </Link>
                </span>
              )}
              {s.genre === "signalement_annonce" && s.reference && (
                <span className="text-corps">Annonce « {s.reference} »</span>
              )}
            </div>
            {peutInstruire && <BoutonRequalifier genre={s.genre} objet={s.id} motifs={motifs} actuel={s.motif} />}
          </div>
        </li>
      ))}
    </ul>
  );
}

"use client";

import Link from "next/link";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { cheminAnnonce } from "@/lib/annonces/types";
import { dateHeure } from "@/lib/dates";
import { cheminLive } from "@/lib/lives/types";
import {
  LIBELLE_ETAT_SIGNALEMENT,
  LIBELLE_GENRE,
  type CompteMotif,
  type Signalement,
} from "@/lib/litiges/types";
import { cheminFiche } from "@/lib/operations/types";
import { cheminCompte } from "@/lib/utilisateurs/types";
import { BoutonRequalifier } from "./GestesDossier";

/** Ce qu'un signalement vise, et la fiche où il s'examine — quand l'équipier peut l'ouvrir. */
function Cible({ s, peutOuvrirAnnonce, peutOuvrirCompte, peutOuvrirLive }: {
  s: Signalement;
  peutOuvrirAnnonce: boolean;
  peutOuvrirCompte: boolean;
  peutOuvrirLive: boolean;
}) {
  if (s.genre === "signalement_utilisateur") {
    return s.cible && peutOuvrirCompte ? (
      <Link href={cheminCompte(s.cible)} className="text-corps font-medium text-h2h-primary hover:underline">
        Ouvrir le compte signalé
      </Link>
    ) : null;
  }
  // Un live (20261002007000) : ses signalements s'examinent sur sa fiche, avec la permission des lives.
  if (s.genre === "signalement_live") {
    return (
      <span className="text-corps">
        Live{" "}
        {s.cible && peutOuvrirLive ? (
          <Link href={cheminLive(s.cible)} className="font-medium text-h2h-primary hover:underline">
            « {s.reference ?? "sans titre"} »
          </Link>
        ) : (
          `« ${s.reference ?? "supprimé"} »`
        )}
      </span>
    );
  }
  if (s.genre !== "signalement_annonce" && s.genre !== "signalement_recherche") return null;
  const quoi = s.genre === "signalement_annonce" ? "Annonce" : "Recherche";
  return (
    <span className="text-corps">
      {quoi}{" "}
      {s.cible && peutOuvrirAnnonce ? (
        <Link href={cheminAnnonce(s.cible)} className="font-medium text-h2h-primary hover:underline">
          « {s.reference ?? "sans titre"} »
        </Link>
      ) : (
        `« ${s.reference ?? "supprimée"} »`
      )}
    </span>
  );
}

/**
 * Les dossiers qui ne sont pas des réclamations : les incidents de
 * co-livraison (absence, refus du colis) et les signalements (fraude,
 * comportement), rangés sous les mêmes motifs.
 *
 * ⚠️ LEUR TRAITEMENT A SA PLACE : un incident se tranche avec la phase 4
 * (H2H Logistic) ; un signalement s'examine sur la fiche de ce qu'il vise —
 * l'annonce, la recherche, le compte, le live. Ici, on les voit, on dit où en est chaque
 * signalement, on ouvre ce qu'il vise ou l'achat d'un incident, et on les range.
 */
export function ListeSignalements({
  signalements,
  motifs,
  peutInstruire,
  peutOuvrirAnnonce = false,
  peutOuvrirCompte = false,
  peutOuvrirLive = false,
}: {
  signalements: Signalement[];
  motifs: CompteMotif[];
  peutInstruire: boolean;
  /** `annonces.lire` : l'annonce ou la recherche signalée s'ouvre, et ses signalements s'y examinent. */
  peutOuvrirAnnonce?: boolean;
  /** `utilisateurs.lire` : le compte signalé s'ouvre, et ses signalements s'y examinent. */
  peutOuvrirCompte?: boolean;
  /** `live.lire` : le live signalé s'ouvre, et ses signalements s'y examinent. */
  peutOuvrirLive?: boolean;
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
              <Cible
                s={s}
                peutOuvrirAnnonce={peutOuvrirAnnonce}
                peutOuvrirCompte={peutOuvrirCompte}
                peutOuvrirLive={peutOuvrirLive}
              />
            </div>
            {peutInstruire && <BoutonRequalifier genre={s.genre} objet={s.id} motifs={motifs} actuel={s.motif} />}
          </div>
        </li>
      ))}
    </ul>
  );
}

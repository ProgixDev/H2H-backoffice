import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import { LIBELLE_LIEU, cheminHub, lienCarte, type Hub } from "@/lib/logistique/types";
import { GesteFermetureHub, GesteValidationHub } from "./GestesHub";

type Props = { hubs: Hub[]; peutGerer: boolean; filtree?: boolean };

/**
 * Les épingles à regarder — le filtre « À valider » de l'annuaire : valider
 * (avec le sous-texte qui dit où se présenter) ou écarter (avec un motif, gardé).
 * Le nom ouvre la fiche du point.
 */
export function ListeHubs({ hubs, peutGerer, filtree = false }: Props) {
  if (hubs.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="handoff" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Aucune épingle à valider pour cette recherche" : "Aucune épingle à regarder"}</p>
        <p className="text-corps text-muted-foreground">Les nouveaux points de rendez-vous apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3">
      {hubs.map((h) => (
        <li key={h.id} className="rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid min-w-0 flex-1 gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={cheminHub(h.id)} className="font-semibold text-h2h-primary hover:underline">
                  {h.nom ?? h.repere ?? "Point sans nom"}
                </Link>
                <StatutPastille ton="neutre">{LIBELLE_LIEU[h.type_lieu] ?? h.type_lieu}</StatutPastille>
              </div>
              <span className="text-legende text-muted-foreground">
                {h.ville ?? "—"}
                {h.region ? ` · ${h.region}` : ""} · posé le {dateHeure(h.cree_le)}
              </span>
              <span className="text-corps">Repère : {h.repere ?? "—"}</span>
              <span className="text-corps text-muted-foreground">Détail affiché : « {h.detail_affiche ?? "—"} »</span>
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
                <GesteFermetureHub hub={h.id} publie={false} trajets={0} rendezVous={0} />
                <GesteValidationHub hub={h.id} repere={h.repere} />
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

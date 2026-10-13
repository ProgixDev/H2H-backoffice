import Link from "next/link";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { LIBELLE_ACTEUR } from "@/lib/activite/types";
import { dateHeure } from "@/lib/dates";
import { LIBELLE_MOMENT, type Colivraison, type MomentColivraison } from "@/lib/logistique/types";
import { LIBELLE_DETENTEUR } from "@/lib/operations/libelles";
import { cheminFiche } from "@/lib/operations/types";

/** ⚠️ UNE CO-LIVRAISON CLOSE SANS REMISE N'EST JAMAIS VERTE. */
export const TON_MOMENT: Record<MomentColivraison, Ton> = {
  a_collecter: "marque",
  en_route: "actif",
  remise: "succes",
  sans_remise: "muet",
};

/**
 * ⚠️ UN PSEUDONYME ABSENT N'EST PAS UN COMPTE EFFACÉ : un membre peut ne pas en
 * avoir choisi (vu en production le 13/10/2026, sur l'acheteur d'une co-livraison
 * menée à son terme). L'écran dit ce qu'il sait.
 */
const SANS_PSEUDONYME = "sans pseudonyme";

const TON_ALERTE: Record<NonNullable<Colivraison["alerte"]>, Ton> = {
  erreur: "erreur",
  incident: "attention",
  retard: "actif",
};

/** Un rendez-vous : le point, la ville, l'heure prévue — et l'heure validée quand elle l'est. */
function RendezVous({
  point,
  ville,
  prevu,
  valide,
}: {
  point: string | null;
  ville: string | null;
  prevu: string | null;
  valide: string | null;
}) {
  if (!point && !ville && !prevu) return <span className="text-muted-foreground">—</span>;
  return (
    <>
      <span className="block">{[point, ville].filter(Boolean).join(" · ") || "—"}</span>
      <span className="block text-legende tabular-nums text-muted-foreground">
        {prevu ? `prévue le ${dateHeure(prevu)}` : "heure non fixée"}
      </span>
      {valide && <span className="block text-legende tabular-nums">validée le {dateHeure(valide)}</span>}
    </>
  );
}

/**
 * Les co-livraisons (§ 12.3) : les trois participants, le colis, les deux
 * rendez-vous, qui détient le colis, la prochaine action et les incidents
 * ouverts. Chaque ligne ouvre l'onglet Livraison de la fiche de l'opération, où
 * se lisent les présences, les scans et ce qu'un incident retient.
 *
 * 🔴 NI CODE, NI POSITION, NI ADRESSE (R4.15) : des pseudonymes, des points de
 * rendez-vous nommés, des heures.
 */
export function ListeColivraisons({ colivraisons, filtree }: { colivraisons: Colivraison[]; filtree: boolean }) {
  if (colivraisons.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="car" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Aucune co-livraison pour ces filtres" : "Aucune co-livraison"}</p>
        <p className="text-corps text-muted-foreground">
          Une co-livraison apparaît ici dès qu’elle est confirmée — ou, sur l’ancien parcours, dès qu’elle est proposée à
          un cotransporteur particulier.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-2">
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[1180px] text-corps">
          <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Co-livraison</th>
              <th className="px-3 py-2 font-medium">Participants</th>
              <th className="px-3 py-2 font-medium">Collecte</th>
              <th className="px-3 py-2 font-medium">Remise</th>
              <th className="px-3 py-2 font-medium">Colis détenu par</th>
              <th className="px-3 py-2 font-medium">Étape · prochaine action</th>
              <th className="px-3 py-2 font-medium">Incidents</th>
            </tr>
          </thead>
          <tbody>
            {colivraisons.map((c) => (
              <tr key={c.id} className="border-t align-top hover:bg-muted/30">
                <td className="max-w-56 px-3 py-2">
                  <Link
                    href={cheminFiche(c.ref, "livraison")}
                    className="font-medium tabular-nums text-h2h-primary hover:underline"
                  >
                    {c.ref}
                  </Link>
                  <span className="line-clamp-2">« {c.bien_titre ?? "—"} »</span>
                  <span className="block text-legende text-muted-foreground">
                    {[c.format ? `format ${c.format}` : null, c.retour ? "retour" : null, c.par_recherche ? null : "ancien parcours"]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {c.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                </td>
                <td className="px-3 py-2 text-legende">
                  <span className="block">Vendeur · {c.vendeur ?? SANS_PSEUDONYME}</span>
                  <span className="block">Acheteur · {c.acheteur ?? SANS_PSEUDONYME}</span>
                  <span className="block">
                    Cotransporteur · {c.cotransporteur_designe ? (c.cotransporteur ?? SANS_PSEUDONYME) : "pas encore désigné"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <RendezVous point={c.hub_collecte} ville={c.ville_collecte} prevu={c.collecte_prevue} valide={c.collecte_validee_le} />
                </td>
                <td className="px-3 py-2">
                  <RendezVous point={c.hub_remise} ville={c.ville_remise} prevu={c.remise_prevue} valide={c.remise_validee_le} />
                </td>
                <td className="px-3 py-2">
                  <StatutPastille ton={TON_MOMENT[c.moment]}>{LIBELLE_MOMENT[c.moment]}</StatutPastille>
                  <span className="block text-legende">{c.detenteur ? LIBELLE_DETENTEUR[c.detenteur] : "—"}</span>
                </td>
                <td className="max-w-64 px-3 py-2">
                  <span className="block">{c.etape_libelle ?? "—"}</span>
                  {c.action_attendue && (
                    <span className="block text-legende text-muted-foreground">
                      {c.action_attendue}
                      {c.acteur_attendu ? ` · ${LIBELLE_ACTEUR[c.acteur_attendu]}` : ""}
                    </span>
                  )}
                  {c.echeance && (
                    <span className="block text-legende tabular-nums text-muted-foreground">avant le {dateHeure(c.echeance)}</span>
                  )}
                  {c.alerte && c.alerte_libelle && <StatutPastille ton={TON_ALERTE[c.alerte]}>{c.alerte_libelle}</StatutPastille>}
                </td>
                <td className="px-3 py-2">
                  {c.incidents_ouverts > 0 ? (
                    <StatutPastille ton="attention">
                      {c.incidents_ouverts === 1 ? "1 incident ouvert" : `${c.incidents_ouverts} incidents ouverts`}
                    </StatutPastille>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {colivraisons.length >= 300 && (
        <p className="text-legende text-muted-foreground">
          Les 300 premières sont affichées : affinez par un filtre ou une recherche pour voir les autres.
        </p>
      )}
    </div>
  );
}

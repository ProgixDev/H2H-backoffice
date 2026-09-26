import { cn } from "cn";
import { Package } from "lucide-react";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { ilYA } from "@/lib/activite/temps";
import { LIBELLE_ACTEUR, LIBELLE_SERVICE, LIBELLE_TYPE, type Operation } from "@/lib/activite/types";
import { tonEtape, TON_ALERTE } from "./commun";
import { Echeance } from "./Echeance";

type Props = {
  operations: Operation[];
  maintenant: number;
  selection: string | null;
  surOuverture: (o: Operation) => void;
};

function Miniature({ o }: { o: Operation }) {
  return o.bien_image ? (
    // Les photos viennent du stockage de l'application et de domaines variés :
    // `next/image` exigerait de les déclarer une à une.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={o.bien_image} alt="" className="size-10 shrink-0 rounded-lg object-cover" loading="lazy" />
  ) : (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-h2h-surface-elevated">
      <Package className="size-5 text-muted-foreground" />
    </span>
  );
}

const participants = (o: Operation) =>
  o.participants.map((p) => p.pseudo ?? "(compte effacé)").join(" · ") || "—";

function Reference({ o }: { o: Operation }) {
  return (
    <span className="grid gap-0.5">
      <span className="font-semibold tabular-nums">{o.ref}</span>
      <span className="flex flex-wrap items-center gap-1 text-legende text-muted-foreground">
        {LIBELLE_TYPE[o.type] ?? o.type} · {LIBELLE_SERVICE[o.service]}
        {o.est_test && <StatutPastille ton="attention" className="px-1.5 py-0">TEST</StatutPastille>}
      </span>
    </span>
  );
}

function Alerte({ o }: { o: Operation }) {
  return o.alerte ? (
    <StatutPastille ton={TON_ALERTE[o.alerte]}>{o.alerte_libelle}</StatutPastille>
  ) : (
    <span className="text-muted-foreground">—</span>
  );
}

/**
 * La liste des opérations : les douze colonnes du §4, regroupées deux à deux
 * pour tenir sur un écran (référence et service, bien et participants, étape et
 * situation financière, action et acteur).
 */
export function ListeOperations({ operations, maintenant, selection, surOuverture }: Props) {
  return (
    <>
      {/* Grand écran : le tableau. */}
      <div className="hidden overflow-x-auto rounded-xl border bg-card md:block" style={{ boxShadow: "var(--ombre-carte)" }}>
        <table className="w-full min-w-[1100px] text-corps">
          <thead className="border-b text-left text-legende text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Référence · service</th>
              <th className="px-3 py-2 font-medium">Bien · participants</th>
              <th className="px-3 py-2 font-medium">Étape · situation financière</th>
              <th className="px-3 py-2 font-medium">Action attendue · acteur</th>
              <th className="px-3 py-2 font-medium">Échéance</th>
              <th className="px-3 py-2 font-medium">Localisation</th>
              <th className="px-3 py-2 font-medium">Dernier événement</th>
              <th className="px-3 py-2 font-medium">Alerte</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((o) => (
              <tr
                key={o.objet_id}
                onClick={() => surOuverture(o)}
                className={cn(
                  "cursor-pointer border-b align-top last:border-0 hover:bg-muted/60",
                  selection === o.objet_id && "bg-h2h-primary-light hover:bg-h2h-primary-light",
                )}
              >
                <td className="px-3 py-2.5">
                  <button type="button" className="text-left" onClick={() => surOuverture(o)}>
                    <Reference o={o} />
                  </button>
                </td>
                <td className="max-w-[240px] px-3 py-2.5">
                  <span className="flex items-start gap-2">
                    <Miniature o={o} />
                    <span className="grid min-w-0 gap-0.5">
                      <span className="truncate font-medium">{o.bien_titre ?? "—"}</span>
                      <span className="truncate text-legende text-muted-foreground">{participants(o)}</span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <span className="grid justify-items-start gap-1">
                    <StatutPastille ton={tonEtape(o)}>{o.etape_libelle}</StatutPastille>
                    <span className="text-legende text-muted-foreground">{o.finance_libelle}</span>
                  </span>
                </td>
                <td className="max-w-[220px] px-3 py-2.5">
                  <span className="grid gap-0.5">
                    <span>{o.action_attendue ?? "—"}</span>
                    <span className="text-legende text-muted-foreground">
                      {o.acteur_attendu ? LIBELLE_ACTEUR[o.acteur_attendu] : "—"}
                    </span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <Echeance iso={o.echeance} maintenant={maintenant} />
                </td>
                <td className="max-w-[160px] px-3 py-2.5">{o.localisation ?? "—"}</td>
                <td className="max-w-[200px] px-3 py-2.5">
                  <span className="grid gap-0.5">
                    <span>{o.dernier_evenement}</span>
                    <span className="text-legende text-muted-foreground">{ilYA(o.dernier_evenement_le, maintenant)}</span>
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  <Alerte o={o} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Téléphone : une carte par opération. */}
      <ul className="grid gap-2 md:hidden">
        {operations.map((o) => (
          <li key={o.objet_id}>
            <button
              type="button"
              onClick={() => surOuverture(o)}
              className={cn(
                "grid w-full gap-2 rounded-xl border bg-card p-3 text-left",
                selection === o.objet_id && "border-h2h-primary",
              )}
              style={{ boxShadow: "var(--ombre-carte)" }}
            >
              <span className="flex items-start justify-between gap-2">
                <Reference o={o} />
                <Echeance iso={o.echeance} maintenant={maintenant} />
              </span>
              <span className="flex items-center gap-2">
                <Miniature o={o} />
                <span className="grid min-w-0">
                  <span className="truncate font-medium">{o.bien_titre ?? "—"}</span>
                  <span className="truncate text-legende text-muted-foreground">{participants(o)}</span>
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <StatutPastille ton={tonEtape(o)}>{o.etape_libelle}</StatutPastille>
                {o.alerte && <Alerte o={o} />}
              </span>
              <span className="text-corps">
                {o.action_attendue ?? "—"}
                {o.acteur_attendu && (
                  <span className="text-muted-foreground"> · {LIBELLE_ACTEUR[o.acteur_attendu]}</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

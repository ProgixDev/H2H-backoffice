import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { LIBELLE_TYPE } from "@/lib/activite/types";
import { cheminFiche, type Trouvee } from "@/lib/operations/types";

/** Les opérations qu'une référence désigne, chacune vers sa fiche. */
export function ListeTrouvees({ trouvees }: { trouvees: Trouvee[] }) {
  return (
    <ul className="grid gap-2">
      {trouvees.map((t) => (
        <li key={`${t.objet_table}:${t.objet_id}`}>
          <Link
            href={cheminFiche(t.ref)}
            className="flex items-center gap-3 rounded-xl border bg-card p-3 transition-colors hover:bg-muted/50"
            style={{ boxShadow: "var(--ombre-carte)" }}
          >
            <span className="grid min-w-0 flex-1 gap-0.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold tabular-nums">{t.ref}</span>
                <span className="text-legende text-muted-foreground">{LIBELLE_TYPE[t.type] ?? t.type}</span>
                {t.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
              </span>
              <span className="truncate text-corps">{t.titre ?? "—"}</span>
              <span className="text-legende text-muted-foreground">
                {t.correspondance} · créée le {new Date(t.cree_le).toLocaleDateString("fr-FR")}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

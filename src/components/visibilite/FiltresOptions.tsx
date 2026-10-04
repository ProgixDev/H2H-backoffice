import Link from "next/link";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FILTRES_OPTION,
  LIBELLE_FILTRE_OPTION,
  adresseOptions,
  type CompteursOptions,
  type FiltreOption,
  type FiltresOptions,
} from "@/lib/visibilite/types";

/** Ce qui attend l'équipe : la pastille le signale quand son compteur n'est pas nul. */
const A_TRAITER: FiltreOption[] = ["anomalies", "retractations"];

/**
 * Les filtres : l'état (des pastilles, chacune avec son compteur — le même
 * prédicat que la liste), puis la recherche (un formulaire simple, lu par le
 * serveur).
 */
export function FiltresListeOptions({
  f,
  compteurs,
  testVisible,
}: {
  f: FiltresOptions;
  compteurs: CompteursOptions | null;
  testVisible: boolean;
}) {
  const pastilles: (FiltreOption | null)[] = [null, ...FILTRES_OPTION];
  return (
    <div className="grid gap-3">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer les options">
        {pastilles.map((x) => {
          const nb = compteurs ? compteurs[x ?? "tous"] : null;
          const actif = x === f.filtre;
          return (
            <Link
              key={x ?? "tous"}
              href={adresseOptions({ ...f, filtre: x })}
              aria-current={actif ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-legende font-medium transition-colors",
                actif
                  ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
                  : x && A_TRAITER.includes(x) && (nb ?? 0) > 0
                    ? "border-[#B45309]/40 text-[#B45309] hover:bg-[#B45309]/5"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {x ? LIBELLE_FILTRE_OPTION[x] : "Toutes"}
              {nb !== null && <span className="tabular-nums">{nb}</span>}
            </Link>
          );
        })}
      </nav>
      <form method="get" action="/visibilite-et-publicite" className="flex flex-wrap items-end gap-2">
        {f.filtre && <input type="hidden" name="filtre" value={f.filtre} />}
        <label className="grid min-w-56 flex-1 gap-1 text-legende text-muted-foreground">
          Recherche
          <Input
            name="q"
            defaultValue={f.q ?? ""}
            placeholder="Titre, pseudonyme, OPT-…, RET-…, ARO-…, OF-…, facture, avoir, pi_…"
          />
        </label>
        {testVisible && (
          <label className="flex h-9 items-center gap-2 text-corps">
            <input type="checkbox" name="test" value="1" defaultChecked={f.test} />
            Inclure le monde du test
          </label>
        )}
        <Button type="submit" size="sm" className="h-9">
          Filtrer
        </Button>
        {(f.q || f.test) && (
          <Link
            href={adresseOptions({ ...f, q: null, test: false })}
            className="flex h-9 items-center text-legende text-muted-foreground hover:text-foreground"
          >
            Effacer
          </Link>
        )}
      </form>
    </div>
  );
}

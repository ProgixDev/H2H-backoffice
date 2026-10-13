import Link from "next/link";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Filtres<F extends string> = { filtre: F | null; q: string | null; test: boolean };

/**
 * Les filtres d'une liste de la rubrique : des pastilles, chacune avec son
 * compteur — le même prédicat que la liste —, puis la recherche (un formulaire
 * simple, lu par le serveur).
 */
export function FiltresListe<F extends string>({
  onglet,
  nom,
  filtres,
  libelles,
  tous,
  aTraiter,
  f,
  compteurs,
  adresse,
  recherche,
  testVisible,
}: {
  /** L'onglet de la rubrique : il reste dans l'adresse avec les filtres. */
  onglet: string;
  /** « Filtrer les … » : le nom de la navigation, pour un lecteur d'écran. */
  nom: string;
  filtres: F[];
  libelles: Record<F, string>;
  /** Le libellé de la pastille sans filtre (« Toutes », « Tous »). */
  tous: string;
  /** Ce qui attend l'équipe : la pastille le signale quand son compteur n'est pas nul. */
  aTraiter: F[];
  f: Filtres<F>;
  compteurs: Record<F | "tous", number> | null;
  adresse: (f: Filtres<F>) => string;
  /** Ce que la recherche sait trouver, dit dans le champ. */
  recherche: string;
  testVisible: boolean;
}) {
  const pastilles: (F | null)[] = [null, ...filtres];
  return (
    <div className="grid gap-3">
      <nav className="flex flex-wrap gap-2" aria-label={nom}>
        {pastilles.map((x) => {
          const nb = compteurs ? compteurs[x ?? "tous"] : null;
          const actif = x === f.filtre;
          return (
            <Link
              key={x ?? "tous"}
              href={adresse({ ...f, filtre: x })}
              aria-current={actif ? "page" : undefined}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-legende font-medium transition-colors",
                actif
                  ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
                  : x && aTraiter.includes(x) && (nb ?? 0) > 0
                    ? "border-[#B45309]/40 text-[#B45309] hover:bg-[#B45309]/5"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {x ? libelles[x] : tous}
              {nb !== null && <span className="tabular-nums">{nb}</span>}
            </Link>
          );
        })}
      </nav>
      <form method="get" action="/h2h-logistic" className="flex flex-wrap items-end gap-2">
        <input type="hidden" name="onglet" value={onglet} />
        {f.filtre && <input type="hidden" name="filtre" value={f.filtre} />}
        <label className="grid min-w-56 flex-1 gap-1 text-legende text-muted-foreground">
          Recherche
          <Input name="q" defaultValue={f.q ?? ""} placeholder={recherche} />
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
            href={adresse({ ...f, q: null, test: false })}
            className="flex h-9 items-center text-legende text-muted-foreground hover:text-foreground"
          >
            Effacer
          </Link>
        )}
      </form>
    </div>
  );
}

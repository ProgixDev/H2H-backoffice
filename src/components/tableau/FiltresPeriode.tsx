import Link from "next/link";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { instantParis, jourMoyen } from "@/lib/dates";
import { adresseTableau, prereglages } from "@/lib/tableau/periodes";
import type { FiltresTableau } from "@/lib/tableau/types";

const CHAMP = "h-9 rounded-md border border-input bg-transparent px-3 text-corps";

/** « 1 mars 2026 » : un jour de calendrier, tel que Paris le lit. */
export const jourDit = (jour: string) => jourMoyen(instantParis(jour, "12:00"));

/**
 * La période du tableau de bord : des périodes toutes faites d'abord, puis deux
 * dates. Elle reste dans l'adresse — et tout ce qui est sous cette rangée est
 * lu sur la même période.
 *
 * `periode` : celle que la base a retenue (trente jours par défaut) ; sans
 * elle — la lecture a échoué, ou la période est refusée — on montre ce qui a
 * été demandé.
 */
export function FiltresPeriode({
  f,
  periode,
  aujourdhui,
  testVisible,
  indicateur,
}: {
  f: FiltresTableau;
  periode: { du: string; au: string; jours: number; avant_du?: string; avant_au?: string } | null;
  aujourdhui: string;
  /** Un équipier réel peut demander le monde du test en plus ; un équipier de test ne lit que lui. */
  testVisible: boolean;
  /** Sur le détail d'un indicateur : on y reste en changeant de période. */
  indicateur?: string;
}) {
  const du = periode?.du ?? f.du;
  const au = periode?.au ?? f.au;
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
        <nav className="flex flex-wrap gap-2" aria-label="Périodes">
          {prereglages(aujourdhui).map((p) => (
            <Link
              key={p.code}
              href={adresseTableau({ ...f, du: p.du, au: p.au }, indicateur)}
              aria-current={p.du === du && p.au === au ? "true" : undefined}
              className={cn(
                "flex h-9 items-center rounded-full border px-3 text-legende font-medium transition-colors",
                p.du === du && p.au === au
                  ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p.libelle}
            </Link>
          ))}
        </nav>
        <form method="get" action={adresseTableau({ du: null, au: null, test: false }, indicateur)} className="flex flex-wrap items-end gap-2">
          <label className="grid gap-1 text-legende text-muted-foreground">
            Du
            <input type="date" name="du" defaultValue={du ?? ""} max={aujourdhui} className={CHAMP} />
          </label>
          <label className="grid gap-1 text-legende text-muted-foreground">
            Au
            <input type="date" name="au" defaultValue={au ?? ""} max={aujourdhui} className={CHAMP} />
          </label>
          {testVisible && (
            <label className="flex h-9 items-center gap-2 text-corps">
              <input type="checkbox" name="test" value="1" defaultChecked={f.test} />
              Inclure le monde du test
            </label>
          )}
          <Button type="submit" size="sm" className="h-9">
            Appliquer
          </Button>
        </form>
      </div>
      {periode && (
        <p className="text-legende text-muted-foreground">
          Du {jourDit(periode.du)} au {jourDit(periode.au)} — {periode.jours} jour{periode.jours > 1 ? "s" : ""}, à
          l’heure de Paris.
          {periode.avant_du && periode.avant_au && (
            <>
              {" "}
              Chaque chiffre se compare à la période précédente, de même longueur : du {jourDit(periode.avant_du)} au{" "}
              {jourDit(periode.avant_au)}.
            </>
          )}
          {f.test && " Le monde du test est inclus."}
        </p>
      )}
    </div>
  );
}

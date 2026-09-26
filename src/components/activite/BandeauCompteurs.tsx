import { cn } from "cn";
import type { Compteur } from "@/lib/activite/types";

// Les compteurs qui disent qu'il faut intervenir se colorent quand ils ne sont pas à zéro.
const A_SURVEILLER: Record<string, string> = {
  incidents: "var(--h2h-warning)",
  echecs: "var(--h2h-error)",
};

/**
 * Le bandeau de synthèse (§4). Chaque compteur est un bouton : il filtre la
 * liste sur exactement ce qu'il compte (la base applique le même filtre).
 */
export function BandeauCompteurs({
  compteurs,
  actif,
  surChoix,
}: {
  compteurs: Compteur[];
  actif: string | null;
  surChoix: (code: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
      {compteurs.map((c) => {
        const choisi = actif === c.code;
        const alerte = c.nombre > 0 ? A_SURVEILLER[c.code] : undefined;
        return (
          <button
            key={c.code}
            type="button"
            aria-pressed={choisi}
            title={c.description}
            onClick={() => surChoix(choisi ? null : c.code)}
            className={cn(
              "flex min-h-[76px] flex-col justify-between rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted",
              choisi && "border-h2h-primary bg-h2h-primary-light hover:bg-h2h-primary-light",
            )}
            style={{
              boxShadow: "var(--ombre-carte)",
              ...(alerte && !choisi ? { borderColor: `color-mix(in srgb, ${alerte} 45%, transparent)` } : {}),
            }}
          >
            <span className="text-legende text-muted-foreground">{c.libelle}</span>
            <span
              className={cn("text-h2 font-bold tabular-nums", choisi && "text-h2h-primary")}
              style={alerte && !choisi ? { color: alerte } : undefined}
            >
              {c.nombre}
            </span>
          </button>
        );
      })}
    </div>
  );
}

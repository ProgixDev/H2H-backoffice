import { cn } from "cn";
import { compteARebours, dateCourte } from "@/lib/activite/temps";

/** Une échéance : la date, l'heure et le compte à rebours (§4). */
export function Echeance({ iso, maintenant }: { iso: string | null; maintenant: number }) {
  if (!iso) return <span className="text-muted-foreground">—</span>;
  const c = compteARebours(iso, maintenant);
  return (
    <span className="grid leading-tight">
      <span className="tabular-nums">{dateCourte(iso, maintenant)}</span>
      <span
        className={cn(
          "text-legende font-semibold tabular-nums",
          c.depassee ? "text-h2h-error" : c.proche ? "text-h2h-warning" : "text-muted-foreground",
        )}
      >
        {c.texte}
      </span>
    </span>
  );
}

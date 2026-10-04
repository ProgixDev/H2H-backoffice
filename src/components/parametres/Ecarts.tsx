import { valeurDite, type Ecart } from "@/lib/parametres/types";

/** « Plafond de la co-livraison : 100,00 € → 150,00 € ». */
export function Ecarts({ ecarts }: { ecarts: Ecart[] }) {
  return (
    <ul className="grid gap-0.5">
      {ecarts.map((e) => (
        <li key={e.colonne} className="tabular-nums">
          {e.libelle} : {valeurDite(e.unite, e.avant)} → <span className="font-semibold">{valeurDite(e.unite, e.apres)}</span>
        </li>
      ))}
    </ul>
  );
}

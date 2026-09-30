import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { adresseTableau } from "@/lib/tableau/periodes";
import {
  GROUPES,
  chiffre,
  entier,
  evolution,
  lignesComptees,
  type FiltresTableau,
  type IndicateurAVenir,
  type IndicateurDisponible,
  type Tableau,
} from "@/lib/tableau/types";

/**
 * Un indicateur : son libellé, son chiffre, l'écart avec la période
 * précédente, sa définition — et le lien vers ce qui le compose.
 *
 * 🔴 LE CHIFFRE EST CELUI DE LA BASE, ET SA LISTE AUSSI : le lien ouvre
 * exactement les lignes qu'elle a comptées.
 */
function Indicateur({ i, f }: { i: IndicateurDisponible; f: FiltresTableau }) {
  const comptees = lignesComptees(i);
  const evo = evolution(i);
  return (
    <article
      className="flex flex-col gap-2 rounded-xl border bg-card p-4"
      style={{ boxShadow: "var(--ombre-carte)" }}
    >
      <header className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-corps font-medium text-muted-foreground">{i.libelle}</h3>
        {i.portee === "instant" && <StatutPastille ton="neutre">À l’instant</StatutPastille>}
      </header>
      <div>
        <p className="text-h1 font-bold">{chiffre(i)}</p>
        {comptees && <p className="text-legende text-muted-foreground">{comptees}</p>}
      </div>
      {evo && (
        <p className="text-legende text-muted-foreground">
          <span className="font-semibold text-foreground">{evo.ecart}</span> · {evo.avant} sur la période précédente
        </p>
      )}
      {i.a_part > 0 && (
        <p className="text-legende text-muted-foreground">
          {entier(i.a_part)} de vitrine, à part : hors du chiffre.
        </p>
      )}
      <p className="text-legende text-muted-foreground">
        {i.definition}
        {i.a_confirmer && <span className="font-medium"> Définition proposée, à confirmer.</span>}
      </p>
      <footer className="mt-auto pt-1 text-legende">
        {!i.ouvrable ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Lock className="size-3.5 shrink-0" />
            Votre rôle lit ce chiffre, pas ce qui le compose.
          </span>
        ) : i.nombre > 0 ? (
          <Link
            href={adresseTableau(f, i.code)}
            aria-label={`Ouvrir ce qui compose « ${i.libelle} »`}
            className="inline-flex items-center gap-1 font-semibold text-h2h-primary hover:underline"
          >
            Ouvrir ce qui compose ce chiffre
            <ArrowRight className="size-3.5" />
          </Link>
        ) : (
          <span className="text-muted-foreground">
            {i.portee === "instant" ? "Rien à ouvrir en ce moment." : "Rien à ouvrir sur cette période."}
          </span>
        )}
      </footer>
    </article>
  );
}

/**
 * Ce que l'indicateur compte n'existe pas encore.
 *
 * 🔴 PAS DE FAUX ZÉRO : « 0 compte suspendu » ferait croire que personne ne
 * l'est, quand la suspension elle-même n'existe pas. La carte dit ce qui manque.
 */
function AVenir({ i }: { i: IndicateurAVenir }) {
  return (
    <article className="flex flex-col gap-2 rounded-xl border border-dashed p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="text-corps font-medium text-muted-foreground">{i.libelle}</h3>
        <StatutPastille ton="muet">À venir</StatutPastille>
      </header>
      <p className="text-corps">{i.a_venir}</p>
      <p className="text-legende text-muted-foreground">{i.definition}</p>
    </article>
  );
}

/**
 * Le tableau de bord (§3) : les indicateurs du cahier des charges, groupe par
 * groupe et dans son ordre, lus sur une même période.
 */
export function TableauIndicateurs({ tableau, f }: { tableau: Tableau; f: FiltresTableau }) {
  // La période que la base a retenue : le détail s'ouvre sur la même, même si l'adresse n'en portait pas.
  const periode: FiltresTableau = { du: tableau.periode.du, au: tableau.periode.au, test: f.test };
  return (
    <div className="grid gap-8">
      {GROUPES.map((g) => {
        const indicateurs = tableau.indicateurs.filter((i) => i.groupe === g.code);
        if (indicateurs.length === 0) return null;
        return (
          <section key={g.code} className="grid gap-3" aria-labelledby={`groupe-${g.code}`}>
            <div className="grid gap-1">
              <h2 id={`groupe-${g.code}`} className="text-h3 font-semibold">
                {g.titre}
              </h2>
              {g.note && <p className="max-w-3xl text-legende text-muted-foreground">{g.note}</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {indicateurs.map((i) =>
                i.disponible ? <Indicateur key={i.code} i={i} f={periode} /> : <AVenir key={i.code} i={i} />,
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

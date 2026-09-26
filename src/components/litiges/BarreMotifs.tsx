import Link from "next/link";
import { cn } from "cn";
import { A_QUALIFIER, type CompteMotif } from "@/lib/litiges/types";

const CHEMIN = "/litiges-et-signalements";

/**
 * « Séparer les dossiers par motif » (§15) : les onze motifs du cahier des
 * charges, et combien de dossiers OUVERTS chacun compte — réclamations,
 * incidents de co-livraison, signalements —, puis ceux qui restent à qualifier.
 */
export function BarreMotifs({ motifs, filtre }: { motifs: CompteMotif[]; filtre: string | null }) {
  const total = (m: CompteMotif) => m.reclamations + m.incidents + m.signalements;
  const tous = motifs.reduce((s, m) => s + total(m), 0);
  const aConfirmer = motifs.some((m) => m.a_confirmer);
  return (
    <div className="grid gap-2">
      <nav aria-label="Dossiers par motif" className="flex flex-wrap gap-2">
        <Puce href={CHEMIN} actif={filtre === null} n={tous}>
          Tous
        </Puce>
        {motifs.map((m) => {
          const code = m.motif ?? A_QUALIFIER;
          return (
            <Puce
              key={code}
              href={`${CHEMIN}?motif=${code}`}
              actif={filtre === code}
              n={total(m)}
              titre={m.definition ?? undefined}
              aConfirmer={m.a_confirmer}
            >
              {m.libelle}
            </Puce>
          );
        })}
      </nav>
      <p className="text-legende text-muted-foreground">
        Le nombre compte les dossiers ouverts. Survolez un motif pour lire sa définition
        {aConfirmer ? " ; * : définition proposée, à confirmer par le client (D1, D26)." : "."}
      </p>
    </div>
  );
}

function Puce({ href, actif, n, titre, aConfirmer, children }: {
  href: string;
  actif: boolean;
  n: number;
  titre?: string;
  aConfirmer?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={titre}
      aria-current={actif ? "page" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-legende font-medium transition-colors",
        actif
          ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
          : n === 0
            ? "text-muted-foreground/60 hover:text-foreground"
            : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
      {aConfirmer && <span aria-hidden>*</span>}
      <span className="tabular-nums">{n}</span>
    </Link>
  );
}

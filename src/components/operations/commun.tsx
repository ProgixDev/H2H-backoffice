import { Lock } from "lucide-react";
import { cn } from "cn";
import { dateCourte } from "@/lib/activite/temps";
import { euros } from "@/lib/litiges/types";

/** Une section de la fiche : un titre, son contenu. */
export function Bloc({
  titre,
  aside,
  children,
  className,
}: {
  titre: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("grid content-start gap-3 rounded-xl border bg-card p-4", className)}
      style={{ boxShadow: "var(--ombre-carte)" }}
    >
      <header className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-h3 font-semibold">{titre}</h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

/** Des paires libellé / valeur, en colonnes. Une valeur absente s'écrit « — ». */
export function Champs({ items, colonnes = 3 }: { items: [string, React.ReactNode][]; colonnes?: 2 | 3 | 4 }) {
  const grille = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[colonnes];
  return (
    <dl className={cn("grid gap-x-6 gap-y-3", grille)}>
      {items.map(([libelle, valeur]) => (
        <div key={libelle} className="grid min-w-0 gap-0.5">
          <dt className="text-legende text-muted-foreground">{libelle}</dt>
          <dd className="min-w-0 break-words text-corps">{vide(valeur) ? "—" : valeur}</dd>
        </div>
      ))}
    </dl>
  );
}

const vide = (v: React.ReactNode) => v === null || v === undefined || v === "" || v === false;

/**
 * Un onglet ou une partie que le rôle ne permet pas de lire.
 *
 * 🔴 UN REFUS NE RESSEMBLE PAS À UN VIDE : « rien ici » ferait croire qu'il
 * n'y a pas de paiement, quand il y en a un que ce rôle ne voit pas.
 */
export function Reserve({ quoi, permission }: { quoi: string; permission: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed p-4 text-corps text-muted-foreground">
      <Lock className="mt-0.5 size-4 shrink-0" />
      <p>
        Votre rôle ne donne pas accès {quoi} (permission « {permission} »). La Direction attribue les rôles.
      </p>
    </div>
  );
}

/** « Aucun … » : une liste réellement vide, lue avec succès. */
export function Aucun({ children }: { children: React.ReactNode }) {
  return <p className="text-corps text-muted-foreground">{children}</p>;
}

/** Une date lisible, ou « — ». */
export function Quand({ iso, maintenant }: { iso: string | null | undefined; maintenant: number }) {
  if (!iso) return <span className="text-muted-foreground">—</span>;
  return (
    <time dateTime={iso} className="tabular-nums" title={new Date(iso).toLocaleString("fr-FR")}>
      {dateCourte(iso, maintenant)}
    </time>
  );
}

/** Un montant en euros, ou « — ». */
export function Montant({ cents, fort }: { cents: number | null | undefined; fort?: boolean }) {
  if (cents === null || cents === undefined) return <span className="text-muted-foreground">—</span>;
  return <span className={cn("tabular-nums", fort && "font-bold")}>{euros(cents)}</span>;
}

/** Oui / non, pour un booléen de la base ; « — » s'il n'est pas renseigné. */
export const ouiNon = (b: boolean | null | undefined) => (b === null || b === undefined ? null : b ? "Oui" : "Non");

/** Un identifiant de prestataire, raccourci à la lecture, entier au survol et à la copie. */
export function Reference({ valeur }: { valeur: string | null | undefined }) {
  if (!valeur) return <span className="text-muted-foreground">—</span>;
  const court = valeur.length > 22 ? `${valeur.slice(0, 10)}…${valeur.slice(-8)}` : valeur;
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 text-legende" title={valeur}>
      {court}
    </code>
  );
}

/** Un tableau sobre ; défilement horizontal sur les petits écrans. */
export function Tableau({ entetes, children, largeur = 720 }: { entetes: string[]; children: React.ReactNode; largeur?: number }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-corps" style={{ minWidth: largeur }}>
        <thead className="border-b bg-muted/40 text-left text-legende text-muted-foreground">
          <tr>
            {entetes.map((e) => (
              <th key={e} className="px-3 py-2 font-medium">
                {e}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr:last-child]:border-0 [&_td]:px-3 [&_td]:py-2 [&_td]:align-top">
          {children}
        </tbody>
      </table>
    </div>
  );
}

/** Un objet de la base (caractéristiques, réponses d'un formulaire) en paires lisibles. */
export function Paires({ objet }: { objet: Record<string, unknown> | null | undefined }) {
  const entrees = Object.entries(objet ?? {}).filter(([, v]) => v !== null && v !== "");
  if (entrees.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <ul className="grid gap-0.5">
      {entrees.map(([k, v]) => (
        <li key={k}>
          <span className="text-muted-foreground">{k} :</span>{" "}
          {typeof v === "boolean" ? (v ? "oui" : "non") : typeof v === "object" ? JSON.stringify(v) : String(v)}
        </li>
      ))}
    </ul>
  );
}

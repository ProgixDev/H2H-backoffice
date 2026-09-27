"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { ActionsTicket } from "@/components/operations/ActionsTicket";
import { dateHeure, jourMoyen } from "@/lib/dates";
import { LIBELLE_STATUT_COMMANDE, LIBELLE_TYPE_ANNONCE } from "@/lib/operations/libelles";
import { cheminFiche, type Onglet } from "@/lib/operations/types";
import { euros } from "@/lib/paiements/types";
import {
  LIBELLE_ETAT_PISTE,
  LIBELLE_ETAT_TRANSACTION,
  ONGLET_PISTE,
  type EtatPiste,
  type Piste,
  type Transaction,
} from "@/lib/transactions/types";
import { BoutonAnnulerTransaction } from "./GesteAnnulation";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : bloqué est ambre, en échec rouge.
export const TON_PISTE: Record<EtatPiste, Ton> = {
  fait: "succes",
  en_cours: "marque",
  a_venir: "neutre",
  bloque: "attention",
  echoue: "erreur",
  annule: "muet",
  sans_objet: "muet",
};

const POINT: Record<EtatPiste, string> = {
  fait: "bg-[var(--h2h-success)] border-[var(--h2h-success)]",
  en_cours: "bg-[var(--h2h-primary)] border-[var(--h2h-primary)]",
  a_venir: "border-[var(--h2h-text-muted)]",
  bloque: "bg-[#B45309] border-[#B45309]",
  echoue: "bg-[var(--h2h-error)] border-[var(--h2h-error)]",
  annule: "bg-[var(--h2h-text-muted)] border-[var(--h2h-text-muted)] opacity-60",
  sans_objet: "border-dashed border-[var(--h2h-text-muted)] opacity-50",
};

/** La fiche où se lit une piste ; une réception en litige se lit dans l'onglet Litiges. */
const ongletDe = (p: Piste): Onglet =>
  p.code === "reception" && p.detail.startsWith("Litige") ? "litiges" : ONGLET_PISTE[p.code];

/** Les neuf pistes en un coup d'œil : un point par piste, son état au survol. */
function Bande({ pistes }: { pistes: Piste[] }) {
  return (
    <span className="flex items-center gap-1" role="list" aria-label="Pistes de l’achat">
      {pistes.map((p) => (
        <span
          key={p.code}
          role="listitem"
          title={`${p.libelle} — ${LIBELLE_ETAT_PISTE[p.etat]} : ${p.detail}`}
          aria-label={`${p.libelle} : ${LIBELLE_ETAT_PISTE[p.etat]}`}
          className={cn("size-3 shrink-0 rounded-full border-2", POINT[p.etat])}
        />
      ))}
    </span>
  );
}

/** Où en est l'achat : la piste qui attend, sinon l'état d'ensemble. */
function OuEnEst({ t }: { t: Transaction }) {
  const courante = t.pistes.find((p) => p.code === t.piste_courante);
  if (courante) {
    return (
      <span className="grid gap-0.5">
        <span className="font-medium">{courante.libelle}</span>
        <span className="text-legende text-muted-foreground">{courante.detail}</span>
      </span>
    );
  }
  const prochaine = t.pistes.find((p) => p.etat === "a_venir");
  if (t.etat === "en_cours" && prochaine) {
    return (
      <span className="grid gap-0.5">
        <span className="font-medium">À venir : {prochaine.libelle.toLowerCase()}</span>
        <span className="text-legende text-muted-foreground">{prochaine.detail}</span>
      </span>
    );
  }
  return <span className="text-muted-foreground">{t.etat === "annulee" ? LIBELLE_STATUT_COMMANDE[t.statut] : LIBELLE_ETAT_TRANSACTION[t.etat]}</span>;
}

/** Le détail d'un achat : ses neuf pistes, et les gestes que son étape permet. */
function Detail({ t, peutAnnuler, peutTraiter }: { t: Transaction; peutAnnuler: boolean; peutTraiter: boolean }) {
  const courante = t.pistes.find((p) => p.code === t.piste_courante);
  return (
    <div className="grid gap-4 bg-muted/20 px-4 py-4 lg:grid-cols-[1fr_280px]">
      <ol className="grid gap-2">
        {t.pistes.map((p) => (
          <li key={p.code} className="grid grid-cols-[14px_1fr_auto] items-start gap-3">
            <span className={cn("mt-1 size-3 rounded-full border-2", POINT[p.etat])} aria-hidden />
            <span className="grid gap-0.5">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{p.libelle}</span>
                <StatutPastille ton={TON_PISTE[p.etat]}>{LIBELLE_ETAT_PISTE[p.etat]}</StatutPastille>
              </span>
              <span className="text-corps text-muted-foreground">{p.detail}</span>
              {(p.le || p.echeance) && (
                <span className="text-legende text-muted-foreground tabular-nums">
                  {p.le && <>le {dateHeure(p.le)}</>}
                  {p.le && p.echeance && " · "}
                  {p.echeance && <>échéance {dateHeure(p.echeance)}</>}
                </span>
              )}
            </span>
            {p.etat !== "sans_objet" && (
              <Link href={cheminFiche(t.numero, ongletDe(p))} className="text-legende text-h2h-primary hover:underline">
                Voir
              </Link>
            )}
          </li>
        ))}
      </ol>
      <div className="grid content-start gap-3">
        <Link href={cheminFiche(t.numero)} className="text-corps font-medium text-h2h-primary hover:underline">
          Ouvrir la fiche complète
        </Link>
        {peutAnnuler && <BoutonAnnulerTransaction t={t} />}
        {peutTraiter && (
          <div className="grid gap-1">
            <ActionsTicket
              o={{
                objet_table: "orders",
                objet_id: t.id,
                alerte_libelle: t.alerte,
                action_attendue: null,
                etape_libelle: courante?.libelle ?? LIBELLE_STATUT_COMMANDE[t.statut],
              }}
            />
            <p className="text-legende text-muted-foreground">
              Un litige s’ouvre par l’acheteur, depuis l’application ; l’équipe ouvre un dossier sur l’achat.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Les transactions Marketplace (§10) : un achat par ligne, ses neuf pistes, où
 * il en est — et, déplié, chaque piste avec sa date, son échéance et le geste
 * que son étape permet.
 */
export function ListeTransactions({
  lignes,
  peutAnnuler,
  peutTraiter,
  filtree,
}: {
  lignes: Transaction[];
  peutAnnuler: boolean;
  peutTraiter: boolean;
  filtree: boolean;
}) {
  const [ouverte, setOuverte] = useState<string | null>(null);

  if (lignes.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="coin" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Aucune transaction pour ces filtres" : "Aucune transaction"}</p>
        <p className="text-corps text-muted-foreground">Chaque achat de la Marketplace apparaît ici, dès sa commande.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[1080px] text-corps">
        <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
          <tr>
            <th className="w-8 px-2 py-2" />
            <th className="px-3 py-2 font-medium">Achat</th>
            <th className="px-3 py-2 font-medium">Bien</th>
            <th className="px-3 py-2 font-medium">Acheteur → vendeur</th>
            <th className="px-3 py-2 text-right font-medium">Total</th>
            <th className="px-3 py-2 font-medium">Pistes</th>
            <th className="px-3 py-2 font-medium">Où en est l’achat</th>
            <th className="px-3 py-2 font-medium">Alerte</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((t) => {
            const deplie = ouverte === t.id;
            return (
              <Fragment key={t.id}>
                <tr
                  className={cn("cursor-pointer border-t align-top hover:bg-muted/30", deplie && "bg-muted/30")}
                  onClick={() => setOuverte(deplie ? null : t.id)}
                >
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      aria-expanded={deplie}
                      aria-label={deplie ? "Replier" : "Déplier"}
                      className="text-muted-foreground"
                    >
                      {deplie ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={cheminFiche(t.numero)}
                      className="font-medium tabular-nums hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {t.numero}
                    </Link>
                    {t.est_test && (
                      <StatutPastille ton="attention" className="ml-2">
                        TEST
                      </StatutPastille>
                    )}
                    <span className="block text-legende text-muted-foreground">
                      {jourMoyen(t.cree_le)} · {t.acheminement}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      {t.bien_image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- miniature du stockage, déjà publique dans l'application
                        <img src={t.bien_image} alt="" className="size-10 shrink-0 rounded-md border object-cover" />
                      ) : (
                        <span className="size-10 shrink-0 rounded-md border bg-muted" aria-hidden />
                      )}
                      <span className="grid">
                        <span className="line-clamp-1">{t.bien_titre ?? "—"}</span>
                        {t.type_annonce && (
                          <span className="text-legende text-muted-foreground">{LIBELLE_TYPE_ANNONCE[t.type_annonce]}</span>
                        )}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {t.acheteur ?? "Compte effacé"} → {t.vendeur ?? "Compte effacé"}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold tabular-nums">{euros(t.total_cents)}</td>
                  <td className="px-3 py-2">
                    <Bande pistes={t.pistes} />
                  </td>
                  <td className="px-3 py-2">
                    <OuEnEst t={t} />
                  </td>
                  <td className="px-3 py-2">
                    {t.alerte && (
                      <StatutPastille ton={t.alerte === "Étape en échec" ? "erreur" : "attention"}>{t.alerte}</StatutPastille>
                    )}
                  </td>
                </tr>
                {deplie && (
                  <tr className="border-t">
                    <td colSpan={8} className="p-0">
                      <Detail t={t} peutAnnuler={peutAnnuler} peutTraiter={peutTraiter} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

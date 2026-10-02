"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, TriangleAlert } from "lucide-react";
import { cn } from "cn";
import { Echeance } from "@/components/activite/Echeance";
import { useMaintenant } from "@/components/activite/commun";
import { POINT_PISTE, TON_PISTE } from "@/components/bo/pistes";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { ActionsTicket } from "@/components/operations/ActionsTicket";
import { LIBELLE_ETAT_MODERATION, TON_ETAT_MODERATION } from "@/lib/annonces/types";
import { dateHeure, jourMoyen } from "@/lib/dates";
import {
  LIBELLE_ACTEUR_FLASH,
  type CodePisteFlash,
  type EtapeFlash,
  type OffreFlash,
  type PisteFlash,
} from "@/lib/flash/types";
import { LIBELLE_ACCES, LIBELLE_SELECTION, LIBELLE_STATUT_COMMANDE } from "@/lib/operations/libelles";
import { cheminFiche, type Onglet } from "@/lib/operations/types";
import { euros } from "@/lib/paiements/types";
import { LIBELLE_ETAT_PISTE } from "@/lib/transactions/types";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : « Non vendu » et l'annulation
// sont muets, un litige est ambre ; seule une offre payée est verte.
export const TON_ETAPE_FLASH: Record<EtapeFlash, Ton> = {
  offres: "marque",
  choix: "marque",
  nouveau_choix: "marque",
  exclu: "marque",
  acces_flash: "marque",
  paiement: "marque",
  payee: "succes",
  non_vendue: "muet",
  annulee: "muet",
  litige: "attention",
};

/** Où la fiche complète montre ce que dit une piste ; le paiement, dans la fiche de l'achat. */
function lienPiste(o: OffreFlash, code: CodePisteFlash): string | null {
  if (code === "paiement") return o.paiement ? cheminFiche(o.paiement.numero, "paiements") : null;
  const onglet: Onglet = code === "issue" ? "resume" : "bien-et-accord";
  return cheminFiche(o.ref, onglet);
}

/** Les cinq pistes en un coup d'œil : un point par piste, son état au survol. */
function Bande({ pistes }: { pistes: PisteFlash[] }) {
  return (
    <span className="flex items-center gap-1" role="list" aria-label="Pistes de l’offre">
      {pistes.map((p) => (
        <span
          key={p.code}
          role="listitem"
          title={`${p.libelle} — ${LIBELLE_ETAT_PISTE[p.etat]} : ${p.detail}`}
          aria-label={`${p.libelle} : ${LIBELLE_ETAT_PISTE[p.etat]}`}
          className={cn("size-3 shrink-0 rounded-full border-2", POINT_PISTE[p.etat])}
        />
      ))}
    </span>
  );
}

/** Les acheteurs de la dernière sélection : l'Exclu, ou la vague. */
function Selection({ o }: { o: OffreFlash }) {
  if (o.selectionnes.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="grid gap-0.5">
      <span className="text-legende text-muted-foreground">
        {o.mode ? LIBELLE_SELECTION[o.mode] : "Sélection"}
        {o.mode === "exclu" && o.tentatives_exclu > 0 && ` · tentative ${o.tentatives_exclu}/3`}
        {o.mode === "flash" && o.vagues_flash > 0 && ` · vague ${o.vagues_flash}/2`}
      </span>
      {o.selectionnes.map((s, i) => (
        <span key={`${s.pseudo ?? "efface"}-${i}`} className="flex items-center gap-1.5">
          <span>{s.pseudo ?? "Compte effacé"}</span>
          <span className="text-legende text-muted-foreground">{LIBELLE_ACCES[s.statut].toLowerCase()}</span>
        </span>
      ))}
    </span>
  );
}

/** Le détail d'une offre : ses cinq pistes, ce qui ne va pas, et ce que l'équipe peut faire. */
export function DetailFlash({
  o,
  lienAnnonce,
  peutModerer,
  peutTraiter,
}: {
  o: OffreFlash;
  lienAnnonce: boolean;
  peutModerer: boolean;
  peutTraiter: boolean;
}) {
  return (
    <div className="grid gap-4 bg-muted/20 px-4 py-4 lg:grid-cols-[1fr_300px]">
      <div className="grid content-start gap-4">
        {o.anomalies.length > 0 && (
          <ul className="grid gap-1.5 rounded-lg border border-[#B45309]/30 bg-[#B45309]/5 p-3" aria-label="Anomalies">
            {o.anomalies.map((a) => (
              <li key={a.code} className="flex items-start gap-2 text-corps">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#B45309]" aria-hidden />
                <span>{a.libelle}</span>
              </li>
            ))}
          </ul>
        )}
        <ol className="grid gap-2">
          {o.pistes.map((p) => {
            const lien = lienPiste(o, p.code);
            return (
              <li key={p.code} className="grid grid-cols-[14px_1fr_auto] items-start gap-3">
                <span className={cn("mt-1 size-3 rounded-full border-2", POINT_PISTE[p.etat])} aria-hidden />
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
                {lien && p.etat !== "sans_objet" && (
                  <Link href={lien} className="text-legende text-h2h-primary hover:underline">
                    Voir
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
      <div className="grid content-start gap-3">
        <Link href={cheminFiche(o.ref)} className="text-corps font-medium text-h2h-primary hover:underline">
          Ouvrir la fiche complète
        </Link>
        <Link href={cheminFiche(o.ref, "bien-et-accord")} className="text-corps text-h2h-primary hover:underline">
          Voir les offres et les accès d’achat
        </Link>
        {o.paiement && (
          <Link href={cheminFiche(o.paiement.numero, "paiements")} className="text-corps text-h2h-primary hover:underline">
            Voir le paiement · {o.paiement.numero}
          </Link>
        )}
        {lienAnnonce && (
          <div className="grid gap-0.5">
            <Link href={`/annonces/${o.produit_id}`} className="text-corps text-h2h-primary hover:underline">
              Ouvrir l’annonce
            </Link>
            {peutModerer && (
              <span className="text-legende text-muted-foreground">
                Retirer un contenu selon les règles : masquer ou retirer l’annonce depuis sa fiche. Son vendeur n’y choisit
                plus personne, et personne ne l’achète.
              </span>
            )}
          </div>
        )}
        {peutTraiter && (
          <div className="grid gap-1">
            <ActionsTicket
              o={{
                objet_table: "courtage_listings",
                objet_id: o.id,
                alerte_libelle: o.anomalies[0]?.libelle ?? null,
                action_attendue: o.action_attendue,
                etape_libelle: o.etape_libelle,
              }}
            />
            {o.anomalies.length > 0 && (
              <p className="text-legende text-muted-foreground">
                Examiner une anomalie : un ticket sur l’offre, dans « À traiter ». Rien ne se corrige d’ici.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Les offres Flash (§13) : une offre par ligne, son étape, son échéance, ses
 * offres, sa sélection — et, dépliée, ses cinq pistes, ses anomalies et les
 * gestes que l'équipe peut faire. Personne n'y choisit d'acheteur (R13.3).
 */
export function ListeFlash({
  offres,
  filtree,
  lienCompte,
  lienAnnonce,
  peutModerer,
  peutTraiter,
}: {
  offres: OffreFlash[];
  filtree: boolean;
  lienCompte: boolean;
  lienAnnonce: boolean;
  peutModerer: boolean;
  peutTraiter: boolean;
}) {
  const [ouverte, setOuverte] = useState<string | null>(null);
  const maintenant = useMaintenant();

  if (offres.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="flash" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Aucune offre Flash pour ces filtres" : "Aucune offre Flash"}</p>
        <p className="text-corps text-muted-foreground">Chaque offre Flash apparaît ici dès son ouverture.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[1120px] text-corps">
        <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
          <tr>
            <th className="w-8 px-2 py-2" />
            <th className="px-3 py-2 font-medium">Offre</th>
            <th className="px-3 py-2 font-medium">Bien</th>
            <th className="px-3 py-2 font-medium">Vendeur</th>
            <th className="px-3 py-2 font-medium">Étape</th>
            <th className="px-3 py-2 font-medium">Échéance</th>
            <th className="px-3 py-2 font-medium">Offres</th>
            <th className="px-3 py-2 font-medium">Sélection</th>
            <th className="px-3 py-2 font-medium">Paiement</th>
            <th className="px-3 py-2 font-medium">Pistes</th>
          </tr>
        </thead>
        <tbody>
          {offres.map((o) => {
            const deplie = ouverte === o.id;
            return (
              <Fragment key={o.id}>
                <tr
                  className={cn("cursor-pointer border-t align-top hover:bg-muted/30", deplie && "bg-muted/30")}
                  onClick={() => setOuverte(deplie ? null : o.id)}
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
                      href={cheminFiche(o.ref)}
                      className="font-medium tabular-nums hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {o.ref}
                    </Link>
                    {o.est_test && (
                      <StatutPastille ton="attention" className="ml-2">
                        TEST
                      </StatutPastille>
                    )}
                    <span className="block text-legende text-muted-foreground">ouverte le {jourMoyen(o.cree_le)}</span>
                    {o.anomalies.length > 0 && (
                      <StatutPastille ton="attention" className="mt-1">
                        {o.anomalies.length > 1 ? `${o.anomalies.length} anomalies` : "1 anomalie"}
                      </StatutPastille>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      {o.bien_image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- miniature du stockage, déjà publique dans l'application
                        <img src={o.bien_image} alt="" className="size-10 shrink-0 rounded-md border object-cover" />
                      ) : (
                        <span className="size-10 shrink-0 rounded-md border bg-muted" aria-hidden />
                      )}
                      <span className="grid">
                        <span className="line-clamp-1">{o.bien_titre}</span>
                        <span className="text-legende text-muted-foreground">
                          à partir de {euros(o.prix_depart_cents)}
                        </span>
                        {o.moderation && (
                          <StatutPastille ton={TON_ETAT_MODERATION[o.moderation]} className="mt-1 w-fit">
                            {LIBELLE_ETAT_MODERATION[o.moderation]}
                          </StatutPastille>
                        )}
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {o.vendeur && o.vendeur_id && lienCompte ? (
                      <Link
                        href={`/utilisateurs/${o.vendeur_id}`}
                        className="hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {o.vendeur}
                      </Link>
                    ) : (
                      (o.vendeur ?? "Compte effacé")
                    )}
                    {o.ville && <span className="block text-legende text-muted-foreground">{o.ville}</span>}
                  </td>
                  <td className="px-3 py-2">
                    <StatutPastille ton={TON_ETAPE_FLASH[o.etape]}>{o.etape_libelle}</StatutPastille>
                    {o.action_attendue && (
                      <span className="mt-1 block max-w-60 text-legende text-muted-foreground">
                        {o.acteur_attendu ? `${LIBELLE_ACTEUR_FLASH[o.acteur_attendu] ?? o.acteur_attendu} · ` : ""}
                        {o.action_attendue}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Echeance iso={o.echeance} maintenant={maintenant} />
                  </td>
                  <td className="px-3 py-2 tabular-nums">{o.offres}</td>
                  <td className="px-3 py-2">
                    <Selection o={o} />
                  </td>
                  <td className="px-3 py-2">
                    {o.paiement ? (
                      <span className="grid">
                        <span className="tabular-nums">{euros(o.paiement.total_cents)}</span>
                        <span className="text-legende text-muted-foreground">
                          {LIBELLE_STATUT_COMMANDE[o.paiement.statut]}
                        </span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Bande pistes={o.pistes} />
                  </td>
                </tr>
                {deplie && (
                  <tr className="border-t">
                    <td colSpan={10} className="p-0">
                      <DetailFlash o={o} lienAnnonce={lienAnnonce} peutModerer={peutModerer} peutTraiter={peutTraiter} />
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

"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, TriangleAlert } from "lucide-react";
import { cn } from "cn";
import { Echeance } from "@/components/activite/Echeance";
import { useMaintenant } from "@/components/activite/commun";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { ActionsTicket } from "@/components/operations/ActionsTicket";
import { dateHeure, jourMoyen } from "@/lib/dates";
import { LIBELLE_ACTEUR_LIVE, adresseLives, cheminLive, type LiveLigne, type ZoneLive } from "@/lib/lives/types";
import { LIBELLE_DIFFUSION, LIBELLE_FORMAT_LIVE } from "@/lib/operations/libelles";
import { cheminFiche } from "@/lib/operations/types";

// La couleur des lives est celle de l'application et de l'Activité en direct (le
// rouge du « LIVE ») ; un live terminé est muet.
export const TON_ZONE_LIVE: Record<ZoneLive, Ton> = { programme: "erreur", en_direct: "erreur", termine: "muet" };

/** Les places d'un live Exclusif ou VIP ; un live Classique n'en a pas. */
function Places({ l }: { l: LiveLigne }) {
  const p = l.places;
  if (p.total === null) return <span className="text-muted-foreground">Ouvert à tous</span>;
  return (
    <span className="grid gap-0.5">
      <span className="tabular-nums">
        {p.confirmees + p.reservees}/{p.total} occupées
      </span>
      <span className="text-legende text-muted-foreground">
        {p.confirmees} confirmées · {p.reservees} à confirmer
        {p.attente > 0 && ` · ${p.attente} en attente`}
      </span>
    </span>
  );
}

/** Le détail d'un live : son déroulé, ses comptes, ce qui ne va pas, et ce que l'équipe peut faire. */
export function DetailLive({ l, peutTraiter }: { l: LiveLigne; peutTraiter: boolean }) {
  const p = l.places;
  return (
    <div className="grid gap-4 bg-muted/20 px-4 py-4 lg:grid-cols-[1fr_300px]">
      <div className="grid content-start gap-4">
        {l.anomalies.length > 0 && (
          <ul className="grid gap-1.5 rounded-lg border border-[#B45309]/30 bg-[#B45309]/5 p-3" aria-label="Anomalies">
            {l.anomalies.map((a) => (
              <li key={a.code} className="flex items-start gap-2 text-corps">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#B45309]" aria-hidden />
                <span>{a.libelle}</span>
              </li>
            ))}
          </ul>
        )}
        <dl className="grid gap-x-6 gap-y-2 text-corps sm:grid-cols-2">
          <div>
            <dt className="text-legende text-muted-foreground">Déroulé</dt>
            <dd>{l.moment_libelle}</dd>
          </div>
          <div>
            <dt className="text-legende text-muted-foreground">Diffusion</dt>
            <dd>{LIBELLE_DIFFUSION[l.diffusion]}</dd>
          </div>
          <div>
            <dt className="text-legende text-muted-foreground">Programmé · lancé · terminé</dt>
            <dd className="tabular-nums">
              {[l.programme_le, l.debut, l.fin].map((d) => (d ? dateHeure(d) : "—")).join(" · ")}
            </dd>
          </div>
          <div>
            <dt className="text-legende text-muted-foreground">Articles</dt>
            <dd>
              {l.articles} au programme · {l.vendus} vendus · {l.invendus} non vendus · {l.retires} retirés · {l.en_cours}{" "}
              en cours
            </dd>
          </div>
          <div>
            <dt className="text-legende text-muted-foreground">Accès d’achat et paiements encore ouverts</dt>
            <dd>
              {l.acces_ouverts} accès · {l.paiements_ouverts} paiements
              {l.zone === "termine" && (l.acces_ouverts > 0 || l.paiements_ouverts > 0) && (
                <span className="block text-legende text-muted-foreground">
                  La fin du live n’annule aucune échéance de paiement déjà ouverte (R14.6).
                </span>
              )}
            </dd>
          </div>
          {p.total !== null && (
            <div>
              <dt className="text-legende text-muted-foreground">Places</dt>
              <dd>
                {p.total} places{p.acheteurs_vip !== null && ` dont ${p.acheteurs_vip} acheteurs VIP`} ·{" "}
                {p.confirmees} confirmées · {p.reservees} à confirmer · {p.attente} en attente · {p.liberees} libérées ou
                expirées
                {p.spectateurs > 0 && ` · ${p.spectateurs} spectateurs`}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-legende text-muted-foreground">Audience</dt>
            <dd className="text-muted-foreground">Non mesurée : l’application ne compte pas encore les spectateurs.</dd>
          </div>
        </dl>
      </div>
      <div className="grid content-start gap-3">
        <Link href={cheminLive(l.id)} className="text-corps font-medium text-h2h-primary hover:underline">
          Gérer le live et ses articles
        </Link>
        <Link href={cheminFiche(l.ref)} className="text-corps text-h2h-primary hover:underline">
          Ouvrir la fiche complète
        </Link>
        <Link href={cheminFiche(l.ref, "bien-et-accord")} className="text-corps text-h2h-primary hover:underline">
          Voir les articles, les offres et les accès d’achat
        </Link>
        {p.total !== null && (
          <Link
            href={adresseLives({ onglet: "reservations", live: l.id, q: null, test: l.est_test })}
            className="text-corps text-h2h-primary hover:underline"
          >
            Voir les réservations de ce live
          </Link>
        )}
        {peutTraiter && (
          <div className="grid gap-1">
            <ActionsTicket
              o={{
                objet_table: "live_sessions",
                objet_id: l.id,
                alerte_libelle: l.anomalies[0]?.libelle ?? null,
                action_attendue: l.action_attendue,
                etape_libelle: l.moment_libelle,
              }}
            />
            {l.anomalies.length > 0 && (
              <p className="text-legende text-muted-foreground">
                Examiner une anomalie : un ticket sur le live, dans « À traiter ». Rien ne se corrige d’ici.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Les lives (§14) : un live par ligne, sa zone et le moment de son déroulé, son
 * échéance, ses articles, ses places — et, déplié, son détail et les gestes que
 * l'équipe peut faire.
 */
export function ListeLives({
  lives,
  filtree,
  lienCompte,
  peutTraiter,
  vide,
}: {
  lives: LiveLigne[];
  filtree: boolean;
  lienCompte: boolean;
  peutTraiter: boolean;
  /** Ce que dit une liste vide sans filtre : « Rediffusions » le dit autrement. */
  vide?: { titre: string; texte: string };
}) {
  const [ouvert, setOuvert] = useState<string | null>(null);
  const maintenant = useMaintenant();

  if (lives.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="live" taille={96} />
        <p className="mt-3 font-semibold">{filtree && !vide ? "Aucun live pour ces filtres" : (vide?.titre ?? "Aucun live")}</p>
        <p className="max-w-lg text-corps text-muted-foreground">
          {vide?.texte ?? "Chaque live apparaît ici dès sa programmation."}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[1080px] text-corps">
        <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
          <tr>
            <th className="w-8 px-2 py-2" />
            <th className="px-3 py-2 font-medium">Live</th>
            <th className="px-3 py-2 font-medium">Titre</th>
            <th className="px-3 py-2 font-medium">Hôte</th>
            <th className="px-3 py-2 font-medium">Moment</th>
            <th className="px-3 py-2 font-medium">Échéance</th>
            <th className="px-3 py-2 font-medium">Articles</th>
            <th className="px-3 py-2 font-medium">Places</th>
            <th className="px-3 py-2 font-medium">Ouverts</th>
          </tr>
        </thead>
        <tbody>
          {lives.map((l) => {
            const deplie = ouvert === l.id;
            return (
              <Fragment key={l.id}>
                <tr
                  className={cn("cursor-pointer border-t align-top hover:bg-muted/30", deplie && "bg-muted/30")}
                  onClick={() => setOuvert(deplie ? null : l.id)}
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
                      href={cheminFiche(l.ref)}
                      className="font-medium tabular-nums hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {l.ref}
                    </Link>
                    {l.est_test && (
                      <StatutPastille ton="attention" className="ml-2">
                        TEST
                      </StatutPastille>
                    )}
                    <span className="block text-legende text-muted-foreground">créé le {jourMoyen(l.cree_le)}</span>
                    {l.anomalies.length > 0 && (
                      <StatutPastille ton="attention" className="mt-1">
                        {l.anomalies.length > 1 ? `${l.anomalies.length} anomalies` : "1 anomalie"}
                      </StatutPastille>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className="flex items-center gap-2">
                      {l.image ? (
                        // eslint-disable-next-line @next/next/no-img-element -- miniature du stockage, déjà publique dans l'application
                        <img src={l.image} alt="" className="size-10 shrink-0 rounded-md border object-cover" />
                      ) : (
                        <span className="size-10 shrink-0 rounded-md border bg-muted" aria-hidden />
                      )}
                      <span className="grid">
                        <span className="line-clamp-1">{l.titre}</span>
                        <span className="text-legende text-muted-foreground">{LIBELLE_FORMAT_LIVE[l.format]}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {l.vendeur && l.vendeur_id && lienCompte ? (
                      <Link href={`/utilisateurs/${l.vendeur_id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                        {l.vendeur}
                      </Link>
                    ) : (
                      (l.vendeur ?? "Compte effacé")
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <StatutPastille ton={TON_ZONE_LIVE[l.zone]}>{l.moment_libelle}</StatutPastille>
                    {l.action_attendue && (
                      <span className="mt-1 block max-w-60 text-legende text-muted-foreground">
                        {l.acteur_attendu ? `${LIBELLE_ACTEUR_LIVE[l.acteur_attendu] ?? l.acteur_attendu} · ` : ""}
                        {l.action_attendue}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Echeance iso={l.echeance} maintenant={maintenant} />
                  </td>
                  <td className="px-3 py-2">
                    <span className="grid">
                      <span className="tabular-nums">{l.articles}</span>
                      <span className="text-legende text-muted-foreground">
                        {l.vendus} vendus · {l.en_cours} en cours
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <Places l={l} />
                  </td>
                  <td className="px-3 py-2">
                    <span className="grid text-legende">
                      <span>{l.acces_ouverts} accès</span>
                      <span>{l.paiements_ouverts} paiements</span>
                    </span>
                  </td>
                </tr>
                {deplie && (
                  <tr className="border-t">
                    <td colSpan={9} className="p-0">
                      <DetailLive l={l} peutTraiter={peutTraiter} />
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

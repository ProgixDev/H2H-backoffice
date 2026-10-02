"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Echeance } from "@/components/activite/Echeance";
import { useMaintenant } from "@/components/activite/commun";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { SignalementsLus } from "@/components/signalements/BlocSignalements";
import { dateHeure } from "@/lib/dates";
import { LIBELLE_ACTEUR_LIVE, LIBELLE_ARRET, adresseLives, type ArretLive, type FicheLive } from "@/lib/lives/types";
import {
  LIBELLE_DIFFUSION,
  LIBELLE_FORMAT_LIVE,
  LIBELLE_ISSUE_ARTICLE,
  LIBELLE_PHASE_ARTICLE,
  LIBELLE_SELECTION_LIVE,
} from "@/lib/operations/libelles";
import { cheminFiche } from "@/lib/operations/types";
import { euros } from "@/lib/paiements/types";
import type { SignalementsCible } from "@/lib/signalements/types";
import { GesteArretLive } from "./GesteArretLive";
import { GesteRetraitArticle } from "./GesteRetraitArticle";
import { TON_ZONE_LIVE } from "./ListeLives";

/**
 * La fiche d'un live pour l'équipe : où en est son déroulé, ce qui ne va pas,
 * ses signalements et leur examen (R14.4), et ses articles dans l'ordre de passage — chacun avec son issue, ses offres,
 * ses fenêtres d'achat, et « Retirer l'article » quand la base le permet (R14.4).
 */
// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE : l'arrêt qui n'aboutit pas est rouge.
const TON_ARRET: Record<ArretLive["statut"], Ton> = { demande: "actif", en_cours: "actif", reussi: "muet", echoue: "erreur" };

export function FicheLiveVue({ f, signalements }: { f: FicheLive; signalements: SignalementsCible | null }) {
  const maintenant = useMaintenant();
  return (
    <div className="grid gap-6">
      <div className="grid gap-3 rounded-xl border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-h3 font-semibold">{f.titre}</h2>
          <StatutPastille ton={TON_ZONE_LIVE[f.zone]}>{f.moment_libelle}</StatutPastille>
          {f.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
        </div>
        <dl className="grid gap-x-6 gap-y-2 text-corps sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-legende text-muted-foreground">Référence</dt>
            <dd>
              <Link href={cheminFiche(f.ref)} className="font-medium tabular-nums text-h2h-primary hover:underline">
                {f.ref}
              </Link>
            </dd>
          </div>
          <div>
            <dt className="text-legende text-muted-foreground">Format · hôte</dt>
            <dd>
              {LIBELLE_FORMAT_LIVE[f.format]} · {f.vendeur ?? "Compte effacé"}
            </dd>
          </div>
          <div>
            <dt className="text-legende text-muted-foreground">Diffusion</dt>
            <dd>{LIBELLE_DIFFUSION[f.diffusion]}</dd>
          </div>
          <div>
            <dt className="text-legende text-muted-foreground">Échéance</dt>
            <dd>
              <Echeance iso={f.echeance} maintenant={maintenant} />
            </dd>
          </div>
          {f.action_attendue && (
            <div className="sm:col-span-2">
              <dt className="text-legende text-muted-foreground">Action attendue</dt>
              <dd>
                {f.acteur_attendu ? `${LIBELLE_ACTEUR_LIVE[f.acteur_attendu] ?? f.acteur_attendu} · ` : ""}
                {f.action_attendue}
              </dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="text-legende text-muted-foreground">Accès d’achat et paiements encore ouverts</dt>
            <dd>
              {f.acces_ouverts} accès · {f.paiements_ouverts} paiements
            </dd>
          </div>
        </dl>
        {f.anomalies.length > 0 && (
          <ul className="grid gap-1.5 rounded-lg border border-[#B45309]/30 bg-[#B45309]/5 p-3" aria-label="Anomalies">
            {f.anomalies.map((a) => (
              <li key={a.code} className="flex items-start gap-2 text-corps">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[#B45309]" aria-hidden />
                <span>{a.libelle}</span>
              </li>
            ))}
          </ul>
        )}
        {(f.arret || f.arret_possible.possible || f.zone === "en_direct") && (
          <div className="grid gap-2 border-t pt-3">
            <span className="text-legende font-semibold text-muted-foreground">Arrêter la diffusion</span>
            {f.arret && (
              <span className="flex flex-wrap items-center gap-2 text-corps">
                <StatutPastille ton={TON_ARRET[f.arret.statut]}>{LIBELLE_ARRET[f.arret.statut]}</StatutPastille>
                <span className="text-legende text-muted-foreground tabular-nums">
                  demandé le {dateHeure(f.arret.demande_le)} · {f.arret.tentatives} tentative{f.arret.tentatives > 1 ? "s" : ""}
                  {f.arret.erreur && ` · ${f.arret.erreur}`}
                </span>
              </span>
            )}
            {f.arret_possible.possible ? (
              <span className="flex flex-wrap items-center gap-3">
                <GesteArretLive live={f.id} titre={f.titre} />
                <span className="max-w-xl text-legende text-muted-foreground">
                  Le live est terminé pour tout le monde et la vidéo s’arrête chez le prestataire ; les achats déjà
                  ouverts vont au bout.
                </span>
              </span>
            ) : (
              f.zone === "en_direct" &&
              f.arret_possible.raison && <span className="text-legende text-muted-foreground">{f.arret_possible.raison}</span>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-4 text-corps">
          <Link href={cheminFiche(f.ref)} className="font-medium text-h2h-primary hover:underline">
            Ouvrir la fiche complète
          </Link>
          {f.places.total !== null && (
            <Link
              href={adresseLives({ onglet: "reservations", live: f.id, q: null, test: f.est_test })}
              className="text-h2h-primary hover:underline"
            >
              Voir les réservations
            </Link>
          )}
        </div>
      </div>

      {/* Les signalements des spectateurs (20261002007000) : leur examen se fait ici, la mesure aussi. */}
      <section className="grid gap-2">
        <h3 className="text-h3 font-semibold">Signalements</h3>
        <SignalementsLus genre="live" cible={f.id} s={signalements} />
      </section>

      <section className="grid gap-2">
        <h3 className="text-h3 font-semibold">Articles · {f.articles.length}</h3>
        <p className="text-legende text-muted-foreground">
          Un article retiré garde sa place dans le déroulé, mais ne reçoit plus d’offre et ne s’achète plus. Un achat
          déjà commencé suit sa propre procédure, dans Transactions : il ne s’annule pas d’ici.
        </p>
        {f.articles.length === 0 ? (
          <p className="text-corps text-muted-foreground">Aucun article au programme.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[900px] text-corps">
              <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">Article</th>
                  <th className="px-3 py-2 font-medium">Issue</th>
                  <th className="px-3 py-2 font-medium">Offres</th>
                  <th className="px-3 py-2 font-medium">Accès ouverts</th>
                  <th className="px-3 py-2 font-medium">Retrait</th>
                </tr>
              </thead>
              <tbody>
                {f.articles.map((a) => (
                  <tr key={a.id} className="border-t align-top">
                    <td className="px-3 py-2 tabular-nums">{a.position}</td>
                    <td className="px-3 py-2">
                      <span className="grid">
                        <span>{a.titre ?? "—"}</span>
                        <span className="text-legende text-muted-foreground">
                          {a.prix_depart_cents !== null && `départ ${euros(a.prix_depart_cents)}`}
                          {a.en_cours && a.phase && ` · en cours : ${LIBELLE_PHASE_ARTICLE[a.phase].toLowerCase()}`}
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {LIBELLE_ISSUE_ARTICLE[a.issue]}
                      {a.mode && <span className="block text-legende text-muted-foreground">{LIBELLE_SELECTION_LIVE[a.mode]}</span>}
                      {a.vendu_a && <span className="block text-legende text-muted-foreground">à {a.vendu_a}</span>}
                    </td>
                    <td className="px-3 py-2 tabular-nums">
                      {a.offres}
                      {a.meilleure_offre_cents !== null && (
                        <span className="block text-legende text-muted-foreground">
                          meilleure {euros(a.meilleure_offre_cents)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 tabular-nums">{a.acces_ouverts}</td>
                    <td className="px-3 py-2">
                      <GesteRetraitArticle live={f.id} article={a} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

import Link from "next/link";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { TON_ORDRE } from "@/components/paiements/OrdresFinanciers";
import { cheminAnnonce } from "@/lib/annonces/types";
import { dateHeure } from "@/lib/dates";
import { euros, LIBELLE_STATUT_ORDRE } from "@/lib/paiements/types";
import { cheminCompte } from "@/lib/utilisateurs/types";
import {
  causePauseDite,
  EXPLICATION_ANOMALIE,
  LIBELLE_ANOMALIE,
  LIBELLE_FIN_OPTION,
  LIBELLE_STATUT_REMONTEE,
  partEnMots,
  type FicheOption,
  type StatutRemontee,
  type TarifOption,
} from "@/lib/visibilite/types";
import { GesteArretOption } from "./GesteArretOption";
import { etatDetaille, LIBELLE_ETAT_COURT, TON_ETAT_OPTION } from "./ListeOptions";
import { FormulaireRemboursementOption } from "./RemboursementOption";

const TON_REMONTEE: Record<StatutRemontee, "actif" | "succes" | "erreur" | "muet"> = {
  prevue: "actif",
  executee: "succes",
  manquee: "erreur",
  annulee: "muet",
};

const POURCENT = new Intl.NumberFormat("fr-FR", { style: "percent", maximumFractionDigits: 2 });
const HEURES = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

/** La durée d'une pause close, en heures ou en jours — sans lire l'horloge : une page serveur reste pure. */
function dureeDite(debut: string, fin: string | null): string {
  if (!fin) return "en cours";
  const heures = (Date.parse(fin) - Date.parse(debut)) / 3_600_000;
  return heures < 48 ? `${HEURES.format(heures)} h` : `${HEURES.format(heures / 24)} j`;
}

function Section({ titre, children, className }: { titre: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`grid content-start gap-2 rounded-xl border p-4 ${className ?? ""}`}>
      <h3 className="text-h3 font-semibold">{titre}</h3>
      {children}
    </section>
  );
}

function Champ({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-legende text-muted-foreground">{titre}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Aucun({ children }: { children: React.ReactNode }) {
  return <p className="text-corps text-muted-foreground">{children}</p>;
}

/** Le tarif appliqué, figé à la réservation (R17.1 : grille, assiette, minimum, plafond). */
function Tarif({ t }: { t: TarifOption | null }) {
  if (!t) {
    return <Aucun>Aucun tarif figé : l’option a été réservée avant que la base le garde (04/10/2026).</Aucun>;
  }
  const pourcentage = t.calcul === "percent";
  return (
    <dl className="grid gap-x-6 gap-y-2 text-corps sm:grid-cols-2">
      <Champ titre="Grille · rang">
        {t.grille ?? "—"} · {t.rang ?? "—"}
        {t.rang !== null && t.rang > 1 && (
          <span className="block text-legende text-muted-foreground">
            {t.rang}ᵉ annonce de la catégorie en douze mois
          </span>
        )}
      </Champ>
      <Champ titre="Calcul">
        {pourcentage ? `Pourcentage de l’assiette (${t.taux !== null ? POURCENT.format(t.taux) : "—"})` : "Forfait"}
      </Champ>
      {pourcentage ? (
        <>
          <Champ titre="Assiette">{euros(t.assiette_cents)}</Champ>
          <Champ titre="Minimum · plafond">
            {t.minimum_cents !== null ? euros(t.minimum_cents) : "—"} · {t.plafond_cents !== null ? euros(t.plafond_cents) : "—"}
          </Champ>
        </>
      ) : (
        <Champ titre="Forfait">{t.forfait_cents !== null ? euros(t.forfait_cents) : "—"}</Champ>
      )}
      <Champ titre="Durée">{t.duree_jours ? `${t.duree_jours} jour(s), depuis l’activation` : "Un acte : pas de durée"}</Champ>
      <Champ titre="Prix appliqué">
        <span className="font-semibold">{euros(t.prix_cents)}</span>
      </Champ>
    </dl>
  );
}

/**
 * La fiche d'une option de visibilité (§17, R17.1) : ce qu'elle met en avant et
 * pour qui, le tarif appliqué, son exécution (chaque remontée, chaque pause), la
 * preuve de l'accord à l'exécution immédiate, sa rétractation, le calcul de son
 * remboursement, ses avoirs, ses contestations, ses arrêts — et « Arrêter
 * l'option » ou « Demander le remboursement » quand la base le permet, sinon
 * pourquoi.
 *
 * ⚠️ L'ÉCRAN MONTRE CE QUE LA BASE PERMET (`possibles`), et la base décide encore.
 */
export function FicheOptionVue({
  f,
  lienAnnonce,
  lienCompte,
  lienDossier,
}: {
  f: FicheOption;
  /** `annonces.lire` : l'annonce ou la demande ouvre sa fiche. */
  lienAnnonce: boolean;
  /** `utilisateurs.lire` : l'acheteur ouvre la sienne. */
  lienCompte: boolean;
  /** `dossiers.lire` : les dossiers « À traiter » s'ouvrent. */
  lienDossier: boolean;
}) {
  const detail = etatDetaille(f);
  const r = f.remboursement;
  return (
    <div className="grid gap-6">
      <div className="grid gap-3 rounded-xl border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-h3 font-semibold tabular-nums">{f.ref}</h2>
          <StatutPastille ton={f.fin_motif === "arretee" ? "erreur" : TON_ETAT_OPTION[f.etat]}>
            {LIBELLE_ETAT_COURT[f.etat]}
          </StatutPastille>
          {f.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
        </div>
        <p className="text-corps">
          <span className="font-semibold">{f.libelle}</span>
          {detail && <span className="text-muted-foreground"> — {detail}</span>}
        </p>
        <dl className="grid gap-x-6 gap-y-2 text-corps sm:grid-cols-2 lg:grid-cols-4">
          <Champ titre={f.famille === "annonce" ? "Annonce mise en avant" : "Demande mise en avant"}>
            {lienAnnonce ? (
              <Link href={cheminAnnonce(f.cible.id)} className="font-medium text-h2h-primary hover:underline">
                « {f.cible.titre ?? "—"} »
              </Link>
            ) : (
              <>« {f.cible.titre ?? "—"} »</>
            )}
            <span className="block text-legende text-muted-foreground">
              {f.cible.statut ?? "—"}
              {f.cible.moderation ? ` · modération : ${f.cible.moderation}` : ""}
            </span>
          </Champ>
          <Champ titre="Acheteur">
            {lienCompte ? (
              <Link href={cheminCompte(f.acheteur_id)} className="font-medium text-h2h-primary hover:underline">
                {f.acheteur ?? "Compte effacé"}
              </Link>
            ) : (
              (f.acheteur ?? "Compte effacé")
            )}
            <span className="block text-legende text-muted-foreground">
              {f.acheteur_compte === "individual" ? "Particulier" : f.acheteur_compte ? "Professionnel" : "—"}
            </span>
          </Champ>
          <Champ titre="Prix">
            <span className="font-semibold">{euros(f.prix_cents)}</span>
            <span className="block text-legende text-muted-foreground tabular-nums">réservée le {dateHeure(f.reservee_le)}</span>
          </Champ>
          <Champ titre="Début · fin">
            <span className="tabular-nums">{f.active_depuis ? dateHeure(f.active_depuis) : "Pas commencée"}</span>
            <span className="block text-legende text-muted-foreground tabular-nums">
              {f.termine_le
                ? `finie le ${dateHeure(f.termine_le)}${f.fin_motif ? ` — ${LIBELLE_FIN_OPTION[f.fin_motif] ?? f.fin_motif}` : ""}`
                : f.fin_prevue
                  ? `jusqu’au ${dateHeure(f.fin_prevue)}${f.etat === "en_pause" ? ", et la pause la recule" : ""}`
                  : "—"}
            </span>
          </Champ>
        </dl>

        {f.anomalies.length > 0 && (
          <ul className="grid gap-2">
            {f.anomalies.map((a) => (
              <li key={a} className="grid gap-0.5 rounded-lg border border-h2h-error/30 bg-h2h-error/5 p-3 text-corps">
                <span className="font-semibold text-h2h-error">{LIBELLE_ANOMALIE[a] ?? a}</span>
                <span>{EXPLICATION_ANOMALIE[a]}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t pt-3">
          {f.possibles.arreter.possible ? (
            <GesteArretOption
              option={f.id}
              libelle={f.libelle}
              remboursementCents={f.possibles.arreter.remboursement_cents}
              remboursementRaison={f.possibles.arreter.remboursement_raison}
            />
          ) : (
            f.possibles.arreter.raison && <span className="text-legende text-muted-foreground">{f.possibles.arreter.raison}</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section titre="Tarif appliqué">
          <Tarif t={f.tarif} />
          <p className="text-legende text-muted-foreground">Figé à la réservation : un changement de grille ne le touche pas.</p>
        </Section>

        <Section titre="Accord à l’exécution immédiate">
          {f.accord_detail ? (
            <>
              <dl className="grid gap-x-6 gap-y-2 text-corps sm:grid-cols-2">
                <Champ titre="Donné le">
                  <span className="tabular-nums">{dateHeure(f.accord_detail.donne_le)}</span>
                </Champ>
                <Champ titre="Texte · compte">
                  {f.accord_detail.version} · {f.accord_detail.particulier ? "particulier" : "professionnel"}
                </Champ>
              </dl>
              <blockquote className="whitespace-pre-line rounded-lg border-l-4 border-h2h-primary/40 bg-muted/30 p-3 text-corps">
                {f.accord_detail.texte}
              </blockquote>
              <p className="break-all text-legende text-muted-foreground">Empreinte du texte (md5) : {f.accord_detail.empreinte}</p>
              {f.accord_detail.a_valider && (
                <p className="text-legende text-[#B45309]">Ce texte est un projet, à valider juridiquement.</p>
              )}
            </>
          ) : (
            <Aucun>
              Aucun accord recueilli : l’option a été achetée avant le 04/10/2026, ou par une version de l’application qui
              ne le demandait pas. Elle reste rétractable dans le délai, sans part exécutée retenue.
            </Aucun>
          )}
        </Section>

        <Section titre="Exécution" className="lg:col-span-2">
          <p className="text-corps">
            Part exécutée : <span className="font-semibold">{partEnMots(f.part)}</span>
          </p>
          {f.remontees.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[520px] text-corps">
                <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
                  <tr>
                    <th className="px-3 py-1.5 font-medium">Remontée</th>
                    <th className="px-3 py-1.5 font-medium">Prévue le</th>
                    <th className="px-3 py-1.5 font-medium">Exécutée le</th>
                    <th className="px-3 py-1.5 font-medium">État</th>
                  </tr>
                </thead>
                <tbody>
                  {f.remontees.map((m) => (
                    <tr key={m.numero} className="border-t">
                      <td className="px-3 py-1.5 tabular-nums">n° {m.numero}</td>
                      <td className="px-3 py-1.5 tabular-nums">{dateHeure(m.prevue_le)}</td>
                      <td className="px-3 py-1.5 tabular-nums">{m.executee_le ? dateHeure(m.executee_le) : "—"}</td>
                      <td className="px-3 py-1.5">
                        <StatutPastille ton={TON_REMONTEE[m.statut]}>{LIBELLE_STATUT_REMONTEE[m.statut]}</StatutPastille>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Aucun>
              {f.famille === "demande" || f.option === "urgent"
                ? "Le badge Urgent ne remonte rien : sa part exécutée est son temps d’affichage, pauses déduites."
                : "Aucune remontée planifiée : l’option n’a pas démarré."}
            </Aucun>
          )}
          <h4 className="mt-2 text-legende font-semibold text-muted-foreground">Pauses · {f.pauses.length}</h4>
          {f.pauses.length > 0 ? (
            <ul className="grid gap-1 text-corps">
              {f.pauses.map((p) => (
                <li key={p.debut} className="flex flex-wrap gap-x-3">
                  <span className="tabular-nums">
                    {dateHeure(p.debut)} → {p.fin ? dateHeure(p.fin) : "…"}
                  </span>
                  <span className="text-muted-foreground">
                    {dureeDite(p.debut, p.fin)} · parce que {causePauseDite(p.cause)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Aucun>
              {f.famille === "demande"
                ? "Une demande ne met pas son option en pause."
                : "Aucune : l’annonce est restée visible tant que l’option a couru."}
            </Aucun>
          )}
        </Section>

        <Section titre="Rétractation">
          {f.retractation ? (
            <dl className="grid gap-x-6 gap-y-2 text-corps sm:grid-cols-2">
              <Champ titre="Référence · demandée le">
                <span className="tabular-nums">
                  {f.retractation.ref} · {dateHeure(f.retractation.demandee_le)}
                </span>
              </Champ>
              <Champ titre="Part exécutée, qui reste due">{euros(f.retractation.execute_cents)}</Champ>
              <Champ titre="Dû à l’acheteur">{euros(f.retractation.a_rembourser_cents)}</Champ>
              <Champ titre="Reste à rendre · avant le">
                <span className={f.retractation.reste_cents > 0 ? "font-semibold" : undefined}>
                  {euros(f.retractation.reste_cents)}
                </span>{" "}
                · {dateHeure(f.retractation.rembourser_avant)}
              </Champ>
            </dl>
          ) : f.retractation_possible ? (
            f.retractation_possible.possible ? (
              <p className="text-corps">
                L’acheteur peut encore se rétracter, avant le {dateHeure(f.retractation_possible.delai_jusqu_au)} :{" "}
                {euros(f.retractation_possible.a_rembourser_cents)} lui seraient remboursés.
              </p>
            ) : (
              <Aucun>Pas de rétractation possible : {f.retractation_possible.raison}</Aucun>
            )
          ) : (
            <Aucun>—</Aucun>
          )}
        </Section>

        <Section titre="Paiement, remboursements et avoirs">
          <dl className="grid gap-x-6 gap-y-2 text-corps sm:grid-cols-2">
            <Champ titre="Payé">
              {f.paiement?.montant_cents != null ? euros(f.paiement.montant_cents) : "Rien d’encaissé"}
              {f.paiement?.statut && <span className="block text-legende text-muted-foreground">{f.paiement.statut}</span>}
              {f.paiement?.reel === false && <StatutPastille ton="attention">Mode test</StatutPastille>}
            </Champ>
            <Champ titre="Facture">{f.facture ? f.facture.numero : "—"}</Champ>
            <Champ titre="Déjà rendu">{euros(r.rembourse_cents)}</Champ>
            <Champ titre="Peut encore partir">{euros(r.disponible_cents)}</Champ>
          </dl>
          {f.paiement?.intention && (
            <p className="break-all text-legende text-muted-foreground">Intention Stripe : {f.paiement.intention}</p>
          )}
          {r.ordres.length > 0 && (
            <ul className="grid gap-1.5">
              {r.ordres.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-2 text-legende">
                  <StatutPastille ton={TON_ORDRE[o.statut]}>{LIBELLE_STATUT_ORDRE[o.statut]}</StatutPastille>
                  <span className="font-medium tabular-nums">{o.ref}</span>
                  <span className="tabular-nums">{euros(o.montant_cents)}</span>
                  {o.demande_par && <span className="text-muted-foreground">demandé par {o.demande_par}</span>}
                  {o.avoir && <span className="text-muted-foreground">avoir {o.avoir}</span>}
                  {o.erreur && <span className="text-h2h-error">{o.erreur}</span>}
                </li>
              ))}
            </ul>
          )}
          {r.avoirs.length > 0 && (
            <ul className="grid gap-1.5">
              {r.avoirs.map((a) => (
                <li key={a.numero} className="grid rounded-lg border p-2 text-legende">
                  <span className="font-semibold tabular-nums">
                    Avoir {a.numero} · {euros(a.montant_cents)}
                  </span>
                  <span className="text-muted-foreground">
                    Corrige la facture {a.facture} · émis le {dateHeure(a.emis_le)} · « {a.raison} »
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-legende text-muted-foreground">
            Chaque remboursement réussi émet son avoir, qui cite la facture : aucun avoir ne s’émet sans argent rendu.
          </p>
          {f.possibles.rembourser.possible ? (
            <FormulaireRemboursementOption
              famille={f.famille}
              boost={f.id}
              suggestion={r.suggestion_cents}
              minimum={r.minimum_cents}
              disponible={r.disponible_cents}
            />
          ) : (
            f.possibles.rembourser.raison && (
              <p className="text-legende text-muted-foreground">{f.possibles.rembourser.raison}</p>
            )
          )}
        </Section>

        <Section titre="Contestations bancaires">
          {f.contestations.length === 0 ? (
            <Aucun>Aucune : le paiement n’a pas été contesté auprès de la banque.</Aucun>
          ) : (
            <ul className="grid gap-2">
              {f.contestations.map((c) => (
                <li key={c.dispute} className="grid gap-0.5 rounded-lg border p-3 text-corps">
                  <span className="flex flex-wrap items-center gap-2">
                    <StatutPastille ton={c.issue === "won" ? "neutre" : "erreur"}>
                      {c.close_le ? (c.issue === "won" ? "Gagnée" : c.issue === "lost" ? "Perdue" : "Close") : "Ouverte"}
                    </StatutPastille>
                    <span className="font-medium tabular-nums">{euros(c.montant_cents)}</span>
                    <span className="text-legende text-muted-foreground">frais {euros(c.frais_cents)}</span>
                  </span>
                  <span className="text-legende text-muted-foreground">
                    {c.motif ?? "—"} · ouverte le {dateHeure(c.ouverte_le)}
                    {c.preuves_avant && !c.close_le ? ` · preuves avant le ${dateHeure(c.preuves_avant)}` : ""}
                    {c.reprise_le ? ` · reprise le ${dateHeure(c.reprise_le)}` : ""}
                    {c.retablie_le ? ` · rétablie le ${dateHeure(c.retablie_le)}` : ""}
                  </span>
                  <span className="break-all text-legende text-muted-foreground">{c.dispute}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section titre="Arrêts par l’équipe">
          {f.arrets.length === 0 ? (
            <Aucun>Aucun.</Aucun>
          ) : (
            <ul className="grid gap-2">
              {f.arrets.map((a) => (
                <li key={a.reference} className="grid gap-0.5 rounded-lg border p-3 text-corps">
                  <span className="text-legende text-muted-foreground tabular-nums">
                    {a.reference} · {dateHeure(a.le)}
                    {a.par ? ` · ${a.par}` : ""}
                  </span>
                  <span>
                    <span className="text-muted-foreground">Message à l’acheteur : </span>« {a.message} »
                  </span>
                  <span className="text-legende text-muted-foreground">Motif interne : {a.motif}</span>
                  <span className="text-legende text-muted-foreground">
                    Part exécutée à l’arrêt : {partEnMots(a.part)}
                    {a.propose_cents ? ` · remboursement proposé : ${euros(a.propose_cents)}${a.ordre ? ` (${a.ordre})` : ""}` : " · aucun remboursement proposé"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {f.dossiers.length > 0 && (
          <Section titre="Dossiers « À traiter »">
            <ul className="grid gap-1.5 text-corps">
              {f.dossiers.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center gap-2">
                  <StatutPastille ton={d.statut === "ouvert" ? "actif" : "muet"}>{d.statut === "ouvert" ? "Ouvert" : "Clos"}</StatutPastille>
                  {lienDossier ? (
                    <Link href={`/a-traiter?dossier=${d.id}`} className="font-medium text-h2h-primary hover:underline">
                      {d.titre}
                    </Link>
                  ) : (
                    <span>{d.titre}</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}

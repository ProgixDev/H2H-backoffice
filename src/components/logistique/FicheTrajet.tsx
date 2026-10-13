import Link from "next/link";
import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import {
  EXPLICATION_ANOMALIE_TRAJET,
  LIBELLE_ANOMALIE_TRAJET,
  LIBELLE_MODE,
  LIBELLE_MOMENT,
  LIBELLE_RAISON_PASSAGE,
  LIBELLE_RAISON_TRAJET,
  LIBELLE_SITUATION,
  type FicheTrajet,
  type PassageTrajet,
  type RaisonPassage,
  type RechercheOuverte,
} from "@/lib/logistique/types";
import { LIBELLE_STATUT_CANDIDATURE, LIBELLE_STATUT_RECHERCHE } from "@/lib/operations/libelles";
import { cheminFiche, type StatutCandidature } from "@/lib/operations/types";
import { cheminCompte } from "@/lib/utilisateurs/types";
import { GesteRepriseTrajet, GesteSuspensionTrajet } from "./GestesTrajet";
import { TON_MOMENT } from "./ListeColivraisons";
import { SANS_PSEUDONYME, TON_SITUATION, capaciteDite, pluriel, rythmeDit } from "./ListeTrajets";

/** ⚠️ UN PASSAGE QUE LE COTRANSPORTEUR A FERMÉ SE TAIT ; un passage sans point de remise est une faute du trajet. */
const TON_PASSAGE: Record<RaisonPassage, Ton> = {
  sans_point_de_remise: "erreur",
  jour_off: "muet",
  complet: "neutre",
  chevauchement: "attention",
};

/** Les candidatures qui suivent leur cours, même si les nouvelles propositions sont suspendues. */
const EN_COURS: StatutCandidature[] = ["proposee", "en_attente", "retenue"];

const candidatureDite = (statut: string) => LIBELLE_STATUT_CANDIDATURE[statut as StatutCandidature] ?? statut;

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

/** Ce qu'un passage peut encore prendre, en une pastille. */
function Disponibilite({ p }: { p: PassageTrajet }) {
  if (p.ecarte) return <StatutPastille ton={TON_PASSAGE[p.ecarte]}>{LIBELLE_RAISON_PASSAGE[p.ecarte] ?? p.ecarte}</StatutPastille>;
  const libres = Math.max(p.places - p.reserves, 0);
  return <StatutPastille ton="succes">{`${pluriel(libres, "place")} libre${libres > 1 ? "s" : ""}`}</StatutPastille>;
}

/** Pourquoi ce trajet n'est pas proposé à cette recherche — ou qu'il va l'être. */
function Verdict({ r }: { r: RechercheOuverte }) {
  if (r.candidature) {
    return (
      <span>
        Proposition déjà envoyée — {candidatureDite(r.candidature)}
        <span className="text-muted-foreground">
          {r.sur_ce_trajet ? " (sur ce trajet)" : " (sur un autre trajet du même cotransporteur)"}
        </span>
      </span>
    );
  }
  if (r.ecarte) {
    return (
      <span>
        <StatutPastille ton="attention">Écarté</StatutPastille> {LIBELLE_RAISON_TRAJET[r.ecarte] ?? r.ecarte}
      </span>
    );
  }
  const passages = r.passages ?? [];
  if (r.fenetre_close) {
    return <span>La recherche n’a plus le temps de prévenir un cotransporteur avant la fin de son horizon.</span>;
  }
  if (passages.length === 0) {
    return (
      <span>
        Aucun passage dans la fenêtre de cette recherche : une collecte y est possible du {dateHeure(r.des)} au{" "}
        {dateHeure(r.jusqu_au)}.
      </span>
    );
  }
  const proposable = passages.some((p) => p.ecarte === null);
  return (
    <span className="grid gap-1">
      {proposable ? (
        <span>
          <StatutPastille ton="succes">Proposable</StatutPastille> Rien ne l’écarte : la proposition part au prochain
          tour d’horloge.
        </span>
      ) : (
        <span>
          <StatutPastille ton="attention">Écarté</StatutPastille> Aucun de ses passages n’est libre dans la fenêtre de
          cette recherche.
        </span>
      )}
      {passages.map((p) => (
        <span key={p.collecte_le} className="text-legende tabular-nums text-muted-foreground">
          {dateHeure(p.collecte_le)} · {p.ecarte ? (LIBELLE_RAISON_PASSAGE[p.ecarte] ?? p.ecarte) : "libre"}
        </span>
      ))}
    </span>
  );
}

/**
 * La fiche d'un trajet (§ 12.2) : ponctuel ou récurrent, le corridor, les points
 * de rendez-vous, les horaires, la capacité, les réservations et la
 * disponibilité restante de chaque passage ; ses co-livraisons (« Voir les
 * missions associées ») ; ce qui l'écarte des recherches ouvertes de son corridor
 * (« Examiner une incompatibilité ») ; ses suspensions — et « Suspendre » ou
 * « Rétablir les nouvelles propositions » quand la base le permet, sinon pourquoi.
 *
 * ⚠️ L'ÉCRAN MONTRE CE QUE LA BASE PERMET (`possibles`), et la base décide encore.
 * 🔴 NI POSITION, NI ADRESSE (R4.15).
 */
export function FicheTrajetVue({ f, lienCompte }: {
  f: FicheTrajet;
  /** `utilisateurs.lire` : le cotransporteur ouvre sa fiche. */
  lienCompte: boolean;
}) {
  const t = f.trajet;
  const corridor = `${t.ville_depart} → ${t.ville_arrivee}`;
  const suspendu = t.raisons.includes("trajet_suspendu");
  const geste = suspendu ? f.possibles.reprendre : f.possibles.suspendre;
  const candidatures = Object.entries(f.candidatures).sort(([a], [b]) => a.localeCompare(b));
  const enCours = candidatures.filter(([s]) => (EN_COURS as string[]).includes(s)).reduce((n, [, nb]) => n + nb, 0);

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 rounded-xl border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-h3 font-semibold">{corridor}</h2>
          <StatutPastille ton={TON_SITUATION[t.situation]}>{LIBELLE_SITUATION[t.situation]}</StatutPastille>
          {t.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
        </div>
        <dl className="grid gap-x-6 gap-y-2 text-corps sm:grid-cols-2 lg:grid-cols-4">
          <Champ titre="Cotransporteur particulier">
            {lienCompte ? (
              <Link href={cheminCompte(t.cotransporteur_id)} className="font-medium text-h2h-primary hover:underline">
                {t.cotransporteur ?? SANS_PSEUDONYME}
              </Link>
            ) : (
              (t.cotransporteur ?? SANS_PSEUDONYME)
            )}
          </Champ>
          <Champ titre="Trajet">
            <span className="tabular-nums">{rythmeDit(t)}</span>
            <span className="block text-legende text-muted-foreground">
              {LIBELLE_MODE[t.mode] ?? t.mode} · publié le {dateHeure(t.cree_le)}
            </span>
          </Champ>
          <Champ titre="Capacité">
            {capaciteDite(t)}
            <span className="block text-legende text-muted-foreground">
              {t.hors_hub ? "Hors point de rendez-vous possible" : "Aux points de rendez-vous seulement"}
            </span>
          </Champ>
          <Champ titre="Prochain passage">
            <span className="tabular-nums">{t.prochain_passage ? dateHeure(t.prochain_passage) : "Aucun passage à venir"}</span>
            <span className="block text-legende text-muted-foreground">
              {t.places_restantes !== null ? `${pluriel(t.places_restantes, "place")} sur ${t.places} · ` : ""}
              {pluriel(t.reservations, "réservation")} à venir · {pluriel(t.colivraisons_en_cours, "co-livraison")} en cours
            </span>
          </Champ>
        </dl>

        {t.raisons.length > 0 && t.situation !== "clos" && (
          <div className="grid gap-1 rounded-lg border border-[#B45309]/30 bg-[#B45309]/5 p-3 text-corps">
            <span className="font-semibold text-[#B45309]">Ce trajet n’est proposé à aucune recherche</span>
            <ul className="grid gap-0.5">
              {t.raisons.map((r) => (
                <li key={r}>{LIBELLE_RAISON_TRAJET[r] ?? r}</li>
              ))}
            </ul>
          </div>
        )}
        {t.situation === "clos" && (
          <p className="text-corps text-muted-foreground">
            Ce trajet ne recevra plus de proposition : il est expiré, terminé ou annulé — ou ponctuel, et sa date est
            passée.
          </p>
        )}

        {t.anomalies.length > 0 && (
          <ul className="grid gap-2">
            {t.anomalies.map((a) => (
              <li key={a} className="grid gap-0.5 rounded-lg border border-h2h-error/30 bg-h2h-error/5 p-3 text-corps">
                <span className="font-semibold text-h2h-error">{LIBELLE_ANOMALIE_TRAJET[a] ?? a}</span>
                <span>{EXPLICATION_ANOMALIE_TRAJET[a]}</span>
              </li>
            ))}
          </ul>
        )}

        <p className="text-legende text-muted-foreground">
          Confirmation du déplacement : elle se lit sur chaque passage, depuis que « Confirmer le trajet » s’enregistre
          (13/10/2026). La version de H2H Logistic en magasin ne l’envoie pas encore : un passage « pas confirmé » ne
          dit donc rien pour l’instant. Rien n’en dépend : un trajet non confirmé reste proposé.
        </p>

        <div className="flex flex-wrap items-center gap-3 border-t pt-3">
          {geste.possible ? (
            suspendu ? (
              <GesteRepriseTrajet trajet={t.id} corridor={corridor} />
            ) : (
              <GesteSuspensionTrajet trajet={t.id} corridor={corridor} />
            )
          ) : (
            geste.raison && <span className="text-legende text-muted-foreground">{geste.raison}</span>
          )}
          {suspendu && t.suspendu_le && (
            <span className="text-legende tabular-nums text-muted-foreground">
              Propositions suspendues depuis le {dateHeure(t.suspendu_le)}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section titre="Arrêts et horaires">
          {f.arrets.length === 0 ? (
            <Aucun>Aucun arrêt enregistré.</Aucun>
          ) : (
            <ol className="grid gap-1.5 text-corps">
              {f.arrets.map((a) => (
                <li key={a.position} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="w-16 text-legende text-muted-foreground">{a.position === 0 ? "Collecte" : `Remise ${a.position}`}</span>
                  <span className="tabular-nums">{a.heure ? a.heure.slice(0, 5) : "—"}</span>
                  <span>{[a.point, a.ville].filter(Boolean).join(" · ") || "—"}</span>
                  {a.point_actif === false && <StatutPastille ton="erreur">Point inactif</StatutPastille>}
                  {a.point === null && <StatutPastille ton="attention">Sans point de rendez-vous</StatutPastille>}
                </li>
              ))}
            </ol>
          )}
          <p className="text-legende text-muted-foreground">Les heures sont celles de Paris, à chaque passage du trajet.</p>
        </Section>

        <Section titre="Passages des sept prochains jours">
          {f.passages.length === 0 ? (
            <Aucun>Aucun passage dans les sept prochains jours.</Aucun>
          ) : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full min-w-[560px] text-corps">
                <thead className="bg-muted/40 text-left text-legende text-muted-foreground">
                  <tr>
                    <th className="px-3 py-1.5 font-medium">Collecte</th>
                    <th className="px-3 py-1.5 font-medium">Dernière remise</th>
                    <th className="px-3 py-1.5 font-medium">Réservations</th>
                    <th className="px-3 py-1.5 font-medium">Disponibilité</th>
                    <th className="px-3 py-1.5 font-medium">Déplacement</th>
                  </tr>
                </thead>
                <tbody>
                  {f.passages.map((p) => (
                    <tr key={p.collecte_le} className="border-t">
                      <td className="px-3 py-1.5 tabular-nums">{dateHeure(p.collecte_le)}</td>
                      <td className="px-3 py-1.5 tabular-nums">{dateHeure(p.fin_le)}</td>
                      <td className="px-3 py-1.5 tabular-nums">
                        {p.reserves} sur {p.places}
                      </td>
                      <td className="px-3 py-1.5">
                        <Disponibilite p={p} />
                      </td>
                      <td className="px-3 py-1.5 text-legende tabular-nums">
                        {p.jour_off ? (
                          <span className="text-muted-foreground">fermé par le cotransporteur</span>
                        ) : p.confirme_le ? (
                          `confirmé le ${dateHeure(p.confirme_le)}`
                        ) : (
                          <span className="text-muted-foreground">pas confirmé</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="text-legende text-muted-foreground">
            Les places se comptent par passage, comme la mise en relation les compte : les candidatures retenues ou
            confirmées, et les co-livraisons en cours.
            {t.raisons.length > 0 && t.situation !== "clos"
              ? " Tant que le trajet est écarté, aucun de ces passages n’est proposé."
              : ""}
          </p>
        </Section>

        <Section titre="Co-livraisons associées">
          {f.colivraisons.length === 0 ? (
            <Aucun>Aucune co-livraison sur ce trajet.</Aucun>
          ) : (
            <ul className="grid gap-1.5 text-corps">
              {f.colivraisons.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link href={cheminFiche(c.ref, "livraison")} className="font-medium tabular-nums text-h2h-primary hover:underline">
                    {c.ref}
                  </Link>
                  <StatutPastille ton={TON_MOMENT[c.moment]}>{LIBELLE_MOMENT[c.moment]}</StatutPastille>
                  <span className="text-legende tabular-nums text-muted-foreground">
                    collecte {c.collecte_prevue ? `le ${dateHeure(c.collecte_prevue)}` : "non fixée"} · remise{" "}
                    {c.remise_prevue ? `le ${dateHeure(c.remise_prevue)}` : "non fixée"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {f.colivraisons.length >= 50 && (
            <p className="text-legende text-muted-foreground">Les 50 plus récentes sont affichées.</p>
          )}
        </Section>

        <Section titre="Propositions et candidatures">
          {candidatures.length === 0 ? (
            <Aucun>Aucune proposition n’a encore porté sur ce trajet.</Aucun>
          ) : (
            <ul className="grid gap-1 text-corps">
              {candidatures.map(([statut, nb]) => (
                <li key={statut} className="flex gap-3">
                  <span className="w-8 text-right font-semibold tabular-nums">{nb}</span>
                  <span>{candidatureDite(statut)}</span>
                </li>
              ))}
            </ul>
          )}
          {enCours > 0 && (
            <p className="text-legende text-muted-foreground">
              {enCours > 1 ? `${enCours} sont en cours : elles suivent` : "Une est en cours : elle suit"} leur cours, que
              les nouvelles propositions soient suspendues ou non.
            </p>
          )}
        </Section>

        <Section titre="Recherches ouvertes sur ce corridor" className="lg:col-span-2">
          {f.recherches_ouvertes.length === 0 ? (
            <Aucun>Aucune recherche de co-livraison n’est ouverte sur ce corridor en ce moment.</Aucun>
          ) : (
            <ul className="grid gap-2">
              {f.recherches_ouvertes.map((r) => (
                <li key={r.recherche} className="grid gap-1 rounded-lg border p-3 text-corps">
                  <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-legende text-muted-foreground">
                    {r.ref ? (
                      <Link href={cheminFiche(r.ref, "livraison")} className="font-medium tabular-nums text-h2h-primary hover:underline">
                        {r.ref}
                      </Link>
                    ) : (
                      <span className="font-medium tabular-nums">Recherche n° {r.numero}</span>
                    )}
                    <span>{LIBELLE_STATUT_RECHERCHE[r.statut] ?? r.statut}</span>
                    <span>format {r.format}</span>
                    <span className="tabular-nums">lancée le {dateHeure(r.t0)}</span>
                  </span>
                  <Verdict r={r} />
                </li>
              ))}
            </ul>
          )}
          <p className="text-legende text-muted-foreground">
            La raison se lit maintenant, là où la mise en relation la lit : elle n’était pas enregistrée quand une
            recherche a prévenu les cotransporteurs, et une recherche close n’apparaît plus ici.
          </p>
        </Section>

        <Section titre="Suspensions par l’équipe" className="lg:col-span-2">
          {f.suspensions.length === 0 ? (
            <Aucun>Aucune.</Aucun>
          ) : (
            <ul className="grid gap-2">
              {f.suspensions.map((s) => (
                <li key={s.numero} className="grid gap-0.5 rounded-lg border p-3 text-corps">
                  <span className="text-legende tabular-nums text-muted-foreground">
                    n° {s.numero} · suspendues le {dateHeure(s.suspendu_le)}
                    {s.suspendu_par ? ` · ${s.suspendu_par}` : ""}
                  </span>
                  <span>
                    <span className="text-muted-foreground">Message au cotransporteur : </span>« {s.message} »
                  </span>
                  <span className="text-legende text-muted-foreground">Motif interne : {s.motif}</span>
                  <span className="text-legende text-muted-foreground">
                    {s.leve_le
                      ? `Rétablies le ${dateHeure(s.leve_le)}${s.leve_par ? ` · ${s.leve_par}` : ""} — ${s.motif_levee ?? "sans motif"}`
                      : "Toujours en cours"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

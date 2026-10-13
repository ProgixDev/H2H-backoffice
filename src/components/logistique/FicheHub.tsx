import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import {
  LIBELLE_CHAMP_HUB,
  LIBELLE_ETAT_HUB,
  LIBELLE_ISSUE_HUB,
  LIBELLE_LIEU,
  LIBELLE_MOMENT,
  LIBELLE_RAISON_SIGNALEMENT_HUB,
  LIBELLE_SITUATION,
  cheminHub,
  cheminTrajet,
  lienCarte,
  type FicheHub,
} from "@/lib/logistique/types";
import { LIBELLE_STATUT_CANDIDATURE, LIBELLE_STATUT_RECHERCHE } from "@/lib/operations/libelles";
import { cheminFiche } from "@/lib/operations/types";
import { TON_ETAT_HUB } from "./AnnuaireHubs";
import { GesteExamenSignalementsHub } from "./ExamenSignalementsHub";
import { GesteCorrectionHub } from "./FormulairePoint";
import { GesteFermetureHub, GesteReouvertureHub, GesteValidationHub } from "./GestesHub";
import { TON_MOMENT } from "./ListeColivraisons";
import { SANS_PSEUDONYME, TON_SITUATION, pluriel } from "./ListeTrajets";

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

const ROLE: Record<"collecte" | "remise", string> = { collecte: "Collecte", remise: "Remise" };

/** Une valeur d'une correction, telle qu'elle se lit : le type de lieu en mots, le vide dit « — ». */
function valeurCorrigee(champ: string, v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return "—";
  return champ === "type_lieu" ? (LIBELLE_LIEU[String(v)] ?? String(v)) : String(v);
}

/**
 * La fiche d'un point de rendez-vous (§ 12.4) : sa localisation, son état et le
 * motif de son indisponibilité, ses signalements et leur examen, les missions
 * concernées — les rendez-vous qui restent à y tenir et les trajets qui y
 * passent —, l'histoire de ses fermetures ; et « Valider », « Fermer aux nouvelles
 * recherches », « Rouvrir » ou « Examiner les signalements » quand la base le
 * permet, sinon pourquoi.
 *
 * ⚠️ L'ÉCRAN MONTRE CE QUE LA BASE PERMET (`possibles`), et la base décide encore.
 * ⚠️ UN POINT EST UN LIEU PUBLIC : ses coordonnées se lisent. Une personne n'y est
 * jamais située — un signalement dit le pseudonyme de son auteur, rien d'autre.
 */
export function FicheHubVue({ f }: { f: FicheHub }) {
  const h = f.hub;
  const enCours = f.fermetures.find((x) => x.leve_le === null) ?? null;
  // Ceux qui attendent l'équipe, tels que la fiche les montre : c'est parmi eux que l'examen choisit — sauf celui que
  // l'appelant a fait lui-même, que la base refuserait.
  const aExaminer = f.signalements.filter((s) => s.examen === null && !s.le_votre);
  const raisons = [...new Set([f.possibles.valider, f.possibles.fermer, f.possibles.rouvrir, f.possibles.corriger]
    .filter((p) => !p.possible && p.raison)
    .map((p) => p.raison as string))];
  const aucunGeste =
    !f.possibles.valider.possible &&
    !f.possibles.fermer.possible &&
    !f.possibles.rouvrir.possible &&
    !f.possibles.corriger.possible;

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 rounded-xl border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-h3 font-semibold">{h.nom ?? h.repere ?? "Point sans nom"}</h2>
          <StatutPastille ton={TON_ETAT_HUB[h.etat]}>{LIBELLE_ETAT_HUB[h.etat]}</StatutPastille>
          <StatutPastille ton="neutre">{LIBELLE_LIEU[h.type_lieu] ?? h.type_lieu}</StatutPastille>
        </div>
        <dl className="grid gap-x-6 gap-y-2 text-corps sm:grid-cols-2 lg:grid-cols-4">
          <Champ titre="Localisation">
            {[h.ville, h.region].filter(Boolean).join(" · ") || "—"}
            {h.adresse_du_lieu ? <span className="block text-legende text-muted-foreground">{h.adresse_du_lieu}</span> : null}
            <a
              href={lienCarte(h.latitude, h.longitude)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-1 text-legende text-h2h-primary hover:underline"
            >
              Voir le point sur la carte <ExternalLink className="size-3" />
            </a>
            <span className="block text-legende tabular-nums text-muted-foreground">zone de rendez-vous : {h.rayon_m} m</span>
          </Champ>
          <Champ titre="Où se présenter">
            « {h.detail_affiche ?? "—"} »
            <span className="block text-legende text-muted-foreground">Repère : {h.repere ?? "—"}</span>
          </Champ>
          <Champ titre="Validation de l’épingle">
            {f.validation ? (
              <>
                <span className="tabular-nums">le {dateHeure(f.validation.le)}</span>
                <span className="block text-legende text-muted-foreground">{f.validation.par ?? "à la mise en place de l’annuaire"}</span>
              </>
            ) : (
              "Jamais validée : personne n’a encore regardé cette épingle"
            )}
          </Champ>
          <Champ titre="Ce qui y passe">
            {pluriel(h.trajets, "trajet")}
            <span className="block text-legende text-muted-foreground">{h.rendez_vous_en_cours} rendez-vous à tenir</span>
            <span className="block text-legende text-muted-foreground">
              {pluriel(h.propositions_en_cours, "proposition")} en cours
            </span>
          </Champ>
        </dl>

        {enCours && (
          <div className="grid gap-0.5 rounded-lg border border-h2h-error/30 bg-h2h-error/5 p-3 text-corps">
            <span className="font-semibold text-h2h-error">
              {h.etat === "ecarte" ? "Épingle écartée" : "Point fermé aux nouvelles recherches"} depuis le {dateHeure(enCours.le)}
            </span>
            <span>
              <span className="text-muted-foreground">Motif (interne) : </span>« {enCours.motif} »
              {enCours.par ? <span className="text-muted-foreground"> — {enCours.par}</span> : null}
            </span>
          </div>
        )}
        {h.etat === "ferme" && !enCours && (
          <p className="text-corps text-muted-foreground">Ce point est fermé, sans motif enregistré.</p>
        )}
        {h.etat === "ferme" && h.rendez_vous_en_cours > 0 && (
          <div className="rounded-lg border border-[#B45309]/30 bg-[#B45309]/5 p-3 text-corps">
            <span className="font-semibold text-[#B45309]">
              {h.rendez_vous_en_cours > 1
                ? `${h.rendez_vous_en_cours} rendez-vous confirmés restent à tenir à ce point fermé.`
                : "Un rendez-vous confirmé reste à tenir à ce point fermé."}
            </span>{" "}
            Fermer le point ne les déplace pas et ne les annule pas : les conditions d’une co-livraison confirmée ne
            changent pas. Si le lieu ne peut plus servir, ses participants doivent en être prévenus — ouvrez chaque
            co-livraison ci-dessous.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 border-t pt-3">
          {f.possibles.valider.possible && <GesteValidationHub hub={h.id} repere={h.repere} detail={h.detail_affiche} />}
          {f.possibles.corriger.possible && <GesteCorrectionHub hub={h} />}
          {f.possibles.fermer.possible && (
            <GesteFermetureHub
              hub={h.id}
              publie={h.etat === "actif"}
              trajets={h.trajets}
              rendezVous={h.rendez_vous_en_cours}
              propositions={h.propositions_en_cours}
            />
          )}
          {f.possibles.rouvrir.possible && <GesteReouvertureHub hub={h.id} dejaPublie={h.etat === "ferme"} />}
          {aucunGeste && raisons.map((r) => (
            <span key={r} className="text-legende text-muted-foreground">
              {r}
            </span>
          ))}
          {/* Un point occupé ne se corrige pas : la raison se dit, à côté de ce qui reste possible. */}
          {!aucunGeste && !f.possibles.corriger.possible && f.possibles.corriger.raison && (
            <p className="w-full text-legende text-muted-foreground">
              <span className="font-semibold text-foreground">Corriger : </span>
              {f.possibles.corriger.raison}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section titre="Rendez-vous à tenir à ce point">
          {f.rendez_vous.length === 0 ? (
            <Aucun>Aucun rendez-vous confirmé n’attend à ce point.</Aucun>
          ) : (
            <ul className="grid gap-1.5 text-corps">
              {f.rendez_vous.map((r) => (
                <li key={`${r.mission}-${r.role}`} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {r.ref ? (
                    <Link href={cheminFiche(r.ref, "livraison")} className="font-medium tabular-nums text-h2h-primary hover:underline">
                      {r.ref}
                    </Link>
                  ) : (
                    <span className="font-medium">Co-livraison sans commande</span>
                  )}
                  <span>{ROLE[r.role]}</span>
                  <span className="tabular-nums text-muted-foreground">{r.quand ? `le ${dateHeure(r.quand)}` : "heure non fixée"}</span>
                  <StatutPastille ton={TON_MOMENT[r.moment]}>{LIBELLE_MOMENT[r.moment]}</StatutPastille>
                  {r.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                </li>
              ))}
            </ul>
          )}
          <p className="text-legende text-muted-foreground">
            Fermer un point ne déplace aucun de ces rendez-vous, et un point ne se corrige pas tant qu’il en reste un.
          </p>
        </Section>

        <Section titre="Propositions en cours">
          {f.propositions.length === 0 ? (
            <Aucun>Aucune recherche en cours ne propose ce point.</Aucun>
          ) : (
            <ul className="grid gap-1.5 text-corps">
              {f.propositions.map((p) => (
                <li key={`${p.candidature}-${p.role}`} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {p.ref ? (
                    <Link href={cheminFiche(p.ref, "livraison")} className="font-medium tabular-nums text-h2h-primary hover:underline">
                      {p.ref}
                    </Link>
                  ) : (
                    <span className="font-medium">Recherche sans commande</span>
                  )}
                  <span>{ROLE[p.role]}</span>
                  <span className="text-muted-foreground">{LIBELLE_STATUT_CANDIDATURE[p.reponse] ?? p.reponse}</span>
                  <span className="text-legende text-muted-foreground">{LIBELLE_STATUT_RECHERCHE[p.etape] ?? p.etape}</span>
                  {p.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                </li>
              ))}
            </ul>
          )}
          <p className="text-legende text-muted-foreground">
            Une proposition en cours peut encore confirmer un rendez-vous à ce point, même fermé : fermer n’arrête que
            les nouvelles recherches.
          </p>
        </Section>

        <Section titre="Trajets qui y passent">
          {f.trajets.length === 0 ? (
            <Aucun>Aucun trajet en cours ne passe par ce point.</Aucun>
          ) : (
            <ul className="grid gap-1.5 text-corps">
              {f.trajets.map((t) => (
                <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Link href={cheminTrajet(t.id)} className="font-medium text-h2h-primary hover:underline">
                    {t.ville_depart} → {t.ville_arrivee}
                  </Link>
                  <span>{ROLE[t.role]}</span>
                  <span className="text-muted-foreground">{t.cotransporteur ?? SANS_PSEUDONYME}</span>
                  <StatutPastille ton={TON_SITUATION[t.situation]}>{LIBELLE_SITUATION[t.situation]}</StatutPastille>
                  {t.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                  <span className="text-legende tabular-nums text-muted-foreground">
                    {t.prochain_passage ? `prochain passage le ${dateHeure(t.prochain_passage)}` : "aucun passage à venir"}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {f.trajets.length >= 50 && <p className="text-legende text-muted-foreground">Les 50 premiers sont affichés.</p>}
        </Section>

        <Section titre="Points voisins">
          {f.voisins.length === 0 ? (
            <Aucun>Aucun autre point à moins de 150 mètres.</Aucun>
          ) : (
            <>
              <ul className="grid gap-1.5 text-corps">
                {f.voisins.map((v) => (
                  <li key={v.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Link href={cheminHub(v.id)} className="font-medium text-h2h-primary hover:underline">
                      {v.nom}
                    </Link>
                    <span className="tabular-nums text-muted-foreground">à {Math.round(v.distance_m)} m</span>
                    <StatutPastille ton={TON_ETAT_HUB[v.etat]}>{LIBELLE_ETAT_HUB[v.etat]}</StatutPastille>
                  </li>
                ))}
              </ul>
              <p className="text-legende text-muted-foreground">
                À moins de 150 mètres : vérifiez qu’il ne s’agit pas du même lieu, posé deux fois.
              </p>
            </>
          )}
        </Section>

        <Section titre="Signalements" className="lg:col-span-2">
          {f.signalements.length === 0 ? (
            <Aucun>Aucun signalement de ce point.</Aucun>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-corps">
                  {h.signalements_a_examiner > 0
                    ? `${pluriel(h.signalements_a_examiner, "signalement")} à examiner`
                    : "Tous les signalements sont examinés."}
                  {f.dossiers.map((d) => (
                    <span key={d.id}>
                      {" · "}
                      <Link href={`/a-traiter?dossier=${d.id}`} className="font-semibold tabular-nums text-h2h-primary hover:underline">
                        {d.reference}
                      </Link>
                      {d.est_test ? " (test)" : ""}
                    </span>
                  ))}
                </p>
                {/* ⚠️ L'ÉCRAN MONTRE CE QUE LA BASE PERMET : le geste, ou la raison de ne pas pouvoir — son rôle, ou
                    parce qu'il n'attend que son propre signalement. */}
                {h.signalements_a_examiner > 0 &&
                  (!f.possibles.examiner.possible ? (
                    <span className="text-legende text-muted-foreground">{f.possibles.examiner.raison}</span>
                  ) : aExaminer.length > 0 ? (
                    <GesteExamenSignalementsHub hub={h.id} ouverts={aExaminer} />
                  ) : null)}
              </div>
              <ul className="grid gap-2">
                {f.signalements.map((s) => (
                  <li key={s.id} className="grid gap-0.5 rounded-lg border p-3 text-corps">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <StatutPastille ton="attention">{LIBELLE_RAISON_SIGNALEMENT_HUB[s.raison] ?? s.raison}</StatutPastille>
                      {s.examen ? (
                        <StatutPastille ton="muet">{LIBELLE_ISSUE_HUB[s.examen.issue]}</StatutPastille>
                      ) : (
                        <StatutPastille ton="actif">À examiner</StatutPastille>
                      )}
                      {s.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                      {s.le_votre && <StatutPastille ton="neutre">Le vôtre</StatutPastille>}
                      <span className="text-legende tabular-nums text-muted-foreground">
                        le {dateHeure(s.signale_le)} · {s.signale_par ?? SANS_PSEUDONYME}
                        {s.pieces > 0 ? ` · ${pluriel(s.pieces, "pièce")} jointe${s.pieces > 1 ? "s" : ""}` : ""}
                      </span>
                      {s.colivraison && (
                        <Link href={cheminFiche(s.colivraison, "livraison")} className="text-legende font-medium tabular-nums text-h2h-primary hover:underline">
                          {s.colivraison}
                        </Link>
                      )}
                    </span>
                    {s.explication && <span>« {s.explication} »</span>}
                    {s.nom_alors && s.nom_alors !== h.nom && (
                      <span className="text-legende text-muted-foreground">Le point s’appelait alors « {s.nom_alors} ».</span>
                    )}
                    {s.examen && (
                      <div className="mt-1 grid gap-0.5 border-t pt-2 text-legende">
                        <span className="text-muted-foreground">
                          Examiné le {dateHeure(s.examen.le)}
                          {s.examen.par ? ` par ${s.examen.par}` : ""}
                        </span>
                        <span>
                          <span className="text-muted-foreground">Réponse envoyée : </span>« {s.examen.reponse} »
                        </span>
                        <span className="text-muted-foreground">Motif interne : {s.examen.motif}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="text-legende text-muted-foreground">
            Un signalement ne ferme rien de lui-même, et son examen non plus : fermer ou corriger le point reste un geste à
            part. La personne qui a signalé reçoit la réponse de l’équipe dans l’application du cotransporteur.
            {f.signalements.length >= 50 ? " Les 50 premiers sont affichés : ceux qui attendent, puis les plus récents." : ""}
          </p>
        </Section>

        <Section titre="Fermetures" className="lg:col-span-2">
          {f.fermetures.length === 0 ? (
            <Aucun>Ce point n’a jamais été fermé ni écarté.</Aucun>
          ) : (
            <ul className="grid gap-2">
              {f.fermetures.map((x) => (
                <li key={x.le} className="grid gap-0.5 rounded-lg border p-3 text-corps">
                  <span className="text-legende tabular-nums text-muted-foreground">
                    fermé le {dateHeure(x.le)}
                    {x.par ? ` · ${x.par}` : ""}
                  </span>
                  <span>
                    <span className="text-muted-foreground">Motif : </span>« {x.motif} »
                  </span>
                  <span className="text-legende text-muted-foreground">
                    {x.leve_le
                      ? `Rouvert le ${dateHeure(x.leve_le)}${x.leve_par ? ` · ${x.leve_par}` : ""} — ${x.motif_levee ?? "sans motif"}`
                      : "Toujours en cours"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section titre="Corrections" className="lg:col-span-2">
          {f.corrections.length === 0 ? (
            <Aucun>Ce point n’a pas été corrigé depuis le back-office.</Aucun>
          ) : (
            <ul className="grid gap-2">
              {f.corrections.map((c) => (
                <li key={c.le} className="grid gap-0.5 rounded-lg border p-3 text-corps">
                  <span className="text-legende tabular-nums text-muted-foreground">
                    corrigé le {dateHeure(c.le)}
                    {c.par ? ` · ${c.par}` : ""}
                    {c.deplace_de_m !== null ? ` · épingle déplacée de ${Math.round(c.deplace_de_m)} m` : ""}
                  </span>
                  <ul className="grid gap-0.5">
                    {Object.keys(c.apres ?? {}).map((k) => (
                      <li key={k}>
                        <span className="text-muted-foreground">{LIBELLE_CHAMP_HUB[k] ?? k} : </span>
                        {valeurCorrigee(k, c.avant?.[k])} → <span className="font-medium">{valeurCorrigee(k, c.apres?.[k])}</span>
                      </li>
                    ))}
                  </ul>
                  <span>
                    <span className="text-muted-foreground">Motif : </span>« {c.motif} »
                  </span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-legende text-muted-foreground">
            Un point ne se corrige pas tant qu’un rendez-vous y est confirmé ou qu’une proposition en cours peut y
            aboutir : aucune de ces corrections n’a déplacé un rendez-vous. Un rendez-vous dont l’heure est passée
            depuis plus de sept jours n’a pas été tenu : il n’empêche plus de corriger.
            {f.corrections.length >= 50 ? " Les 50 plus récentes sont affichées." : ""}
          </p>
        </Section>
      </div>
    </div>
  );
}

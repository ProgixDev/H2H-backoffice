import Link from "next/link";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Aucun, Bloc, Champs, Paires, Tableau, ouiNon } from "@/components/operations/commun";
import { ecartAuRendezVous } from "@/components/operations/onglets/SuiviColivraison";
import { BoutonPiece, CadreConsultations } from "@/components/operations/sensibles";
import { dateHeure } from "@/lib/dates";
import {
  LIBELLE_ATTENTE_INCIDENT,
  LIBELLE_ISSUE_DECLARATION,
  LIBELLE_ISSUE_INCIDENT,
  LIBELLE_PARTIE_PROTOCOLE,
  LIBELLE_ROLE_INCIDENT,
  cheminIncident,
  type DecisionIncident,
  type FicheIncident,
  type Incident,
  type RoleIncident,
  type ValidationIncident,
} from "@/lib/logistique/types";
import { LIBELLE_DETENTEUR, LIBELLE_ETAT_COLIS, LIBELLE_MISSION, LIBELLE_PARTIE_HUB } from "@/lib/operations/libelles";
import { cheminFiche } from "@/lib/operations/types";
import { euros } from "@/lib/paiements/types";
import { GestePreparerDecision, GesteSecondeCle } from "./GestesIncident";
import { TON_SITUATION_INCIDENT, personneDite, piecesDites } from "./ListeIncidents";

function Question({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="grid content-start gap-1 rounded-xl border bg-card p-3">
      <h3 className="text-legende font-semibold text-muted-foreground">{titre}</h3>
      <div className="grid gap-1 text-corps">{children}</div>
    </section>
  );
}

const SANS_PSEUDONYME = "sans pseudonyme";

/** « 12 min », « 3 h 05 », « 4 j 2 h » : une durée en minutes, lisible. */
export function dureeDite(minutes: number): string {
  const m = Math.abs(Math.trunc(minutes));
  if (m < 60) return `${m} min`;
  if (m < 24 * 60) return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
  const h = Math.floor((m % (24 * 60)) / 60);
  return `${Math.floor(m / (24 * 60))} j${h ? ` ${h} h` : ""}`;
}

/**
 * Ce qui est attendu, et de qui (R1.7) — dit d'après ce que la base rend, sans
 * rien promettre que le back-office ne sache faire.
 *
 * ⚠️ UN INCIDENT SE DÉCIDE À DEUX CLÉS, depuis cette fiche : l'un prépare, un
 * autre valide. Le refus du colis d'une co-livraison du § 5, lui, s'examine dans
 * l'onglet Livraison de sa commande.
 */
export function actionAttendue(f: FicheIncident): string {
  const i = f.incident;
  const refusExaminable = f.refus_colis !== null;
  switch (i.situation) {
    case "contestable":
      return "La personne visée peut contester depuis son application. Sans contestation, la plateforme clôt la déclaration à l’échéance.";
    case "conteste":
      return refusExaminable
        ? "L’équipe examine la contestation : dans l’onglet Livraison de la commande."
        : "L’équipe examine la contestation, puis prépare une décision — qu’un autre membre de l’équipe valide.";
    case "a_examiner":
      return "L’équipe analyse l’incident, puis prépare une décision — qu’un autre membre de l’équipe valide.";
    case "en_validation":
      return "Une décision est préparée : un autre membre de la Logistique ou de la Direction la valide, ou la refuse.";
    case "en_cloture":
      return refusExaminable
        ? "La plateforme annule la co-livraison, dans la minute."
        : "La plateforme clôt la déclaration : le délai de contestation est passé sans contestation.";
    default:
      return f.decision
        ? "Aucune : la décision de l’équipe est rendue, et notifiée aux trois participants."
        : "Aucune : l’incident est clos.";
  }
}

/** Ce qui a été exécuté, en une phrase — jamais ce que le protocole prévoit. */
export function executionDite(f: FicheIncident): string {
  const e = f.execution;
  if (e.frais) {
    const qui = LIBELLE_ROLE_INCIDENT[e.frais.role as RoleIncident] ?? e.frais.role;
    return `Des frais de ${euros(e.frais.frais_cents)} ont été appliqués — ${qui} —, le ${dateHeure(e.frais.le)}.`;
  }
  // ⚠️ UNE DÉCISION DE L'ÉQUIPE N'EXÉCUTE RIEN : elle dit qui avait raison, et l'écran ne laisse pas croire davantage.
  if (e.issue && e.issue in LIBELLE_ISSUE_INCIDENT) {
    return `Issue enregistrée : ${LIBELLE_ISSUE_DECLARATION[e.issue]}. Cette décision n’a exécuté ni remboursement, ni frais, ni versement.`;
  }
  if (e.issue) return `Issue enregistrée : ${LIBELLE_ISSUE_DECLARATION[e.issue] ?? e.issue}.`;
  if (e.reglements > 0) return `${e.reglements} règlement${e.reglements > 1 ? "s" : ""} enregistré${e.reglements > 1 ? "s" : ""}.`;
  return "Rien n’a été exécuté : ni remboursement, ni frais, ni versement ne vient de cet incident.";
}


const NATURE: Record<string, string> = {
  refund: "Remboursement",
  pay: "Versement",
  fee: "Frais",
  kept: "Conservé",
  unpaid: "Non versé",
};

const GENRE: Record<FicheIncident["autres"][number]["genre"], string> = {
  incident: "Incident",
  contestation: "Contestation",
  annulation: "Annulation",
  commun: "Bloc commun",
};

function Pieces({ nombre, piece, libelle }: { nombre: number; piece: string; libelle: string }) {
  if (nombre === 0) return <>aucune</>;
  return (
    <span className="flex flex-wrap items-center gap-2">
      {piecesDites(nombre)}
      {Array.from({ length: nombre }, (_, n) => (
        <BoutonPiece key={n} nature="piece_incident" piece={piece} rang={n + 1} libelle={`${libelle} — pièce ${n + 1}`} />
      ))}
    </span>
  );
}

function Participants({ i }: { i: Incident }) {
  return (
    <>
      <span className="block">Déclaré par : {personneDite(i.declarant_role, i.declarant)}</span>
      <span className="block">
        {i.partie_visee_role ? `Vise : ${personneDite(i.partie_visee_role, i.partie_visee)}` : "Ne vise personne : c’est un blocage."}
      </span>
    </>
  );
}

const imputeA = (roles: RoleIncident[]) =>
  roles.length === 0 ? "Personne" : roles.map((r) => LIBELLE_ROLE_INCIDENT[r]).join(" · ");

/** La décision rendue : son issue, à qui elle est imputée, ses deux clés, et la réponse que les participants ont reçue. */
function DecisionRendue({ d }: { d: DecisionIncident }) {
  return (
    <>
      <Champs
        colonnes={4}
        items={[
          ["Décision", LIBELLE_ISSUE_INCIDENT[d.issue] ?? d.issue],
          ["Imputée à", imputeA(d.responsables)],
          ["Préparée par", d.prepare_par ?? "—"],
          ["Validée par", d.valide_par ?? "—"],
          ["Rendue le", <span key="l" className="tabular-nums">{dateHeure(d.le)}</span>],
        ]}
      />
      <blockquote className="border-l-2 pl-3 text-corps whitespace-pre-line">
        <span className="block text-legende text-muted-foreground">Réponse envoyée aux trois participants</span>
        {d.reponse}
      </blockquote>
      <p className="text-corps">
        <span className="text-legende text-muted-foreground">Motif interne — </span>
        {d.motif}
      </p>
      <p className="text-legende text-muted-foreground">
        Une décision ne se réécrit pas. Elle n’a déplacé aucun argent : ce qui a été exécuté se lit plus bas.
      </p>
    </>
  );
}

/** La décision préparée, qui attend sa seconde clé : ce que la seconde personne relit avant de valider. */
function DecisionPreparee({ v }: { v: ValidationIncident }) {
  return (
    <>
      <Champs
        colonnes={4}
        items={[
          ["Décision proposée", LIBELLE_ISSUE_INCIDENT[v.issue] ?? v.issue],
          ["Imputée à", imputeA(v.responsables)],
          ["Préparée par", v.demandeur ?? "—"],
          ["Préparée le", <span key="d" className="tabular-nums">{dateHeure(v.demande_le)}</span>],
          ["À valider avant le", <span key="e" className="tabular-nums">{dateHeure(v.expire_le)}</span>],
        ]}
      />
      <blockquote className="border-l-2 pl-3 text-corps whitespace-pre-line">
        <span className="block text-legende text-muted-foreground">
          Réponse qui sera envoyée aux trois participants, à la validation
        </span>
        {v.reponse}
      </blockquote>
      <p className="text-corps">
        <span className="text-legende text-muted-foreground">Motif interne — </span>
        {v.motif}
      </p>
      {v.peut_valider ? (
        <GesteSecondeCle validation={v.id} />
      ) : (
        <p className="text-legende text-muted-foreground">
          {v.la_votre
            ? "Vous avez préparé cette décision : un autre membre de la Logistique ou de la Direction la valide."
            : "Votre rôle ne permet pas de valider cette décision : la Logistique ou la Direction la valide."}
        </p>
      )}
      <p className="text-legende text-muted-foreground">
        Passé cette échéance sans validation, la demande ne compte plus : l’incident attend de nouveau sa décision.
      </p>
    </>
  );
}

/**
 * La fiche d'un incident (§ 12.5) : les quatre questions ; la déclaration et ses
 * pièces ; les tolérances, prolongations, délais de déclaration et de
 * contestation propres au cas ; les présences déclarées à ce rendez-vous ; la
 * contestation ; la co-livraison ; ce que le protocole prévoit — et, à part, ce
 * qui a été exécuté ; ce que l'incident retient des versements ; ses dossiers
 * « À traiter » ; les autres déclarations de la co-livraison.
 *
 * ⚠️ LA BASE DÉCIDE : où en est l'incident, qui il attend, si l'appelant peut en
 * ouvrir les pièces, préparer une décision — et à qui un blocage s'impute —, ou
 * donner la seconde clé. L'écran ne montre que les gestes qu'elle dit possibles.
 * 🔴 NI POSITION, NI CHEMIN D'UNE PIÈCE (R4.15).
 */
export function FicheIncidentVue({ f }: { f: FicheIncident }) {
  const i = f.incident;
  const d = f.delais;
  const c = f.colivraison;
  const dossierOuvert = f.dossiers.find((x) => x.ouvert);

  return (
    <CadreConsultations objet={i.commande ?? ""} peutReveler={f.pieces_ouvrables && i.commande !== null}>
      <div className="grid gap-6">
        <div className="grid gap-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-h3 font-semibold">
              <span className="tabular-nums">Formulaire {i.numero}</span> · {i.nom}
            </h2>
            <StatutPastille ton={TON_SITUATION_INCIDENT[i.situation]}>{i.situation_libelle}</StatutPastille>
            {i.alerte === "cloture_en_retard" && (
              <StatutPastille ton="erreur">La plateforme n’a pas clos : plus d’un quart d’heure</StatutPastille>
            )}
            {i.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
          </div>
          <p className="text-corps text-muted-foreground">
            « {i.libelle} » — c’est le nom que les participants lisent sur le formulaire.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Question titre="Que se passe-t-il ?">
              <span>
                {LIBELLE_ROLE_INCIDENT[i.declarant_role]} : « {i.libelle} », au rendez-vous de {i.etape === "collecte" ? "collecte" : "remise"}{" "}
                du {dateHeure(i.rendez_vous)}.
              </span>
              <span className="text-muted-foreground">
                {i.retient_les_fonds ? "Il retient les versements de la commande." : "Il ne retient aucun versement."}
              </span>
            </Question>
            <Question titre="Qui est concerné ?">
              <Participants i={i} />
              {i.ref && (
                <Link href={cheminFiche(i.ref, "litiges")} className="w-fit font-medium tabular-nums text-h2h-primary hover:underline">
                  Commande {i.ref}
                </Link>
              )}
            </Question>
            <Question titre="Quelle action est attendue ?">
              <span>{actionAttendue(f)}</span>
              {i.attend && <span className="text-muted-foreground">Attendu de : {LIBELLE_ATTENTE_INCIDENT[i.attend]}</span>}
              {dossierOuvert && (
                <Link href={`/a-traiter?dossier=${dossierOuvert.id}`} className="w-fit font-medium tabular-nums text-h2h-primary hover:underline">
                  Dossier {dossierOuvert.reference}
                </Link>
              )}
              {f.refus_colis && i.ref && (
                <Link href={cheminFiche(i.ref, "livraison")} className="w-fit font-medium text-h2h-primary hover:underline">
                  {f.refus_colis.examinable ? "Examiner la contestation dans l’onglet Livraison" : "Voir le refus dans l’onglet Livraison"}
                </Link>
              )}
            </Question>
            <Question titre="Avant quelle échéance ?">
              {i.echeance ? (
                <span className="tabular-nums">Contestation possible jusqu’au {dateHeure(i.echeance)}</span>
              ) : (
                <span>Aucune échéance ne court pour un participant.</span>
              )}
            </Question>
          </div>
        </div>

        <Bloc
          titre="La décision de l’équipe"
          aside={
            f.decision ? (
              <StatutPastille ton="neutre">{LIBELLE_ISSUE_INCIDENT[f.decision.issue] ?? f.decision.issue}</StatutPastille>
            ) : f.validation ? (
              <StatutPastille ton="attention">Préparée, à valider</StatutPastille>
            ) : undefined
          }
        >
          {f.decision ? (
            <DecisionRendue d={f.decision} />
          ) : f.validation ? (
            <DecisionPreparee v={f.validation} />
          ) : f.possibles.decider.possible ? (
            <>
              <p className="text-corps">
                Aucune décision n’est préparée. Elle se prend à deux : vous la préparez, un autre membre de la Logistique
                ou de la Direction la valide.
              </p>
              <GestePreparerDecision incident={i.id} libelle={i.libelle} imputables={f.possibles.decider.imputables} />
            </>
          ) : (
            <Aucun>{f.possibles.decider.raison ?? "Aucune décision ne se prépare sur cet incident."}</Aucun>
          )}
        </Bloc>

        <Bloc titre="La déclaration">
          <Champs
            colonnes={4}
            items={[
              ["Déclaré par", personneDite(i.declarant_role, i.declarant)],
              ["Déclaré le", <span key="d" className="tabular-nums">{dateHeure(i.declare_le)}</span>],
              ["Rendez-vous", `${i.etape === "collecte" ? "Collecte" : "Remise"} · ${dateHeure(i.rendez_vous)}`],
              ["Point de rendez-vous", [i.hub, i.ville].filter(Boolean).join(" · ") || null],
              ["Exactitude confirmée", ouiNon(f.declaration.exactitude_confirmee)],
              ["Pièces jointes", <Pieces key="p" nombre={i.pieces} piece={i.id} libelle={i.nom} />],
            ]}
          />
          {f.declaration.motif && <p className="text-corps">{f.declaration.motif}</p>}
          {f.declaration.commentaire && <p className="whitespace-pre-line text-corps text-muted-foreground">{f.declaration.commentaire}</p>}
          {f.declaration.reponses && Object.keys(f.declaration.reponses).length > 0 && (
            <div className="text-corps">
              <span className="text-legende text-muted-foreground">Réponses au formulaire</span>
              <Paires objet={f.declaration.reponses} />
            </div>
          )}
          {i.pieces > 0 && !f.pieces_ouvrables && (
            <p className="text-legende text-muted-foreground">
              Votre rôle ne permet pas d’ouvrir les pièces des utilisateurs.
            </p>
          )}
        </Bloc>

        <Bloc titre="Les délais de ce cas">
          <Champs
            colonnes={4}
            items={[
              ["Tolérance", d.tolerance_minutes === null ? null : `${d.tolerance_minutes} min avant et après l’heure du rendez-vous`],
              [
                "Déclarable à partir du",
                d.attente_exigee ? (
                  <span key="a" className="tabular-nums">{dateHeure(d.declarable_des)}</span>
                ) : (
                  "Pendant le créneau : ce formulaire n’attend pas la fin de la tolérance"
                ),
              ],
              [
                "Déclaré",
                d.declaree_apres_minutes >= 0
                  ? `${dureeDite(d.declaree_apres_minutes)} après l’heure du rendez-vous`
                  : `${dureeDite(d.declaree_apres_minutes)} avant l’heure du rendez-vous`,
              ],
              [
                "Délai de déclaration",
                d.declaration_minutes === null ? (
                  "Aucun pour ce formulaire"
                ) : (
                  <span key="s" className="grid gap-1">
                    <span className="tabular-nums">
                      {d.declaration_minutes} min après la tolérance : jusqu’au {dateHeure(d.declaration_jusqu_au)}
                    </span>
                    {d.declaree_dans_le_delai ? (
                      <StatutPastille ton="neutre">Déclaré dans ce délai</StatutPastille>
                    ) : (
                      <StatutPastille ton="attention">Déclaré hors de ce délai</StatutPastille>
                    )}
                  </span>
                ),
              ],
              [
                "Délai de contestation",
                d.contestation_heures === null ? (
                  "Aucun : personne ne peut contester cette déclaration"
                ) : (
                  <span key="c" className="tabular-nums">
                    {d.contestation_heures} h à compter de la notification : jusqu’au {dateHeure(d.contestable_jusqu_au)}
                  </span>
                ),
              ],
              ["Prolongations", "Aucune n’est enregistrée : les applications ne les transmettent pas."],
            ]}
          />
          {d.declaration_minutes !== null && (
            <p className="text-legende text-muted-foreground">
              Les formulaires 6 et 13 suivent les mêmes règles de délai. Le serveur accepte une déclaration hors de ce
              délai : c’est à l’examen d’en tenir compte.
            </p>
          )}
          {d.regle && (
            <blockquote className="border-l-2 pl-3 text-corps">
              <span className="block text-legende text-muted-foreground">
                Règle {d.regle.code} — {d.regle.titre}
              </span>
              {d.regle.texte}
            </blockquote>
          )}
        </Bloc>

        <Bloc titre={`Les présences déclarées à ce rendez-vous de ${i.etape === "collecte" ? "collecte" : "remise"}`}>
          {f.presences.length === 0 ? (
            <Aucun>Aucune présence déclarée à ce rendez-vous (« Je suis au hub »).</Aucun>
          ) : (
            <Tableau entetes={["Qui", "Déclarée le", "Par rapport au rendez-vous", "Dans la zone"]} largeur={600}>
              {f.presences.map((p, n) => (
                <tr key={n}>
                  <td>
                    {LIBELLE_PARTIE_HUB[p.partie]} · {p.pseudo ?? SANS_PSEUDONYME}
                  </td>
                  <td className="tabular-nums">
                    {dateHeure(p.declaree_le)}
                    {p.tentatives > 1 && <span className="text-muted-foreground"> · {p.tentatives} essais</span>}
                  </td>
                  <td>{ecartAuRendezVous(p.retard_minutes) ?? "—"}</td>
                  <td>
                    {p.validee_le ? (
                      <StatutPastille ton="succes">Validée</StatutPastille>
                    ) : (
                      <StatutPastille ton="attention">Hors de la zone : non validée</StatutPastille>
                    )}
                  </td>
                </tr>
              ))}
            </Tableau>
          )}
          <p className="text-legende text-muted-foreground">
            Une présence déclarée hors de la zone est enregistrée, pas validée : elle prouve une heure, pas un lieu.
          </p>
        </Bloc>

        <Bloc titre={f.contestations.length > 1 ? "Les contestations" : "La contestation"}>
          {f.contestations.length === 0 ? (
            <Aucun>
              {d.contestation_heures === null
                ? "Cette déclaration ne se conteste pas."
                : i.situation === "contestable"
                  ? "Pas encore contestée : le délai court."
                  : "Aucune contestation n’a été déposée dans le délai."}
            </Aucun>
          ) : (
            <ul className="grid gap-3">
              {f.contestations.map((k) => (
                <li key={k.id} className="grid gap-2 rounded-lg border p-3">
                  <span className="font-medium">
                    {k.numero ? `Formulaire ${k.numero} · ` : ""}
                    {k.libelle}
                  </span>
                  <Champs
                    colonnes={3}
                    items={[
                      ["Déposée par", personneDite(k.role, k.par)],
                      ["Déposée le", <span key="d" className="tabular-nums">{dateHeure(k.declaree_le)}</span>],
                      ["Pièces jointes", <Pieces key="p" nombre={k.pieces} piece={k.id} libelle="Contestation" />],
                    ]}
                  />
                  {k.motif && <p className="text-corps">{k.motif}</p>}
                  {k.commentaire && <p className="whitespace-pre-line text-corps text-muted-foreground">{k.commentaire}</p>}
                  {k.reponses && Object.keys(k.reponses).length > 0 && (
                    <div className="text-corps">
                      <span className="text-legende text-muted-foreground">Réponses au formulaire</span>
                      <Paires objet={k.reponses} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Bloc>

        <Bloc titre="La co-livraison">
          {c ? (
            <>
              <Champs
                colonnes={4}
                items={[
                  ["Parcours", c.par_recherche ? "Mise en relation du § 5" : "Ancien parcours"],
                  ["État de la co-livraison", LIBELLE_MISSION[c.statut as keyof typeof LIBELLE_MISSION] ?? c.statut],
                  ["État du colis", c.etat_colis ? (LIBELLE_ETAT_COLIS[c.etat_colis as keyof typeof LIBELLE_ETAT_COLIS] ?? c.etat_colis) : null],
                  ["Colis détenu par", c.detenteur ? LIBELLE_DETENTEUR[c.detenteur] : null],
                  ["Vendeur", c.vendeur ?? SANS_PSEUDONYME],
                  ["Acheteur", c.acheteur ?? SANS_PSEUDONYME],
                  ["Cotransporteur particulier", c.cotransporteur ?? SANS_PSEUDONYME],
                  ["Bien", i.bien_titre],
                  ["Collecte", `${c.hub_collecte ?? "—"} · prévue le ${dateHeure(c.collecte_prevue)}`],
                  ["Collecte validée le", c.collecte_validee_le ? dateHeure(c.collecte_validee_le) : "Non validée"],
                  ["Remise", `${c.hub_remise ?? "—"} · prévue le ${dateHeure(c.remise_prevue)}`],
                  ["Remise validée le", c.remise_validee_le ? dateHeure(c.remise_validee_le) : "Non validée"],
                ]}
              />
              {i.ref && (
                <Link href={cheminFiche(i.ref, "livraison")} className="w-fit text-legende font-semibold text-h2h-primary hover:underline">
                  Scans, autres présences et demandes hors point de rendez-vous : l’onglet Livraison de la commande
                </Link>
              )}
            </>
          ) : (
            <Aucun>La co-livraison de cette déclaration n’existe plus.</Aucun>
          )}
        </Bloc>

        <Bloc titre="Ce que le protocole prévoit" aside={<StatutPastille ton="neutre">Prévu, pas exécuté</StatutPastille>}>
          {f.protocole ? (
            <>
              <p className="text-corps font-medium">{f.protocole.titre}</p>
              <Tableau entetes={["Pour qui", "Quoi", "Ce que le protocole en dit", "Montant"]} largeur={640}>
                {f.protocole.lignes.map((l, n) => (
                  <tr key={n}>
                    <td>{LIBELLE_PARTIE_PROTOCOLE[l.partie]}</td>
                    <td>{NATURE[l.nature] ?? l.nature}</td>
                    <td>{l.libelle}</td>
                    <td className="tabular-nums">{l.montant_cents === null ? "—" : euros(l.montant_cents)}</td>
                  </tr>
                ))}
              </Tableau>
              {f.protocole.note && <p className="text-legende text-muted-foreground">{f.protocole.note}</p>}
            </>
          ) : (
            <Aucun>
              {f.refus_colis
                ? "Les frais d’un refus du colis se lisent avec son examen, dans l’onglet Livraison de la commande."
                : "Le protocole ne prévoit aucun règlement type pour ce formulaire."}
            </Aucun>
          )}
          <div className="grid gap-1 border-t pt-3">
            <span className="text-legende font-semibold text-muted-foreground">Ce qui a été exécuté</span>
            <p className="text-corps">{executionDite(f)}</p>
          </div>
        </Bloc>

        <Bloc
          titre="Ce que l’incident retient des versements"
          aside={f.retenues.length > 0 ? <StatutPastille ton="attention">Fonds retenus</StatutPastille> : undefined}
        >
          {f.retenues.length === 0 ? (
            <Aucun>Il ne retient aucun versement.</Aucun>
          ) : (
            <>
              <ul className="grid gap-1 text-corps">
                {f.retenues.map((r, n) => (
                  <li key={n}>
                    {r.de_la_contestation ? "Sa contestation — " : ""}
                    {r.libelle} — retient tous les versements de la commande, depuis le{" "}
                    <span className="tabular-nums">{dateHeure(r.depuis)}</span>.
                  </li>
                ))}
              </ul>
              <p className="text-legende text-muted-foreground">
                Les montants se lisent dans l’onglet Paiements de la commande. Une retenue tombe quand la déclaration qui
                la cause est close.
              </p>
            </>
          )}
        </Bloc>

        <div className="grid gap-6 lg:grid-cols-2">
          <Bloc titre="Dossiers « À traiter »">
            {f.dossiers.length === 0 ? (
              <Aucun>
                {i.attend === "equipe"
                  ? "Son dossier s’ouvre dans la minute : « À traiter » se met à jour par la plateforme."
                  : "Aucun dossier : cet incident n’attend pas l’équipe."}
              </Aucun>
            ) : (
              <ul className="grid gap-1 text-corps">
                {f.dossiers.map((x) => (
                  <li key={x.id} className="flex flex-wrap items-center gap-2">
                    <Link href={`/a-traiter?dossier=${x.id}`} className="font-semibold tabular-nums text-h2h-primary hover:underline">
                      {x.reference}
                    </Link>
                    <StatutPastille ton={x.ouvert ? "attention" : "muet"}>{x.ouvert ? "Ouvert" : "Clos"}</StatutPastille>
                    <span className="text-legende text-muted-foreground">
                      {x.source === "incident" ? "contestation d’un refus de colis" : "dossier de la commande"}
                    </span>
                    {x.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                  </li>
                ))}
              </ul>
            )}
          </Bloc>

          <Bloc titre="Autres déclarations de cette co-livraison">
            {f.autres.length === 0 ? (
              <Aucun>Aucune autre déclaration.</Aucun>
            ) : (
              <ul className="grid gap-1 text-corps">
                {f.autres.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-2">
                    {a.genre === "incident" ? (
                      <Link href={cheminIncident(a.id)} className="font-medium text-h2h-primary hover:underline">
                        {a.numero ? `Formulaire ${a.numero} · ` : ""}
                        {a.libelle}
                      </Link>
                    ) : (
                      <span className="font-medium">
                        {a.numero ? `Formulaire ${a.numero} · ` : ""}
                        {a.libelle}
                      </span>
                    )}
                    <span className="text-legende text-muted-foreground">
                      {GENRE[a.genre]} · {LIBELLE_ROLE_INCIDENT[a.role]} · <span className="tabular-nums">{dateHeure(a.declare_le)}</span>
                      {/* L'état ne se dit que d'un incident : sa fiche dit où il en est vraiment. */}
                      {a.genre === "incident" && a.statut === "closed" ? " · clos" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Bloc>
        </div>
      </div>
    </CadreConsultations>
  );
}

import { Echeance } from "@/components/activite/Echeance";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { jour } from "@/lib/dates";
import {
  LIBELLE_DECISION,
  LIBELLE_DECLARANT,
  LIBELLE_ETAT_PAQUET,
  LIBELLE_EXCEPTION_RETOUR,
  LIBELLE_FAMILLE,
  LIBELLE_FRAIS_RETOUR,
  LIBELLE_INCIDENT,
  LIBELLE_PARCOURS,
  LIBELLE_PARTIE,
  LIBELLE_PHASE,
  LIBELLE_SOLUTION,
  LIBELLE_SUIVI_RETOUR,
} from "@/lib/operations/libelles";
import type { Incident, Litiges, Reclamation } from "@/lib/operations/types";
import { Aucun, Bloc, Champs, Montant, ouiNon, Paires, Quand } from "../commun";

/**
 * Litiges : la réclamation et ce que chaque partie y a apporté, les décisions
 * de l'équipe — et, sur le même écran, les incidents de co-livraison du même
 * achat (R15.4). En lecture : on tranche depuis « Litiges et signalements ».
 */
export function OngletLitiges({ l, maintenant }: { l: Litiges; maintenant: number }) {
  if (l.reclamations.length === 0 && l.incidents.length === 0 && l.oppositions === 0) {
    return <Aucun>Aucun litige, aucun incident, aucune opposition sur cet achat.</Aucun>;
  }
  return (
    <div className="grid gap-4">
      {l.reclamations.map((r) => (
        <UneReclamation key={r.id} r={r} maintenant={maintenant} />
      ))}
      {l.incidents.length > 0 && (
        <Bloc titre="Incidents de co-livraison">
          <ul className="grid gap-3">
            {l.incidents.map((d) => (
              <UnIncident key={d.id} d={d} maintenant={maintenant} />
            ))}
          </ul>
        </Bloc>
      )}
      {l.oppositions > 0 && (
        <p className="text-corps">
          {l.oppositions} opposition{l.oppositions > 1 ? "s" : ""} bancaire{l.oppositions > 1 ? "s" : ""} : le détail est
          dans l’onglet « Paiements ».
        </p>
      )}
    </div>
  );
}

function UneReclamation({ r, maintenant }: { r: Reclamation; maintenant: number }) {
  const v = r.reponse_vendeur;
  return (
    <Bloc
      titre={`Litige · ${LIBELLE_FAMILLE[r.famille]}`}
      aside={<StatutPastille ton={r.clos_le ? "muet" : "attention"}>{LIBELLE_PHASE[r.phase]}</StatutPastille>}
    >
      <Champs
        colonnes={4}
        items={[
          ["Motif", r.motif],
          ["Parcours", r.parcours ? LIBELLE_PARCOURS[r.parcours] : null],
          ["État du colis", r.etat_colis ? LIBELLE_ETAT_PAQUET[r.etat_colis] : null],
          ["Solution demandée", r.solution_demandee ? LIBELLE_SOLUTION[r.solution_demandee] : null],
          ["Ouvert", <Quand key="o" iso={r.ouvert_le} maintenant={maintenant} />],
          ["Clos", <Quand key="c" iso={r.clos_le} maintenant={maintenant} />],
          ["Échéance", r.echeance ? <Echeance key="e" iso={r.echeance} maintenant={maintenant} /> : null],
          ["Phase amiable jusqu’au", r.echeance_amiable ? <Echeance key="a" iso={r.echeance_amiable} maintenant={maintenant} /> : null],
          ["Décision", r.decision ? LIBELLE_DECISION[r.decision] : null],
          ["Montant décidé", r.decision_cents === null ? null : <Montant key="d" cents={r.decision_cents} fort />],
          ["Déjà remboursé", <Montant key="r" cents={r.rembourse_cents} />],
          ["Solution convenue", r.solution_convenue ? LIBELLE_SOLUTION[r.solution_convenue] : null],
          ["Frais de retour", r.frais_retour ? LIBELLE_FRAIS_RETOUR[r.frais_retour] : null],
          ["Exception", r.exception_frais_retour ? LIBELLE_EXCEPTION_RETOUR[r.exception_frais_retour] : null],
          ["Retour à organiser avant", r.echeance_retour ? <Echeance key="ro" iso={r.echeance_retour} maintenant={maintenant} /> : null],
          ["Retour à valider avant", r.echeance_validation_retour ? <Echeance key="rv" iso={r.echeance_validation_retour} maintenant={maintenant} /> : null],
          ["Consultation des messages autorisée", ouiNon(r.consultation_autorisee)],
          ["Bonne foi déclarée", ouiNon(r.bonne_foi)],
          ["Dommages", r.dommages?.length ? r.dommages.join(", ") : null],
          ["Usage de l’article", r.usage],
        ]}
      />
      {r.description && (
        <blockquote className="border-l-2 pl-3 text-corps whitespace-pre-line">
          <span className="block text-legende text-muted-foreground">Déclaration de l’acheteur</span>
          {r.description}
        </blockquote>
      )}
      {r.detail_dommages && <p className="text-corps text-muted-foreground">{r.detail_dommages}</p>}

      <div className="grid gap-2 border-t pt-3">
        <span className="text-legende font-semibold text-muted-foreground">Observations des parties</span>
        {r.observations.length === 0 ? (
          <Aucun>Aucune observation.</Aucun>
        ) : (
          <ul className="grid gap-2">
            {r.observations.map((x, i) => (
              <li key={i} className="grid gap-0.5">
                <span className="text-legende text-muted-foreground">
                  {LIBELLE_PARTIE[x.auteur]} · <Quand iso={x.le} maintenant={maintenant} />
                </span>
                <span className="whitespace-pre-line text-corps">{x.texte}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-2 border-t pt-3">
        <span className="text-legende font-semibold text-muted-foreground">Réponse du vendeur</span>
        {!v ? (
          <Aucun>Pas de réponse du vendeur.</Aucun>
        ) : (
          <>
            <Champs
              colonnes={4}
              items={[
                ["Reçue", <Quand key="r" iso={v.le} maintenant={maintenant} />],
                ["Proposition", v.proposition ? (LIBELLE_SOLUTION[v.proposition as keyof typeof LIBELLE_SOLUTION] ?? v.proposition) : null],
                ["Montant proposé", v.montant_partiel_cents === null ? null : <Montant key="m" cents={v.montant_partiel_cents} fort />],
                ["Motif du montant", v.motif_partiel],
                ["Conformité", v.conformite],
                ["Authenticité", v.authenticite],
                ["Transporteur du retour", v.transporteur_retour],
                ["Adresse de retour", v.adresse_retour_donnee ? "Donnée · masquée" : null],
                ["Consultation des messages autorisée", ouiNon(v.consultation_autorisee)],
                ["Bonne foi déclarée", ouiNon(v.bonne_foi)],
              ]}
            />
            {v.observations && <p className="whitespace-pre-line text-corps">{v.observations}</p>}
            {v.commentaire_retour && <p className="text-corps text-muted-foreground">{v.commentaire_retour}</p>}
          </>
        )}
      </div>

      {r.retours.length > 0 && (
        <div className="grid gap-2 border-t pt-3">
          <span className="text-legende font-semibold text-muted-foreground">Retour du colis</span>
          {r.retours.map((x, i) => (
            <Champs
              key={i}
              colonnes={4}
              items={[
                ["Transporteur", x.transporteur],
                ["Suivi", `${LIBELLE_SUIVI_RETOUR[x.suivi_mode]}${x.suivi ? ` · ${x.suivi}` : ""}`],
                ["Expédié le", x.expedie_le ? jour(x.expedie_le) : null],
                ["Reçu", <Quand key="r" iso={x.recu_le} maintenant={maintenant} />],
                ["Emballage", x.emballage],
                ["Contestation", [x.contestation, x.note_contestation].filter(Boolean).join(" — ")],
              ]}
            />
          ))}
        </div>
      )}

      <div className="grid gap-2 border-t pt-3">
        <span className="text-legende font-semibold text-muted-foreground">Décisions de l’équipe</span>
        {r.decisions.length === 0 ? (
          <Aucun>Aucune décision rendue.</Aucun>
        ) : (
          <ul className="grid gap-1 text-corps">
            {r.decisions.map((x, i) => (
              <li key={i}>
                <Quand iso={x.le} maintenant={maintenant} /> · {x.par ?? "Équipe"}
                {x.motif ? ` — ${x.motif}` : ""}
                {x.resultat && x.resultat !== "ok" ? ` (${x.resultat})` : ""}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Bloc>
  );
}

function UnIncident({ d, maintenant }: { d: Incident; maintenant: number }) {
  return (
    <li className="grid gap-2 rounded-lg border p-3">
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-medium">
          {d.conteste ? "Contestation · " : ""}
          {d.formulaire_libelle}
        </span>
        <StatutPastille ton={d.statut === "closed" ? "muet" : "attention"}>{LIBELLE_INCIDENT[d.statut]}</StatutPastille>
      </span>
      <Champs
        colonnes={4}
        items={[
          ["Déclaré par", `${LIBELLE_DECLARANT[d.declarant_role]}${d.declarant ? ` · ${d.declarant}` : ""}`],
          ["Déclaré", <Quand key="d" iso={d.declare_le} maintenant={maintenant} />],
          ["Rendez-vous", <Quand key="r" iso={d.rendez_vous} maintenant={maintenant} />],
          ["Point de rendez-vous", d.hub],
          ["Contestation possible jusqu’au", d.contestation_avant ? <Echeance key="c" iso={d.contestation_avant} maintenant={maintenant} /> : null],
          ["Exactitude confirmée", ouiNon(d.exactitude_confirmee)],
          ["Pièces jointes", d.pieces ? String(d.pieces) : null],
          ["Issue", d.issue],
        ]}
      />
      {d.motif && <p className="text-corps">{d.motif}</p>}
      {d.commentaire && <p className="whitespace-pre-line text-corps text-muted-foreground">{d.commentaire}</p>}
      {d.reponses && Object.keys(d.reponses).length > 0 && (
        <div className="text-corps">
          <span className="text-legende text-muted-foreground">Réponses au formulaire</span>
          <Paires objet={d.reponses} />
        </div>
      )}
    </li>
  );
}

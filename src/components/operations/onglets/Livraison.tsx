import { StatutPastille } from "@/components/bo/StatutPastille";
import {
  LIBELLE_ANNULATION,
  LIBELLE_ASSURANCE,
  LIBELLE_ETAT_COLIS,
  LIBELLE_MISSION,
  LIBELLE_MODE,
  LIBELLE_TRANSPORTEUR,
} from "@/lib/operations/libelles";
import type { Fait, Livraison } from "@/lib/operations/types";
import { Aucun, Bloc, Champs, Montant, Quand, Reference } from "../commun";
import { ListeFaits } from "./Chronologie";

const tentative = (n: number | null, max: number | null) => (n === null ? null : max ? `${n} sur ${max}` : String(n));

/**
 * Livraison : le mode, les envois, la co-livraison et ses rendez-vous, puis le
 * parcours du colis.
 *
 * 🔴 NI CODE, NI POSITION, NI ADRESSE (R4.15) : la commune de destination dit
 * où va le colis ; une remise hors point de rendez-vous dit seulement qu'elle
 * l'est. L'adresse se révélera une à une, avec un motif et une trace.
 */
export function OngletLivraison({ l, parcours, maintenant }: { l: Livraison; parcours: Fait[]; maintenant: number }) {
  return (
    <div className="grid gap-4">
      <Bloc titre="Le mode de livraison">
        <Champs
          colonnes={4}
          items={[
            ["Mode", l.mode ? LIBELLE_MODE[l.mode] : null],
            ["Transporteur", l.transporteur ? LIBELLE_TRANSPORTEUR[l.transporteur] : null],
            ["Numéro de suivi", l.suivi ? <Reference key="s" valeur={l.suivi} /> : null],
            ["Destination", l.ville_destination ? `${l.ville_destination} · adresse masquée` : "Adresse masquée"],
          ]}
        />
      </Bloc>

      {l.envois.map((s) => (
        <Bloc
          key={s.id}
          titre={`Envoi · ${LIBELLE_MODE[s.mode]}`}
          aside={<StatutPastille ton={s.etat === "cancelled" || s.etat === "expired" ? "muet" : s.etat === "disputed" ? "attention" : "marque"}>{LIBELLE_ETAT_COLIS[s.etat]}</StatutPastille>}
        >
          <Champs
            colonnes={4}
            items={[
              ["Suivi", s.suivi ? <Reference key="s" valeur={s.suivi} /> : null],
              ["Format", s.format],
              ["Protection", s.assurance ? LIBELLE_ASSURANCE[s.assurance] : null],
              ["Couverture", s.couverture_cents === null ? null : <Montant key="c" cents={s.couverture_cents} />],
              ["Cotransporteur particulier", s.cotransporteur],
              ["Point de départ", s.hub_depart],
              ["Point d’arrivée", s.hub_arrivee],
              ["Tentative", tentative(s.tentative, s.tentatives_max)],
              ["Collecte entre", s.collecte_debut ? <span key="cd"><Quand iso={s.collecte_debut} maintenant={maintenant} /> et <Quand iso={s.collecte_fin} maintenant={maintenant} /></span> : null],
              ["Remise prévue", <Quand key="r" iso={s.remise_prevue} maintenant={maintenant} />],
              ["Tolérance", s.tolerance_minutes === null ? null : `${s.tolerance_minutes} min`],
              ["Expédié", <Quand key="e" iso={s.expedie_le} maintenant={maintenant} />],
              ["Déposé en relais", <Quand key="dr" iso={s.relais_le} maintenant={maintenant} />],
              ["Retour du relais avant", <Quand key="rr" iso={s.relais_retour_avant} maintenant={maintenant} />],
              ["Remis", <Quand key="l" iso={s.livre_le} maintenant={maintenant} />],
              ["Livraison présumée", <Quand key="p" iso={s.presume_le} maintenant={maintenant} />],
              ["Réception confirmée", <Quand key="rc" iso={s.reception_confirmee_le} maintenant={maintenant} />],
              ["Absence déclarée", <Quand key="a" iso={s.absence_declaree_le} maintenant={maintenant} />],
            ]}
          />
        </Bloc>
      ))}

      {l.missions.map((m) => (
        <Bloc
          key={m.id}
          titre={m.retour ? "Co-livraison du retour" : "Co-livraison"}
          aside={<StatutPastille ton={m.statut === "cancelled" || m.statut === "expired" ? "muet" : "marque"}>{LIBELLE_MISSION[m.statut]}</StatutPastille>}
        >
          <Champs
            colonnes={4}
            items={[
              ["Cotransporteur particulier", m.cotransporteur ?? "Pas encore désigné"],
              ["Format · poids", [m.format, m.poids_kg === null ? null : `${m.poids_kg} kg`].filter(Boolean).join(" · ")],
              ["Suivi", m.suivi ? <Reference key="s" valeur={m.suivi} /> : null],
              ["Tentative", tentative(m.tentative, m.tentatives_max)],
              ["Rendez-vous de collecte", [m.hub_collecte, m.ville_collecte].filter(Boolean).join(" · ")],
              ["Collecte prévue", <Quand key="cp" iso={m.collecte_prevue} maintenant={maintenant} />],
              ["Collecte validée", <Quand key="cv" iso={m.collecte_validee_le} maintenant={maintenant} />],
              ["Tolérance", m.tolerance_minutes === null ? null : `${m.tolerance_minutes} min`],
              ["Rendez-vous de remise", [m.hub_remise, m.ville_remise].filter(Boolean).join(" · ")],
              ["Remise prévue", <Quand key="rp" iso={m.remise_prevue} maintenant={maintenant} />],
              ["Remise validée", <Quand key="rv" iso={m.remise_validee_le} maintenant={maintenant} />],
              ["Point de remise choisi", <Quand key="hc" iso={m.hub_remise_choisi_le} maintenant={maintenant} />],
              ["Proposition valable jusqu’au", <Quand key="pe" iso={m.proposition_expire_le} maintenant={maintenant} />],
              ["Confirmation du vendeur avant", <Quand key="va" iso={m.vendeur_avant} maintenant={maintenant} />],
              ["Refus de cotransporteurs", m.refus ? String(m.refus) : null],
              ["Annulation", m.annulation ? LIBELLE_ANNULATION[m.annulation] : null],
            ]}
          />
          {m.hors_point_de_rendez_vous && (
            <StatutPastille ton="neutre" className="justify-self-start">
              Remise hors point de rendez-vous · adresse masquée
            </StatutPastille>
          )}
        </Bloc>
      ))}

      {l.refus.length > 0 && (
        <Bloc titre="Propositions déclinées">
          <ul className="grid gap-1 text-corps">
            {l.refus.map((r, i) => (
              <li key={i}>
                <Quand iso={r.le} maintenant={maintenant} /> · {r.cotransporteur ?? "(compte effacé)"}
                {r.motif ? ` — ${r.motif}` : ""}
              </li>
            ))}
          </ul>
        </Bloc>
      )}

      {l.envois.length === 0 && l.missions.length === 0 && (
        <Aucun>Aucun envoi n’a encore été créé pour cet achat.</Aucun>
      )}

      <Bloc titre="Parcours du colis">
        <ListeFaits faits={parcours} tronquee={false} maintenant={maintenant} filtres={false} />
      </Bloc>
    </div>
  );
}

import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import {
  LIBELLE_MOTIF_ANNULATION_RECHERCHE,
  LIBELLE_RAISON_INDISPONIBLE,
  LIBELLE_STATUT_CANDIDATURE,
  LIBELLE_STATUT_RECHERCHE,
} from "@/lib/operations/libelles";
import type { CandidatureColivraison, RechercheColivraison, StatutRecherche } from "@/lib/operations/types";
import { Bloc, Champs, Montant, Quand, Tableau } from "../commun";

const TON_RECHERCHE: Record<StatutRecherche, Ton> = {
  ouverte: "actif",
  choix: "actif",
  validation_vendeur: "actif",
  confirmee: "succes",
  annulee: "muet",
};

/** Une issue qui ferme la candidature sans la retenir n'est jamais verte. */
const tonCandidature = (c: CandidatureColivraison): Ton =>
  c.statut === "confirmee"
    ? "succes"
    : c.statut === "retenue" || c.statut === "en_attente"
      ? "actif"
      : c.statut === "refusee_vendeur" || c.statut === "expiree_vendeur"
        ? "attention"
        : c.statut === "non_selectionnee"
          ? "neutre"
          : "muet";

/**
 * Une recherche de cotransporteur — la mise en relation du § 5 des CGU H2H
 * Logistic, telle que le cahier des charges la demande (R12.1) : T0, la fenêtre
 * des collectes, les TROIS délais de vingt minutes chacun pour soi, la marge
 * avant collecte, et chaque candidature avec son passage, ses hubs, le motif d'un
 * refus ou la raison pour laquelle elle ne pourrait pas être choisie.
 *
 * ⚠️ RIEN À FAIRE ICI : la recherche avance seule ou par les gestes des
 * participants. L'équipe la lit.
 *
 * 🔴 NI ADRESSE, NI POSITION (R4.15) : des hubs nommés et des heures.
 */
export function RechercheColivraisonBloc({ r, maintenant }: { r: RechercheColivraison; maintenant: number }) {
  return (
    <Bloc
      titre={`Recherche de cotransporteur n° ${r.numero}`}
      aside={<StatutPastille ton={TON_RECHERCHE[r.statut]}>{LIBELLE_STATUT_RECHERCHE[r.statut]}</StatutPastille>}
    >
      <Champs
        colonnes={4}
        items={[
          ["Démarrée (T0)", <Quand key="t0" iso={r.t0} maintenant={maintenant} />],
          [
            "Collectes possibles",
            <span key="f">
              <Quand iso={r.collecte_min} maintenant={maintenant} /> → <Quand iso={r.collecte_max} maintenant={maintenant} />
            </span>,
          ],
          ["« Express » si collecte avant", <Quand key="x" iso={r.express_avant} maintenant={maintenant} />],
          ["Trajet", `${r.ville_depart} → ${r.ville_arrivee} · format ${r.format}`],
          ["Propositions envoyées", String(r.propositions)],
          ["Tour", r.tour > 1 ? `${r.tour} — choix d’un remplaçant (§ 5.3.3)` : "1"],
          ["Confirmée", <Quand key="c" iso={r.confirmee_le} maintenant={maintenant} />],
          [
            "Close",
            r.annulee_le ? (
              <span key="a">
                <Quand iso={r.annulee_le} maintenant={maintenant} />
                {r.motif_annulation ? ` · ${LIBELLE_MOTIF_ANNULATION_RECHERCHE[r.motif_annulation]}` : ""}
              </span>
            ) : null,
          ],
        ]}
      />

      {/* Les trois délais, CHACUN LE SIEN (R12.1), et la marge : ce sont des règles, pas des étapes. */}
      <Champs
        colonnes={4}
        items={[
          ["Réponse de chaque cotransporteur", `${r.reponse_minutes} min après sa proposition`],
          [
            "Choix de l’acheteur",
            r.choix_jusqu_au ? (
              <span key="ch">
                {r.choix_minutes} min · avant <Quand iso={r.choix_jusqu_au} maintenant={maintenant} />
              </span>
            ) : (
              `${r.choix_minutes} min`
            ),
          ],
          [
            "Validation du vendeur",
            r.validation_jusqu_au ? (
              <span key="va">
                {r.validation_minutes} min · avant <Quand iso={r.validation_jusqu_au} maintenant={maintenant} />
              </span>
            ) : (
              `${r.validation_minutes} min`
            ),
          ],
          ["Marge avant collecte", `${r.marge_minutes} min au moins après la confirmation`],
        ]}
      />

      {r.candidatures.length > 0 && (
        <Tableau entetes={["Cotransporteur", "État", "Proposée", "Réponse", "Collecte", "Remise", "Motif ou raison"]} largeur={960}>
          {r.candidatures.map((c) => (
            <tr key={c.id}>
              <td>{c.cotransporteur ?? "(compte effacé)"}</td>
              <td>
                <StatutPastille ton={tonCandidature(c)}>{LIBELLE_STATUT_CANDIDATURE[c.statut]}</StatutPastille>
                {c.express ? <span className="ml-1 text-legende text-muted-foreground">Express</span> : null}
              </td>
              <td>
                <Quand iso={c.proposee_le} maintenant={maintenant} />
                <div className="text-legende text-muted-foreground">
                  {c.passages} passage{c.passages > 1 ? "s" : ""} · <Montant cents={c.participation_cents} />
                </div>
              </td>
              <td>
                {c.repondue_le ? (
                  <Quand iso={c.repondue_le} maintenant={maintenant} />
                ) : (
                  <span className="text-muted-foreground">
                    avant <Quand iso={c.repondre_avant} maintenant={maintenant} />
                  </span>
                )}
              </td>
              <td>
                {c.collecte_le ? <Quand iso={c.collecte_le} maintenant={maintenant} /> : "—"}
                {c.hub_collecte ? <div className="text-legende text-muted-foreground">{c.hub_collecte}</div> : null}
              </td>
              <td>
                {c.remise_le ? <Quand iso={c.remise_le} maintenant={maintenant} /> : "—"}
                {c.hub_remise ? <div className="text-legende text-muted-foreground">{c.hub_remise}</div> : null}
              </td>
              <td className="grid gap-0.5">
                {c.motif_refus ? <span>Refus : {c.motif_refus}</span> : null}
                {c.motif_vendeur ? <span>Vendeur : {c.motif_vendeur}</span> : null}
                {c.raison ? <span className="text-muted-foreground">{LIBELLE_RAISON_INDISPONIBLE[c.raison]}</span> : null}
                {c.marge_tenue_minutes !== null ? <span>Marge tenue : {c.marge_tenue_minutes} min</span> : null}
              </td>
            </tr>
          ))}
        </Tableau>
      )}
    </Bloc>
  );
}

import { StatutPastille } from "@/components/bo/StatutPastille";
import {
  LIBELLE_ETAPE_HUB,
  LIBELLE_HORS_HUB,
  LIBELLE_PARTIE_HUB,
  LIBELLE_ROLE_SCAN,
} from "@/lib/operations/libelles";
import type { DemandeHorsHub, PresenceHub, RetenueLivraison, ScanColis } from "@/lib/operations/types";
import { euros } from "@/lib/paiements/types";
import { Bloc, Quand, Tableau } from "../commun";

// CE QUE LE § 12.3 DEMANDE D'UNE CO-LIVRAISON, EN PLUS DE SES RENDEZ-VOUS (hand-to-hand `20261013002000`) : les
// présences déclarées, les validations et scans, les demandes hors point de rendez-vous, et ce qu'un incident
// retient des versements.
//
// 🔴 NI POSITION, NI CODE, NI ADRESSE : la base n'en rend aucun. Une présence dit « dans la zone » ou non ; un scan
// dit quel code a servi, pas sa valeur ; une demande hors point de rendez-vous dit son sort, pas son lieu.

/** L'écart à l'heure du rendez-vous, en clair. */
export function ecartAuRendezVous(minutes: number | null): string | null {
  if (minutes === null) return null;
  if (minutes === 0) return "À l’heure";
  return minutes < 0 ? `${-minutes} min avant l’heure` : `${minutes} min après l’heure`;
}

const BENEFICIAIRE: Record<NonNullable<RetenueLivraison["beneficiaire"]>, string> = {
  vendeur: "le versement du vendeur",
  cotransporteur: "la participation du cotransporteur particulier",
};

/** Ce qu'un incident ou une contestation retient : la cause et sa date — les montants sont dans l'onglet Paiements. */
export function RetenuesBloc({ retenues, maintenant }: { retenues: RetenueLivraison[]; maintenant: number }) {
  if (retenues.length === 0) return null;
  return (
    <Bloc titre="Ce qui retient les versements" aside={<StatutPastille ton="attention">Fonds retenus</StatutPastille>}>
      <ul className="grid gap-1 text-corps">
        {retenues.map((r, i) => (
          <li key={i}>
            {r.libelle} — retient {r.beneficiaire ? BENEFICIAIRE[r.beneficiaire] : "tous les versements de cet achat"},
            depuis <Quand iso={r.depuis} maintenant={maintenant} />.
          </li>
        ))}
      </ul>
      <p className="text-legende text-muted-foreground">
        Les montants se lisent dans l’onglet Paiements. Une retenue tombe quand le dossier qui la cause est clos.
      </p>
    </Bloc>
  );
}

/**
 * Les présences déclarées (« Je suis au hub »).
 *
 * ⚠️ DÉCLARÉE N'EST PAS VALIDÉE. Hors de la zone, la présence est enregistrée — c'est une preuve de l'heure —
 * sans être validée : l'écran le dit, sans en faire une faute.
 */
export function PresencesTableau({ presences, maintenant }: { presences: PresenceHub[]; maintenant: number }) {
  if (presences.length === 0) {
    return <p className="text-corps text-muted-foreground">Aucune présence déclarée.</p>;
  }
  return (
    <Tableau entetes={["Étape", "Qui", "Déclarée", "Par rapport au rendez-vous", "Dans la zone"]} largeur={640}>
      {presences.map((p, i) => (
        <tr key={i}>
          <td>{LIBELLE_ETAPE_HUB[p.etape]}</td>
          <td>
            {LIBELLE_PARTIE_HUB[p.partie]}
            {p.pseudo ? ` · ${p.pseudo}` : ""}
          </td>
          <td>
            <Quand iso={p.declaree_le} maintenant={maintenant} />
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
  );
}

/** Les validations et scans des parties, dans l'ordre. Un refus n'est jamais vert. */
export function ScansTableau({ scans, maintenant }: { scans: ScanColis[]; maintenant: number }) {
  if (scans.length === 0) {
    return <p className="text-corps text-muted-foreground">Aucune validation ni scan.</p>;
  }
  return (
    <Tableau entetes={["Quand", "Qui", "Geste", "Résultat"]} largeur={640}>
      {scans.map((s, i) => (
        <tr key={i}>
          <td>
            <Quand iso={s.le} maintenant={maintenant} />
          </td>
          <td>
            {LIBELLE_ROLE_SCAN[s.role]}
            {s.acteur ? ` · ${s.acteur}` : ""}
          </td>
          <td>
            {s.libelle}
            {s.photo && <span className="text-muted-foreground"> · avec photo</span>}
          </td>
          <td>
            {s.resultat === "success" ? (
              <StatutPastille ton="succes">Accepté</StatutPastille>
            ) : (
              <StatutPastille ton="attention">Refusé</StatutPastille>
            )}
          </td>
        </tr>
      ))}
    </Tableau>
  );
}

/** Les demandes hors point de rendez-vous : l'étape, qui demande, le sort. L'adresse reste masquée. */
export function HorsHubListe({ demandes, maintenant }: { demandes: DemandeHorsHub[]; maintenant: number }) {
  if (demandes.length === 0) return null;
  return (
    <ul className="grid gap-1 text-corps">
      {demandes.map((d, i) => (
        <li key={i}>
          {LIBELLE_ETAPE_HUB[d.etape]} hors point de rendez-vous, demandée par {d.demandeur ?? "(compte effacé)"} le{" "}
          <Quand iso={d.demandee_le} maintenant={maintenant} /> — {LIBELLE_HORS_HUB[d.statut]}
          {d.statut === "pending" && (
            <>
              {" "}
              (jusqu’au <Quand iso={d.expire_le} maintenant={maintenant} />)
            </>
          )}
          {d.frais_cents !== null && ` · frais proposés : ${euros(d.frais_cents)}`} · adresse masquée
        </li>
      ))}
    </ul>
  );
}

import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import type { Database } from "@/lib/db/contrat/database.types";
import {
  LIBELLE_COMPTE,
  LIBELLE_ECRITURE,
  LIBELLE_ECRITURE_STATUT,
  LIBELLE_OBJET_PAIEMENT,
  LIBELLE_PAIEMENT,
} from "@/lib/operations/libelles";
import type { Paiements } from "@/lib/operations/types";
import { Aucun, Bloc, Montant, Quand, Reference, Tableau } from "../commun";

// ⚠️ UNE ISSUE DÉFAVORABLE N'EST JAMAIS VERTE.
const TON_PAIEMENT: Record<Database["public"]["Enums"]["payment_status"], Ton> = {
  requires_action: "actif",
  pre_authorized: "marque",
  captured: "succes",
  released: "neutre",
  refunded: "neutre",
  failed: "erreur",
  canceled: "muet",
};

const TON_DEMANDE = { en_cours: "actif", reussi: "succes", echoue: "erreur" } as const;
const LIBELLE_DEMANDE = { en_cours: "En cours chez Stripe", reussi: "Réussi", echoue: "Échoué" } as const;

/**
 * Paiements (§16 en lecture) : les paiements, les remboursements et leurs
 * demandes, les oppositions, et les écritures du grand livre — la vérité de
 * l'argent de cet achat. Rien ne s'exécute d'ici.
 */
export function OngletPaiements({ p, maintenant }: { p: Paiements; maintenant: number }) {
  return (
    <div className="grid gap-4">
      <Bloc titre="Paiements">
        {p.paiements.length === 0 ? (
          <Aucun>Aucun paiement engagé.</Aucun>
        ) : (
          <Tableau entetes={["Objet", "État", "Montant", "Stripe", "Mode", "Créé", "Dernière mise à jour"]}>
            {p.paiements.map((x) => (
              <tr key={x.id}>
                <td>{LIBELLE_OBJET_PAIEMENT[x.objet] ?? x.objet}</td>
                <td><StatutPastille ton={TON_PAIEMENT[x.statut]}>{LIBELLE_PAIEMENT[x.statut]}</StatutPastille></td>
                <td><Montant cents={x.montant_cents} fort /></td>
                <td><Reference valeur={x.stripe} /></td>
                <td>{x.reel === false ? <StatutPastille ton="attention">TEST</StatutPastille> : "Réel"}</td>
                <td><Quand iso={x.cree_le} maintenant={maintenant} /></td>
                <td><Quand iso={x.maj_le} maintenant={maintenant} /></td>
              </tr>
            ))}
          </Tableau>
        )}
      </Bloc>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloc titre="Remboursements émis">
          {p.remboursements.length === 0 ? (
            <Aucun>Aucun remboursement.</Aucun>
          ) : (
            <ul className="grid gap-2">
              {p.remboursements.map((r, i) => (
                <li key={i} className="grid gap-0.5 rounded-lg border p-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <Montant cents={r.montant_cents} fort />
                    {r.litige && <StatutPastille ton="neutre">Litige</StatutPastille>}
                    <Reference valeur={r.stripe} />
                  </span>
                  <span className="text-legende text-muted-foreground">
                    <Quand iso={r.le} maintenant={maintenant} />
                    {r.par ? ` · par ${r.par}` : ""}
                    {r.motif ? ` · ${r.motif}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Bloc>

        <Bloc titre="Demandes de remboursement">
          {p.demandes.length === 0 ? (
            <Aucun>Aucune demande envoyée à Stripe.</Aucun>
          ) : (
            <ul className="grid gap-2">
              {p.demandes.map((d, i) => (
                <li key={i} className="grid gap-0.5 rounded-lg border p-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <Montant cents={d.montant_cents} fort />
                    <StatutPastille ton={TON_DEMANDE[d.statut]}>{LIBELLE_DEMANDE[d.statut]}</StatutPastille>
                  </span>
                  <span className="text-legende text-muted-foreground">
                    Demandée <Quand iso={d.demande_le} maintenant={maintenant} />
                    {d.par ? ` par ${d.par}` : ""}
                    {d.clos_le && <> · close <Quand iso={d.clos_le} maintenant={maintenant} /></>}
                  </span>
                  {d.erreur && <span className="text-legende text-h2h-error">{d.erreur}</span>}
                </li>
              ))}
            </ul>
          )}
        </Bloc>
      </div>

      {p.oppositions.length > 0 && (
        <Bloc titre="Oppositions bancaires">
          <Tableau entetes={["Montant", "Frais", "Motif", "État", "Issue", "Preuves avant", "Ouverte", "Close"]} largeur={880}>
            {p.oppositions.map((o) => (
              <tr key={o.stripe}>
                <td><Montant cents={o.montant_cents} fort /></td>
                <td><Montant cents={o.frais_cents} /></td>
                <td>{o.motif ?? "—"}</td>
                <td>{o.statut ?? "—"}</td>
                <td>{o.issue ?? "—"}</td>
                <td><Quand iso={o.preuves_avant} maintenant={maintenant} /></td>
                <td><Quand iso={o.ouverte_le} maintenant={maintenant} /></td>
                <td><Quand iso={o.close_le} maintenant={maintenant} /></td>
              </tr>
            ))}
          </Tableau>
        </Bloc>
      )}

      <Bloc titre="Grand livre">
        {p.ecritures.length === 0 ? (
          <Aucun>Aucune écriture comptable pour cet achat.</Aucun>
        ) : (
          <Tableau entetes={["Date", "Événement", "Compte", "Débit", "Crédit", "État"]} largeur={820}>
            {p.ecritures.map((e, i) => (
              <tr key={i}>
                <td><Quand iso={e.le} maintenant={maintenant} /></td>
                <td>
                  {LIBELLE_ECRITURE[e.evenement]}
                  {e.libelle && <span className="block text-legende text-muted-foreground">{e.libelle}</span>}
                </td>
                <td>{LIBELLE_COMPTE[e.compte]}</td>
                <td>{e.sens === "D" ? <Montant cents={e.montant_cents} /> : ""}</td>
                <td>{e.sens === "C" ? <Montant cents={e.montant_cents} /> : ""}</td>
                <td>{LIBELLE_ECRITURE_STATUT[e.statut]}</td>
              </tr>
            ))}
          </Tableau>
        )}
      </Bloc>
    </div>
  );
}

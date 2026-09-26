import { StatutPastille, type Ton } from "@/components/bo/StatutPastille";
import { TON_FONDS } from "@/components/paiements/FondsAVerser";
import { BoutonLever, BoutonRetenir } from "@/components/paiements/GestesFonds";
import {
  BoutonAnnulerOrdre,
  BoutonRelancer,
  BoutonRembourser,
  BoutonsValidation,
} from "@/components/paiements/GestesOrdres";
import { TON_ORDRE } from "@/components/paiements/OrdresFinanciers";
import type { Database } from "@/lib/db/contrat/database.types";
import {
  LIBELLE_COMPTE,
  LIBELLE_ECRITURE,
  LIBELLE_ECRITURE_STATUT,
  LIBELLE_OBJET_PAIEMENT,
  LIBELLE_PAIEMENT,
} from "@/lib/operations/libelles";
import type { Paiements } from "@/lib/operations/types";
import { LIBELLE_ATTENTE, LIBELLE_ETAT_FONDS, LIBELLE_ROLE_FONDS, LIBELLE_STATUT_ORDRE } from "@/lib/paiements/types";
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

type Gestes = {
  /** L'achat : la retenue se pose sur lui. */
  commande: string;
  peutRetenir: boolean;
  peutLiberer: boolean;
  /** `remboursements.preparer` : demander hors litige, relancer, annuler. */
  peutRembourser: boolean;
  /** Relire la fiche après un geste. */
  surGeste: () => void;
};

/**
 * Paiements (§16) : l'état des fonds, puis les paiements, les remboursements et
 * leurs demandes, les oppositions, et les écritures du grand livre — la vérité
 * de l'argent de cet achat.
 *
 * ⚠️ AUCUN ARGENT NE PART DE CET ONGLET : on y retient ou libère des fonds, et
 * on y DEMANDE un remboursement — un ordre financier, qu'une seconde personne
 * valide et que `stripe-ordres` exécute.
 */
export function OngletPaiements({ p, maintenant, ...gestes }: { p: Paiements; maintenant: number } & Gestes) {
  return (
    <div className="grid gap-4">
      {p.fonds && <EtatDesFonds f={p.fonds} maintenant={maintenant} {...gestes} />}
      {p.ordres && (
        <OrdresDeLAchat
          ordres={p.ordres}
          restant={p.remboursable_cents}
          maintenant={maintenant}
          commande={gestes.commande}
          peutRembourser={gestes.peutRembourser}
          surGeste={gestes.surGeste}
        />
      )}

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

/**
 * L'état des fonds (R15.2) : ce que l'achat doit à chaque personne qu'il paie,
 * ce qui le retient, et les retenues de l'équipe.
 *
 * 🔴 LEVER UNE RETENUE NE LIBÈRE QU'ELLE (R15.5) : une réclamation, une opposition
 * ou un incident continuent de retenir, et restent listés ici.
 */
function EtatDesFonds({
  f,
  maintenant,
  commande,
  peutRetenir,
  peutLiberer,
  surGeste,
}: { f: Paiements["fonds"]; maintenant: number } & Gestes) {
  const retenueDeTous = f.historique.some((h) => h.beneficiaire === null && h.levee_le === null);
  return (
    <Bloc
      titre="État des fonds"
      aside={
        peutRetenir && !retenueDeTous ? (
          <BoutonRetenir
            commande={commande}
            beneficiaire={null}
            qui="tous les bénéficiaires de cet achat"
            surGeste={surGeste}
          />
        ) : undefined
      }
    >
      {f.beneficiaires.length === 0 ? (
        <Aucun>Rien n’est encore dû : l’achat n’est pas encaissé.</Aucun>
      ) : (
        <Tableau entetes={["Bénéficiaire", "Dû", "État", "Détail", ""]} largeur={760}>
          {f.beneficiaires.map((b) => {
            const causes = f.retenues.filter((r) => r.beneficiaire === null || r.beneficiaire === b.profil);
            // Une retenue de l'équipe tient déjà ces fonds — la sienne, ou celle de tous.
            const retenueEquipe = f.historique.some(
              (h) => (h.beneficiaire === b.profil || h.beneficiaire === null) && h.levee_le === null,
            );
            const ouvert = b.etat === "retenu" || b.etat === "versable" || b.etat === "en_attente";
            return (
              <tr key={`${b.role}:${b.profil}`}>
                <td>
                  {b.pseudo ?? "Compte effacé"}
                  <span className="block text-legende text-muted-foreground">{LIBELLE_ROLE_FONDS[b.role]}</span>
                </td>
                <td><Montant cents={b.du_cents} fort /></td>
                <td><StatutPastille ton={TON_FONDS[b.etat]}>{LIBELLE_ETAT_FONDS[b.etat]}</StatutPastille></td>
                <td className="text-muted-foreground">
                  {b.etat === "verse" ? (
                    <>Versé <Quand iso={b.verse_le} maintenant={maintenant} /></>
                  ) : b.etat === "retenu" ? (
                    causes.map((c) => c.libelle).join(" · ")
                  ) : b.etat === "en_attente" ? (
                    <>
                      {b.attente ? LIBELLE_ATTENTE[b.attente] : "En attente"}
                      {b.attente === "fenetre" && b.versable_le && (
                        <> — jusqu’à <Quand iso={b.versable_le} maintenant={maintenant} /></>
                      )}
                    </>
                  ) : b.etat === "versable" ? (
                    "La personne peut demander son versement."
                  ) : (
                    "—"
                  )}
                </td>
                <td className="text-right">
                  {peutRetenir && ouvert && !retenueEquipe && (
                    <BoutonRetenir
                      commande={commande}
                      beneficiaire={b.profil}
                      qui={`${LIBELLE_ROLE_FONDS[b.role].toLowerCase()} ${b.pseudo ?? ""}`.trim()}
                      surGeste={surGeste}
                      taille="xs"
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </Tableau>
      )}

      {f.retenues.length > 0 && (
        <div className="grid gap-2">
          <h3 className="text-corps font-semibold">Ce qui retient les fonds</h3>
          <ul className="grid gap-2">
            {f.retenues.map((r, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3">
                <span className="grid gap-0.5">
                  <span>{r.libelle}</span>
                  <span className="text-legende text-muted-foreground">
                    {r.beneficiaire ? `Fonds de ${r.pseudo ?? "un compte effacé"}` : "Fonds de tous les bénéficiaires"}
                    {" · depuis "}
                    <Quand iso={r.depuis} maintenant={maintenant} />
                  </span>
                </span>
                {r.retenue && peutLiberer && <BoutonLever retenue={r.retenue} surGeste={surGeste} />}
              </li>
            ))}
          </ul>
        </div>
      )}

      {f.historique.length > 0 && (
        <div className="grid gap-2">
          <h3 className="text-corps font-semibold">Retenues de l’équipe</h3>
          <ul className="grid gap-2">
            {f.historique.map((h) => (
              <li key={h.id} className="grid gap-0.5 rounded-lg border p-3">
                <span className="flex flex-wrap items-center gap-2">
                  <StatutPastille ton={h.levee_le ? "muet" : "attention"}>{h.levee_le ? "Levée" : "Active"}</StatutPastille>
                  <span>{h.beneficiaire ? `Fonds de ${h.pseudo ?? "un compte effacé"}` : "Fonds de tous les bénéficiaires"}</span>
                </span>
                <span className="text-legende text-muted-foreground">
                  Posée <Quand iso={h.posee_le} maintenant={maintenant} />
                  {h.posee_par ? ` par ${h.posee_par}` : ""} · {h.motif}
                </span>
                {h.levee_le && (
                  <span className="text-legende text-muted-foreground">
                    Levée <Quand iso={h.levee_le} maintenant={maintenant} />
                    {h.levee_par ? ` par ${h.levee_par}` : ""} · {h.motif_levee}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Bloc>
  );
}

const LIBELLE_ESSAI: Record<string, string> = {
  reussi: "exécuté",
  en_attente: "créé, en attente chez Stripe",
  echoue: "refusé",
  inconnu: "sans réponse sûre — vérifié avant tout renvoi",
};

/**
 * Les ordres financiers de l'achat (§16) : chaque remboursement, ses
 * tentatives chez Stripe, sa validation — et les gestes qui restent possibles.
 *
 * 🔴 UN ORDRE PARTI CHEZ STRIPE NE S'ANNULE PLUS ; un ordre en échec se relance
 * (une clé neuve, après vérification chez Stripe) ou s'annule.
 */
function OrdresDeLAchat({
  ordres,
  restant,
  maintenant,
  commande,
  peutRembourser,
  surGeste,
}: {
  ordres: Paiements["ordres"];
  restant: number;
  maintenant: number;
  commande: string;
  peutRembourser: boolean;
  surGeste: () => void;
}) {
  const vivant = ordres.some((o) => ["en_validation", "demande", "en_cours", "echoue"].includes(o.statut));
  return (
    <Bloc
      titre="Ordres financiers"
      aside={
        peutRembourser && !vivant ? (
          <BoutonRembourser commande={commande} restant={restant} surGeste={surGeste} />
        ) : undefined
      }
    >
      {ordres.length === 0 ? (
        <Aucun>Aucun remboursement demandé par l’équipe sur cet achat.</Aucun>
      ) : (
        <ul className="grid gap-2">
          {ordres.map((o) => (
            <li key={o.id} className="grid gap-1 rounded-lg border p-3">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold tabular-nums">{o.ref}</span>
                <StatutPastille ton={TON_ORDRE[o.statut]}>{LIBELLE_STATUT_ORDRE[o.statut]}</StatutPastille>
                <Montant cents={o.montant_cents} fort />
                <StatutPastille ton="neutre">{o.litige ? "Litige" : "Hors litige"}</StatutPastille>
                {o.reel === false && <StatutPastille ton="attention">TEST</StatutPastille>}
                {o.stripe && <Reference valeur={o.stripe} />}
              </span>
              <span className="text-legende text-muted-foreground">
                Demandé <Quand iso={o.cree_le} maintenant={maintenant} />
                {o.demande_par ? ` par ${o.demande_par}` : ""} · « {o.motif} »
              </span>
              {o.validation && (
                <span className="text-legende text-muted-foreground">
                  {o.validation.statut === "en_attente" ? (
                    <>
                      Attend une seconde personne (Finance ou Direction), jusqu’à{" "}
                      <Quand iso={o.validation.expire_le} maintenant={maintenant} />
                    </>
                  ) : (
                    <>
                      Validation : {o.validation.statut}
                      {o.validation.valideur ? ` par ${o.validation.valideur}` : ""}
                      {o.validation.motif_decision ? ` · « ${o.validation.motif_decision} »` : ""}
                    </>
                  )}
                </span>
              )}
              {o.essais.length > 0 && (
                <ul className="grid gap-0.5 text-legende text-muted-foreground">
                  {o.essais.map((e) => (
                    <li key={e.numero}>
                      Tentative {e.numero} · <Quand iso={e.le} maintenant={maintenant} /> ·{" "}
                      {e.resultat ? LIBELLE_ESSAI[e.resultat] : "en vol"}
                      {e.verifications > 0 ? ` · vérifiée ${e.verifications} fois` : ""}
                      {e.erreur ? ` · ${e.erreur}` : ""}
                    </li>
                  ))}
                </ul>
              )}
              {o.erreur && <span className="text-legende text-h2h-error">{o.erreur}</span>}
              {o.reprise && "dette" in o.reprise && (
                <span className="text-legende text-h2h-warning">
                  Le vendeur avait déjà été versé et la somme n’a pas pu être reprise : une dette est inscrite, qui
                  retient ses prochains versements.
                </span>
              )}
              <span className="flex flex-wrap gap-2">
                {o.statut === "en_validation" && o.validation?.peut_decider && (
                  <BoutonsValidation validation={o.validation.id} surGeste={surGeste} taille="xs" />
                )}
                {peutRembourser && o.statut === "echoue" && (
                  <BoutonRelancer ordre={o.id} surGeste={surGeste} taille="xs" />
                )}
                {peutRembourser && ["en_validation", "demande", "echoue"].includes(o.statut) && (
                  <BoutonAnnulerOrdre ordre={o.id} surGeste={surGeste} taille="xs" />
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Bloc>
  );
}

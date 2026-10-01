import Link from "next/link";
import { Star } from "lucide-react";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Aucun, Bloc, Champs, Montant, Reference, Tableau, ouiNon } from "@/components/operations/commun";
import { CadreConsultations, DonneeMasquee } from "@/components/operations/sensibles";
import { dateHeure, jour } from "@/lib/dates";
import {
  LIBELLE_ANNONCE,
  LIBELLE_MISSION,
  LIBELLE_STATUT_COMMANDE,
  LIBELLE_TYPE_ANNONCE,
} from "@/lib/operations/libelles";
import { cheminAnnonce } from "@/lib/annonces/types";
import { cheminFiche } from "@/lib/operations/types";
import {
  LIBELLE_APPLICATION,
  LIBELLE_CONNEXION,
  LIBELLE_METHODE,
  LIBELLE_ROLE,
  LIBELLE_ROLE_NOTE,
  LIBELLE_STATUT_KYC,
  LIBELLE_STATUT_ROLE,
  LIBELLE_TYPE_COMPTE,
  etatCompte,
  type AvisCompte,
  type ConditionsCompte,
  type FicheCompte as Fiche,
} from "@/lib/utilisateurs/types";
import { SignalementsLus } from "@/components/signalements/BlocSignalements";
import { SupportLu } from "@/components/support/FilSupport";
import type { FilSupportLu } from "@/lib/support/types";
import type { SignalementsCible } from "@/lib/signalements/types";
import { noteDite } from "./ListeComptes";
import { DemandesVerification } from "./DemandesVerification";
import { GestesVerification } from "./GestesVerification";
import { SanctionsCompte } from "./SanctionsCompte";

const DOCUMENT: Record<string, string> = {
  passport: "passeport",
  id_card: "carte d’identité",
  driving_license: "permis de conduire",
};
const RELAIS: Record<string, string> = { pending: "En attente", verified: "Vérifié", rejected: "Refusé" };
const libelle = (table: Record<string, string>, code: string) => table[code] ?? code;
const pseudo = (p: string | null) => (p ? `@${p}` : "(compte effacé)");

/** Une référence d'achat : elle ouvre la fiche de l'opération si l'équipier lit l'activité. */
function Achat({ reference, lien }: { reference: string | null; lien: boolean }) {
  if (!reference) return <span className="text-muted-foreground">—</span>;
  if (!lien) return <span className="tabular-nums">{reference}</span>;
  return (
    <Link href={cheminFiche(reference)} className="font-medium tabular-nums text-h2h-primary hover:underline">
      {reference}
    </Link>
  );
}

function Avis({ avis, sens }: { avis: AvisCompte[]; sens: "recus" | "donnes" }) {
  if (avis.length === 0) return <Aucun>{sens === "recus" ? "Aucun avis reçu." : "Aucun avis donné."}</Aucun>;
  return (
    <ul className="grid gap-2">
      {avis.map((a) => (
        <li key={a.id} className="grid gap-0.5 rounded-lg border p-3">
          <span className="flex flex-wrap items-center gap-2 text-legende text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Star className="size-3.5" aria-hidden />
              {a.note} / 5
            </span>
            {sens === "recus" ? `par ${pseudo(a.avec)}, comme ${LIBELLE_ROLE_NOTE[a.role]}` : `à ${pseudo(a.avec)}, ${LIBELLE_ROLE_NOTE[a.role]}`}
            {" · "}
            {jour(a.le)}
          </span>
          {a.commentaire && <span className="text-corps">« {a.commentaire} »</span>}
        </li>
      ))}
    </ul>
  );
}

/**
 * La fiche d'un compte (§8) : l'identifiant permanent et le pseudonyme,
 * l'identité et les coordonnées selon les droits, le statut et les
 * vérifications, les annonces, transactions et missions, les avis, les
 * signalements, les documents acceptés, le compte de paiement, les mandats.
 *
 * 🔴 L'IDENTITÉ ET LES COORDONNÉES SONT MASQUÉES. Elles se révèlent une à la
 * fois, avec un motif, et la base inscrit chaque révélation au journal. La
 * fiche elle-même ne porte que le pseudonyme.
 *
 * 🔴 SES SANCTIONS ET SES GESTES : avertir, restreindre, suspendre, lever,
 * examiner un recours — ceux que la base permet à l'équipier qui lit, avec la
 * raison de ceux qu'elle ne permet pas.
 *
 * 🔴 SES SIGNALEMENTS se lisent à part (`bo_signalements_cible`) : chacun, son
 * examen, son dossier « À traiter » ; qui a signalé, seulement pour qui peut
 * examiner. Leur lecture échouée se dit, et ne cache pas la fiche.
 *
 * 🔴 SON FIL AVEC LE SUPPORT aussi (`bo_support_lire`) : l'équipe y écrit au nom de
 * HandtoHand ; l'équipier qui écrit n'est lu que d'ici et du journal.
 */
/**
 * Les conditions générales et la politique de confidentialité : quelle version
 * le compte a acceptée, quand, depuis quelle application — et ce qui lui reste.
 * Tant que rien n'est publié, la fiche le dit au lieu d'un tableau vide.
 */
function Conditions({ c }: { c: ConditionsCompte }) {
  if (!c.publiees) {
    return (
      <p className="text-legende text-muted-foreground">
        Conditions générales : aucun texte n’est encore publié dans le registre des versions. Rien n’est donc demandé aux
        personnes, ni accepté.
      </p>
    );
  }
  return (
    <div className="grid gap-2">
      {c.acceptations.length === 0 ? (
        <Aucun>Aucun texte accepté.</Aucun>
      ) : (
        <Tableau entetes={["Texte", "Version", "Acceptée le", "Depuis", "Acceptation"]} largeur={640}>
          {c.acceptations.map((a) => (
            <tr key={`${a.code}-${a.version}`}>
              <td className="font-medium">{a.titre}</td>
              <td className="whitespace-nowrap">
                {a.version}{" "}
                {a.en_vigueur ? (
                  <StatutPastille ton="actif">En vigueur</StatutPastille>
                ) : (
                  <StatutPastille ton="muet">Remplacée</StatutPastille>
                )}
              </td>
              <td className="whitespace-nowrap tabular-nums">{dateHeure(a.accepte_le)}</td>
              <td>{LIBELLE_APPLICATION[a.application]}</td>
              <td>{a.contexte === "premiere" ? "Première acceptation" : "Nouvelle version"}</td>
            </tr>
          ))}
        </Tableau>
      )}
      <p className="text-legende text-muted-foreground">
        {c.a_accepter.length === 0
          ? "Rien ne reste à accepter dans HandtoHand."
          : `Reste à accepter dans HandtoHand : ${c.a_accepter.map((x) => `${x.titre} (version ${x.version})`).join(", ")}. L’application le demandera à la prochaine ouverture.`}
      </p>
    </div>
  );
}

export function FicheCompte({
  f,
  signalements,
  support,
  peutReveler,
  peutOuvrirFiche,
  peutOuvrirAnnonce = false,
}: {
  f: Fiche;
  /** Les signalements reçus et leur examen (`bo_signalements_cible`) — nuls : leur lecture a échoué. */
  signalements: SignalementsCible | null;
  /** Son fil avec le support (`bo_support_lire`) — nul : sa lecture a échoué. */
  support: FilSupportLu | null;
  /** `donnees.reveler` — et la base refuse de toute façon son propre compte. */
  peutReveler: boolean;
  /** `activite.lire` : une référence d'achat ouvre la fiche de l'opération. */
  peutOuvrirFiche: boolean;
  /** `annonces.lire` : une annonce du compte ouvre sa fiche. */
  peutOuvrirAnnonce?: boolean;
}) {
  const c = f.compte;
  const v = f.verifications;
  const efface = c.efface_le !== null;
  const attente = f.roles.filter((r) => r.statut.startsWith("pending_")).length;
  const etat = etatCompte(f);

  return (
    <div className="grid gap-4">
      {/* ── Qui, et où en est le compte ── */}
      <section className="grid gap-3 rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-h2 font-semibold">{c.pseudo ? `@${c.pseudo}` : "Sans pseudonyme"}</h2>
          <StatutPastille ton={etat.ton}>{etat.libelle}</StatutPastille>
          <StatutPastille ton="neutre">{LIBELLE_TYPE_COMPTE[c.type_compte]}</StatutPastille>
          {c.vitrine && <StatutPastille ton="neutre">Vitrine</StatutPastille>}
          {c.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
        </div>
        <Champs
          colonnes={4}
          items={[
            ["Identifiant permanent", <Reference key="id" valeur={c.id} />],
            ["Inscrit le", dateHeure(c.inscrit_le)],
            ["Ville", [c.ville, c.region].filter(Boolean).join(", ")],
            ["Connexion", c.connexion ? libelle(LIBELLE_CONNEXION, c.connexion) : null],
            ["Note", noteDite(c.note, c.avis)],
            ["Litiges ouverts", `${f.litiges.ouverts} sur ${f.litiges.total}`],
            ["Signalements reçus", String(f.signalements.recus_total)],
            ["Demandes de rôle en attente", String(attente)],
          ]}
        />
        {efface && (
          <p className="text-legende text-muted-foreground">
            Effacé le {dateHeure(c.efface_le)} : le nom, l’e-mail, le téléphone et les adresses ont été supprimés avec le
            compte. Ses transactions et ses avis restent, sous un pseudonyme neutre.
          </p>
        )}
      </section>

      {/* ── Les sanctions : ce qui est arrêté, et les gestes de l'équipe ── */}
      <Bloc titre="Sanctions">
        <SanctionsCompte profil={c.id} pseudo={c.pseudo} s={f.sanctions} />
      </Bloc>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* ── L'identité et les coordonnées, masquées ── */}
        <Bloc titre="Identité et coordonnées">
          <CadreConsultations objet={c.id} table="profiles" peutReveler={peutReveler && !f.conflit}>
            <Champs
              colonnes={2}
              items={[
                ["Nom", <DonneeMasquee key="nom" champ="compte.nom" />],
                ["E-mail", <DonneeMasquee key="email" champ="compte.email" />],
                ["Téléphone", <DonneeMasquee key="tel" champ="compte.telephone" />],
                ["Identité vérifiée", <DonneeMasquee key="identite" champ="compte.identite_verifiee" />],
                ["Adresses enregistrées", <DonneeMasquee key="adresses" champ="compte.adresses" />],
              ]}
            />
          </CadreConsultations>
          <p className="text-legende text-muted-foreground">
            {f.conflit
              ? "Ce compte est le vôtre : ses données sont réservées au reste de l’équipe."
              : "Chaque donnée se révèle une à la fois, pour un motif ; la consultation est inscrite au journal d’audit."}
          </p>
        </Bloc>

        {/* ── Le statut et les vérifications ── */}
        <Bloc titre="Statut et vérifications">
          <Champs
            colonnes={2}
            items={[
              [
                "Identité",
                v.identite.verifiee ? (
                  <span>
                    Vérifiée par {v.identite.methode ? LIBELLE_METHODE[v.identite.methode] : "Stripe"}
                    {v.identite.type_document ? ` (${libelle(DOCUMENT, v.identite.type_document)})` : ""}
                    {v.identite.verifiee_le ? `, le ${jour(v.identite.verifiee_le)}` : ""}
                    {v.identite.mode_test ? " — en mode test" : ""}
                  </span>
                ) : (
                  "Non vérifiée"
                ),
              ],
              ["Vendeur professionnel vérifié", ouiNon(v.professionnel_verifie)],
              [
                "Documents du cotransporteur",
                v.documents_cotransporteur === null
                  ? "Sans objet"
                  : v.documents_cotransporteur
                    ? "Vérifiés — rôle de cotransporteur actif"
                    : "Non vérifiés — rôle de cotransporteur pas actif",
              ],
              ["Terme réservé autorisé dans le pseudonyme", ouiNon(v.pseudo_autorise)],
            ]}
          />
          <GestesVerification profil={c.id} v={v} />
          <DemandesVerification profil={c.id} v={v} />
          {v.demandes.length > 0 && (
            <Tableau entetes={["Vérification demandée", "État", "Mode", "Échecs", "Issue"]} largeur={560}>
              {v.demandes.map((d, i) => (
                <tr key={`${d.soumise_le}-${i}`}>
                  <td className="whitespace-nowrap tabular-nums">{dateHeure(d.soumise_le)}</td>
                  <td>{libelle(LIBELLE_STATUT_KYC, d.statut)}</td>
                  <td>{d.mode_test ? "Test" : "Réel"}</td>
                  <td className="tabular-nums">{d.echecs}</td>
                  <td className="text-muted-foreground">
                    {d.verifiee_le ? `vérifiée le ${jour(d.verifiee_le)}` : (d.motif_rejet ?? d.statut_stripe ?? "—")}
                  </td>
                </tr>
              ))}
            </Tableau>
          )}
        </Bloc>

        {/* ── Les rôles ── */}
        <Bloc titre="Rôles">
          {f.roles.length === 0 ? (
            <Aucun>Ce compte achète et publie sans rôle particulier.</Aucun>
          ) : (
            <Tableau entetes={["Rôle", "État", "Demandé le", "Décidé le", "Motif de la décision"]} largeur={560}>
              {f.roles.map((r) => (
                <tr key={r.role}>
                  <td className="font-medium">{libelle(LIBELLE_ROLE, r.role)}</td>
                  <td>{libelle(LIBELLE_STATUT_ROLE, r.statut)}</td>
                  <td className="whitespace-nowrap tabular-nums">{jour(r.demande_le)}</td>
                  <td className="whitespace-nowrap tabular-nums">{jour(r.decide_le ?? r.active_le)}</td>
                  <td className="text-muted-foreground">{r.motif ?? "—"}</td>
                </tr>
              ))}
            </Tableau>
          )}
          {f.point_relais && (
            <Champs
              colonnes={2}
              items={[
                ["Point relais", f.point_relais.nom],
                ["État", `${libelle(RELAIS, f.point_relais.statut)}${f.point_relais.en_pause ? " · en pause" : ""}`],
                ["Ville", f.point_relais.ville],
                ["Vérifié le", f.point_relais.verifie_le ? jour(f.point_relais.verifie_le) : null],
              ]}
            />
          )}
        </Bloc>

        {/* ── Le compte de paiement ── */}
        <Bloc titre="Compte de paiement">
          <Champs
            colonnes={2}
            items={[
              [
                "Compte de versement",
                f.paiement.compte_versement === "absent"
                  ? "Aucun"
                  : `${f.paiement.compte_versement === "payable" ? "Payable" : "Incomplet"}${f.paiement.mode_test ? " — en mode test" : ""}`,
              ],
              ["Payable depuis", f.paiement.payable_depuis ? jour(f.paiement.payable_depuis) : null],
              ["Encaissements ouverts", ouiNon(f.paiement.encaissements)],
              ["Carte enregistrée", ouiNon(f.paiement.carte_enregistree)],
              ["Référence chez Stripe", f.paiement.reference ? <Reference key="ref" valeur={f.paiement.reference} /> : null],
            ]}
          />
          <p className="text-legende text-muted-foreground">
            Aucune coordonnée bancaire n’est gardée par HandtoHand : Stripe les tient.
          </p>
        </Bloc>
      </div>

      {/* ── Les documents, mandats et engagements ── */}
      <Bloc titre="Documents acceptés, mandats et engagements">
        {f.documents.conventions.length === 0 ? (
          <Aucun>Aucune convention signée.</Aucun>
        ) : (
          <Tableau entetes={["Convention", "Version", "Acceptée le", "Mandat de prélèvement"]} largeur={560}>
            {f.documents.conventions.map((k) => (
              <tr key={`${k.role}-${k.acceptee_le}`}>
                <td className="font-medium">{libelle(LIBELLE_ROLE, k.role)}</td>
                <td>{k.version}</td>
                <td className="whitespace-nowrap tabular-nums">{dateHeure(k.acceptee_le)}</td>
                <td>{k.mandat_debit ? "Autorisé" : "Non autorisé"}</td>
              </tr>
            ))}
          </Tableau>
        )}
        <Conditions c={f.documents.conditions_generales} />
      </Bloc>

      {/* ── L'activité ── */}
      <Bloc titre="Annonces, transactions et missions">
        <Champs
          colonnes={4}
          items={[
            [
              "Annonces",
              `${f.activite.annonces.publiees} publiées · ${f.activite.annonces.en_ligne} en ligne · ${f.activite.annonces.vendues} vendues`,
            ],
            ["Recherches « Je cherche »", String(f.activite.recherches)],
            ["Achats", `${f.activite.achats.total} · ${f.activite.achats.en_cours} en cours · ${f.activite.achats.annules} annulés`],
            ["Ventes", `${f.activite.ventes.total} · ${f.activite.ventes.en_cours} en cours · ${f.activite.ventes.annulees} annulées`],
            ["Co-livraisons", `${f.activite.colivraisons.total} · ${f.activite.colivraisons.realisees} réalisées`],
            ["Trajets publiés", String(f.activite.trajets)],
            [
              "Dernière ouverture",
              f.activite.ouvertures.length === 0 ? null : (
                <ul key="ouvertures" className="grid gap-0.5">
                  {f.activite.ouvertures.map((o) => (
                    <li key={o.application}>
                      {LIBELLE_APPLICATION[o.application]} : {dateHeure(o.le)}
                    </li>
                  ))}
                </ul>
              ),
            ],
          ]}
        />

        <h3 className="text-corps font-semibold">Dernières transactions</h3>
        {f.transactions.length === 0 ? (
          <Aucun>Aucun achat, aucune vente.</Aucun>
        ) : (
          <Tableau entetes={["Référence", "Bien", "En tant que", "Avec", "État", "Total", "Le"]}>
            {f.transactions.map((t) => (
              <tr key={t.reference}>
                <td className="whitespace-nowrap">
                  <Achat reference={t.reference} lien={peutOuvrirFiche} />
                </td>
                <td>{t.titre ?? "—"}</td>
                <td>{t.role === "acheteur" ? "Acheteur" : "Vendeur"}</td>
                <td>{pseudo(t.avec)}</td>
                <td>{libelle(LIBELLE_STATUT_COMMANDE, t.statut)}</td>
                <td className="whitespace-nowrap text-right">
                  <Montant cents={t.total_cents} />
                </td>
                <td className="whitespace-nowrap tabular-nums">{dateHeure(t.le)}</td>
              </tr>
            ))}
          </Tableau>
        )}

        <h3 className="text-corps font-semibold">Dernières annonces</h3>
        {f.annonces.length === 0 ? (
          <Aucun>Aucune annonce publiée.</Aucun>
        ) : (
          <Tableau entetes={["Annonce", "Type", "État", "Prix", "Publiée le"]} largeur={560}>
            {f.annonces.map((a) => (
              <tr key={a.id}>
                <td className="font-medium">
                  {peutOuvrirAnnonce ? (
                    <Link href={cheminAnnonce(a.id)} className="text-h2h-primary hover:underline">
                      {a.titre}
                    </Link>
                  ) : (
                    a.titre
                  )}
                </td>
                <td>{a.mode === "exchange" ? "Échange" : libelle(LIBELLE_TYPE_ANNONCE, a.type)}</td>
                <td>{libelle(LIBELLE_ANNONCE, a.statut)}</td>
                <td className="whitespace-nowrap text-right">
                  <Montant cents={a.prix_cents} />
                </td>
                <td className="whitespace-nowrap tabular-nums">{jour(a.publiee_le)}</td>
              </tr>
            ))}
          </Tableau>
        )}

        {f.colivraisons.length > 0 && (
          <>
            <h3 className="text-corps font-semibold">Dernières co-livraisons</h3>
            <Tableau entetes={["Achat", "État", "Le"]} largeur={420}>
              {f.colivraisons.map((m, i) => (
                <tr key={`${m.reference ?? "sans"}-${i}`}>
                  <td className="whitespace-nowrap">
                    <Achat reference={m.reference} lien={peutOuvrirFiche} />
                  </td>
                  <td>
                    {libelle(LIBELLE_MISSION, m.statut)}
                    {m.retour ? " · retour au vendeur" : ""}
                  </td>
                  <td className="whitespace-nowrap tabular-nums">{dateHeure(m.le)}</td>
                </tr>
              ))}
            </Tableau>
          </>
        )}
      </Bloc>

      <div className="grid gap-4 xl:grid-cols-2">
        {/* ── Les avis ── */}
        <Bloc titre="Avis reçus" aside={<span className="text-legende text-muted-foreground">{noteDite(c.note, c.avis)}</span>}>
          <Avis avis={f.avis.recus} sens="recus" />
        </Bloc>
        <Bloc titre="Avis donnés">
          <Avis avis={f.avis.donnes} sens="donnes" />
        </Bloc>
      </div>

      {/* ── Les signalements ── */}
      <Bloc
        titre="Signalements"
        aside={
          <Link href="/litiges-et-signalements" className="text-legende font-semibold text-h2h-primary hover:underline">
            Litiges et signalements
          </Link>
        }
      >
        <Champs
          colonnes={4}
          items={[
            ["Signalements reçus", String(f.signalements.recus_total)],
            ["Annonces signalées", String(f.signalements.annonces)],
            ["Avis signalés", String(f.signalements.avis)],
            ["Personnes qui l’ont bloqué", String(f.signalements.blocages)],
            ["Signalements faits par ce compte", String(f.signalements.faits)],
          ]}
        />
        <SignalementsLus genre="utilisateur" cible={c.id} s={signalements} />
      </Bloc>

      {/* ── Le fil avec le support ── */}
      <Bloc titre="Support">
        <SupportLu profil={c.id} f={support} />
      </Bloc>
    </div>
  );
}

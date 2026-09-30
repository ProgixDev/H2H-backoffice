import Link from "next/link";
import { ExaminerRecoursAnnonce, GestesModeration } from "@/components/annonces/GestesModeration";
import { CarteRecours } from "@/components/bo/CarteRecours";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Aucun, Bloc, Champs, Montant, Reference, Tableau, ouiNon } from "@/components/operations/commun";
import { dateHeure, jour } from "@/lib/dates";
import {
  LIBELLE_ANNONCE,
  LIBELLE_DEMANDE_ACCES,
  LIBELLE_ETAT_ARTICLE,
  LIBELLE_FLASH,
  LIBELLE_MODE as LIBELLE_LIVRAISON_COMMANDE,
  LIBELLE_SELECTION,
  LIBELLE_STATUT_COMMANDE,
  LIBELLE_TYPE_ANNONCE,
} from "@/lib/operations/libelles";
import { cheminFiche } from "@/lib/operations/types";
import {
  LIBELLE_ACCES,
  LIBELLE_DECISION_MODERATION,
  LIBELLE_ECHANGE,
  LIBELLE_ETAT_MODERATION,
  LIBELLE_LIVRAISON,
  LIBELLE_MODE,
  LIBELLE_OPTION_ANNONCE,
  LIBELLE_OPTION_VISIBILITE,
  LIBELLE_ORIGINE_MODIFICATION,
  LIBELLE_STATUT_RECHERCHE,
  LIBELLE_URGENCE,
  cheminAnnonce,
  type Auteur,
  type Categorie,
  type Droits,
  type Fiche,
  type FicheAnnonce,
  type FicheRecherche,
  type ModerationFiche,
  type NatureAnnonce,
  type Remontee,
} from "@/lib/annonces/types";
import { LIBELLE_PRIORITE_SIGNALEMENT, cheminCompte, type RecoursLu } from "@/lib/utilisateurs/types";

const libelle = (table: Record<string, string>, code: string | null | undefined) =>
  code ? (table[code] ?? code) : null;

/** Les champs qu'une modification touche, dans les mots de l'équipe ; un champ inconnu garde son nom. */
const CHAMP_MODIFIE: Record<string, string> = {
  title: "Titre",
  description: "Description",
  price_cents: "Prix",
  original_price_cents: "Prix d’origine",
  category_id: "Catégorie",
  condition: "État",
  specs: "Attributs",
  parcel_format: "Format du colis",
  free_shipping: "Livraison offerte",
  negotiable: "Prix négociable",
  accessories_included: "Accessoires",
  declared_defects: "Défauts déclarés",
  tags: "Étiquettes",
  wanted_items: "Échange contre",
  stock: "Stock",
  city: "Ville",
  seller_service_share: "Part des frais de service",
  seller_delivery_share: "Part des frais de livraison",
};

/** Une valeur d'attribut telle que le vendeur l'a saisie : texte, nombre, liste ou oui/non. */
function valeurAttribut(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (Array.isArray(v)) return v.map(valeurAttribut).join(", ");
  if (typeof v === "boolean") return v ? "Oui" : "Non";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function AuteurBloc({ a, droits, role }: { a: Auteur; droits: Droits; role: string }) {
  const nom = a.pseudo ? `@${a.pseudo}` : "(compte effacé)";
  return (
    <Bloc titre={role}>
      <div className="flex flex-wrap items-center gap-2">
        {droits.compte ? (
          <Link href={cheminCompte(a.id)} className="font-semibold text-h2h-primary hover:underline">
            {nom}
          </Link>
        ) : (
          <span className="font-semibold">{nom}</span>
        )}
        {a.suspendu && <StatutPastille ton="erreur">Compte suspendu</StatutPastille>}
        {!a.suspendu && a.publication_restreinte && <StatutPastille ton="attention">Publication restreinte</StatutPastille>}
        {a.efface && <StatutPastille ton="muet">Compte effacé</StatutPastille>}
        {a.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
      </div>
      <Champs
        colonnes={3}
        items={[
          ["Ville", a.ville],
          ["Type de compte", a.type_compte === "ecommerce" ? "Professionnel" : "Particulier"],
          ["Note", a.note === null ? `Pas encore noté` : `${a.note} / 5 · ${a.avis} avis`],
        ]}
      />
    </Bloc>
  );
}

function Remontees({ remontees }: { remontees: Remontee[] }) {
  if (remontees.length === 0) return <Aucun>Aucune remontée achetée.</Aucun>;
  return (
    <Tableau entetes={["Option", "Depuis", "Jusqu’au", "Prix", "État"]}>
      {remontees.map((r, i) => (
        <tr key={`${r.option}:${r.depuis}:${i}`}>
          <td className="font-medium">{LIBELLE_OPTION_VISIBILITE[r.option] ?? r.option}</td>
          <td className="whitespace-nowrap tabular-nums">{dateHeure(r.depuis)}</td>
          <td className="whitespace-nowrap tabular-nums">{r.jusqu_a ? dateHeure(r.jusqu_a) : "—"}</td>
          <td className="whitespace-nowrap">
            <Montant cents={r.prix_cents} />
          </td>
          <td>{r.active ? <StatutPastille ton="actif">En cours</StatutPastille> : <StatutPastille ton="muet">Terminée</StatutPastille>}</td>
        </tr>
      ))}
    </Tableau>
  );
}

const categorieDite = (c: Categorie) => (c ? (c.libelle ?? c.id) : null);

/** Ce qu'un recours conteste, dit : « Contre : le masquage du 30/09/2026 10:00 ». */
const DECISION_CONTESTEE: Record<string, string> = { masquer: "le masquage", retirer: "le retrait" };

/** L'état posé par l'équipe, en pastille : masquée, c'est à surveiller ; retirée, une issue défavorable. */
function PastilleModeration({ m }: { m: ModerationFiche }) {
  if (!m.etat) return null;
  return (
    <StatutPastille ton={m.etat === "retiree" ? "erreur" : "attention"}>
      {LIBELLE_ETAT_MODERATION[m.etat]} par l’équipe
    </StatutPastille>
  );
}

/**
 * La modération (R9.2) : où elle en est, la correction qui attend l'auteur,
 * l'historique des décisions — le message qu'il a lu et le motif que l'équipe
 * garde —, et les gestes que la base permet à l'équipier qui lit.
 */
function BlocModeration({ id, nature, m }: { id: string; nature: NatureAnnonce; m: ModerationFiche }) {
  // Les recours de l'auteur : ceux qui attendent d'abord, puis les plus récents.
  const recours = m.historique
    .filter((h): h is typeof h & { recours: RecoursLu } => h.recours !== null)
    .sort((a, b) => Number(b.recours.statut === "a_examiner") - Number(a.recours.statut === "a_examiner"));
  return (
    <Bloc titre="Modération">
      <p className="text-corps">
        {m.etat === "masquee"
          ? "Masquée : personne d’autre que son auteur ne la voit, et rien ne commence plus autour d’elle ; ce qui était engagé va au bout."
          : m.etat === "retiree"
            ? "Retirée pour de bon : seul un recours accepté la rendrait, et elle ne se modifie plus."
            : "Aucune mesure en cours : elle se montre selon son statut."}
      </p>
      {m.correction && (
        <div className="grid gap-1 rounded-lg border p-3">
          <span className="flex flex-wrap items-center gap-2">
            <StatutPastille ton="attention">Correction demandée</StatutPastille>
            <span className="font-semibold">{m.correction.libelle}</span>
          </span>
          <p className="whitespace-pre-line text-corps">« {m.correction.message} »</p>
          <span className="text-legende text-muted-foreground">
            Demandée le {dateHeure(m.correction.le)}
            {m.correction.par ? ` par ${m.correction.par}` : ""} · la modification que fera l’auteur ne lui sera pas facturée.
          </span>
        </div>
      )}
      <GestesModeration id={id} nature={nature} possibles={m.possibles} />
      {m.historique.length > 0 && (
        <Tableau entetes={["Le", "Décision", "Message à l’auteur", "Motif interne", "Par"]}>
          {m.historique.map((h) => (
            <tr key={h.id}>
              <td className="whitespace-nowrap tabular-nums">{dateHeure(h.le)}</td>
              <td>
                {LIBELLE_DECISION_MODERATION[h.decision] ?? h.decision}
                {h.correction_libelle ? ` · ${h.correction_libelle}` : ""}
                {h.annulee && <span className="block text-legende text-h2h-success">Annulée sur recours</span>}
                {h.decision === "demander_correction" && (
                  <span className="block text-legende text-muted-foreground">
                    {h.corrigee_le
                      ? `Corrigée le ${dateHeure(h.corrigee_le)}`
                      : m.correction?.id === h.id
                        ? "Attend l’auteur"
                        : "Sans suite"}
                  </span>
                )}
              </td>
              <td className="whitespace-pre-line">{h.message ?? "—"}</td>
              <td className="text-muted-foreground">{h.motif}</td>
              <td>{h.par ?? "—"}</td>
            </tr>
          ))}
        </Tableau>
      )}
      {recours.length > 0 && (
        <section className="grid gap-2" aria-label="Recours">
          <h3 className="text-corps font-semibold">
            Recours{m.recours_a_examiner > 0 ? ` · ${m.recours_a_examiner} à examiner` : ""}
          </h3>
          <ul className="grid gap-2">
            {recours.map((h) => (
              <CarteRecours
                key={h.recours.id}
                r={h.recours}
                contre={`${DECISION_CONTESTEE[h.decision] ?? h.decision} du ${dateHeure(h.le)}`}
                geste={<ExaminerRecoursAnnonce recours={h.recours.id} annonce={id} reference={h.recours.reference} />}
              />
            ))}
          </ul>
        </section>
      )}
      <p className="text-legende text-muted-foreground">
        Autoriser ou refuser une publication : ce geste arrive avec la suite de cette phase.
      </p>
    </Bloc>
  );
}

function Annonce({ f }: { f: FicheAnnonce }) {
  const a = f.annonce;
  const e = f.eligibilite;
  const typeDit = a.mode === "exchange" ? LIBELLE_MODE.exchange : (LIBELLE_TYPE_ANNONCE[a.type] ?? a.type);
  return (
    <div className="grid gap-4">
      {/* ── Ce qu'elle est, et où elle en est ── */}
      <section className="grid gap-3 rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-h2 font-semibold">{a.titre}</h2>
          <StatutPastille ton={a.statut === "active" ? "actif" : a.statut === "sold" ? "succes" : "neutre"}>
            {LIBELLE_ANNONCE[a.statut] ?? a.statut}
          </StatutPastille>
          <StatutPastille ton="neutre">{typeDit}</StatutPastille>
          {a.acces === "controlled" && <StatutPastille ton="neutre">{LIBELLE_ACCES.controlled}</StatutPastille>}
          <PastilleModeration m={f.moderation} />
          {f.visibilite.mise_en_avant && <StatutPastille ton="marque">Mise en avant</StatutPastille>}
          {f.auteur.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
        </div>
        <Champs
          colonnes={4}
          items={[
            ["Identifiant", <Reference key="id" valeur={a.id} />],
            ["Prix", <Montant key="prix" cents={a.prix_cents} fort />],
            ["Prix d’origine", a.prix_origine_cents ? <Montant key="origine" cents={a.prix_origine_cents} /> : null],
            ["Prix négociable", ouiNon(a.negociable)],
            ["Catégorie", categorieDite(f.categorie)],
            ["État", libelle(LIBELLE_ETAT_ARTICLE, a.etat)],
            ["Ville", [a.ville, a.region].filter(Boolean).join(", ") || null],
            ["Stock", String(a.stock)],
            ["Publiée le", a.publiee_le ? dateHeure(a.publiee_le) : "Jamais publiée"],
            ["Créée le", dateHeure(a.cree_le)],
            ["Échéance", a.expire_le ? dateHeure(a.expire_le) : null],
            ["Vues · favoris", `${a.vues} · ${a.favoris}`],
          ]}
        />
        <p className="text-legende text-muted-foreground">
          Le statut de l’annonce dit si elle se montre ; l’état de chaque transaction se lit à part, plus bas (R9.3).
        </p>
      </section>

      <BlocModeration id={a.id} nature="annonce" m={f.moderation} />

      {/* ── Ce que l'acheteur voit ── */}
      <Bloc titre="Aperçu">
        {a.photos.length === 0 ? (
          <Aucun>Aucune photo.</Aucun>
        ) : (
          <ul className="flex flex-wrap gap-2" aria-label="Photos">
            {a.photos.map((p) => (
              <li key={`${p.rang}:${p.url}`}>
                <a href={p.url} target="_blank" rel="noreferrer">
                  {/* Les photos d'annonce sont publiques : le seau les sert à tous. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.miniature ?? p.url} alt={`Photo ${p.rang + 1}`} className="size-28 rounded-lg object-cover" />
                </a>
              </li>
            ))}
          </ul>
        )}
        {a.videos > 0 && (
          <p className="text-legende text-muted-foreground">
            {a.videos} vidéo{a.videos > 1 ? "s" : ""}
            {a.video_max_secondes ? `, ${a.video_max_secondes} s au plus` : ""}
          </p>
        )}
        <h3 className="text-corps font-semibold">Description</h3>
        <p className="whitespace-pre-line text-corps">{a.description || "—"}</p>
        {f.attributs.length > 0 && (
          <>
            <h3 className="text-corps font-semibold">Attributs</h3>
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {f.attributs.map((x) => (
                <div key={x.cle} className="grid gap-0.5">
                  <dt className="text-legende text-muted-foreground">
                    {x.libelle ?? `${x.cle} (clé inconnue de la catégorie)`}
                  </dt>
                  <dd className="text-corps">
                    {valeurAttribut(x.valeur)}
                    {x.unite ? ` ${x.unite}` : ""}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
        <Champs
          colonnes={3}
          items={[
            ["Accessoires inclus", ouiNon(a.accessoires)],
            ["Défauts déclarés", a.defauts],
            ["Étiquettes", a.etiquettes.length > 0 ? a.etiquettes.join(", ") : null],
            ...(a.mode === "exchange"
              ? ([["Échange contre", a.echange_contre.length > 0 ? a.echange_contre.join(", ") : null]] as [string, string | null][])
              : []),
          ]}
        />
        {a.recherche_source && (
          <Link href={cheminAnnonce(a.recherche_source)} className="text-legende font-semibold text-h2h-primary hover:underline">
            Publiée en réponse à une recherche « Je cherche »
          </Link>
        )}
      </Bloc>

      <AuteurBloc a={f.auteur} droits={f.droits} role="Vendeur" />

      {/* ── Ce que la base permet ── */}
      <Bloc titre="Paiement et livraison">
        <Champs
          colonnes={2}
          items={[
            ["Paiement par HandtoHand", e.paiement ? "Oui" : "Non : catégorie « contact direct »"],
            ["Livraison", LIBELLE_LIVRAISON[e.livraison]],
            ["Format du colis", e.format],
            ["Livraison offerte par le vendeur", ouiNon(e.livraison_offerte)],
            [
              "Co-livraison H2H Logistic",
              e.colivraison ? "Possible" : `Non proposée (plafond ${Math.round(e.colivraison_plafond_cents / 100)} €, colis expédiable)`,
            ],
            ["Part du vendeur", `${e.part_vendeur_service_pct} % des frais de service · ${e.part_vendeur_livraison_pct} % de la livraison`],
          ]}
        />
      </Bloc>

      {a.acces === "controlled" && (
        <Bloc titre="Accès contrôlé">
          {Object.keys(f.acces.demandes).length === 0 ? (
            <Aucun>Aucune demande d’accès.</Aucun>
          ) : (
            <p className="text-corps">
              {Object.entries(f.acces.demandes)
                .map(([s, n]) => `${n} ${(LIBELLE_DEMANDE_ACCES[s as keyof typeof LIBELLE_DEMANDE_ACCES] ?? s).toLowerCase()}`)
                .join(" · ")}
            </p>
          )}
        </Bloc>
      )}

      {/* ── R9.3 : les transactions, chacune avec son état ── */}
      <Bloc titre="Transactions">
        {f.commandes.length === 0 ? (
          <Aucun>Aucune commande sur cette annonce.</Aucun>
        ) : (
          <Tableau entetes={["Référence", "État de la transaction", "Acheteur", "Livraison", "Total", "Le"]}>
            {f.commandes.map((o) => (
              <tr key={o.reference}>
                <td className="whitespace-nowrap">
                  {f.droits.operations ? (
                    <Link href={cheminFiche(o.reference)} className="font-medium tabular-nums text-h2h-primary hover:underline">
                      {o.reference}
                    </Link>
                  ) : (
                    <span className="tabular-nums">{o.reference}</span>
                  )}
                </td>
                <td>{LIBELLE_STATUT_COMMANDE[o.statut] ?? o.statut}</td>
                <td>{o.acheteur ? `@${o.acheteur}` : "(compte effacé)"}</td>
                <td>{libelle(LIBELLE_LIVRAISON_COMMANDE, o.livraison) ?? "—"}</td>
                <td className="whitespace-nowrap text-right">
                  <Montant cents={o.total_cents} />
                </td>
                <td className="whitespace-nowrap tabular-nums">{dateHeure(o.le)}</td>
              </tr>
            ))}
          </Tableau>
        )}
        {f.flash && (
          <p className="text-corps">
            Offre Flash <span className="tabular-nums">{f.flash.reference}</span> :{" "}
            {LIBELLE_FLASH[f.flash.statut] ?? f.flash.statut}
            {f.flash.mode_selection ? ` · ${LIBELLE_SELECTION[f.flash.mode_selection]}` : ""} · fin des offres le{" "}
            {dateHeure(f.flash.fin_offres)}
          </p>
        )}
        {f.lives.length > 0 && (
          <ul className="grid gap-1 text-corps">
            {f.lives.map((l) => (
              <li key={l.reference}>
                Live <span className="tabular-nums">{l.reference}</span> « {l.titre} » · {l.statut}
                {l.phase ? ` · phase ${l.phase}` : ""}
                {l.issue ? ` · ${l.issue}` : ""}
              </li>
            ))}
          </ul>
        )}
        {Object.keys(f.echanges).length > 0 && (
          <p className="text-corps">
            Propositions d’échange :{" "}
            {Object.entries(f.echanges)
              .map(([s, n]) => `${n} ${LIBELLE_ECHANGE[s as keyof typeof LIBELLE_ECHANGE] ?? s}`)
              .join(" · ")}
          </p>
        )}
      </Bloc>

      <Bloc titre="Historique des modifications">
        {f.modifications.length === 0 ? (
          <Aucun>Aucune modification depuis la publication.</Aucun>
        ) : (
          <Tableau entetes={["Le", "Par", "Ce qui change", "Frais", "Paiement"]}>
            {f.modifications.map((m, i) => (
              <tr key={`${m.le}:${i}`}>
                <td className="whitespace-nowrap tabular-nums">{dateHeure(m.le)}</td>
                <td>{LIBELLE_ORIGINE_MODIFICATION[m.origine] ?? m.origine}</td>
                <td>
                  {m.genre === "partage_frais"
                    ? "Partage des frais"
                    : m.champs.length === 0
                      ? "Contenu"
                      : m.champs.map((c) => CHAMP_MODIFIE[c] ?? c).join(", ")}
                </td>
                <td className="whitespace-nowrap">{m.frais_cents > 0 ? <Montant cents={m.frais_cents} /> : "Gratuite"}</td>
                <td>{m.paiement ?? (m.frais_cents > 0 ? "—" : "Sans paiement")}</td>
              </tr>
            ))}
          </Tableau>
        )}
      </Bloc>

      <Bloc titre="Visibilité achetée">
        <Remontees remontees={f.visibilite.remontees} />
        {f.visibilite.urgent_jusqu_au && (
          <p className="text-corps">Badge « Urgent » jusqu’au {dateHeure(f.visibilite.urgent_jusqu_au)}</p>
        )}
        {f.visibilite.options.length > 0 && (
          <Tableau entetes={["Option", "Valeur", "Prix", "Achetée le", "Appliquée le"]}>
            {f.visibilite.options.map((o, i) => (
              <tr key={`${o.genre}:${o.achetee_le}:${i}`}>
                <td className="font-medium">{LIBELLE_OPTION_ANNONCE[o.genre] ?? o.genre}</td>
                <td>{o.valeur}</td>
                <td className="whitespace-nowrap">
                  <Montant cents={o.prix_cents} />
                </td>
                <td className="whitespace-nowrap tabular-nums">{dateHeure(o.achetee_le)}</td>
                <td className="whitespace-nowrap tabular-nums">{o.appliquee_le ? dateHeure(o.appliquee_le) : "Pas encore"}</td>
              </tr>
            ))}
          </Tableau>
        )}
      </Bloc>

      <Bloc titre={`Signalements (${f.signalements.total})`}>
        {f.signalements.recents.length === 0 ? (
          <Aucun>Aucun signalement.</Aucun>
        ) : (
          <>
            <ul className="grid gap-2">
              {f.signalements.recents.map((s, i) => (
                <li key={`${s.le}:${i}`} className="grid gap-1 rounded-lg border p-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{s.raison_libelle}</span>
                    <StatutPastille ton={s.priorite === "critique" || s.priorite === "tres_elevee" ? "erreur" : "neutre"}>
                      Priorité {LIBELLE_PRIORITE_SIGNALEMENT[s.priorite].toLowerCase()}
                    </StatutPastille>
                    <span className="text-legende text-muted-foreground">
                      {dateHeure(s.le)} · {s.preuves} pièce{s.preuves > 1 ? "s" : ""}
                    </span>
                  </span>
                  <p className="whitespace-pre-line text-corps">« {s.explication} »</p>
                </li>
              ))}
            </ul>
            <p className="text-legende text-muted-foreground">
              Qui a signalé ne se lit pas ici : le traitement des signalements arrive avec la suite de la phase.
            </p>
          </>
        )}
      </Bloc>
    </div>
  );
}

function Recherche({ f }: { f: FicheRecherche }) {
  const r = f.recherche;
  return (
    <div className="grid gap-4">
      <section className="grid gap-3 rounded-xl border bg-card p-4" style={{ boxShadow: "var(--ombre-carte)" }}>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-h2 font-semibold">{r.titre}</h2>
          <StatutPastille ton="neutre">Recherche « Je cherche »</StatutPastille>
          <StatutPastille ton={r.expiree ? "muet" : r.statut === "trouve" ? "succes" : "actif"}>
            {r.expiree && ["active", "propositions_recues", "en_discussion"].includes(r.statut)
              ? "Expirée"
              : (LIBELLE_STATUT_RECHERCHE[r.statut] ?? r.statut)}
          </StatutPastille>
          <StatutPastille ton={r.urgence === "urgent" ? "attention" : "neutre"}>{LIBELLE_URGENCE[r.urgence]}</StatutPastille>
          <PastilleModeration m={f.moderation} />
          {f.visibilite.mise_en_avant && <StatutPastille ton="marque">Mise en avant</StatutPastille>}
          {f.auteur.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
        </div>
        <Champs
          colonnes={4}
          items={[
            ["Identifiant", <Reference key="id" valeur={r.id} />],
            ["Budget maximum", <Montant key="budget" cents={r.budget_max_cents} fort />],
            ["Catégorie", categorieDite(f.categorie)],
            ["Zones", r.zones.length > 0 ? r.zones.join(", ") : null],
            ["Ville", r.ville],
            ["Livraison souhaitée", r.preferences_livraison.length > 0 ? r.preferences_livraison.join(", ") : null],
            ["Déposée le", dateHeure(r.cree_le)],
            ["Échéance", dateHeure(r.expire_le)],
            ["Vues · favoris", `${r.vues} · ${r.favoris}`],
            ...(r.emploi
              ? ([
                  ["Contrat", r.emploi.contrat],
                  ["Disponibilité", r.emploi.disponibilite],
                ] as [string, string | null][])
              : []),
          ]}
        />
      </section>

      <BlocModeration id={r.id} nature="recherche" m={f.moderation} />

      <Bloc titre="Aperçu">
        {r.photos.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Photos">
            {r.photos.map((u) => (
              <li key={u}>
                {/* Les photos d'une recherche sont publiques : le seau les sert à tous. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="size-28 rounded-lg object-cover" />
              </li>
            ))}
          </ul>
        )}
        <p className="whitespace-pre-line text-corps">{r.description || "—"}</p>
      </Bloc>

      <AuteurBloc a={f.auteur} droits={f.droits} role="Acheteur" />

      <Bloc titre={`Propositions reçues (${f.propositions.length})`}>
        {f.propositions.length === 0 ? (
          <Aucun>Aucune annonce proposée.</Aucun>
        ) : (
          <Tableau entetes={["Le", "Vendeur", "Annonce proposée", "Réponse", "Message"]}>
            {f.propositions.map((p, i) => (
              <tr key={`${p.le}:${i}`}>
                <td className="whitespace-nowrap tabular-nums">{dateHeure(p.le)}</td>
                <td>{p.vendeur ? `@${p.vendeur}` : "(compte effacé)"}</td>
                <td>
                  {p.annonce ? (
                    <Link href={cheminAnnonce(p.annonce.id)} className="font-medium text-h2h-primary hover:underline">
                      {p.annonce.titre}
                    </Link>
                  ) : (
                    "—"
                  )}
                  {p.annonce && (
                    <span className="text-legende text-muted-foreground">
                      {" "}
                      · {LIBELLE_ANNONCE[p.annonce.statut] ?? p.annonce.statut}
                    </span>
                  )}
                </td>
                <td>{p.statut}</td>
                <td className="text-muted-foreground">{p.message ?? "—"}</td>
              </tr>
            ))}
          </Tableau>
        )}
      </Bloc>

      <Bloc titre="Visibilité achetée">
        <Remontees remontees={f.visibilite.remontees} />
        {f.visibilite.urgent_jusqu_au && (
          <p className="text-corps">Badge « Urgent » jusqu’au {jour(f.visibilite.urgent_jusqu_au)}</p>
        )}
      </Bloc>
    </div>
  );
}

/**
 * La fiche d'une annonce ou d'une recherche « Je cherche » (§9) : la base dit
 * laquelle, et ce que l'équipier peut ouvrir d'autre.
 */
export function FicheAnnonceVue({ f }: { f: Fiche }) {
  return f.nature === "annonce" ? <Annonce f={f} /> : <Recherche f={f} />;
}

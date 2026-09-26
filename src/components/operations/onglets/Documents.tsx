import { FileLock2 } from "lucide-react";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { LIBELLE_ATTESTATION, LIBELLE_DECISION_ACHETEUR, LIBELLE_PARTIE, LIBELLE_RECU } from "@/lib/operations/libelles";
import type { Documents } from "@/lib/operations/types";
import { Aucun, Bloc, Champs, Montant, ouiNon, Quand, Reserve, Tableau } from "../commun";
import { BoutonPiece, DonneeMasquee } from "../sensibles";

/**
 * Documents : attestations, reçus, factures, pièces du litige, des incidents et
 * de la remise — leur état, leurs dates, et leur ouverture une à une.
 *
 * 🔴 UNE PIÈCE S'OUVRE PAR SA LIGNE, POUR UN MOTIF : la base délivre un accès de
 * cinq minutes à ce seul fichier et l'inscrit au journal d'audit. Les identités
 * légales de l'attestation se révèlent de même, une à une.
 */
export function OngletDocuments({ d, maintenant }: { d: Documents; maintenant: number }) {
  const photosRemise = d.photos_remise ?? [];
  return (
    <div className="grid gap-4">
      <p className="flex items-start gap-2 rounded-xl border border-dashed p-3 text-legende text-muted-foreground">
        <FileLock2 className="mt-0.5 size-4 shrink-0" />
        Les fichiers (photos, exemplaires, preuves) s’ouvrent un à un : un motif, un accès de cinq minutes à ce seul
        fichier, et une trace au journal d’audit.
      </p>

      <Bloc titre="Attestations de vente">
        {d.attestations === null ? (
          <Reserve quoi="aux attestations" permission="attestations.lire" />
        ) : d.attestations.length === 0 ? (
          <Aucun>Aucune attestation pour cet achat.</Aucun>
        ) : (
          d.attestations.map((a) => (
            <div key={a.id} className="grid gap-3 rounded-lg border p-3">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">Version {a.version}</span>
                <StatutPastille ton={a.statut === "cancelled_or_replaced" ? "muet" : a.statut === "refused_by_buyer" ? "attention" : "marque"}>
                  {LIBELLE_ATTESTATION[a.statut]}
                </StatutPastille>
                {a.reference && <span className="text-legende text-muted-foreground">{a.reference}</span>}
              </span>
              <Champs
                colonnes={4}
                items={[
                  ["Ouverte", <Quand key="c" iso={a.creee_le} maintenant={maintenant} />],
                  ["Données figées", <Quand key="f" iso={a.figee_le} maintenant={maintenant} />],
                  ["Signée par le vendeur", <Quand key="v" iso={a.signee_vendeur_le} maintenant={maintenant} />],
                  ["Décision de l’acheteur", a.decision_acheteur ? LIBELLE_DECISION_ACHETEUR[a.decision_acheteur] : null],
                  ["Signée par l’acheteur", <Quand key="a" iso={a.signee_acheteur_le} maintenant={maintenant} />],
                  [
                    "Exemplaire durable",
                    a.document ? (
                      <span key="d" className="inline-flex items-center gap-2">
                        Disponible
                        <BoutonPiece
                          nature="document_attestation"
                          piece={a.id}
                          libelle={`Attestation, version ${a.version}`}
                          format="document"
                        />
                      </span>
                    ) : (
                      "Pas encore généré"
                    ),
                  ],
                  ["Preuve de signature", a.preuve_signature ? "Disponible" : null],
                  ["Empreinte", a.empreinte ? <code key="e" className="text-legende">{a.empreinte}…</code> : null],
                  ["Vendeur sur l’attestation", <DonneeMasquee key="lv" champ="attestation.vendeur" piece={a.id} />],
                  ["Acheteur sur l’attestation", <DonneeMasquee key="la" champ="attestation.acheteur" piece={a.id} />],
                ]}
              />
              {a.photos.length > 0 && (
                <div className="grid gap-1">
                  <span className="text-legende font-semibold text-muted-foreground">Photos · {a.photos.length}</span>
                  <ul className="flex flex-wrap gap-2">
                    {a.photos.map((p) => (
                      <li key={p.id} className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-legende">
                        <span>
                          {p.emplacement}
                          <span className="text-muted-foreground">
                            {" "}· {p.dans_l_application ? "prise dans l’application" : "importée"}
                            {p.lisible === false ? " · illisible" : ""}
                          </span>
                        </span>
                        <BoutonPiece nature="photo_attestation" piece={p.id} libelle={`Photo « ${p.emplacement} »`} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </Bloc>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bloc titre="Reçus">
          {d.recus === null ? (
            <Reserve quoi="aux justificatifs" permission="transactions.lire" />
          ) : d.recus.length === 0 ? (
            <Aucun>Aucun reçu : il naît de l’encaissement.</Aucun>
          ) : (
            <ul className="grid gap-2">
              {d.recus.map((r) => (
                <li key={r.id} className="grid gap-1 rounded-lg border p-3">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold tabular-nums">{r.numero}</span>
                    <StatutPastille ton={r.statut === "transaction_cancelled" ? "muet" : "neutre"}>{LIBELLE_RECU[r.statut]}</StatutPastille>
                    {r.remplace && <StatutPastille ton="attention">Remplacé</StatutPastille>}
                  </span>
                  <span className="text-legende text-muted-foreground">
                    Total <Montant cents={r.total_cents} /> · prix <Montant cents={r.prix_cents} />
                    {r.protection_cents ? <> · protection <Montant cents={r.protection_cents} /></> : null}
                    {r.livraison_cents ? <> · livraison <Montant cents={r.livraison_cents} /></> : null}
                    {r.colivraison_cents ? <> · co-livraison <Montant cents={r.colivraison_cents} /></> : null}
                    {r.finalise_le && <> · finalisé <Quand iso={r.finalise_le} maintenant={maintenant} /></>}
                    {r.remplace_le_numero ? ` · remplace ${r.remplace_le_numero}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Bloc>

        <Bloc titre="Factures">
          {d.factures === null ? (
            <Reserve quoi="aux justificatifs" permission="transactions.lire" />
          ) : d.factures.length === 0 ? (
            <Aucun>Aucune facture pour cet achat.</Aucun>
          ) : (
            <ul className="grid gap-1 text-corps">
              {d.factures.map((f) => (
                <li key={f.id}>
                  <span className="font-semibold tabular-nums">{f.numero}</span> · <Montant cents={f.total_cents} /> ·{" "}
                  <Quand iso={f.emise_le} maintenant={maintenant} />
                  {f.pdf ? "" : " · PDF pas encore généré"}
                </li>
              ))}
            </ul>
          )}
        </Bloc>
      </div>

      <Bloc titre="Pièces du litige et des incidents">
        {d.preuves === null ? (
          <Reserve quoi="aux pièces des litiges" permission="litiges.lire" />
        ) : d.preuves.length === 0 && (d.pieces_incidents ?? []).length === 0 ? (
          <Aucun>Aucune pièce déposée.</Aucun>
        ) : (
          <>
            {d.preuves.length > 0 && (
              <Tableau entetes={["Déposée par", "Nature", "Précision", "Prise dans l’application", "Prise", "Déposée", ""]}>
                {d.preuves.map((p) => (
                  <tr key={p.id}>
                    <td>{LIBELLE_PARTIE[p.auteur]}</td>
                    <td>{p.nature === "video" ? "Vidéo" : "Photo"}{p.complementaire ? " complémentaire" : ""}</td>
                    <td>{p.precision}</td>
                    <td>{ouiNon(p.dans_l_application)}</td>
                    <td><Quand iso={p.prise_le} maintenant={maintenant} /></td>
                    <td><Quand iso={p.ajoutee_le} maintenant={maintenant} /></td>
                    <td>
                      <BoutonPiece
                        nature="preuve_litige"
                        piece={p.id}
                        libelle={`${p.nature === "video" ? "Vidéo" : "Photo"} de ${LIBELLE_PARTIE[p.auteur].toLowerCase()} — ${p.precision}`}
                        format={p.nature === "video" ? "video" : "image"}
                      />
                    </td>
                  </tr>
                ))}
              </Tableau>
            )}
            {(d.pieces_incidents ?? []).map((x) => (
              <div key={x.incident} className="flex flex-wrap items-center gap-2 text-corps">
                <span>
                  {x.formulaire} : {x.pieces} pièce{x.pieces > 1 ? "s" : ""} ·{" "}
                  <Quand iso={x.declare_le} maintenant={maintenant} />
                </span>
                {Array.from({ length: x.pieces }, (_, i) => (
                  <BoutonPiece
                    key={i}
                    nature="piece_incident"
                    piece={x.incident}
                    rang={i + 1}
                    libelle={`${x.formulaire} — pièce ${i + 1}`}
                  />
                ))}
              </div>
            ))}
          </>
        )}
      </Bloc>

      {photosRemise.length > 0 && (
        <Bloc titre="Photos de la remise">
          <ul className="grid gap-2">
            {photosRemise.map((p) => (
              <li key={`${p.nature}:${p.id}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border p-3 text-corps">
                <span className="font-medium">{p.libelle}</span>
                <span className="text-legende text-muted-foreground">
                  <Quand iso={p.le} maintenant={maintenant} />
                </span>
                <BoutonPiece nature={p.nature} piece={p.id} libelle={p.libelle} />
              </li>
            ))}
          </ul>
        </Bloc>
      )}
    </div>
  );
}

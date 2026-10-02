import Link from "next/link";
import { Star } from "lucide-react";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import { LIBELLE_ROLE_AVIS, LIBELLE_STATUT_AVIS, moyenneDite, type FicheAvis } from "@/lib/avis/types";
import { cheminFiche } from "@/lib/operations/types";
import { cheminCompte } from "@/lib/utilisateurs/types";
import { GesteModerationAvis } from "./GesteModerationAvis";

function Champ({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-legende text-muted-foreground">{titre}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/**
 * La fiche d'un avis (§19, R19.1) : l'auteur et la personne notée, le rôle, la
 * commande, la note et le commentaire, les dates, les signalements, les
 * décisions, l'effet sur la moyenne affichée — et « Retirer » ou « Rétablir »
 * quand la base le permet, sinon pourquoi (R19.2).
 *
 * ⚠️ L'ÉCRAN MONTRE CE QUE LA BASE PERMET (`possibles`), et la base décide encore.
 */
export function FicheAvisVue({
  f,
  lienCompte,
  lienFiche,
}: {
  f: FicheAvis;
  /** `utilisateurs.lire` : l'auteur et la personne notée ouvrent leur fiche. */
  lienCompte: boolean;
  /** `activite.lire` : la commande ouvre sa fiche complète. */
  lienFiche: boolean;
}) {
  const compte = (pseudo: string | null, id: string) =>
    lienCompte ? (
      <Link href={cheminCompte(id)} className="font-medium text-h2h-primary hover:underline">
        {pseudo ?? "Compte effacé"}
      </Link>
    ) : (
      (pseudo ?? "Compte effacé")
    );
  const geste = f.statut === "publie" ? f.possibles.retirer : f.possibles.retablir;

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 rounded-xl border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-h3 font-semibold tabular-nums">{f.ref}</h2>
          <StatutPastille ton={f.statut === "retire" ? "erreur" : "neutre"}>{LIBELLE_STATUT_AVIS[f.statut]}</StatutPastille>
          {f.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
        </div>
        <dl className="grid gap-x-6 gap-y-2 text-corps sm:grid-cols-2 lg:grid-cols-4">
          <Champ titre="Auteur">{compte(f.auteur, f.auteur_id)}</Champ>
          <Champ titre="Personne notée">
            {compte(f.destinataire, f.destinataire_id)} · comme {LIBELLE_ROLE_AVIS[f.role]}
          </Champ>
          <Champ titre="Transaction">
            {f.commande_ref ? (
              lienFiche ? (
                <Link href={cheminFiche(f.commande_ref)} className="font-medium tabular-nums text-h2h-primary hover:underline">
                  {f.commande_ref}
                </Link>
              ) : (
                <span className="tabular-nums">{f.commande_ref}</span>
              )
            ) : f.mission_id ? (
              "Une mission H2H Logistic"
            ) : (
              "—"
            )}
          </Champ>
          <Champ titre="Déposé · publié">
            <span className="tabular-nums">{dateHeure(f.depose_le)}</span>
            {f.retire_le && (
              <span className="block text-legende text-muted-foreground tabular-nums">retiré le {dateHeure(f.retire_le)}</span>
            )}
          </Champ>
        </dl>
        <div className="grid gap-1 rounded-lg border p-3">
          <span className="inline-flex items-center gap-1 font-semibold">
            <Star className="size-4" aria-hidden />
            {f.note} / 5
          </span>
          {f.commentaire ? (
            <p className="whitespace-pre-line text-corps">« {f.commentaire} »</p>
          ) : (
            <p className="text-corps text-muted-foreground">Sans commentaire.</p>
          )}
          <p className="text-legende text-muted-foreground">
            La note et le commentaire sont ceux de l’auteur : l’équipe ne les réécrit pas.
          </p>
        </div>
        {f.moyenne && (
          <div className="grid gap-1 text-corps">
            <span className="text-legende font-semibold text-muted-foreground">Effet sur la moyenne affichée</span>
            <span>
              Moyenne affichée de {f.destinataire ?? "ce compte"} : {moyenneDite(f.moyenne.affichee)} ({f.moyenne.nombre}{" "}
              avis comptés)
            </span>
            <span className="text-legende text-muted-foreground">
              {f.statut === "publie"
                ? `Sans cet avis : ${moyenneDite(f.moyenne.sans_cet_avis)}.`
                : `Avec cet avis : ${moyenneDite(f.moyenne.avec_cet_avis)}.`}
            </span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 border-t pt-3">
          {geste.possible ? (
            <GesteModerationAvis
              avis={f.id}
              decision={f.statut === "publie" ? "retirer" : "retablir"}
              moyenneApres={f.statut === "publie" ? (f.moyenne?.sans_cet_avis ?? null) : (f.moyenne?.avec_cet_avis ?? null)}
            />
          ) : (
            geste.raison && <span className="text-legende text-muted-foreground">{geste.raison}</span>
          )}
        </div>
      </div>

      <section className="grid gap-2">
        <h3 className="text-h3 font-semibold">Signalements · {f.signalements.length}</h3>
        <p className="text-legende text-muted-foreground">
          Leur examen — fondé ou non, avec une réponse à chaque personne qui a signalé — arrive avec la suite de cette
          rubrique. La mesure, retirer l’avis, se prend ici.
        </p>
        {f.signalements.length === 0 ? (
          <p className="text-corps text-muted-foreground">Aucun signalement.</p>
        ) : (
          <ul className="grid gap-2">
            {f.signalements.map((s) => (
              <li key={s.id} className="grid gap-1 rounded-lg border p-3">
                <span className="font-semibold">{s.raison_libelle ?? s.raison}</span>
                <span className="text-legende text-muted-foreground">
                  Signalé le {dateHeure(s.le)}
                  {s.signale_par ? ` par ${s.signale_par}` : ""}
                </span>
                <p className="whitespace-pre-line text-corps">« {s.explication} »</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-2">
        <h3 className="text-h3 font-semibold">Décisions de l’équipe</h3>
        {f.decisions.length === 0 ? (
          <p className="text-corps text-muted-foreground">Aucune décision : l’avis est publié depuis son dépôt.</p>
        ) : (
          <ul className="grid gap-2">
            {f.decisions.map((d) => (
              <li key={d.reference} className="grid gap-0.5 rounded-lg border p-3 text-corps">
                <span className="flex flex-wrap items-center gap-2">
                  <StatutPastille ton={d.decision === "retirer" ? "erreur" : "neutre"}>
                    {d.decision === "retirer" ? "Retiré" : "Rétabli"}
                  </StatutPastille>
                  <span className="text-legende text-muted-foreground tabular-nums">
                    {d.reference} · {dateHeure(d.le)}
                    {d.par ? ` · ${d.par}` : ""}
                  </span>
                </span>
                {d.message && (
                  <span>
                    <span className="text-muted-foreground">Message à l’auteur : </span>« {d.message} »
                  </span>
                )}
                <span className="text-legende text-muted-foreground">Motif interne : {d.motif}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

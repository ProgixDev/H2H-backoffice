import Link from "next/link";
import { cn } from "cn";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { dateHeure } from "@/lib/dates";
import {
  FILTRES_RECOURS,
  LIBELLE_FILTRE_RECOURS,
  LIBELLE_NATURE_SANCTION,
  LIBELLE_PORTEE,
  LIBELLE_STATUT_RECOURS,
  cheminCompte,
  type FiltreRecours,
  type RecoursListe,
} from "@/lib/utilisateurs/types";

/** Le chemin d'un filtre de l'onglet, le mode test gardé s'il est demandé. */
const cheminFiltre = (f: FiltreRecours, test: boolean) =>
  `/utilisateurs?vue=recours${f === "a_examiner" ? "" : `&statut=${f}`}${test ? "&test=1" : ""}`;

/**
 * Les recours contre une décision de l'équipe (§8, §5 « Contestations à
 * examiner »). Chacun s'examine sur la fiche du compte, où se lisent aussi la
 * décision contestée, les mots de la personne et ses pièces.
 */
export function ListeRecours({ recours, filtre, test }: { recours: RecoursListe[]; filtre: FiltreRecours; test: boolean }) {
  return (
    <div className="grid gap-3">
      <nav className="flex flex-wrap gap-2" aria-label="Filtre des recours">
        {FILTRES_RECOURS.map((f) => (
          <Link
            key={f}
            href={cheminFiltre(f, test)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-legende font-semibold transition-colors",
              f === filtre ? "border-h2h-primary bg-h2h-primary-light text-h2h-primary" : "hover:bg-muted",
            )}
          >
            {LIBELLE_FILTRE_RECOURS[f]}
          </Link>
        ))}
      </nav>

      {recours.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <AnimationH2H nom="recherche" taille={96} />
          <p className="mt-3 font-semibold">
            {filtre === "a_examiner" ? "Aucun recours à examiner" : "Aucun recours"}
          </p>
          <p className="text-corps text-muted-foreground">
            Les recours que les personnes déposent depuis l’application contre une décision de l’équipe apparaîtront ici.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {recours.map((r) => (
            <li
              key={r.id}
              className="grid gap-2 rounded-xl border bg-card p-4"
              style={{ boxShadow: "var(--ombre-carte)" }}
              data-recours={r.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold tabular-nums">{r.reference}</span>
                  <StatutPastille ton={r.statut === "a_examiner" ? "attention" : r.statut === "accepte" ? "succes" : "neutre"}>
                    {LIBELLE_STATUT_RECOURS[r.statut]}
                  </StatutPastille>
                  {r.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
                  <Link href={cheminCompte(r.profil)} className="font-semibold text-h2h-primary">
                    @{r.pseudo ?? "—"}
                  </Link>
                </div>
                <span className="text-legende text-muted-foreground">Déposé le {dateHeure(r.depose_le)}</span>
              </div>
              <p className="text-corps">
                Contre : {LIBELLE_NATURE_SANCTION[r.nature]}
                {r.portee ? ` · ${LIBELLE_PORTEE[r.portee]}` : ""} du {dateHeure(r.sanction_depuis)}
                {r.nature === "avertissement" ? "" : r.sanction_en_cours ? " — en cours" : " — terminée"}
              </p>
              <p className="line-clamp-3 text-corps text-muted-foreground">« {r.extrait} »</p>
              <p className="text-legende text-muted-foreground">
                {r.pieces === 0 ? "Sans pièce jointe" : `${r.pieces} pièce${r.pieces > 1 ? "s" : ""} jointe${r.pieces > 1 ? "s" : ""}`}
                {r.statut === "a_examiner"
                  ? r.echeance
                    ? ` · à traiter avant le ${dateHeure(r.echeance)}`
                    : ""
                  : ` · examiné le ${r.examine_le ? dateHeure(r.examine_le) : "—"}${r.examine_par ? ` par ${r.examine_par}` : ""}`}
              </p>
              <Link href={cheminCompte(r.profil)} className="text-legende font-semibold text-h2h-primary">
                {r.statut === "a_examiner" ? "Examiner sur la fiche du compte" : "Lire sur la fiche du compte"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

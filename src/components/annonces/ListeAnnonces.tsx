import Link from "next/link";
import { cn } from "cn";
import { AnimationH2H } from "@/components/marque/AnimationH2H";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Montant } from "@/components/operations/commun";
import { jour } from "@/lib/dates";
import { LIBELLE_ANNONCE, LIBELLE_TYPE_ANNONCE } from "@/lib/operations/libelles";
import {
  FILTRES_ANNONCES,
  FILTRES_RECHERCHES,
  LIBELLE_ACCES,
  LIBELLE_FILTRE_ANNONCES,
  LIBELLE_FILTRE_RECHERCHES,
  LIBELLE_STATUT_RECHERCHE,
  LIBELLE_URGENCE,
  adresseAnnonces,
  cheminAnnonce,
  type AnnonceListe,
  type CategorieFiltre,
  type FiltreAnnonces,
  type FiltreRecherches,
  type FiltresAnnonces,
  type StatutRecherche,
} from "@/lib/annonces/types";
import { cheminCompte } from "@/lib/utilisateurs/types";

const libelle = (table: Record<string, string>, code: string) => table[code] ?? code;

/** Le ton d'un statut : en ligne, en cours ; vendu, un succès ; le reste, neutre. */
function tonStatut(a: AnnonceListe): "actif" | "succes" | "neutre" | "muet" {
  if (a.nature === "recherche") {
    return a.statut === "trouve" ? "succes" : ["active", "propositions_recues", "en_discussion"].includes(a.statut) ? "actif" : "muet";
  }
  return a.statut === "active" ? "actif" : a.statut === "sold" ? "succes" : a.statut === "draft" ? "muet" : "neutre";
}

export function libelleStatut(a: Pick<AnnonceListe, "nature" | "statut">): string {
  return a.nature === "recherche"
    ? libelle(LIBELLE_STATUT_RECHERCHE, a.statut as StatutRecherche)
    : libelle(LIBELLE_ANNONCE, a.statut);
}

/** Les filtres de la liste : des pastilles, une catégorie, une recherche, le monde du test. */
export function FiltresListe({
  f,
  categories,
  testVisible,
}: {
  f: FiltresAnnonces;
  categories: CategorieFiltre[] | null;
  testVisible: boolean;
}) {
  const filtres = (f.vue === "recherches" ? FILTRES_RECHERCHES : FILTRES_ANNONCES) as readonly (FiltreAnnonces | FiltreRecherches)[];
  const libelles: Record<string, string> = f.vue === "recherches" ? LIBELLE_FILTRE_RECHERCHES : LIBELLE_FILTRE_ANNONCES;
  return (
    <div className="grid gap-3">
      <nav className="flex flex-wrap gap-2" aria-label="Filtrer">
        {[null, ...filtres].map((x) => (
          <Link
            key={x ?? "toutes"}
            href={adresseAnnonces({ ...f, filtre: x })}
            className={cn(
              "rounded-full border px-3 py-1 text-legende font-medium transition-colors",
              x === f.filtre
                ? "border-h2h-primary bg-h2h-primary/10 text-h2h-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {x ? libelles[x] : "Toutes"}
          </Link>
        ))}
      </nav>
      <form method="get" action="/annonces" className="flex flex-wrap items-end gap-2">
        {f.vue === "recherches" && <input type="hidden" name="vue" value="recherches" />}
        {f.filtre && <input type="hidden" name="filtre" value={f.filtre} />}
        <label className="grid min-w-64 flex-1 gap-1 text-legende text-muted-foreground">
          Recherche
          <Input name="q" defaultValue={f.q ?? ""} placeholder="Titre, ville, pseudonyme ou identifiant" maxLength={80} />
        </label>
        {categories && categories.length > 0 && (
          <label className="grid gap-1 text-legende text-muted-foreground">
            Catégorie
            <select
              name="categorie"
              defaultValue={f.categorie ?? ""}
              className="h-9 rounded-md border bg-background px-2 text-corps text-foreground"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.libelle} ({c.annonces_en_ligne})
                </option>
              ))}
            </select>
          </label>
        )}
        {testVisible && (
          <label className="flex h-9 items-center gap-2 text-corps">
            <input type="checkbox" name="test" value="1" defaultChecked={f.test} />
            Inclure le monde du test
          </label>
        )}
        <Button type="submit" size="sm" className="h-9">
          Chercher
        </Button>
        {(f.q || f.test || f.categorie) && (
          <Link
            href={adresseAnnonces({ ...f, q: null, test: false, categorie: null })}
            className="flex h-9 items-center text-legende text-muted-foreground hover:text-foreground"
          >
            Effacer
          </Link>
        )}
      </form>
    </div>
  );
}

/**
 * Les annonces (§9), ou les recherches « Je cherche » : ce qu'elles sont, leur
 * statut de publication, leur auteur, ce qui a été signalé et ce qui est en
 * cours. Chaque ligne ouvre la fiche.
 */
export function ListeAnnonces({
  annonces,
  filtree,
  lienCompte,
}: {
  annonces: AnnonceListe[];
  filtree: boolean;
  /** `utilisateurs.lire` : le pseudonyme de l'auteur ouvre la fiche de son compte. */
  lienCompte: boolean;
}) {
  if (annonces.length === 0) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <AnimationH2H nom="recherche" taille={96} />
        <p className="mt-3 font-semibold">{filtree ? "Rien ne correspond" : "Rien à lire pour l’instant"}</p>
        <p className="text-corps text-muted-foreground">
          {filtree
            ? "La recherche porte sur le titre, la ville, le pseudonyme de l’auteur ou l’identifiant."
            : "Les annonces et les recherches publiées dans l’application apparaîtront ici."}
        </p>
      </div>
    );
  }
  return (
    <ul className="grid gap-2">
      {annonces.map((a) => (
        <li
          key={a.id}
          className="grid grid-cols-[64px_1fr] gap-3 rounded-xl border bg-card p-3 md:grid-cols-[64px_1fr_auto]"
          style={{ boxShadow: "var(--ombre-carte)" }}
        >
          {a.image ? (
            // Une photo de l'annonce, servie par le seau public des annonces.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={a.image} alt="" className="size-16 rounded-lg object-cover" loading="lazy" />
          ) : (
            <span className="grid size-16 place-items-center rounded-lg bg-muted text-legende text-muted-foreground">
              Sans photo
            </span>
          )}
          <div className="grid min-w-0 gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={cheminAnnonce(a.id)} className="font-semibold text-h2h-primary hover:underline">
                {a.titre}
              </Link>
              <StatutPastille ton={tonStatut(a)}>{libelleStatut(a)}</StatutPastille>
              {a.nature === "annonce" ? (
                <>
                  <StatutPastille ton="neutre">
                    {a.mode === "exchange" ? "Échange" : libelle(LIBELLE_TYPE_ANNONCE, a.type)}
                  </StatutPastille>
                  {a.acces === "controlled" && <StatutPastille ton="neutre">{LIBELLE_ACCES.controlled}</StatutPastille>}
                </>
              ) : (
                <StatutPastille ton={a.type === "urgent" ? "attention" : "neutre"}>
                  {libelle(LIBELLE_URGENCE, a.type)}
                </StatutPastille>
              )}
              {a.mise_en_avant && <StatutPastille ton="marque">Mise en avant</StatutPastille>}
              {a.est_test && <StatutPastille ton="attention">TEST</StatutPastille>}
            </div>
            <p className="text-legende text-muted-foreground">
              {[a.categorie_libelle ?? a.categorie, a.ville].filter(Boolean).join(" · ")}
              {" · par "}
              {lienCompte ? (
                <Link href={cheminCompte(a.auteur)} className="font-medium text-foreground hover:underline">
                  {a.auteur_pseudo ? `@${a.auteur_pseudo}` : "(compte effacé)"}
                </Link>
              ) : (
                <span className="font-medium text-foreground">{a.auteur_pseudo ? `@${a.auteur_pseudo}` : "(compte effacé)"}</span>
              )}
            </p>
            <p className="text-legende text-muted-foreground">
              {a.publiee_le ? `Publiée le ${jour(a.publiee_le)}` : `Créée le ${jour(a.cree_le)}, jamais publiée`}
              {a.expire_le ? ` · échéance le ${jour(a.expire_le)}` : ""}
              {` · ${a.vues} vue${a.vues > 1 ? "s" : ""} · ${a.favoris} favori${a.favoris > 1 ? "s" : ""}`}
              {a.propositions !== null ? ` · ${a.propositions} proposition${a.propositions > 1 ? "s" : ""}` : ""}
            </p>
          </div>
          <div className="col-span-2 flex flex-wrap items-start gap-2 md:col-span-1 md:grid md:justify-items-end">
            <span className="font-bold">
              {a.nature === "recherche" && "Budget "}
              <Montant cents={a.montant_cents} fort />
            </span>
            {(a.signalements ?? 0) > 0 && (
              <StatutPastille ton="erreur">
                {a.signalements} signalement{(a.signalements ?? 0) > 1 ? "s" : ""}
              </StatutPastille>
            )}
            {(a.commandes_en_cours ?? 0) > 0 && (
              <StatutPastille ton="actif">
                {a.commandes_en_cours} commande{(a.commandes_en_cours ?? 0) > 1 ? "s" : ""} en cours
              </StatutPastille>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

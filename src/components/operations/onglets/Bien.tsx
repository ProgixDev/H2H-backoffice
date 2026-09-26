import Link from "next/link";
import { StatutPastille } from "@/components/bo/StatutPastille";
import { cheminFiche, type AchatNe, type BienAchat, type BienFlash, type BienLive } from "@/lib/operations/types";
import {
  LIBELLE_ACCES,
  LIBELLE_ANNONCE,
  LIBELLE_DIFFUSION,
  LIBELLE_ETAT_ARTICLE,
  LIBELLE_FLASH,
  LIBELLE_FORMAT_LIVE,
  LIBELLE_ISSUE_ARTICLE,
  LIBELLE_LIVE,
  LIBELLE_PHASE_ARTICLE,
  LIBELLE_REMISE_PREFEREE,
  LIBELLE_SELECTION,
  LIBELLE_SELECTION_LIVE,
  LIBELLE_TYPE_ANNONCE,
  libelleSiege,
} from "@/lib/operations/libelles";
import { Aucun, Bloc, Champs, Montant, ouiNon, Paires, Quand, Tableau } from "../commun";

const pct = (n: number | null) => (n === null ? null : `${n} %`);

/**
 * Bien et accord d'un achat (R6.2) : l'annonce FIGÉE au moment de l'accord, ce
 * qu'elle est devenue, le prix, les accessoires et la répartition des frais.
 */
export function BienDunAchat({ b, maintenant }: { b: BienAchat; maintenant: number }) {
  const a = b.accord;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Bloc titre="L’article acheté" className="lg:col-span-2">
        {b.articles.length === 0 ? (
          <Aucun>Aucun article enregistré sur cette commande.</Aucun>
        ) : (
          <ul className="grid gap-2">
            {b.articles.map((x, i) => (
              <li key={i} className="flex items-center gap-3">
                {x.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- miniature du stockage, déjà publique dans l'application
                  <img src={x.image} alt="" className="size-14 shrink-0 rounded-lg border object-cover" />
                ) : (
                  <span className="size-14 shrink-0 rounded-lg border bg-muted" aria-hidden />
                )}
                <span className="grid">
                  <span className="font-medium">{x.titre}</span>
                  <span className="text-legende text-muted-foreground">
                    {x.quantite} × <Montant cents={x.prix_unitaire_cents} /> = <Montant cents={x.prix_total_cents} fort />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </Bloc>

      <Bloc
        titre="L’annonce acceptée"
        aside={
          b.fige && (
            <span className="text-legende text-muted-foreground">
              Figée {b.fige.source === "attestation" ? "par l’attestation" : "par le reçu"} ·{" "}
              <Quand iso={b.fige.le} maintenant={maintenant} />
            </span>
          )
        }
      >
        {!b.fige ? (
          <Aucun>
            Aucune version figée : ni attestation, ni reçu n’ont encore gardé l’annonce telle qu’elle a été acceptée.
          </Aucun>
        ) : (
          <>
            <Champs
              colonnes={2}
              items={[
                ["Titre", b.fige.titre],
                ["Catégorie", b.fige.categorie],
                ["État", b.fige.etat ? (LIBELLE_ETAT_ARTICLE[b.fige.etat as keyof typeof LIBELLE_ETAT_ARTICLE] ?? b.fige.etat) : null],
                ["Marque · modèle", [b.fige.marque, b.fige.modele].filter(Boolean).join(" · ")],
                ["Accessoires inclus", ouiNon(b.fige.accessoires_inclus)],
                ["Éléments confirmés", <Paires key="e" objet={b.fige.elements_confirmes} />],
              ]}
            />
            {b.fige.description && <p className="whitespace-pre-line text-corps">{b.fige.description}</p>}
            <div className="grid gap-1">
              <span className="text-legende text-muted-foreground">Caractéristiques</span>
              <Paires objet={b.fige.caracteristiques} />
            </div>
          </>
        )}
      </Bloc>

      <Bloc titre="L’annonce aujourd’hui">
        {!b.annonce ? (
          <Aucun>L’annonce n’existe plus.</Aucun>
        ) : (
          <>
            <Champs
              colonnes={2}
              items={[
                ["Titre", b.annonce.titre],
                ["Statut", LIBELLE_ANNONCE[b.annonce.statut]],
                ["Type", LIBELLE_TYPE_ANNONCE[b.annonce.type]],
                ["Accessoires inclus", ouiNon(b.annonce.accessoires_inclus)],
              ]}
            />
            {b.annonce.modifications_apres_achat > 0 ? (
              <StatutPastille ton="attention" className="justify-self-start">
                Modifiée {b.annonce.modifications_apres_achat} fois depuis l’achat — l’accord reste celui de gauche
              </StatutPastille>
            ) : (
              <p className="text-legende text-muted-foreground">Aucune modification depuis l’achat.</p>
            )}
          </>
        )}
      </Bloc>

      <Bloc titre="L’accord : prix et répartition des frais" className="lg:col-span-2">
        <Champs
          colonnes={4}
          items={[
            ["Prix du bien", <Montant key="p" cents={a.prix_cents} />],
            ["Livraison", <Montant key="l" cents={a.livraison_cents} />],
            ["Total payé par l’acheteur", <Montant key="t" cents={a.total_cents} fort />],
            ["Modèle de frais", a.modele_frais],
            ["Frais de service", <Montant key="fs" cents={a.frais_service_cents} />],
            ["dont part du vendeur", a.service_part_vendeur_cents === null ? null : <span key="sv"><Montant cents={a.service_part_vendeur_cents} /> ({pct(a.service_part_vendeur_pct)})</span>],
            ["dont part de l’acheteur", <Montant key="sa" cents={a.service_part_acheteur_cents} />],
            ["Livraison, total", <Montant key="lt" cents={a.livraison_total_cents} />],
            ["Livraison, part du vendeur", a.livraison_part_vendeur_cents === null ? null : <span key="lv"><Montant cents={a.livraison_part_vendeur_cents} /> ({pct(a.livraison_part_vendeur_pct)})</span>],
            ["À régler par le vendeur", <Montant key="rv" cents={a.a_regler_par_le_vendeur_cents} />],
            ["Commission de la plateforme", <Montant key="c" cents={a.commission_plateforme_cents} />],
          ]}
        />
        {b.colivraison && (
          <div className="grid gap-2 border-t pt-3">
            <span className="text-legende font-semibold text-muted-foreground">Co-livraison</span>
            <Champs
              items={[
                ["Participation", <Montant key="p" cents={b.colivraison.prix_cents} />],
                ["Part du cotransporteur particulier", <Montant key="t" cents={b.colivraison.part_cotransporteur_cents} />],
                ["Part de la plateforme", <Montant key="h" cents={b.colivraison.part_plateforme_cents} />],
              ]}
            />
          </div>
        )}
      </Bloc>
    </div>
  );
}

/** Les achats nés d'une offre Flash ou d'un live : chacun a sa fiche. */
function Achats({ achats, maintenant }: { achats: AchatNe[]; maintenant: number }) {
  if (achats.length === 0) return <Aucun>Aucun achat n’en est encore né.</Aucun>;
  return (
    <ul className="grid gap-1">
      {achats.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center gap-3 text-corps">
          <Link href={cheminFiche(a.ref)} className="font-semibold tabular-nums text-h2h-primary">
            {a.ref}
          </Link>
          <Montant cents={a.total_cents} />
          <span className="text-muted-foreground">
            créé <Quand iso={a.cree_le} maintenant={maintenant} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Une offre Flash : l'article, les offres, les accès accordés par le vendeur (§13). */
export function BienDuneOffre({ b, maintenant }: { b: BienFlash; maintenant: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Bloc titre="L’article et l’offre">
        <Champs
          colonnes={2}
          items={[
            ["Article", b.article.titre],
            ["État", b.article.etat ? LIBELLE_ETAT_ARTICLE[b.article.etat] : null],
            ["Prix de départ", <Montant key="p" cents={b.article.prix_depart_cents} fort />],
            ["Statut de l’offre", LIBELLE_FLASH[b.statut]],
            ["Sélection", b.mode ? LIBELLE_SELECTION[b.mode] : null],
            ["Fin des offres", <Quand key="o" iso={b.offres_fin} maintenant={maintenant} />],
            ["Choix du vendeur jusqu’au", <Quand key="c" iso={b.rechoix_fin ?? b.choix_fin} maintenant={maintenant} />],
            ["Tentatives Exclu", b.tentatives_exclu],
            ["Vagues d’Accès Flash", b.vagues_flash],
            ["Vendu à", b.vendu_a],
          ]}
        />
        {b.article.description && <p className="whitespace-pre-line text-corps text-muted-foreground">{b.article.description}</p>}
        <p className="text-legende text-muted-foreground">
          La plateforme ne choisit jamais d’acheteur à la place du vendeur, ni le plus offrant, ni le suivant (§13).
        </p>
      </Bloc>

      <Bloc titre="Achats nés de l’offre">
        <Achats achats={b.achats} maintenant={maintenant} />
      </Bloc>

      <Bloc titre={`Offres reçues · ${b.offres.length}`} className="lg:col-span-2">
        {b.offres.length === 0 ? (
          <Aucun>Aucune offre reçue.</Aucun>
        ) : (
          <Tableau entetes={["Acheteur", "Montant", "Reçue", "Remise souhaitée", "État"]}>
            {b.offres.map((x, i) => (
              <tr key={i}>
                <td>{x.acheteur ?? "(compte effacé)"}</td>
                <td><Montant cents={x.montant_cents} fort /></td>
                <td><Quand iso={x.le} maintenant={maintenant} /></td>
                <td>{x.remise_preferee ? LIBELLE_REMISE_PREFEREE[x.remise_preferee] : "—"}</td>
                <td className="text-muted-foreground">
                  {[x.retiree && "retirée", x.masquee && "masquée", x.anonyme && "anonyme au public"].filter(Boolean).join(" · ") || "active"}
                </td>
              </tr>
            ))}
          </Tableau>
        )}
      </Bloc>

      <Bloc titre={`Accès d’achat · ${b.acces.length}`} className="lg:col-span-2">
        {b.acces.length === 0 ? (
          <Aucun>Aucun accès accordé.</Aucun>
        ) : (
          <Tableau entetes={["Acheteur", "Accès", "Vague", "Accordé", "Expire", "État"]}>
            {b.acces.map((x, i) => (
              <tr key={i}>
                <td>{x.acheteur ?? "(compte effacé)"}</td>
                <td>{LIBELLE_SELECTION[x.mode]}</td>
                <td className="tabular-nums">{x.vague ?? "—"}</td>
                <td><Quand iso={x.accorde_le} maintenant={maintenant} /></td>
                <td><Quand iso={x.expire_le} maintenant={maintenant} /></td>
                <td>{LIBELLE_ACCES[x.statut]}</td>
              </tr>
            ))}
          </Tableau>
        )}
      </Bloc>
    </div>
  );
}

/** Un live : le format, les articles dans l'ordre de passage, les places, les accès (§14). */
export function BienDunLive({ b, maintenant }: { b: BienLive; maintenant: number }) {
  const sieges = Object.entries(b.sieges);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Bloc titre="Le live">
        <Champs
          colonnes={2}
          items={[
            ["Titre", b.titre],
            ["Format", b.format ? LIBELLE_FORMAT_LIVE[b.format] : null],
            ["Statut", LIBELLE_LIVE[b.statut]],
            ["Diffusion", b.diffusion ? LIBELLE_DIFFUSION[b.diffusion] : null],
            ["Programmé le", <Quand key="p" iso={b.programme_le} maintenant={maintenant} />],
            ["Lancé le", <Quand key="d" iso={b.debut} maintenant={maintenant} />],
            ["Terminé le", <Quand key="f" iso={b.fin} maintenant={maintenant} />],
            ["Places", b.places],
            ["dont places VIP acheteur", b.places_vip],
            ["Spectateurs", b.spectateurs],
            ["Articles prévus", b.articles_prevus],
            ["Rediffusion", b.rediffusion ? "Disponible" : "Aucune"],
          ]}
        />
        <p className="text-legende text-muted-foreground">
          Pas de discussion publique en live : les spectateurs participent par des offres de prix (§14).
        </p>
      </Bloc>

      <Bloc titre="Places et achats">
        {sieges.length === 0 ? (
          <Aucun>Aucune place réservée.</Aucun>
        ) : (
          <ul className="grid gap-0.5 text-corps">
            {sieges.map(([cle, nb]) => (
              <li key={cle}>
                <span className="tabular-nums font-semibold">{nb}</span> · {libelleSiege(cle)}
              </li>
            ))}
          </ul>
        )}
        <div className="grid gap-1 border-t pt-3">
          <span className="text-legende font-semibold text-muted-foreground">Achats nés du live</span>
          <Achats achats={b.achats} maintenant={maintenant} />
        </div>
      </Bloc>

      <Bloc titre={`Articles · ${b.articles.length}`} className="lg:col-span-2">
        {b.articles.length === 0 ? (
          <Aucun>Aucun article au programme.</Aucun>
        ) : (
          <Tableau entetes={["#", "Article", "Départ", "Phase", "Issue", "Offres", "Meilleure", "Vendu à"]} largeur={880}>
            {b.articles.map((x) => (
              <tr key={x.position}>
                <td className="tabular-nums">{x.position}</td>
                <td>{x.titre ?? "—"}</td>
                <td><Montant cents={x.prix_depart_cents} /></td>
                <td>
                  {x.phase ? LIBELLE_PHASE_ARTICLE[x.phase] : "—"}
                  {x.phase_fin && (
                    <span className="block text-legende text-muted-foreground">
                      jusqu’à <Quand iso={x.phase_fin} maintenant={maintenant} />
                    </span>
                  )}
                </td>
                <td>
                  {x.issue ? LIBELLE_ISSUE_ARTICLE[x.issue] : "—"}
                  {x.mode && <span className="block text-legende text-muted-foreground">{LIBELLE_SELECTION_LIVE[x.mode]}</span>}
                </td>
                <td className="tabular-nums">{x.offres}</td>
                <td><Montant cents={x.meilleure_offre_cents} /></td>
                <td>{x.vendu_a ?? "—"}</td>
              </tr>
            ))}
          </Tableau>
        )}
      </Bloc>

      <Bloc titre={`Accès d’achat · ${b.acces.length}`} className="lg:col-span-2">
        {b.acces.length === 0 ? (
          <Aucun>Aucun accès accordé.</Aucun>
        ) : (
          <Tableau entetes={["Article", "Acheteur", "Accès", "Vague", "Accordé", "Expire", "État"]}>
            {b.acces.map((x, i) => (
              <tr key={i}>
                <td>{x.article ?? "—"}</td>
                <td>{x.acheteur ?? "(compte effacé)"}</td>
                <td>{LIBELLE_SELECTION_LIVE[x.mode]}</td>
                <td className="tabular-nums">{x.vague ?? "—"}</td>
                <td><Quand iso={x.accorde_le} maintenant={maintenant} /></td>
                <td><Quand iso={x.expire_le} maintenant={maintenant} /></td>
                <td>{LIBELLE_ACCES[x.statut]}</td>
              </tr>
            ))}
          </Tableau>
        )}
      </Bloc>
    </div>
  );
}

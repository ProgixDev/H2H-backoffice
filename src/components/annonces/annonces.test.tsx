// CE QUE LA RUBRIQUE « ANNONCES » MONTRE — rendu tel que le serveur l'envoie.
//
// Personne ne clique dans un navigateur pendant les tests : on vérifie ici que
// la liste et la fiche disent ce qu'elles doivent dire — le statut d'une
// annonce à part de l'état de ses transactions (R9.3), ce que la base permet
// pour le paiement et la livraison, les signalements sans qui a signalé, les
// liens qui n'ouvrent que ce que l'équipier peut lire, et la modération dite
// « à venir » plutôt qu'inventée.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AnnonceListe, FicheAnnonce, FicheRecherche } from "@/lib/annonces/types";
import type { DetailIndicateur } from "@/lib/tableau/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));

const { ListeAnnonces, FiltresListe } = await import("./ListeAnnonces");
const { FicheAnnonceVue } = await import("./FicheAnnonce");
const { LignesIndicateur } = await import("@/components/tableau/LignesIndicateur");

const ID = "ff000000-0000-4000-a000-00000000aa01";
const VENDEUSE = "ff000000-0000-4000-a000-000000000001";
const LIGNE: AnnonceListe = {
  id: ID, nature: "annonce", titre: "Lampe de bureau vintage", image: "https://img.h2h/lampe-t.jpg",
  categorie: "electronique", categorie_libelle: "Mobiles & objets connectés", montant_cents: 3000, statut: "active",
  type: "fixed", mode: "sale", acces: "controlled", auteur: VENDEUSE, auteur_pseudo: "vendeuse_ff", ville: "Nice",
  cree_le: "2026-09-28T08:00:00Z", publiee_le: "2026-09-29T08:00:00Z", expire_le: null, vues: 12, favoris: 1,
  signalements: 2, propositions: null, commandes_en_cours: 1, mise_en_avant: true, est_test: false,
};

const AUTEUR: FicheAnnonce["auteur"] = {
  id: VENDEUSE, pseudo: "vendeuse_ff", ville: "Nice", type_compte: "individual", note: 4.5, avis: 3,
  est_test: false, efface: false, suspendu: false, publication_restreinte: false,
};
const DROITS = { moderer: false, compte: true, operations: true };

const FICHE: FicheAnnonce = {
  nature: "annonce",
  droits: DROITS,
  annonce: {
    id: ID, titre: "Lampe de bureau vintage", description: "Une lampe qui éclaire.", statut: "active", type: "fixed",
    mode: "sale", acces: "public", etat: "like_new", prix_cents: 3000, prix_origine_cents: null, negociable: false,
    stock: 1, accessoires: true, defauts: null, etiquettes: [], echange_contre: [], recherche_source: null,
    ville: "Nice", region: "PACA",
    photos: [
      { url: "https://img.h2h/lampe-1.jpg", miniature: "https://img.h2h/lampe-1-t.jpg", rang: 0 },
      { url: "https://img.h2h/lampe-2.jpg", miniature: null, rang: 1 },
    ],
    videos: 0, video_max_secondes: null, pack_photos: null, cree_le: "2026-09-28T08:00:00Z",
    publiee_le: "2026-09-29T08:00:00Z", maj_le: "2026-09-29T09:00:00Z", expire_le: null, vues: 12, favoris: 1,
  },
  categorie: { id: "electronique", libelle: "Mobiles & objets connectés", famille: "tech", contact_seulement: false, xxl_seulement: false },
  attributs: [
    { cle: "storage", libelle: "Stockage", valeur: "128 Go", unite: null },
    { cle: "ancienne_cle", libelle: null, valeur: "x", unite: null },
  ],
  auteur: AUTEUR,
  eligibilite: {
    paiement: true, livraison: "expedition", format: "M", livraison_offerte: false, colivraison: true,
    colivraison_plafond_cents: 10000, part_vendeur_service_pct: 0, part_vendeur_livraison_pct: 100,
  },
  acces: { mode: "public", demandes: {} },
  modifications: [
    { le: "2026-09-29T09:00:00Z", origine: "seller", genre: "contenu", champs: ["price_cents", "title"],
      changements: {}, frais_cents: 0, paiement: null },
  ],
  visibilite: {
    mise_en_avant: true, urgent_jusqu_au: null,
    remontees: [
      { option: "bump", active: true, prix_cents: 199, depuis: "2026-09-29T10:00:00Z", jusqu_a: "2026-10-01T10:00:00Z" },
      { option: "daily7", active: false, prix_cents: 499, depuis: "2026-09-01T10:00:00Z", jusqu_a: "2026-09-08T10:00:00Z" },
    ],
    options: [{ genre: "photo_pack", valeur: "pack10", prix_cents: 99, achetee_le: "2026-09-29T08:00:00Z", appliquee_le: null }],
  },
  signalements: {
    total: 1,
    recents: [
      { le: "2026-09-30T08:00:00Z", raison: "off_platform", raison_libelle: "Coordonnées ou paiement hors plateforme",
        priorite: "elevee", explication: "Le vendeur propose un virement direct.", preuves: 2, bonne_foi: true },
    ],
  },
  commandes: [
    { reference: "HTH-2026-A1B2C3", statut: "awaiting_seller", total_cents: 3490, livraison: "mondial_relay",
      acheteur: "acheteur_ff", le: "2026-09-30T09:00:00Z" },
  ],
  flash: null,
  lives: [],
  echanges: {},
};

const RECHERCHE: FicheRecherche = {
  nature: "recherche",
  droits: DROITS,
  recherche: {
    id: "ff000000-0000-4000-a000-00000000bb01", titre: "Cherche une platine vinyle", description: "En bon état",
    statut: "propositions_recues", expiree: false, budget_max_cents: 8000, zones: ["06"], urgence: "this_week",
    preferences_livraison: [], ville: "Antibes", photos: [], pack_photos: null, emploi: null,
    cree_le: "2026-09-29T08:00:00Z", maj_le: "2026-09-29T08:00:00Z", expire_le: "2026-10-29T08:00:00Z",
    vues: 4, favoris: 0, propositions_total: 1,
  },
  categorie: FICHE.categorie,
  auteur: { ...AUTEUR, id: "ff000000-0000-4000-a000-000000000003", pseudo: "acheteur_ff", ville: "Antibes" },
  propositions: [
    { le: "2026-09-30T08:00:00Z", vendeur: "vendeuse_ff", statut: "pending", message: "Elle est comme neuve.",
      annonce: { id: ID, titre: "Lampe de bureau vintage", statut: "active", prix_cents: 3000 } },
  ],
  visibilite: { mise_en_avant: false, urgent_jusqu_au: null, remontees: [] },
};

describe("la liste des annonces", () => {
  it("une ligne dit ce qu'est l'annonce, son statut, son auteur, ce qui a été signalé et ce qui est en cours", () => {
    const l = renderToStaticMarkup(<ListeAnnonces annonces={[LIGNE]} filtree={false} lienCompte />);
    expect(l).toContain(`href="/annonces/${ID}"`);
    expect(l).toContain("Lampe de bureau vintage");
    expect(l).toContain("En ligne");
    expect(l).toContain("Prix fixe");
    expect(l).toContain("Accès contrôlé");
    expect(l).toContain("Mise en avant");
    expect(l).toContain("2 signalements");
    expect(l).toContain("1 commande en cours");
    expect(l).toContain(`href="/utilisateurs/${VENDEUSE}"`);
    expect(l).toContain("Mobiles &amp; objets connectés · Nice");
    // Sans le droit de lire les comptes, le pseudonyme ne mène nulle part.
    expect(renderToStaticMarkup(<ListeAnnonces annonces={[LIGNE]} filtree={false} lienCompte={false} />))
      .not.toContain("/utilisateurs/");
  });

  it("une recherche dit son budget et son urgence ; un brouillon, qu'il n'a jamais été publié", () => {
    const r = renderToStaticMarkup(
      <ListeAnnonces
        annonces={[{ ...LIGNE, nature: "recherche", statut: "propositions_recues", type: "urgent", mode: null, acces: null,
          signalements: null, commandes_en_cours: null, propositions: 3, montant_cents: 8000 }]}
        filtree={false}
        lienCompte
      />,
    );
    expect(r).toContain("Offres reçues");
    expect(r).toContain("Urgent");
    expect(r).toContain("Budget ");
    expect(r).toContain("3 propositions");
    const b = renderToStaticMarkup(
      <ListeAnnonces annonces={[{ ...LIGNE, statut: "draft", publiee_le: null }]} filtree={false} lienCompte />,
    );
    expect(b).toContain("Brouillon");
    expect(b).toContain("jamais publiée");
  });

  it("une liste vide se dit vide ; les filtres gardent la vue, la catégorie et le monde du test", () => {
    expect(renderToStaticMarkup(<ListeAnnonces annonces={[]} filtree lienCompte />)).toContain("Rien ne correspond");
    const f = renderToStaticMarkup(
      <FiltresListe
        f={{ vue: "recherches", q: "platine", filtre: null, categorie: "electronique", test: true }}
        categories={[{ id: "electronique", libelle: "Mobiles & objets connectés", famille: null, contact_seulement: false,
          annonces_en_ligne: 7 }]}
        testVisible
      />,
    );
    expect(f).toContain('href="/annonces?vue=recherches&amp;q=platine&amp;filtre=actives&amp;categorie=electronique&amp;test=1"');
    expect(f).toContain("Mobiles &amp; objets connectés (7)");
    expect(f).toContain('name="vue" value="recherches"');
  });
});

describe("la fiche d'une annonce", () => {
  it("ce qu'elle est, et R9.3 : son statut à part de l'état de ses transactions", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue f={FICHE} />);
    expect(f).toContain("Lampe de bureau vintage");
    expect(f).toContain("En ligne");
    expect(f).toContain("Très bon état");
    expect(f).toContain("l’état de chaque transaction se lit à part");
    expect(f).toContain("HTH-2026-A1B2C3");
    expect(f).toContain('href="/operations/HTH-2026-A1B2C3"');
    expect(f).toContain("En attente du vendeur");
    expect(f).toContain("Mondial Relay");
  });

  it("ce que l'acheteur voit : les photos dans l'ordre, la description, les attributs nommés", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue f={FICHE} />);
    expect(f.indexOf("lampe-1-t.jpg")).toBeLessThan(f.indexOf("lampe-2.jpg"));
    expect(f).toContain("Une lampe qui éclaire.");
    expect(f).toContain("Stockage");
    expect(f).toContain("128 Go");
    expect(f).toContain("ancienne_cle (clé inconnue de la catégorie)");
  });

  it("ce que la base permet : le paiement, la livraison, la co-livraison", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue f={FICHE} />);
    expect(f).toContain("Expédition possible");
    expect(f).toContain("0 % des frais de service · 100 % de la livraison");
    const contact = renderToStaticMarkup(
      <FicheAnnonceVue f={{ ...FICHE, eligibilite: { ...FICHE.eligibilite, paiement: false, livraison: "contact", colivraison: false } }} />,
    );
    expect(contact).toContain("Non : catégorie « contact direct »");
    expect(contact).toContain("Non proposée (plafond 100 €");
    const xxl = renderToStaticMarkup(
      <FicheAnnonceVue f={{ ...FICHE, eligibilite: { ...FICHE.eligibilite, livraison: "sur_devis", colivraison: false } }} />,
    );
    expect(xxl).toContain("Format XXL : sur devis");
  });

  it("son histoire : les modifications, la visibilité achetée, les signalements sans qui a signalé", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue f={FICHE} />);
    expect(f).toContain("Le vendeur");
    expect(f).toContain("Prix, Titre");
    expect(f).toContain("Gratuite");
    expect(f).toContain("Remontée");
    expect(f).toContain("Remontée quotidienne · 7 jours");
    expect(f).toContain("Terminée");
    expect(f).toContain("Pack de photos");
    expect(f).toContain("Coordonnées ou paiement hors plateforme");
    expect(f).toContain("Priorité élevée");
    expect(f).toContain("2 pièces");
    expect(f).toContain("Qui a signalé ne se lit pas ici");
  });

  it("la modération est dite à venir ; sans droit, ni compte ni opération ne s'ouvrent", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue f={FICHE} />);
    expect(f).toContain("ces gestes arrivent avec la suite de cette phase");
    const muet = renderToStaticMarkup(
      <FicheAnnonceVue f={{ ...FICHE, droits: { moderer: false, compte: false, operations: false } }} />,
    );
    expect(muet).not.toContain("/utilisateurs/");
    expect(muet).not.toContain("/operations/");
  });
});

describe("la fiche d'une recherche « Je cherche »", () => {
  it("son budget, son urgence, et les annonces qu'on lui a proposées", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue f={RECHERCHE} />);
    expect(f).toContain("Recherche « Je cherche »");
    expect(f).toContain("Offres reçues");
    expect(f).toContain("Cette semaine");
    expect(f).toContain("80,00");
    expect(f).toContain(`href="/annonces/${ID}"`);
    expect(f).toContain("Elle est comme neuve.");
    const expiree = renderToStaticMarkup(
      <FicheAnnonceVue f={{ ...RECHERCHE, recherche: { ...RECHERCHE.recherche, expiree: true } }} />,
    );
    expect(expiree).toContain("Expirée");
  });
});

describe("le tableau de bord mène aux annonces", () => {
  const detail = (code: string): DetailIndicateur => ({
    indicateur: {
      code, point: 2, groupe: "annonces", libelle: "Annonces actives", definition: "Les annonces en ligne.",
      portee: "instant", mesure: "nombre", unite: "aucune", a_confirmer: false, nombre: 1, valeur: null, a_part: 0,
    },
    periode: { du: "2026-09-01", au: "2026-09-30", jours: 30 },
    lu_le: "2026-09-30T10:00:00Z",
    lignes: [{ id: ID, reference: null, libelle: "Lampe de bureau vintage", le: "2026-09-29T08:00:00Z", valeur: null,
      detail: "Vente · prix fixe", cible: null, est_test: false }],
    tronquee: false,
  });

  it("une ligne d'annonce ouvre sa fiche — pour qui lit les annonces", () => {
    expect(renderToStaticMarkup(<LignesIndicateur detail={detail("annonces_actives")} peutOuvrirFiche peutOuvrirAnnonce />))
      .toContain(`href="/annonces/${ID}"`);
    expect(renderToStaticMarkup(<LignesIndicateur detail={detail("annonces_actives")} peutOuvrirFiche peutOuvrirAnnonce={false} />))
      .not.toContain("/annonces/");
    expect(renderToStaticMarkup(<LignesIndicateur detail={detail("annonces_vendues")} peutOuvrirFiche peutOuvrirAnnonce />))
      .not.toContain("/annonces/");
  });
});

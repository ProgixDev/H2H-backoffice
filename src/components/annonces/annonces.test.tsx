// CE QUE LA RUBRIQUE « ANNONCES » MONTRE — rendu tel que le serveur l'envoie.
//
// Personne ne clique dans un navigateur pendant les tests : on vérifie ici que
// la liste et la fiche disent ce qu'elles doivent dire — le statut d'une
// annonce à part de l'état de ses transactions (R9.3), ce que la base permet
// pour le paiement et la livraison, les signalements et leur lecture, les
// liens qui n'ouvrent que ce que l'équipier peut lire, et la modération : son
// état à part du statut, la correction qui attend, l'historique avec le message
// lu par l'auteur et le motif gardé par l'équipe.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AnnonceListe, FicheAnnonce, FicheRecherche, ModerationFiche } from "@/lib/annonces/types";
import type { SignalementsCible } from "@/lib/signalements/types";
import type { RecoursLu } from "@/lib/utilisateurs/types";
import type { DetailIndicateur } from "@/lib/tableau/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
// Les gestes se testent à part (`GestesModeration.test.tsx`) : ici, ce que la fiche leur passe.
vi.mock("@/components/annonces/GestesModeration", () => ({
  GestesModeration: ({ id, nature, possibles }: { id: string; nature: string; possibles: object }) => (
    <span data-gestes={`${nature}:${id}:${JSON.stringify(possibles)}`} />
  ),
  ExaminerRecoursAnnonce: ({ recours, annonce }: { recours: string; annonce: string }) => (
    <button data-examiner={`${recours}:${annonce}`} />
  ),
}));
vi.mock("@/components/utilisateurs/GestesRecours", () => ({
  PieceRecours: ({ recours, rang }: { recours: string; rang: number }) => <button data-piece={`${recours}:${rang}`} />,
}));
// Le bloc des signalements se teste à part (`signalements.test.tsx`) : ici, ce que la fiche lui passe.
vi.mock("@/components/signalements/BlocSignalements", () => ({
  SignalementsLus: ({ genre, cible, s }: { genre: string; cible: string; s: { a_examiner: number } | null }) => (
    <span data-signalements={`${genre}:${cible}:${s === null ? "echec" : s.a_examiner}`} />
  ),
}));

const { ListeAnnonces, FiltresListe } = await import("./ListeAnnonces");
const { FicheAnnonceVue } = await import("./FicheAnnonce");
const { LignesIndicateur } = await import("@/components/tableau/LignesIndicateur");

const ID = "ff000000-0000-4000-a000-00000000aa01";
/** Aucun signalement : ce que `bo_signalements_cible` rend d'une cible jamais signalée. */
const SANS_SIGNALEMENT: SignalementsCible = { signalements: [], a_examiner: 0, dossier: null, possibles: { examiner: true, raison: null } };
const VENDEUSE = "ff000000-0000-4000-a000-000000000001";
const LIGNE: AnnonceListe = {
  id: ID, nature: "annonce", titre: "Lampe de bureau vintage", image: "https://img.h2h/lampe-t.jpg",
  categorie: "electronique", categorie_libelle: "Mobiles & objets connectés", montant_cents: 3000, statut: "active",
  type: "fixed", mode: "sale", acces: "controlled", auteur: VENDEUSE, auteur_pseudo: "vendeuse_ff", ville: "Nice",
  cree_le: "2026-09-28T08:00:00Z", publiee_le: "2026-09-29T08:00:00Z", expire_le: null, vues: 12, favoris: 1,
  signalements: 2, propositions: null, commandes_en_cours: 1, mise_en_avant: true, moderation: null, correction: null,
  recours: null, est_test: false,
};

const RIEN: ModerationFiche = {
  etat: null, verification: null, correction: null, historique: [], recours_a_examiner: 0,
  possibles: {
    moderer: true, raison: null, masquer: true, retablir: false, retirer: true, corriger: true, autoriser: false,
    refuser: false,
  },
};

const AUTEUR: FicheAnnonce["auteur"] = {
  id: VENDEUSE, pseudo: "vendeuse_ff", ville: "Nice", type_compte: "individual", note: 4.5, avis: 3,
  est_test: false, efface: false, suspendu: false, publication_restreinte: false,
};
const DROITS = { moderer: false, compte: true, operations: true };

const FICHE: FicheAnnonce = {
  nature: "annonce",
  droits: DROITS,
  moderation: RIEN,
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
  moderation: RIEN,
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

  it("une ligne dit la modération à part du statut, et la correction qui attend ou vient d'être faite", () => {
    const m = renderToStaticMarkup(
      <ListeAnnonces annonces={[{ ...LIGNE, moderation: "masquee", correction: "demandee" }]} filtree={false} lienCompte />,
    );
    expect(m).toContain("En ligne");
    expect(m).toContain("Masquée par l’équipe");
    expect(m).toContain("Correction demandée");
    const r = renderToStaticMarkup(
      <ListeAnnonces annonces={[{ ...LIGNE, moderation: "retiree", correction: "apportee" }]} filtree={false} lienCompte />,
    );
    expect(r).toContain("Retirée par l’équipe");
    expect(r).toContain("Correction apportée");
    const f = renderToStaticMarkup(
      <FiltresListe f={{ vue: "annonces", q: null, filtre: null, categorie: null, test: false }} categories={null} testVisible={false} />,
    );
    expect(f).toContain('href="/annonces?filtre=moderees"');
    expect(f).toContain("Modérées");
    expect(f).toContain('href="/annonces?filtre=corrections"');
    // Les publications qui attendent l'équipe (D25) ; une recherche n'en a pas.
    expect(f).toContain('href="/annonces?filtre=verification"');
    expect(f).toContain("À vérifier avant publication");
    const recherches = renderToStaticMarkup(
      <FiltresListe f={{ vue: "recherches", q: null, filtre: null, categorie: null, test: false }} categories={null} testVisible={false} />,
    );
    expect(recherches).toContain("Masquées ou retirées");
    expect(recherches).not.toContain("filtre=verification");
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
    const f = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={FICHE} />);
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
    const f = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={FICHE} />);
    expect(f.indexOf("lampe-1-t.jpg")).toBeLessThan(f.indexOf("lampe-2.jpg"));
    expect(f).toContain("Une lampe qui éclaire.");
    expect(f).toContain("Stockage");
    expect(f).toContain("128 Go");
    expect(f).toContain("ancienne_cle (clé inconnue de la catégorie)");
  });

  it("ce que la base permet : le paiement, la livraison, la co-livraison", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={FICHE} />);
    expect(f).toContain("Expédition possible");
    expect(f).toContain("0 % des frais de service · 100 % de la livraison");
    const contact = renderToStaticMarkup(
      <FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={{ ...FICHE, eligibilite: { ...FICHE.eligibilite, paiement: false, livraison: "contact", colivraison: false } }} />,
    );
    expect(contact).toContain("Non : catégorie « contact direct »");
    expect(contact).toContain("Non proposée (plafond 100 €");
    const xxl = renderToStaticMarkup(
      <FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={{ ...FICHE, eligibilite: { ...FICHE.eligibilite, livraison: "sur_devis", colivraison: false } }} />,
    );
    expect(xxl).toContain("Format XXL : sur devis");
  });

  it("son histoire : les modifications, la visibilité achetée, les signalements lus à part", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={FICHE} />);
    const un = renderToStaticMarkup(
      <FicheAnnonceVue
        f={FICHE}
        signalements={{ ...SANS_SIGNALEMENT, a_examiner: 1, signalements: [{
          id: "51000000-0000-4000-a000-000000000001", raison: "off_platform", raison_libelle: "Coordonnées ou paiement hors plateforme",
          explication: "Le vendeur propose un virement direct.", preuves: [], priorite: "elevee", bonne_foi: true,
          le: "2026-09-30T08:00:00Z", signale_par: null, examen: null }] }}
      />,
    );
    expect(f).toContain("Le vendeur");
    expect(f).toContain("Prix, Titre");
    expect(f).toContain("Gratuite");
    expect(f).toContain("Remontée");
    expect(f).toContain("Remontée quotidienne · 7 jours");
    expect(f).toContain("Terminée");
    expect(f).toContain("Pack de photos");
    // Les signalements se lisent à part (`bo_signalements_cible`) : la fiche passe sa cible, et compte ce qui est lu.
    expect(un).toContain(`data-signalements="annonce:${ID}:1"`);
    expect(un).toContain("Signalements (1)");
    expect(f).toContain("Signalements (0)");
    // Leur lecture a échoué : la fiche le dit — jamais « aucun signalement ».
    const echec = renderToStaticMarkup(<FicheAnnonceVue f={FICHE} signalements={null} />);
    expect(echec).toContain(`data-signalements="annonce:${ID}:echec"`);
    expect(echec).toContain("Signalements (1)");
  });

  it("sans droit, ni compte ni opération ne s'ouvrent", () => {
    const muet = renderToStaticMarkup(
      <FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={{ ...FICHE, droits: { moderer: false, compte: false, operations: false } }} />,
    );
    expect(muet).not.toContain("/utilisateurs/");
    expect(muet).not.toContain("/operations/");
  });
});

describe("la modération d'une fiche", () => {
  const MASQUEE: ModerationFiche = {
    etat: "masquee",
    verification: null,
    correction: {
      id: "m2", code: "erreur_manifeste", libelle: "Erreur manifeste", message: "Le prix est celui d’un autre objet.",
      le: "2026-09-30T11:00:00Z", par: "mod1@handtohand.pro",
    },
    historique: [
      { id: "m2", decision: "demander_correction", correction: "erreur_manifeste", correction_libelle: "Erreur manifeste",
        message: "Le prix est celui d’un autre objet.", motif: "Vu au contrôle du matin", le: "2026-09-30T11:00:00Z",
        par: "mod1@handtohand.pro", corrigee_le: null, en_vigueur: false, annulee: false, recours: null },
      { id: "m1", decision: "masquer", correction: null, correction_libelle: null,
        message: "Les photos ne correspondent pas à l’objet.", motif: "Deux signalements concordants", le: "2026-09-30T10:00:00Z",
        par: "mod1@handtohand.pro", corrigee_le: null, en_vigueur: true, annulee: false, recours: null },
      { id: "m0", decision: "demander_correction", correction: "doublon", correction_libelle: "Annonce en double",
        message: "Publiée deux fois.", motif: "Doublon vérifié", le: "2026-09-29T10:00:00Z", par: null,
        corrigee_le: "2026-09-29T12:00:00Z", en_vigueur: false, annulee: false, recours: null },
    ],
    recours_a_examiner: 0,
    possibles: {
      moderer: true, raison: null, masquer: false, retablir: true, retirer: true, corriger: false, autoriser: false,
      refuser: false,
    },
  };

  it("sans mesure, elle le dit ; les gestes reçoivent ce que la base permet", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={FICHE} />);
    expect(f).toContain("Aucune mesure en cours");
    expect(f).toContain(`data-gestes="annonce:${ID}:${JSON.stringify(RIEN.possibles).replace(/"/g, "&quot;")}"`);
    expect(f).not.toContain("par l’équipe");
    // Autoriser ou refuser une publication : la suite, dite comme telle.
    expect(f).toContain("Autoriser ou refuser une publication : ce geste arrive");
  });

  it("masquée : l'état, la correction qui attend, l'historique avec le message et le motif interne", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={{ ...FICHE, moderation: MASQUEE }} />);
    expect(f).toContain("Masquée par l’équipe");
    expect(f).toContain("personne d’autre que son auteur ne la voit");
    expect(f).toContain("Correction demandée");
    expect(f).toContain("« Le prix est celui d’un autre objet. »");
    expect(f).toContain("par mod1@handtohand.pro");
    expect(f).toContain("ne lui sera pas facturée");
    expect(f).toContain("Deux signalements concordants");
    expect(f).toContain("Attend l’auteur");
    expect(f).toContain("Corrigée le");
    expect(f).toContain("Correction demandée · Erreur manifeste");
    expect(f).toContain("Correction demandée · Annonce en double");
    expect(f).toContain("Les photos ne correspondent pas à l’objet.");
  });

  it("retirée : une issue défavorable, et la correction restée sans suite", () => {
    const retiree: ModerationFiche = {
      ...MASQUEE, etat: "retiree", correction: null,
      possibles: { ...MASQUEE.possibles, retablir: false, retirer: false },
    };
    const f = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={{ ...FICHE, moderation: retiree }} />);
    expect(f).toContain("Retirée par l’équipe");
    expect(f).toContain("seul un recours accepté la rendrait");
    expect(f).toContain("Sans suite");
    expect(f).not.toContain("Attend l’auteur");
  });

  it("le recours de l'auteur : ses mots, ses pièces, le geste d'examen — ou la raison, puis la réponse", () => {
    const recours: RecoursLu = {
      id: "rec1", reference: "REC-000042", statut: "a_examiner", depose_le: "2026-10-01T09:00:00Z",
      texte: "Les photos sont bien celles de ma lampe.", pieces: 2, examine_le: null, examine_par: null, reponse: null,
      motif: null, dossier: "DOS-000017", examinable: true, raison: null, pieces_ouvrables: true,
    };
    const avecRecours: ModerationFiche = {
      ...MASQUEE,
      recours_a_examiner: 1,
      historique: MASQUEE.historique.map((h) => (h.id === "m1" ? { ...h, recours } : h)),
    };
    const f = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={{ ...FICHE, moderation: avecRecours }} />);
    expect(f).toContain("Recours · 1 à examiner");
    expect(f).toContain("REC-000042");
    expect(f).toContain("Contre : le masquage du");
    expect(f).toContain("« Les photos sont bien celles de ma lampe. »");
    expect(f).toContain(`data-examiner="rec1:${ID}"`);
    expect(f).toContain('data-piece="rec1:2"');
    // Celui qui a décidé lit pourquoi il ne peut pas examiner.
    const auteur = renderToStaticMarkup(
      <FicheAnnonceVue signalements={SANS_SIGNALEMENT}
        f={{ ...FICHE, moderation: { ...avecRecours, historique: avecRecours.historique.map((h) => (h.recours
          ? { ...h, recours: { ...recours, examinable: false,
            raison: "Vous avez pris cette décision : un autre membre de l’équipe examine le recours." } }
          : h)) } }}
      />,
    );
    expect(auteur).not.toContain("data-examiner");
    expect(auteur).toContain("Vous avez pris cette décision");
    // Examiné : la réponse envoyée et le motif interne ; la décision annulée le dit.
    const examine = renderToStaticMarkup(
      <FicheAnnonceVue signalements={SANS_SIGNALEMENT}
        f={{ ...FICHE, moderation: { ...avecRecours, recours_a_examiner: 0, historique: avecRecours.historique.map((h) =>
          (h.recours ? { ...h, annulee: true, recours: { ...recours, statut: "accepte", examinable: false,
            examine_le: "2026-10-02T09:00:00Z", examine_par: "exa2@handtohand.pro", reponse: "L’annonce est conforme.",
            motif: "Photos vérifiées" } } : h)) } }}
      />,
    );
    expect(examine).toContain("Accepté");
    expect(examine).toContain("« L’annonce est conforme. »");
    expect(examine).toContain("Photos vérifiées");
    expect(examine).toContain("Annulée sur recours");
    const ligne = renderToStaticMarkup(<ListeAnnonces annonces={[{ ...LIGNE, recours: "a_examiner" }]} filtree={false} lienCompte />);
    expect(ligne).toContain("Recours à examiner");
  });

  it("une recherche se modère aussi ; la modification demandée se lit comme telle", () => {
    const r = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={{ ...RECHERCHE, moderation: MASQUEE }} />);
    expect(r).toContain("Masquée par l’équipe");
    expect(r).toContain(`data-gestes="recherche:${RECHERCHE.recherche.id}:`);
    const corrigee = renderToStaticMarkup(
      <FicheAnnonceVue signalements={SANS_SIGNALEMENT}
        f={{ ...FICHE, modifications: [{ ...FICHE.modifications[0], origine: "moderation", champs: ["title"] }] }}
      />,
    );
    expect(corrigee).toContain("Le vendeur, sur demande de l’équipe");
  });
});

describe("la fiche d'une recherche « Je cherche »", () => {
  it("son budget, son urgence, et les annonces qu'on lui a proposées", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={RECHERCHE} />);
    expect(f).toContain("Recherche « Je cherche »");
    expect(f).toContain("Offres reçues");
    expect(f).toContain("Cette semaine");
    expect(f).toContain("80,00");
    expect(f).toContain(`href="/annonces/${ID}"`);
    expect(f).toContain("Elle est comme neuve.");
    const expiree = renderToStaticMarkup(
      <FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={{ ...RECHERCHE, recherche: { ...RECHERCHE.recherche, expiree: true } }} />,
    );
    expect(expiree).toContain("Expirée");
  });
});

describe("la vérification avant publication (D25)", () => {
  const ATTEND: ModerationFiche = {
    ...RIEN,
    etat: "en_verification",
    verification: {
      dossier: "DOS-000042", dossier_id: "d0000000-0000-4000-a000-000000000042", depuis: "2026-09-30T09:00:00Z",
      statut: "ouvert", clos_le: null, pourquoi: "Contrefaçons fréquentes : vérifier les photos et la facture",
    },
    possibles: { ...RIEN.possibles, masquer: false, retirer: false, autoriser: true, refuser: true },
  };

  it("une ligne dit qu'elle attend l'équipe ; le filtre la retrouve", () => {
    const l = renderToStaticMarkup(
      <ListeAnnonces annonces={[{ ...LIGNE, moderation: "en_verification" }]} filtree={false} lienCompte />,
    );
    expect(l).toContain("En vérification par l’équipe");
    const r = renderToStaticMarkup(
      <ListeAnnonces annonces={[{ ...LIGNE, moderation: "refusee" }]} filtree={false} lienCompte />,
    );
    expect(r).toContain("Refusée par l’équipe");
  });

  it("elle attend : pourquoi sa catégorie est vérifiée, son dossier « À traiter », autoriser ou refuser", () => {
    const f = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={{ ...FICHE, moderation: ATTEND }} />);
    expect(f).toContain("En vérification par l’équipe");
    expect(f).toContain("sa catégorie est vérifiée avant publication");
    expect(f).toContain("Contrefaçons fréquentes : vérifier les photos et la facture");
    expect(f).toContain('href="/a-traiter?dossier=d0000000-0000-4000-a000-000000000042"');
    expect(f).toContain("DOS-000042");
    expect(f).toContain("attend la décision de l’équipe");
    expect(f).toContain(`data-gestes="annonce:${ID}:${JSON.stringify(ATTEND.possibles).replace(/"/g, "&quot;")}"`);
  });

  it("refusée : une issue défavorable, la décision au journal, et le recours contre le refus", () => {
    const recours: RecoursLu = {
      id: "rec2", reference: "REC-000043", statut: "a_examiner", depose_le: "2026-10-01T09:00:00Z",
      texte: "J’ai la facture de la boutique.", pieces: 1, examine_le: null, examine_par: null, reponse: null,
      motif: null, dossier: "DOS-000044", examinable: true, raison: null, pieces_ouvrables: true,
    };
    const refusee: ModerationFiche = {
      ...ATTEND,
      etat: "refusee",
      verification: { ...ATTEND.verification!, statut: "clos", clos_le: "2026-09-30T10:00:00Z" },
      historique: [
        { id: "m9", decision: "refuser", correction: null, correction_libelle: null,
          message: "La facture manque.", motif: "Authenticité non établie", le: "2026-09-30T10:00:00Z",
          par: "mod1@handtohand.pro", corrigee_le: null, en_vigueur: true, annulee: false, recours },
      ],
      recours_a_examiner: 1,
      possibles: { ...ATTEND.possibles, autoriser: false, refuser: false, corriger: false },
    };
    const f = renderToStaticMarkup(<FicheAnnonceVue signalements={SANS_SIGNALEMENT} f={{ ...FICHE, moderation: refusee }} />);
    expect(f).toContain("Refusée par l’équipe");
    expect(f).toContain("seul un recours accepté la publierait");
    expect(f).toContain("Vérifiée avant publication");
    expect(f).toContain("décidée le");
    expect(f).toContain("Publication refusée");
    expect(f).toContain("Contre : le refus de publication du");
    expect(f).toContain(`data-examiner="rec2:${ID}"`);
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

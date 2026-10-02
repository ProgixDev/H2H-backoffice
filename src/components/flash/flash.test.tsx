// CE QUE LA RUBRIQUE « OFFRES FLASH » MONTRE — rendu tel que le serveur l'envoie.
//
// La base place chaque offre sous son étape, calcule ses pistes et constate ses
// anomalies (`offresFlashSuivies.test.ts` dans hand-to-hand) ; on vérifie ici
// que l'écran le dit tel quel : l'étape et son échéance, la sélection, le
// paiement, les cinq pistes et où chacune se lit, les anomalies, les liens qui
// n'ouvrent que ce que l'équipier peut lire, et les compteurs du bandeau.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CompteursFlash, OffreFlash } from "@/lib/flash/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
// « Créer un ticket » se teste avec la fiche (`ActionsTicket`) : ici, ce que la liste lui passe.
vi.mock("@/components/operations/ActionsTicket", () => ({
  ActionsTicket: ({ o }: { o: object }) => <span data-ticket={JSON.stringify(o)} />,
}));

const { ListeFlash, DetailFlash } = await import("./ListeFlash");
const { FiltresOffresFlash } = await import("./FiltresFlash");
const { adresseFlash } = await import("@/lib/flash/types");

const ID = "ff000000-0000-4000-a000-0000000f1a01";
const PRODUIT = "ff000000-0000-4000-a000-0000000f1a02";
const VENDEUR = "ff000000-0000-4000-a000-0000000f1a03";
const PAIEMENT: OffreFlash = {
  id: ID, ref: "FLASH-FF000000", produit_id: PRODUIT, cree_le: "2026-10-01T08:00:00Z", maj_le: "2026-10-02T10:00:00Z",
  statut: "exclu_active", mode: "exclu", etape: "paiement",
  etape_libelle: "Paiement autorisé · confirmation du vendeur attendue",
  action_attendue: "Le vendeur confirme la disponibilité", acteur_attendu: "vendeur",
  echeance: "2026-10-04T10:00:00Z", bien_titre: "Montre ancienne", bien_image: "https://img.h2h/montre-t.jpg",
  prix_depart_cents: 5000, vendeur: "vendeur_ff", vendeur_id: VENDEUR, ville: "Nice", offres: 2,
  offres_fin: "2026-10-02T08:00:00Z", tentatives_exclu: 1, vagues_flash: 0,
  selectionnes: [{ pseudo: "alice_ff", mode: "exclu", vague: null, expire_le: "2026-10-04T10:00:00Z", statut: "active" }],
  paiement: {
    id: "ff000000-0000-4000-a000-0000000f1a04", numero: "HTH-2026-ABC123", statut: "awaiting_seller", total_cents: 8450,
    acheteur: "alice_ff", echeance: "2026-10-04T10:00:00Z", annulation_demandee: false,
  },
  pistes: [
    { code: "offres", libelle: "Offres publiques (24 h)", etat: "fait", le: "2026-10-02T08:00:00Z", echeance: null, detail: "2 offres reçues" },
    { code: "choix", libelle: "Choix du vendeur", etat: "fait", le: "2026-10-02T09:00:00Z", echeance: null,
      detail: "Exclu : alice_ff · tentative Exclu 1 sur 3" },
    { code: "acces", libelle: "Fenêtres d'achat (Exclu ou Accès Flash)", etat: "en_cours", le: "2026-10-02T09:00:00Z",
      echeance: "2026-10-04T10:00:00Z", detail: "Tenue pour alice_ff jusqu'à la confirmation du vendeur : son paiement est autorisé." },
    { code: "paiement", libelle: "Paiement", etat: "en_cours", le: "2026-10-02T09:02:00Z", echeance: "2026-10-04T10:00:00Z",
      detail: "Commande HTH-2026-ABC123 de alice_ff, 84,50 € : paiement autorisé, le vendeur confirme la disponibilité." },
    { code: "issue", libelle: "Paiement confirmé ou « Non vendu »", etat: "a_venir", le: null, echeance: null,
      detail: "À venir : le paiement confirmé, ou « Non vendu » si personne ne paie." },
  ],
  piste_courante: "acces", anomalies: [], moderation: null, est_test: false,
};
const NON_VENDUE: OffreFlash = {
  ...PAIEMENT, id: "ff000000-0000-4000-a000-0000000f1b01", ref: "FLASH-FF000001", statut: "unsold", etape: "non_vendue",
  etape_libelle: "Non vendu", action_attendue: null, acteur_attendu: null, echeance: null, selectionnes: [], paiement: null,
  pistes: PAIEMENT.pistes.map((p) => (p.code === "paiement" ? { ...p, etat: "sans_objet" as const, detail: "Sans objet : aucun achat." } : p)),
  piste_courante: null,
  anomalies: [
    { code: "achat_sans_acces", libelle: "Un achat sans accès accordé par le vendeur." },
    { code: "prix", libelle: "Un prix payé différent de l'offre de l'acheteur." },
  ],
  moderation: "masquee", est_test: true, vendeur: null, vendeur_id: null,
};

const liste = (offres: OffreFlash[], droits: Partial<Record<"lienCompte" | "lienAnnonce" | "peutModerer" | "peutTraiter", boolean>> = {}, filtree = false) =>
  renderToStaticMarkup(
    <ListeFlash offres={offres} filtree={filtree} lienCompte={droits.lienCompte ?? true} lienAnnonce={droits.lienAnnonce ?? true}
      peutModerer={droits.peutModerer ?? true} peutTraiter={droits.peutTraiter ?? true} />,
  );
const detail = (o: OffreFlash, droits: Partial<Record<"lienAnnonce" | "peutModerer" | "peutTraiter", boolean>> = {}) =>
  renderToStaticMarkup(
    <DetailFlash o={o} lienAnnonce={droits.lienAnnonce ?? true} peutModerer={droits.peutModerer ?? true}
      peutTraiter={droits.peutTraiter ?? true} />,
  );
const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

describe("la liste des offres Flash", () => {
  it("dit l’étape, qui elle attend, la sélection et le paiement — et la référence ouvre la fiche", () => {
    const html = decode(liste([PAIEMENT]));
    expect(html).toContain('href="/operations/FLASH-FF000000"');
    expect(html).toContain("Paiement autorisé · confirmation du vendeur attendue");
    expect(html).toContain("Le vendeur · Le vendeur confirme la disponibilité");
    expect(html).toContain("Exclu · tentative 1/3");
    expect(html).toContain("alice_ff");
    expect(html).toContain("84,50");
    expect(html).toContain("à partir de 50,00");
    expect(html).toContain(`href="/utilisateurs/${VENDEUR}"`);
    expect(html).not.toContain("anomalie");
  });

  it("dit les anomalies, la modération et le monde du test ; sans le droit, le vendeur ne s’ouvre pas", () => {
    const html = decode(liste([NON_VENDUE], { lienCompte: false }));
    expect(html).toContain("2 anomalies");
    expect(html).toContain("Masquée");
    expect(html).toContain("TEST");
    expect(html).toContain("Compte effacé");
    expect(html).not.toContain("/utilisateurs/");
  });

  it("vide, dit pourquoi", () => {
    expect(liste([])).toContain("Aucune offre Flash");
    expect(liste([], {}, true)).toContain("Aucune offre Flash pour ces filtres");
  });
});

describe("le détail d’une offre", () => {
  it("montre les cinq pistes, chacune avec le lien où elle se lit", () => {
    const html = decode(detail(PAIEMENT));
    for (const p of PAIEMENT.pistes) expect(html).toContain(p.detail);
    expect(html).toContain('href="/operations/FLASH-FF000000?onglet=bien-et-accord"');
    expect(html).toContain('href="/operations/HTH-2026-ABC123?onglet=paiements"');
    expect(html).toContain("Voir le paiement · HTH-2026-ABC123");
    expect(html).toContain(`href="/annonces/${PRODUIT}"`);
  });

  it("une piste sans objet n’a pas de lien ; sans paiement, pas de lien vers un achat", () => {
    const html = decode(detail(NON_VENDUE));
    expect(html).not.toContain("onglet=paiements");
    expect(html).toContain("Sans objet : aucun achat.");
  });

  it("dit les anomalies, et le ticket les porte", () => {
    const html = decode(detail(NON_VENDUE));
    expect(html).toContain("Un achat sans accès accordé par le vendeur.");
    expect(html).toContain("Un prix payé différent de l'offre de l'acheteur.");
    const ticket = JSON.parse(/data-ticket="([^"]*)"/.exec(detail(NON_VENDUE))![1].replace(/&quot;/g, '"'));
    expect(ticket).toEqual({
      objet_table: "courtage_listings", objet_id: NON_VENDUE.id,
      alerte_libelle: "Un achat sans accès accordé par le vendeur.", action_attendue: null, etape_libelle: "Non vendu",
    });
    expect(html).toContain("Examiner une anomalie");
  });

  it("n’ouvre que ce que l’équipier peut : l’annonce, la modération, le ticket", () => {
    const sans = decode(detail(PAIEMENT, { lienAnnonce: false, peutModerer: false, peutTraiter: false }));
    expect(sans).not.toContain("/annonces/");
    expect(sans).not.toContain("data-ticket");
    const lecteur = decode(detail(PAIEMENT, { peutModerer: false }));
    expect(lecteur).toContain("Ouvrir l’annonce");
    expect(lecteur).not.toContain("Retirer un contenu");
    expect(decode(detail(PAIEMENT))).toContain("Retirer un contenu selon les règles");
  });
});

describe("le bandeau des filtres", () => {
  const COMPTEURS: CompteursFlash = {
    toutes: 9, en_cours: 5, offres: 1, choix: 1, nouveau_choix: 0, exclu: 1, acces_flash: 1, paiement: 1,
    payee: 2, non_vendue: 1, annulee: 1, litige: 0, anomalie: 2,
  };
  const f = { filtre: "paiement" as const, q: "alice", test: true };

  it("chaque pastille a son compteur, garde la recherche, et dit laquelle est active", () => {
    const html = decode(renderToStaticMarkup(<FiltresOffresFlash f={f} compteurs={COMPTEURS} testVisible />));
    expect(html).toContain('href="/offres-flash?filtre=anomalie&q=alice&test=1"');
    expect(html).toMatch(/aria-current="page"[^>]*>Confirmation du vendeur<span[^>]*>1<\/span>/);
    expect(html).toMatch(/>Toutes<span[^>]*>9<\/span>/);
    expect(html).not.toContain("Litiges");
    expect(html).toContain("Inclure le monde du test");
  });

  it("« Litiges » se montre s’il y en a ; sans compteurs, les pastilles restent", () => {
    const avec = renderToStaticMarkup(<FiltresOffresFlash f={{ filtre: null, q: null, test: false }}
      compteurs={{ ...COMPTEURS, litige: 1 }} testVisible={false} />);
    expect(avec).toContain("Litiges");
    expect(avec).not.toContain("Inclure le monde du test");
    const sans = renderToStaticMarkup(<FiltresOffresFlash f={{ filtre: null, q: null, test: false }} compteurs={null} testVisible={false} />);
    expect(sans).toContain("Anomalies");
  });

  it("l’adresse ne garde que les filtres posés", () => {
    expect(adresseFlash({ filtre: null, q: null, test: false })).toBe("/offres-flash");
    expect(adresseFlash({ filtre: "anomalie", q: null, test: false })).toBe("/offres-flash?filtre=anomalie");
  });
});

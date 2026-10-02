// CE QUE LA RUBRIQUE « LIVE SHOPPING » MONTRE — rendu tel que le serveur l'envoie.
//
// La base place chaque live dans sa zone, lit son moment sur l'horloge du live
// et constate ses anomalies (`livesSuivis.test.ts` dans hand-to-hand) ; on
// vérifie ici que l'écran le dit tel quel : le moment et qui il attend, les
// places, les comptes, l'audience qui n'est pas mesurée, les réservations sous
// les états du cahier des charges (R14.3), et les liens.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { CompteursLives, LiveLigne, PlaceLive } from "@/lib/lives/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
vi.mock("@/components/operations/ActionsTicket", () => ({
  ActionsTicket: ({ o }: { o: object }) => <span data-ticket={JSON.stringify(o)} />,
}));

const { ListeLives, DetailLive } = await import("./ListeLives");
const { ListePlaces } = await import("./ListePlaces");
const { FiltresLivesVue } = await import("./FiltresLives");
const { adresseLives } = await import("@/lib/lives/types");

const ID = "ff000000-0000-4000-a000-0000000a1e01";
const HOTE = "ff000000-0000-4000-a000-0000000a1e02";
const DIRECT: LiveLigne = {
  id: ID, ref: "LIVE-FF000000", cree_le: "2026-10-01T08:00:00Z", maj_le: "2026-10-02T10:00:00Z",
  titre: "Vide-dressing du dimanche", image: null, format: "exclusive", statut: "live", diffusion: "live",
  vendeur: "hote_ff", vendeur_id: HOTE, ville: "Nice", programme_le: "2026-10-02T09:00:00Z",
  debut: "2026-10-02T09:01:00Z", fin: null, zone: "en_direct",
  moment: { etape: "article", article: "ff000000-0000-4000-a000-0000000a1e03", position: 3, phase: "propositions", fin: "2026-10-02T10:01:00Z" },
  moment_libelle: "Article 3 sur 8 · offres", action_attendue: "Les spectateurs font leurs offres", acteur_attendu: "acheteurs",
  echeance: "2026-10-02T10:01:00Z", articles: 8, vendus: 2, invendus: 0, retires: 1, en_cours: 5, acces_ouverts: 1,
  paiements_ouverts: 1,
  places: { total: 100, acheteurs_vip: null, confirmees: 60, reservees: 5, attente: 12, liberees: 3, spectateurs: 0 },
  rediffusion: false, anomalies: [], est_test: false,
};
const FINI: LiveLigne = {
  ...DIRECT, id: "ff000000-0000-4000-a000-0000000a1f01", ref: "LIVE-FF000001", statut: "ended", diffusion: "ended",
  zone: "termine", moment: { etape: "clos" }, moment_libelle: "Live terminé", action_attendue: null, acteur_attendu: null,
  echeance: null, fin: "2026-10-02T11:00:00Z", format: "classic",
  places: { total: null, acheteurs_vip: null, confirmees: 0, reservees: 0, attente: 0, liberees: 0, spectateurs: 0 },
  anomalies: [{ code: "vendu_sans_encaissement", libelle: "Un article dit vendu, sans commande encaissée." }],
  est_test: true, vendeur: null, vendeur_id: null,
};

const liste = (lives: LiveLigne[], o: { filtree?: boolean; lienCompte?: boolean; vide?: { titre: string; texte: string } } = {}) =>
  renderToStaticMarkup(
    <ListeLives lives={lives} filtree={o.filtree ?? false} lienCompte={o.lienCompte ?? true} peutTraiter vide={o.vide} />,
  );
const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

describe("la liste des lives", () => {
  it("dit le moment lu sur l’horloge, qui il attend, les articles et les places", () => {
    const html = decode(liste([DIRECT]));
    expect(html).toContain('href="/operations/LIVE-FF000000"');
    expect(html).toContain("Article 3 sur 8 · offres");
    expect(html).toContain("Les spectateurs · Les spectateurs font leurs offres");
    expect(html).toContain("65/100 occupées");
    expect(html).toContain("12 en attente");
    expect(html).toContain("2 vendus · 5 en cours");
    expect(html).toContain("Exclusif");
    expect(html).toContain(`href="/utilisateurs/${HOTE}"`);
  });

  it("un live Classique est ouvert à tous ; les anomalies, le monde du test, le compte effacé se disent", () => {
    const html = decode(liste([FINI], { lienCompte: false }));
    expect(html).toContain("Ouvert à tous");
    expect(html).toContain("1 anomalie");
    expect(html).toContain("TEST");
    expect(html).toContain("Compte effacé");
    expect(html).not.toContain("/utilisateurs/");
  });

  it("vide, dit pourquoi — et « Rediffusions » dit qu’elles n’existent pas encore", () => {
    expect(liste([])).toContain("Aucun live");
    expect(liste([], { filtree: true })).toContain("Aucun live pour ces filtres");
    const rediff = decode(liste([], { filtree: true, vide: { titre: "Aucune rediffusion", texte: "L’application n’enregistre pas encore de rediffusion de live." } }));
    expect(rediff).toContain("Aucune rediffusion");
    expect(rediff).toContain("n’enregistre pas encore");
  });
});

describe("le détail d’un live", () => {
  it("dit le déroulé, les comptes, l’audience non mesurée, et mène aux réservations", () => {
    const html = decode(renderToStaticMarkup(<DetailLive l={DIRECT} peutTraiter />));
    expect(html).toContain("8 au programme · 2 vendus · 0 non vendus · 1 retirés · 5 en cours");
    expect(html).toContain("1 accès · 1 paiements");
    expect(html).toContain("Non mesurée");
    expect(html).toContain('href="/live-shopping?zone=reservations&live=' + ID + '"');
    expect(html).toContain('href="/operations/LIVE-FF000000?onglet=bien-et-accord"');
    expect(html).not.toContain("R14.6");
  });

  it("terminé avec des paiements ouverts : la fin du live ne les annule pas (R14.6) ; le ticket porte l’anomalie", () => {
    const html = decode(renderToStaticMarkup(<DetailLive l={FINI} peutTraiter />));
    expect(html).toContain("La fin du live n’annule aucune échéance de paiement déjà ouverte");
    expect(html).toContain("Un article dit vendu, sans commande encaissée.");
    expect(html).not.toContain("zone=reservations");
    const ticket = JSON.parse(/data-ticket="([^"]*)"/.exec(renderToStaticMarkup(<DetailLive l={FINI} peutTraiter />))![1].replace(/&quot;/g, '"'));
    expect(ticket).toEqual({
      objet_table: "live_sessions", objet_id: FINI.id, alerte_libelle: "Un article dit vendu, sans commande encaissée.",
      action_attendue: null, etape_libelle: "Live terminé",
    });
    expect(renderToStaticMarkup(<DetailLive l={FINI} peutTraiter={false} />)).not.toContain("data-ticket");
  });
});

const place = (x: Partial<PlaceLive>): PlaceLive => ({
  id: `ff000000-0000-4000-a000-0000000b${String(Math.random()).slice(2, 6).padStart(4, "0")}`,
  live_id: ID, live_ref: "LIVE-FF000000", live_titre: "Vide-dressing du dimanche", live_format: "exclusive",
  live_zone: "programme", programme_le: "2026-10-05T18:00:00Z", pseudo: "alice_ff", role: "buyer", etat: "confirmed",
  categorie: "confirmee", categorie_libelle: "Réservation confirmée", acces: "acces_complet",
  acces_libelle: "Accès complet : regarder et proposer", rang: null, reserve_le: "2026-10-01T08:00:00Z",
  confirme_le: "2026-10-01T08:05:00Z", libere_le: null, verrou_fin: null, alerte_le: null, est_test: false, ...x,
});

describe("les réservations et les accès (R14.3)", () => {
  const places = [
    place({}),
    place({ pseudo: "bruno_ff", etat: "waitlisted", categorie: "alertee", categorie_libelle: "Alerte « place libérée » envoyée",
            rang: 1, confirme_le: null, alerte_le: "2026-10-02T08:00:00Z" }),
    place({ pseudo: "chloe_ff", etat: "waitlisted", categorie: "attente", categorie_libelle: "Liste d’attente", rang: 2, confirme_le: null }),
    place({ pseudo: "dany_ff", role: "spectator", acces: "spectateur", acces_libelle: "Spectateur seulement", etat: "reserved",
            categorie: "reservee", categorie_libelle: "Réservée, à confirmer", confirme_le: null, verrou_fin: "2026-10-05T18:00:30Z" }),
  ];

  it("chaque pastille compte ce qu’elle montre ; chaque place dit son état et son accès", () => {
    const html = decode(renderToStaticMarkup(<ListePlaces places={places} unLive={false} />));
    expect(html).toMatch(/>Toutes<span[^>]*>4<\/span>/);
    expect(html).toMatch(/>Confirmées<span[^>]*>1<\/span>/);
    expect(html).toMatch(/>En liste d’attente<span[^>]*>1<\/span>/);
    expect(html).toMatch(/>Libérées ou expirées<span[^>]*>0<\/span>/);
    expect(html).toContain("Alerte « place libérée » envoyée");
    expect(html).toContain("arrivé 1er");
    expect(html).toContain("arrivé 2e");
    expect(html).toContain("Spectateur seulement");
    expect(html).toContain("n’est pas un classement");
  });

  it("vide, dit pourquoi — d’un live, ou de tous", () => {
    expect(decode(renderToStaticMarkup(<ListePlaces places={[]} unLive />))).toContain("Personne n’a réservé de place pour ce live.");
    expect(decode(renderToStaticMarkup(<ListePlaces places={[]} unLive={false} />))).toContain("Un live Classique est ouvert à tous");
  });
});

describe("les onglets", () => {
  const COMPTEURS: CompteursLives = { tous: 9, programme: 3, en_direct: 2, termine: 4, rediffusions: 0, anomalie: 1 };

  it("chaque zone a son compteur ; les réservations comptent dans leur vue ; l’adresse garde la recherche", () => {
    const html = decode(renderToStaticMarkup(
      <FiltresLivesVue f={{ onglet: "en_direct", q: "dimanche", test: false, live: null }} compteurs={COMPTEURS} testVisible />,
    ));
    expect(html).toMatch(/aria-current="page"[^>]*>En direct<span[^>]*>2<\/span>/);
    expect(html).toMatch(/>Tous<span[^>]*>9<\/span>/);
    expect(html).toMatch(/>Réservations et accès<\/a>/);
    expect(html).toContain('href="/live-shopping?zone=anomalie&q=dimanche"');
    expect(html).toContain("Inclure le monde du test");
  });

  it("l’adresse ne garde que les filtres posés", () => {
    expect(adresseLives({ onglet: null, q: null, test: false, live: null })).toBe("/live-shopping");
    expect(adresseLives({ onglet: "reservations", live: ID, q: null, test: true })).toBe(`/live-shopping?zone=reservations&live=${ID}&test=1`);
  });
});

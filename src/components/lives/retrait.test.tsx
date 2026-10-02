// LA FICHE D'UN LIVE ET « RETIRER L'ARTICLE » (R14.4) — rendu tel que le serveur l'envoie.
//
// La base décide si un article se retire, et sinon pourquoi
// (`articlesRetires.test.ts` dans hand-to-hand) ; on vérifie ici que l'écran
// le dit tel quel : le bouton quand c'est possible, la raison sinon, les
// articles dans l'ordre de passage avec leur issue, et les liens.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { ArticleLive, FicheLive } from "@/lib/lives/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
vi.mock("@/components/operations/ActionsTicket", () => ({ ActionsTicket: () => <span data-ticket /> }));
// Le geste passe par la base : ici, seulement ce que l'écran en montre.
vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/lives/actions", () => ({ retirerArticle: vi.fn(), arreterLive: vi.fn(), annulerLive: vi.fn() }));
// Le bloc des signalements se teste à part (`signalements.test.tsx`) : ici, ce que la fiche lui passe.
vi.mock("@/components/signalements/BlocSignalements", () => ({
  SignalementsLus: ({ genre, cible, s }: { genre: string; cible: string; s: { a_examiner: number } | null }) => (
    <span data-signalements={`${genre}:${cible}:${s === null ? "echec" : s.a_examiner}`} />
  ),
}));

const { FicheLiveVue } = await import("./FicheLive");
const { GesteRetraitArticle } = await import("./GesteRetraitArticle");

const ID = "ff000000-0000-4000-a000-0000000c1e01";
const article = (x: Partial<ArticleLive>): ArticleLive => ({
  id: "ff000000-0000-4000-a000-0000000c1e02", position: 1, titre: "Montre ancienne", prix_depart_cents: 3000, image: null,
  issue: "pending", mode: null, en_cours: false, phase: null, offres: 0, meilleure_offre_cents: null, vendu_a: null,
  acces_ouverts: 0, retrait: { possible: true, raison: null }, ...x,
});
const FICHE: FicheLive = {
  id: ID, ref: "LIVE-FF000000", cree_le: "2026-10-01T08:00:00Z", maj_le: "2026-10-02T10:00:00Z",
  titre: "Vide-dressing du dimanche", image: null, format: "exclusive", statut: "live", diffusion: "live",
  vendeur: "hote_ff", vendeur_id: "ff000000-0000-4000-a000-0000000c1e09", ville: "Nice", programme_le: null,
  debut: "2026-10-02T09:00:00Z", fin: null, zone: "en_direct",
  moment: { etape: "article", position: 1, phase: "propositions", fin: "2026-10-02T10:01:00Z" },
  moment_libelle: "Article 1 sur 3 · offres", action_attendue: "Les spectateurs font leurs offres", acteur_attendu: "acheteurs",
  echeance: "2026-10-02T10:01:00Z", articles: [], vendus: 1, invendus: 0, retires: 0, en_cours: 2, acces_ouverts: 1,
  paiements_ouverts: 0,
  places: { total: 100, acheteurs_vip: null, confirmees: 10, reservees: 0, attente: 0, liberees: 0, spectateurs: 0 },
  rediffusion: false,
  anomalies: [{ code: "places_depassees", libelle: "Plus de places occupées que le live n’en compte." }],
  est_test: false,
  arret: null,
  arret_possible: { possible: true, raison: null },
  annulation: null,
  annulation_possible: { possible: false, raison: "Le live est en direct : arrêtez la diffusion plutôt." },
  options_payees_cents: 0,
};
const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

describe("« Retirer l’article »", () => {
  it("possible : le bouton ; sinon, la raison de la base, sans bouton", () => {
    expect(decode(renderToStaticMarkup(<GesteRetraitArticle live={ID} article={article({})} />))).toContain("Retirer l’article");
    const vendu = decode(renderToStaticMarkup(
      <GesteRetraitArticle live={ID} article={article({ issue: "sold", retrait: { possible: false, raison: "Il est vendu : il ne se retire plus." } })} />,
    ));
    expect(vendu).toContain("Il est vendu : il ne se retire plus.");
    expect(vendu).not.toContain("<button");
  });
});

describe("la fiche d’un live", () => {
  const html = decode(renderToStaticMarkup(
    <FicheLiveVue
      signalements={null}
      f={{
        ...FICHE,
        articles: [
          article({ en_cours: true, phase: "propositions", offres: 4, meilleure_offre_cents: 4200 }),
          article({ id: "ff000000-0000-4000-a000-0000000c1e03", position: 2, titre: "Sac", issue: "sold", vendu_a: "alice_ff",
                    mode: "exclu_live", retrait: { possible: false, raison: "Il est vendu : il ne se retire plus." } }),
          article({ id: "ff000000-0000-4000-a000-0000000c1e04", position: 3, titre: "Lampe", issue: "exclu_active", acces_ouverts: 1,
                    retrait: { possible: false, raison: "Un achat existe sur cet article (HTH-2026-ABC123) : il suit sa propre procédure, dans Transactions." } }),
        ],
      }}
    />,
  ));

  it("dit le déroulé, l’action attendue, les anomalies, et mène aux réservations et à la fiche complète", () => {
    expect(html).toContain("Article 1 sur 3 · offres");
    expect(html).toContain("Les spectateurs · Les spectateurs font leurs offres");
    expect(html).toContain("Plus de places occupées que le live n’en compte.");
    expect(html).toContain('href="/operations/LIVE-FF000000"');
    expect(html).toContain(`href="/live-shopping?zone=reservations&live=${ID}"`);
  });

  it("chaque article dans l’ordre, son issue, ses offres — et le retrait, ou pourquoi pas", () => {
    expect(html).toContain("en cours : offres");
    expect(html).toContain("meilleure 42,00");
    expect(html).toContain("à alice_ff");
    expect(html).toContain("Exclu Live");
    expect(html).toContain("Il est vendu : il ne se retire plus.");
    expect(html).toContain("HTH-2026-ABC123");
    expect((html.match(/Retirer l’article/g) ?? []).length).toBe(1);
  });
});

describe("« Arrêter la diffusion »", () => {
  it("possible : le bouton, et ce qu’il fait", () => {
    const html = decode(renderToStaticMarkup(<FicheLiveVue signalements={null} f={FICHE} />));
    expect(html).toContain("Arrêter la diffusion");
    expect(html).toContain("ouverts vont au bout");
    expect(html).toContain("la vidéo s’arrête chez le prestataire");
  });

  it("l’arrêt qui n’aboutit pas se dit : l’issue, les tentatives, l’erreur du prestataire", () => {
    const html = decode(renderToStaticMarkup(
      <FicheLiveVue signalements={null} f={{ ...FICHE, zone: "termine", statut: "ended",
        arret: { statut: "echoue", tentatives: 5, erreur: "fin 503 · relecture 503", demande_le: "2026-10-02T10:00:00Z", resultat_le: "2026-10-02T10:06:00Z" },
        arret_possible: { possible: false, raison: "Le live est déjà terminé." } }} />,
    ));
    expect(html).toContain("L’arrêt n’a pas abouti chez le prestataire");
    expect(html).toContain("5 tentatives");
    expect(html).toContain("fin 503 · relecture 503");
    expect(html).not.toContain("Le live est déjà terminé.");
  });

  it("en direct sans le droit : la raison de la base, sans bouton ; terminé sans arrêt : rien", () => {
    const sans = decode(renderToStaticMarkup(
      <FicheLiveVue signalements={null} f={{ ...FICHE, arret_possible: { possible: false, raison: "Arrêter un live demande la permission de modérer les lives." } }} />,
    ));
    expect(sans).toContain("Arrêter un live demande la permission de modérer les lives.");
    expect((sans.match(/>Arrêter la diffusion</g) ?? []).length).toBe(1);
    const fini = decode(renderToStaticMarkup(
      <FicheLiveVue signalements={null} f={{ ...FICHE, zone: "termine", arret: null, arret_possible: { possible: false, raison: "Le live est déjà terminé." } }} />,
    ));
    expect(fini).not.toContain("Arrêter la diffusion");
  });
});

describe("les signalements des spectateurs (R14.4)", () => {
  it("la fiche passe au bloc ceux du live — et dit l’échec de leur lecture plutôt qu’une liste vide", () => {
    const lus = { signalements: [], a_examiner: 2, recours_a_examiner: 0, dossier: null, possibles: { examiner: true, raison: null } };
    const html = decode(renderToStaticMarkup(<FicheLiveVue f={FICHE} signalements={lus} />));
    expect(html).toContain("Signalements");
    expect(html).toContain(`data-signalements="live:${ID}:2"`);
    expect(decode(renderToStaticMarkup(<FicheLiveVue f={FICHE} signalements={null} />))).toContain(
      `data-signalements="live:${ID}:echec"`,
    );
  });
});

describe("« Annuler le live » (D24 : aucun live n’attend d’autorisation)", () => {
  const PROGRAMME = { ...FICHE, zone: "programme" as const, statut: "upcoming" as const, debut: null, arret_possible: { possible: false, raison: "Le live n’a pas commencé : il n’y a pas de diffusion à arrêter." } };

  it("programmé, avec le droit : le bouton, et ce qu’il fait", () => {
    const html = decode(renderToStaticMarkup(
      <FicheLiveVue signalements={null} f={{ ...PROGRAMME, annulation_possible: { possible: true, raison: null }, options_payees_cents: 1999 }} />,
    ));
    expect(html).toContain(">Annuler le live<");
    expect(html).toContain("Aucun live n’attend d’autorisation");
  });

  it("programmé, sans le droit ou son propre live : la raison de la base, sans bouton", () => {
    const html = decode(renderToStaticMarkup(
      <FicheLiveVue signalements={null} f={{ ...PROGRAMME, annulation_possible: { possible: false, raison: "Ce live est le vôtre : un autre membre de l’équipe doit en décider." } }} />,
    ));
    expect(html).toContain("Ce live est le vôtre : un autre membre de l’équipe doit en décider.");
    expect((html.match(/>Annuler le live</g) ?? []).length).toBe(1);
  });

  it("annulé : par qui, quand, le message à l’hôte et le motif, distingués", () => {
    const html = decode(renderToStaticMarkup(
      <FicheLiveVue
        signalements={null}
        f={{
          ...PROGRAMME, zone: "termine", statut: "ended",
          annulation: { le: "2026-10-02T21:00:00Z", par: "mod1@handtohand.pro", message: "Le titre enfreint les règles.", motif: "Titre injurieux" },
          annulation_possible: { possible: false, raison: "Le live est déjà terminé." },
        }}
      />,
    ));
    expect(html).toContain("Annulé par l’équipe");
    expect(html).toContain("par mod1@handtohand.pro");
    expect(html).toContain("« Le titre enfreint les règles. »");
    expect(html).toContain("Motif interne : Titre injurieux");
    expect(html).not.toContain("Le live est déjà terminé.");
  });

  it("en direct : pas d’annulation — on arrête la diffusion", () => {
    const html = decode(renderToStaticMarkup(<FicheLiveVue signalements={null} f={FICHE} />));
    expect(html).not.toContain("Annuler le live");
  });
});

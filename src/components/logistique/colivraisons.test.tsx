// LES CO-LIVRAISONS (§ 12.3) — rendu tel que le serveur l'envoie (hand-to-hand `20261013002000`).
//
// La base décide de tout : le moment d'une co-livraison, qui détient le colis, l'étape et la prochaine action
// (celles de l'Activité en direct), les incidents ouverts, l'ordre et le monde (`colivraisonsLues.test.ts` dans
// hand-to-hand). On vérifie ici que l'écran le dit tel quel : la liste, ses filtres et leurs compteurs, et le lien
// vers la fiche.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Colivraison, CompteursColivraisons } from "@/lib/logistique/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));

const { ListeColivraisons } = await import("./ListeColivraisons");
const { FiltresListeColivraisons } = await import("./FiltresColivraisons");
const { adresseColivraisons } = await import("@/lib/logistique/types");

const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

const LIGNE: Colivraison = {
  id: "c0000000-0000-4000-a000-0000000000c1",
  commande: "c0000000-0000-4000-a000-0000000000d1",
  ref: "HTH-2026-313B53",
  suivi: "HTH1A2B3C4D5E",
  retour: false,
  par_recherche: true,
  statut: "group_created",
  etat_colis: "seller_confirmed",
  moment: "a_collecter",
  etape: "colivraison.confirmee",
  etape_libelle: "Co-livraison confirmée",
  action_attendue: "Remise du colis au cotransporteur",
  acteur_attendu: "vendeur",
  echeance: "2026-10-14T12:30:00Z",
  alerte: null,
  alerte_libelle: null,
  bien_titre: "Lampe de bureau",
  format: "M",
  vendeur: "lea_nice",
  acheteur: "sami_cannes",
  cotransporteur: "karim",
  cotransporteur_designe: true,
  hub_collecte: "Hub Gare Nice-Ville",
  ville_collecte: "Nice",
  collecte_prevue: "2026-10-14T12:30:00Z",
  collecte_validee_le: null,
  hub_remise: "Hub Gare de Cannes",
  ville_remise: "Cannes",
  remise_prevue: "2026-10-14T13:15:00Z",
  remise_validee_le: null,
  detenteur: "vendeur",
  incidents_ouverts: 0,
  est_test: false,
  cree_le: "2026-10-13T09:00:00Z",
};
const ligne = (c: Partial<Colivraison> = {}): Colivraison => ({ ...LIGNE, ...c });
const liste = (colivraisons: Colivraison[], filtree = false) =>
  decode(renderToStaticMarkup(<ListeColivraisons colivraisons={colivraisons} filtree={filtree} />));

describe("la liste des co-livraisons", () => {
  it("dit les trois participants, le colis, les deux rendez-vous, qui le détient et la prochaine action", () => {
    const html = liste([ligne()]);
    expect(html).toContain("HTH-2026-313B53");
    expect(html).toContain("« Lampe de bureau »");
    expect(html).toContain("Vendeur · lea_nice");
    expect(html).toContain("Acheteur · sami_cannes");
    expect(html).toContain("Cotransporteur · karim");
    expect(html).toContain("Hub Gare Nice-Ville · Nice");
    expect(html).toContain("Hub Gare de Cannes · Cannes");
    expect(html).toContain("prévue le 14/10/2026");
    expect(html).toContain("À collecter");
    expect(html).toContain("Le vendeur");
    expect(html).toContain("Co-livraison confirmée");
    expect(html).toContain("Remise du colis au cotransporteur · Vendeur");
    expect(html).not.toContain("incident ouvert");
    expect(html).not.toContain("TEST");
    expect(html).not.toContain("ancien parcours");
  });

  it("ouvre l’onglet Livraison de la fiche de l’opération", () => {
    expect(liste([ligne()])).toContain('href="/operations/HTH-2026-313B53?onglet=livraison"');
  });

  it("suit le colis : en route chez le cotransporteur, remise chez l’acheteur, l’heure validée à côté de l’heure prévue", () => {
    const enRoute = liste([ligne({ moment: "en_route", detenteur: "cotransporteur", collecte_validee_le: "2026-10-14T12:34:00Z" })]);
    expect(enRoute).toContain("En route");
    expect(enRoute).toContain("Le cotransporteur particulier");
    expect(enRoute).toContain("validée le 14/10/2026");

    const remise = liste([ligne({ moment: "remise", detenteur: "acheteur" })]);
    expect(remise).toContain("Remise");
    expect(remise).toContain("L’acheteur");
  });

  it("signale un incident ouvert, le monde du test, l’ancien parcours et une alerte — sans les inventer", () => {
    const html = liste([
      ligne({
        incidents_ouverts: 2, est_test: true, par_recherche: false,
        alerte: "retard", alerte_libelle: "En retard de 25 min",
      }),
    ]);
    expect(html).toContain("2 incidents ouverts");
    expect(html).toContain("TEST");
    expect(html).toContain("ancien parcours");
    expect(html).toContain("En retard de 25 min");
    expect(liste([ligne({ incidents_ouverts: 1 })])).toContain("1 incident ouvert");
  });

  it("ne remplace jamais ce qui manque : pas de cotransporteur, pas d’heure, pas de détenteur", () => {
    const html = liste([
      ligne({
        cotransporteur: null, cotransporteur_designe: false, collecte_prevue: null, detenteur: null,
        etape_libelle: null, action_attendue: null, echeance: null,
      }),
    ]);
    expect(html).toContain("Cotransporteur · pas encore désigné");
    expect(html).toContain("heure non fixée");
  });

  it("🔴 un pseudonyme absent n’est pas un compte effacé — ni un cotransporteur qui manque", () => {
    // Vu en production le 13/10/2026 : l'acheteur d'une co-livraison menée à son terme n'avait pas de pseudonyme.
    const html = liste([ligne({ acheteur: null, cotransporteur: null, cotransporteur_designe: true })]);
    expect(html).toContain("Acheteur · sans pseudonyme");
    expect(html).toContain("Cotransporteur · sans pseudonyme");
    expect(html).not.toContain("compte effacé");
    expect(html).not.toContain("pas encore désigné");
  });

  it("distingue une liste vide d’un filtre sans résultat", () => {
    expect(liste([])).toContain("Aucune co-livraison");
    expect(liste([])).not.toContain("pour ces filtres");
    expect(liste([], true)).toContain("Aucune co-livraison pour ces filtres");
  });

  it("dit quand la liste est tronquée", () => {
    const beaucoup = Array.from({ length: 300 }, (_, i) => ligne({ id: `c-${i}`, ref: `HTH-2026-${String(i).padStart(6, "0")}` }));
    expect(liste(beaucoup)).toContain("Les 300 premières sont affichées");
    expect(liste([ligne()])).not.toContain("Les 300 premières");
  });
});

describe("les filtres des co-livraisons", () => {
  const COMPTEURS: CompteursColivraisons = { incidents: 2, a_collecter: 5, en_route: 3, remises: 12, sans_remise: 4, tous: 24 };
  const filtres = (f: Parameters<typeof FiltresListeColivraisons>[0]["f"], compteurs: CompteursColivraisons | null = COMPTEURS, testVisible = true) =>
    decode(renderToStaticMarkup(<FiltresListeColivraisons f={f} compteurs={compteurs} testVisible={testVisible} />));

  it("affichent le compteur de chaque filtre et le total — ceux que la base a comptés", () => {
    const html = filtres({ filtre: null, q: null, test: false });
    for (const attendu of ["Toutes", "24", "Incident ouvert", "2", "À collecter", "5", "En route", "3", "Remises", "12", "Sans remise", "4"]) {
      expect(html).toContain(attendu);
    }
  });

  it("gardent l’onglet, la recherche et le monde du test dans chaque adresse (R4.10)", () => {
    const html = filtres({ filtre: "en_route", q: "karim", test: true });
    expect(html).toContain('href="/h2h-logistic?onglet=colivraisons&filtre=incidents&q=karim&test=1"');
    expect(html).toContain('href="/h2h-logistic?onglet=colivraisons&q=karim&test=1"'); // « Toutes »
    expect(html).toContain('name="onglet" value="colivraisons"');
    expect(html).toContain('name="filtre" value="en_route"');
    expect(html).toContain('aria-current="page"');
  });

  it("s’affichent sans nombre quand les compteurs n’ont pas pu être lus — pas avec des zéros", () => {
    const html = filtres({ filtre: null, q: null, test: false }, null);
    expect(html).toContain("Incident ouvert");
    expect(html).not.toMatch(/tabular-nums/);
  });

  it("ne proposent le monde du test qu’à qui peut le voir", () => {
    expect(filtres({ filtre: null, q: null, test: false }, COMPTEURS, true)).toContain("Inclure le monde du test");
    expect(filtres({ filtre: null, q: null, test: false }, COMPTEURS, false)).not.toContain("Inclure le monde du test");
  });

  it("l’adresse sans filtre reste celle de l’onglet", () => {
    expect(adresseColivraisons({ filtre: null, q: null, test: false })).toBe("/h2h-logistic?onglet=colivraisons");
  });
});

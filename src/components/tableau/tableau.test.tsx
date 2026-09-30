// CE QUE LE TABLEAU DE BORD MONTRE — rendu tel que le serveur l'envoie.
//
// Personne ne clique dans un navigateur pendant les tests : on vérifie donc ici
// que chaque carte dit ce qu'elle doit dire — un chiffre et le lien vers ce qui
// le compose, un « à venir » sans faux zéro, un refus qui ne ressemble pas à un
// vide — et que la liste d'un indicateur montre les lignes que la base a rendues.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { DetailIndicateur, Indicateur, Tableau } from "@/lib/tableau/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
// L'animation charge un fichier dans le navigateur : ici, seule sa présence compte.
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));

const { TableauIndicateurs } = await import("./TableauIndicateurs");
const { LignesIndicateur } = await import("./LignesIndicateur");

const registre = { point: 3, a_confirmer: false, definition: "Ce que compte cet indicateur, en une phrase." };
const INDICATEURS: Indicateur[] = [
  {
    ...registre,
    code: "transactions_commencees",
    groupe: "transactions",
    libelle: "Transactions commencées",
    portee: "periode",
    mesure: "nombre",
    unite: "centimes",
    disponible: true,
    a_venir: null,
    nombre: 8,
    valeur: null,
    a_part: 0,
    ouvrable: true,
    precedent: { nombre: 3, valeur: null },
  },
  {
    ...registre,
    code: "ventes",
    point: 4,
    groupe: "argent",
    libelle: "Montant total des ventes réalisées",
    portee: "periode",
    mesure: "somme",
    unite: "centimes",
    a_confirmer: true,
    disponible: true,
    a_venir: null,
    nombre: 4,
    valeur: 5_000_000,
    a_part: 0,
    ouvrable: false,
    precedent: { nombre: 2, valeur: 2_000_000 },
  },
  {
    ...registre,
    code: "compensations",
    point: 7,
    groupe: "argent",
    libelle: "Compensations",
    portee: "periode",
    mesure: "somme",
    unite: "centimes",
    disponible: false,
    a_venir: "Les compensations suivent les décisions d’incident : aucune ne s’exécute encore.",
  },
  {
    ...registre,
    code: "annonces_actives",
    point: 2,
    groupe: "annonces",
    libelle: "Annonces actives",
    portee: "instant",
    mesure: "nombre",
    unite: "centimes",
    disponible: true,
    a_venir: null,
    nombre: 0,
    valeur: null,
    a_part: 41,
    ouvrable: true,
    precedent: null,
  },
];
const TABLEAU: Tableau = {
  periode: { du: "2026-03-01", au: "2026-03-31", jours: 31, avant_du: "2026-01-29", avant_au: "2026-02-28" },
  lu_le: "2026-04-01T08:00:00Z",
  indicateurs: INDICATEURS,
};

/** La carte d'un indicateur, isolée du reste de la page. */
function carte(html: string, libelle: string): string {
  const cartes = html.split("<article").slice(1);
  const c = cartes.find((x) => x.includes(`>${libelle}</h3>`));
  if (!c) throw new Error(`carte introuvable : ${libelle}`);
  return c.slice(0, c.indexOf("</article>"));
}

describe("le tableau de bord", () => {
  const html = renderToStaticMarkup(<TableauIndicateurs tableau={TABLEAU} f={{ du: null, au: null, test: false }} />);

  it("un indicateur montre son chiffre, son écart, et s'ouvre sur la période que la base a retenue", () => {
    const c = carte(html, "Transactions commencées");
    expect(c).toContain(">8</p>");
    expect(c).toContain("+5");
    expect(c).toContain("3 sur la période précédente");
    // L'adresse ne portait aucune période : le détail s'ouvre sur celle que la base a lue.
    expect(c).toContain('href="/tableau-de-bord/transactions_commencees?du=2026-03-01&amp;au=2026-03-31"');
    expect(c).toContain("Ouvrir ce qui compose « Transactions commencées »");
  });

  it("une somme dit ce qu'elle additionne, et une définition proposée le dit", () => {
    const c = carte(html, "Montant total des ventes réalisées");
    expect(c).toMatch(/50\s000,00\s€/);
    expect(c).toContain("4 commandes encaissées");
    expect(c).toContain("Définition proposée, à confirmer.");
  });

  it("un rôle qui lit le chiffre sans lire ses lignes n'a pas de lien — et on lui dit pourquoi", () => {
    const c = carte(html, "Montant total des ventes réalisées");
    expect(c).not.toContain("href=");
    expect(c).toContain("Votre rôle lit ce chiffre, pas ce qui le compose.");
  });

  it("ce qui n'existe pas encore n'affiche aucun chiffre : pas de faux zéro", () => {
    const c = carte(html, "Compensations");
    expect(c).toContain("À venir");
    expect(c).toContain("aucune ne s’exécute encore");
    expect(c).not.toMatch(/>\s*0[,\s]/);
    expect(c).not.toContain("€");
    expect(c).not.toContain("href=");
  });

  it("un instant se dit tel, ne se compare pas, et met la vitrine à part", () => {
    const c = carte(html, "Annonces actives");
    expect(c).toContain("À l’instant");
    expect(c).not.toContain("période précédente");
    expect(c).toContain("41 de vitrine, à part");
    // Zéro ligne : rien à ouvrir, et on le dit plutôt que d'offrir une liste vide.
    expect(c).not.toContain("href=");
    expect(c).toContain("Rien à ouvrir en ce moment.");
  });

  it("les groupes suivent l'ordre du cahier des charges, et l'argent distingue les ventes du chiffre d'affaires", () => {
    const titres = [...html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
    expect(titres).toEqual(["Annonces", "Transactions", "Argent"]);
    expect(html).toContain("les ventes entre utilisateurs ne sont pas le chiffre d’affaires de HandtoHand");
  });
});

describe("ce qui compose un chiffre", () => {
  const DETAIL: DetailIndicateur = {
    indicateur: {
      ...registre,
      code: "ventes",
      point: 4,
      groupe: "argent",
      libelle: "Montant total des ventes réalisées",
      portee: "periode",
      mesure: "somme",
      unite: "centimes",
      nombre: 2,
      valeur: 3_000_000,
      a_part: 0,
    },
    periode: { du: "2026-03-01", au: "2026-03-31", jours: 31 },
    lu_le: "2026-04-01T08:00:00Z",
    lignes: [
      {
        id: "a",
        reference: "HTH-2026-AAAAAA",
        libelle: "Vélo de ville",
        le: "2026-03-20T12:05:00Z",
        valeur: 1_000_000,
        detail: "acheteur_tb → vendeuse_tb",
        cible: "HTH-2026-AAAAAA",
        est_test: false,
      },
      {
        id: "b",
        reference: "HTH-2026-BBBBBB",
        libelle: "Lampe",
        le: "2026-03-05T10:05:00Z",
        valeur: 2_000_000,
        detail: "essai_ach_tb → essai_vend_tb",
        cible: "HTH-2026-BBBBBB",
        est_test: true,
      },
    ],
    tronquee: false,
  };

  it("chaque ligne porte sa date de Paris, sa référence, son montant — et ouvre sa fiche à l'onglet des paiements", () => {
    const html = renderToStaticMarkup(<LignesIndicateur detail={DETAIL} peutOuvrirFiche />);
    expect(html).toMatch(/30\s000,00\s€/);
    expect(html).toContain("2 commandes encaissées");
    expect(html).toContain("20/03/2026 13:05");
    expect(html).toContain('href="/operations/HTH-2026-AAAAAA?onglet=paiements"');
    expect(html).toMatch(/10\s000,00\s€/);
    expect(html).toContain("acheteur_tb → vendeuse_tb");
    // La ligne du monde du test se reconnaît.
    expect(html.split("TEST").length - 1).toBe(1);
    expect(html).toContain(">Montant</th>");
  });

  it("sans la lecture de l'activité, la référence se lit sans s'ouvrir", () => {
    const html = renderToStaticMarkup(<LignesIndicateur detail={DETAIL} peutOuvrirFiche={false} />);
    expect(html).toContain("HTH-2026-AAAAAA");
    expect(html).not.toContain("href=");
  });

  it("une liste vide se dit vide, une liste coupée se dit coupée", () => {
    const vide = renderToStaticMarkup(
      <LignesIndicateur
        detail={{ ...DETAIL, indicateur: { ...DETAIL.indicateur, nombre: 0, valeur: 0 }, lignes: [] }}
        peutOuvrirFiche
      />,
    );
    expect(vide).toContain("Rien sur cette période");
    expect(vide).not.toContain("<table");
    const coupee = renderToStaticMarkup(
      <LignesIndicateur detail={{ ...DETAIL, indicateur: { ...DETAIL.indicateur, nombre: 812 }, tronquee: true }} peutOuvrirFiche />,
    );
    expect(coupee).toContain("Les 2 lignes les plus récentes sont affichées, sur 812");
  });

  it("une durée se lit en durée, et des lignes sans référence n'ont pas de colonne vide", () => {
    const html = renderToStaticMarkup(
      <LignesIndicateur
        detail={{
          ...DETAIL,
          indicateur: { ...DETAIL.indicateur, code: "litiges_delai", mesure: "mediane", unite: "secondes", valeur: 691200 },
          lignes: [{ id: "c", reference: null, libelle: "Non-conformité", le: "2026-03-29T12:00:00Z", valeur: 864000, detail: null, cible: null, est_test: false }],
        }}
        peutOuvrirFiche
      />,
    );
    expect(html).toContain(">Durée</th>");
    expect(html).toContain("10 j");
    expect(html).not.toContain(">Référence</th>");
    expect(html).not.toContain(">Détail</th>");
  });
});

// LES RÉGLAGES DE LA PLATEFORME (§20, R20.3, R20.4) — rendu tel que le serveur l'envoie.
//
// La base décide de tout (`parametresChanges.test.ts` dans hand-to-hand) : ce qui se change, qui le
// demande et le valide, les bornes, une version programmée à la fois. On vérifie ici que l'écran le
// dit tel quel : la valeur en vigueur dans son unité, pourquoi un réglage est figé, le geste quand la
// base le permet, l'avant et l'après de chaque changement — et que la page des validations montre
// ce que la seconde personne relit.
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { GroupeReglages } from "@/lib/parametres/types";
import { valeurDite, versLaBase, versLaSaisie } from "@/lib/parametres/types";
import type { Validation } from "@/lib/equipe/types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...reste }: { href: string; children: ReactNode }) => (
    <a href={href} {...reste}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/marque/AnimationH2H", () => ({ AnimationH2H: () => <span data-animation /> }));
vi.mock("@/lib/db/useGeste", () => ({ useGeste: () => ({ lancer: vi.fn(), enCours: false }) }));
vi.mock("@/lib/parametres/actions", () => ({ demanderChangement: vi.fn(), annulerVersionReglage: vi.fn() }));
vi.mock("@/lib/equipe/actions", () => ({ deciderValidation: vi.fn() }));

const { ListeParametres } = await import("./ListeParametres");
const { ListeValidations } = await import("@/components/equipe/ListeValidations");

const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const FIGE = "L'application installée sur les téléphones l'annonce encore en toutes lettres.";

const DELAIS: GroupeReglages = {
  table: "ref.claim_windows",
  libelle: "Délais de réclamation et de retour",
  portee: "Les commandes passées à partir de sa date d'effet ; les commandes déjà passées gardent les leurs.",
  champs: [
    { colonne: "article_window_hours", libelle: "Réclamation sur un article reçu", description: "Après la réception.",
      unite: "heures", minimum: 24, maximum: 168, facultatif: false, modifiable: false, raison_figee: FIGE },
    { colonne: "delivery_window_days", libelle: "Réclamation sur un colis non reçu", description: "Après l'expédition.",
      unite: "jours", minimum: 7, maximum: 60, facultatif: false, modifiable: false, raison_figee: FIGE },
  ],
  en_vigueur: { version: 1, depuis: "2026-08-13T16:03:28Z", valeurs: { article_window_hours: 48, delivery_window_days: 30 } },
  programmees: [],
  historique: [{ version: 1, depuis: "2026-08-13T16:03:28Z", changement: null }],
  demandes: [],
  possible: { demander: false, raison: "Aucun de ces réglages ne se change encore d'ici : chacun dit pourquoi." },
};

const FRAIS: GroupeReglages = {
  table: "ref.commission_config",
  libelle: "Frais de service, commission et protection",
  portee: "Les commandes passées à partir de sa date d'effet.",
  champs: [
    { colonne: "service_fee_rate", libelle: "Taux des frais de service", description: "La part du prix.",
      unite: "taux", minimum: 0, maximum: 0.2, facultatif: false, modifiable: true, raison_figee: null },
    { colonne: "service_fee_max_cents", libelle: "Plafond des frais de service", description: "Jamais au-delà.",
      unite: "centimes", minimum: 100, maximum: 100000, facultatif: true, modifiable: true, raison_figee: null },
  ],
  en_vigueur: { version: 3, depuis: "2026-10-03T10:00:00Z", valeurs: { service_fee_rate: 0.05, service_fee_max_cents: 10000 } },
  programmees: [{
    version: 4, effet: "2026-11-01T00:00:00Z", valeurs: { service_fee_rate: 0.06, service_fee_max_cents: 10000 }, annulable: true,
    changement: { demandeur: "dira@handtohand.pro", demande_le: "2026-10-03T11:00:00Z", valideur: "dirb@handtohand.pro",
                  valide_le: "2026-10-03T12:00:00Z", motif: "Hausse annoncée", portee: "Les commandes…",
                  changements: [{ colonne: "service_fee_rate", libelle: "Taux des frais de service", unite: "taux", avant: 0.05, apres: 0.06 }] },
  }],
  historique: [
    { version: 3, depuis: "2026-10-03T10:00:00Z", changement: {
      demandeur: "dira@handtohand.pro", demande_le: "2026-10-03T09:00:00Z", valideur: "dirb@handtohand.pro",
      valide_le: "2026-10-03T10:00:00Z", motif: "Plafond relevé", portee: "Les commandes…",
      changements: [{ colonne: "service_fee_max_cents", libelle: "Plafond des frais de service", unite: "centimes", avant: 8000, apres: 10000 }] } },
    { version: 1, depuis: "2026-08-13T15:40:29Z", changement: null },
  ],
  demandes: [],
  possible: { demander: true, raison: null },
};

describe("les réglages", () => {
  const html = decode(renderToStaticMarkup(<ListeParametres groupes={[DELAIS, FRAIS]} />));

  it("figés : chaque réglage dit pourquoi, et aucun geste", () => {
    expect(html).toContain("Aucun de ces réglages ne se change encore d'ici : chacun dit pourquoi.");
    expect(html.split(FIGE).length - 1).toBe(2);
    // Le seul bouton « Demander un changement » est celui du groupe ouvert.
    expect(html.split("Demander un changement").length - 1).toBe(1);
  });

  it("la valeur en vigueur dans son unité, et les bornes", () => {
    expect(html).toContain(">48 h<");
    expect(html).toContain(">30 jours<");
    expect(html).toContain(">5 %<");
    expect(html).toMatch(/>100,00\s€</);
    expect(html).toMatch(/24 h – 168 h/);
    expect(html).toContain("ou aucun");
  });

  it("une version programmée : l'avant et l'après, qui, pourquoi — et l'annuler", () => {
    expect(html).toContain("Programmée");
    expect(html).toContain("Taux des frais de service : 5 % → ");
    expect(html).toContain("6 %");
    expect(html).toContain("Demandée par dira@handtohand.pro, validée par dirb@handtohand.pro");
    expect(html).toContain("« Hausse annoncée »");
    expect(html.split(">Annuler<").length - 1).toBe(1);
  });

  it("l'histoire : chaque changement, ou une version publiée par migration", () => {
    expect(html).toContain("Historique des versions");
    expect(html).toMatch(/Plafond des frais de service : 80,00\s€ → /);
    expect(html).toContain("« Plafond relevé »");
    expect(html).toContain("Publiée par migration");
  });
});

describe("la validation d'un changement", () => {
  it("la seconde personne relit l'avant, l'après, la date et la portée", () => {
    const v = {
      id: "v1", action: "parametres.modifier", libelle: "Modifier un paramètre de la plateforme",
      cible: "Frais de service, commission et protection", cible_id: null,
      parametres: { table: "ref.commission_config", effet: null, portee: "Les commandes passées à partir de sa date d'effet.",
                    changements: { h2h_max_value_cents: 15000 },
                    diff: [{ colonne: "h2h_max_value_cents", libelle: "Plafond de la co-livraison", unite: "centimes", avant: 10000, apres: 15000 }] },
      motif: "Les co-transporteurs portent plus", demandeur: "p1", demandeur_email: "dira@handtohand.pro",
      demande_le: "2026-10-03T07:00:00Z", expire_le: "2026-10-06T07:00:00Z", est_test: false, peut_decider: true,
    } as unknown as Validation;
    const html = decode(renderToStaticMarkup(<ListeValidations validations={[v]} />));
    expect(html).toMatch(/Plafond de la co-livraison : 100,00\s€ → /);
    expect(html).toMatch(/150,00\s€/);
    expect(html).toContain("En vigueur dès la validation");
    expect(html).toContain("Les commandes passées à partir de sa date d'effet.");
  });
});

describe("les unités", () => {
  it("l'équipe saisit des euros et des pourcentages, la base garde des centimes et des fractions", () => {
    expect(versLaBase("centimes", 0.7)).toBe(70);
    expect(versLaBase("centimes", 150)).toBe(15000);
    expect(versLaBase("taux", 5.5)).toBe(0.055);
    expect(versLaBase("jours", 30)).toBe(30);
    expect(versLaSaisie("centimes", 70)).toBe(0.7);
    expect(versLaSaisie("taux", 0.055)).toBe(5.5);
    expect(valeurDite("jours", 1)).toBe("1 jour");
    expect(valeurDite("minutes", 10)).toBe("10 min");
    expect(valeurDite("centimes", null)).toBe("aucun");
  });
});

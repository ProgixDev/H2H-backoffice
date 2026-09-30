// LE TABLEAU DE BORD MET EN FORME, IL NE COMPTE PAS.
//
// Ce que ce fichier vérifie : les périodes toutes faites (du calcul de
// calendrier, sans fuseau), ce qui se lit dans l'adresse, et la mise en forme
// d'un chiffre — son unité, ce qu'il mesure, son écart avec la période
// précédente, dit sans jugement.
import { describe, expect, it } from "vitest";
import { adresseTableau, decaler, jourValide, lireFiltres, prereglages } from "./periodes";
import { chiffre, duree, evolution, lignesComptees, valeurEnUnite, type IndicateurDisponible } from "./types";

const base: IndicateurDisponible = {
  code: "transactions_commencees",
  point: 3,
  groupe: "transactions",
  libelle: "Transactions commencées",
  definition: "Commandes passées pendant la période.",
  portee: "periode",
  mesure: "nombre",
  unite: "centimes",
  a_confirmer: false,
  disponible: true,
  a_venir: null,
  nombre: 8,
  valeur: null,
  a_part: 0,
  ouvrable: true,
  precedent: { nombre: 3, valeur: null },
};

describe("les périodes", () => {
  it("un jour de calendrier existe, ou n'est pas lu", () => {
    expect(jourValide("2026-03-31")).toBe(true);
    expect(jourValide("2028-02-29")).toBe(true);
    expect(jourValide("2026-02-29")).toBe(false);
    expect(jourValide("2026-13-01")).toBe(false);
    expect(jourValide("31/03/2026")).toBe(false);
    expect(jourValide("")).toBe(false);
  });

  it("décaler traverse les mois, les années et le changement d'heure", () => {
    expect(decaler("2026-03-01", -1)).toBe("2026-02-28");
    expect(decaler("2028-03-01", -1)).toBe("2028-02-29");
    expect(decaler("2026-12-31", 1)).toBe("2027-01-01");
    // Le 29 mars 2026 n'a que vingt-trois heures à Paris : un jour reste un jour.
    expect(decaler("2026-03-28", 2)).toBe("2026-03-30");
    expect(decaler("2026-10-24", 2)).toBe("2026-10-26");
  });

  it("les périodes toutes faites se comptent depuis aujourd'hui, bornes comprises", () => {
    const p = Object.fromEntries(prereglages("2026-03-31").map((x) => [x.code, [x.du, x.au]]));
    expect(p["7j"]).toEqual(["2026-03-25", "2026-03-31"]);
    expect(p["30j"]).toEqual(["2026-03-02", "2026-03-31"]);
    expect(p["90j"]).toEqual(["2026-01-01", "2026-03-31"]);
    expect(p.mois).toEqual(["2026-03-01", "2026-03-31"]);
    expect(p["mois-dernier"]).toEqual(["2026-02-01", "2026-02-28"]);
    expect(p.annee).toEqual(["2026-01-01", "2026-03-31"]);
    // En janvier, le mois dernier est décembre de l'an passé.
    const j = Object.fromEntries(prereglages("2027-01-15").map((x) => [x.code, [x.du, x.au]]));
    expect(j["mois-dernier"]).toEqual(["2026-12-01", "2026-12-31"]);
    expect(j.mois).toEqual(["2027-01-01", "2027-01-15"]);
  });

  it("la période reste dans l'adresse, du tableau comme du détail", () => {
    expect(adresseTableau({ du: null, au: null, test: false })).toBe("/tableau-de-bord");
    expect(adresseTableau({ du: "2026-03-01", au: "2026-03-31", test: false })).toBe(
      "/tableau-de-bord?du=2026-03-01&au=2026-03-31",
    );
    expect(adresseTableau({ du: "2026-03-01", au: "2026-03-31", test: true }, "ventes")).toBe(
      "/tableau-de-bord/ventes?du=2026-03-01&au=2026-03-31&test=1",
    );
  });

  it("une date illisible est ignorée ; le test ne se demande que si c'est permis", () => {
    expect(lireFiltres({ du: "2026-03-01", au: "2026-02-30", test: "1" }, true)).toEqual({
      du: "2026-03-01",
      au: null,
      test: true,
    });
    expect(lireFiltres({ du: ["2026-03-01", "2026-03-02"], test: "1" }, false)).toEqual({ du: null, au: null, test: false });
    expect(lireFiltres({}, true)).toEqual({ du: null, au: null, test: false });
  });
});

describe("la mise en forme d'un chiffre", () => {
  it("une durée se dit dans sa plus grande unité utile", () => {
    expect(duree(45 * 60)).toBe("45 min");
    expect(duree(5 * 3600)).toBe("5 h");
    expect(duree(5 * 3600 + 30 * 60)).toBe("5 h 30");
    expect(duree(47 * 3600 + 5 * 60)).toBe("47 h 05");
    expect(duree(8 * 86400)).toBe("8 j");
    expect(duree(2 * 86400 + 4 * 3600)).toBe("2 j 4 h");
  });

  it("une valeur porte son unité, et une absence de valeur n'est pas un zéro", () => {
    expect(valeurEnUnite(null, "centimes")).toBe("—");
    expect(valeurEnUnite(123456, "centimes")).toMatch(/^1\s234,56\s€$/);
    expect(valeurEnUnite(-295, "centimes")).toMatch(/^-2,95\s€$/);
    expect(valeurEnUnite(691200, "secondes")).toBe("8 j");
  });

  it("un compte se lit en nombre, une somme dans sa monnaie, une médiane dans sa durée", () => {
    expect(chiffre(base)).toBe("8");
    expect(lignesComptees(base)).toBeNull();
    const ventes = { ...base, code: "ventes", mesure: "somme" as const, nombre: 4, valeur: 5_000_000 };
    expect(chiffre(ventes)).toMatch(/^50\s000,00\s€$/);
    expect(lignesComptees(ventes)).toBe("4 commandes encaissées");
    expect(lignesComptees({ ...ventes, nombre: 1 })).toBe("1 commande encaissée");
    const delai = { ...base, code: "litiges_delai", mesure: "mediane" as const, unite: "secondes" as const, nombre: 3, valeur: 691200 };
    expect(chiffre(delai)).toBe("8 j");
    expect(lignesComptees(delai)).toBe("3 réclamations closes");
    // Sans réclamation close, pas de délai : un tiret, jamais « 0 min ».
    expect(chiffre({ ...delai, nombre: 0, valeur: null })).toBe("—");
  });

  it("l'écart avec la période précédente est signé, et dit ce qu'elle valait", () => {
    expect(evolution(base)).toEqual({ ecart: "+5", avant: "3" });
    expect(evolution({ ...base, nombre: 2 })).toEqual({ ecart: "−1", avant: "3" });
    expect(evolution({ ...base, nombre: 3 })).toEqual({ ecart: "=", avant: "3" });
    const revenus = { ...base, mesure: "somme" as const, nombre: 6, valeur: 2500, precedent: { nombre: 2, valeur: 4000 } };
    const e = evolution(revenus)!;
    expect(e.ecart).toMatch(/^−15,00\s€$/);
    expect(e.avant).toMatch(/^40,00\s€$/);
    // Un instant ne se compare pas ; une médiane sans ligne non plus.
    expect(evolution({ ...base, portee: "instant", precedent: null })).toBeNull();
    const delai = { ...base, mesure: "mediane" as const, unite: "secondes" as const, valeur: 691200 };
    expect(evolution({ ...delai, precedent: { nombre: 0, valeur: null } })).toBeNull();
    expect(evolution({ ...delai, precedent: { nombre: 2, valeur: 172800 } })).toEqual({ ecart: "+6 j", avant: "2 j" });
  });
});

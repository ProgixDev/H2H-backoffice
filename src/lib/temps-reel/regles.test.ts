import { describe, expect, it } from "vitest";
import { ciblesDe, concerne, estEnDirect, SILENCE_MAX, TOUT, type Cible } from "./regles";

describe("le temps réel porte-t-il ?", () => {
  const maintenant = 1_000_000;
  it("seulement rejoint ET avec un signe récent", () => {
    expect(estEnDirect({ connecte: true, dernierSigne: maintenant - 10_000 }, maintenant)).toBe(true);
    expect(estEnDirect({ connecte: false, dernierSigne: maintenant - 10_000 }, maintenant)).toBe(false);
    expect(estEnDirect({ connecte: true, dernierSigne: null }, maintenant)).toBe(false);
    expect(estEnDirect({ connecte: true, dernierSigne: maintenant - SILENCE_MAX }, maintenant)).toBe(false);
  });
});

describe("ce qu'un message fait relire", () => {
  const lot = (cibles: Cible[]) => new Set(cibles);

  it("une opération : l'activité, la file, et SA fiche seulement", () => {
    const cibles = lot(ciblesDe("operation", { id: 7, objet_table: "orders", objet_id: "abc" }));
    expect(concerne(["activite", "compteur=x"], cibles)).toBe(true);
    expect(concerne(["activite-evenements", false], cibles)).toBe(true);
    expect(concerne(["file", "tous"], cibles)).toBe(true);
    expect(concerne(["dossier", "d1"], cibles)).toBe(true);
    expect(concerne(["fiche", "orders", "abc"], cibles)).toBe(true);
    expect(concerne(["fiche", "orders", "autre"], cibles)).toBe(false);
  });

  it("la file : la file, les dossiers, et toutes les fiches ouvertes — pas l'activité", () => {
    const cibles = lot(ciblesDe("dossier", {}));
    expect(concerne(["file", "tous"], cibles)).toBe(true);
    expect(concerne(["fiche", "orders", "n-importe"], cibles)).toBe(true);
    expect(concerne(["activite", ""], cibles)).toBe(false);
  });

  it("un battement ne relit rien ; une reconnexion relit tout", () => {
    expect(ciblesDe("battement", { le: "maintenant" })).toEqual([]);
    const tout = lot(TOUT);
    for (const cle of [["activite", ""], ["file", "tous"], ["dossier", "x"], ["fiche", "orders", "y"]]) {
      expect(concerne(cle, tout)).toBe(true);
    }
    expect(concerne(["autre"], tout)).toBe(false);
    expect(concerne([42], tout)).toBe(false);
  });
});

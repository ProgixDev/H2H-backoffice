import { describe, expect, it } from "vitest";
import { compteARebours, etatSynchro, ilYA } from "./temps";

const T0 = Date.parse("2026-09-26T12:00:00Z");
const plus = (ms: number) => new Date(T0 + ms).toISOString();

describe("le compte à rebours", () => {
  it("dit le temps qui reste, et prévient sous l'heure", () => {
    expect(compteARebours(plus(12 * 60_000), T0)).toEqual({ texte: "dans 12 min", depassee: false, proche: true });
    expect(compteARebours(plus(2 * 3_600_000 + 5 * 60_000), T0)).toEqual({ texte: "dans 2 h 05", depassee: false, proche: false });
    expect(compteARebours(plus(3 * 86_400_000), T0).texte).toBe("dans 3 j");
  });
  it("dit de combien une échéance est dépassée", () => {
    expect(compteARebours(plus(-90 * 60_000), T0)).toEqual({ texte: "dépassée de 1 h 30", depassee: true, proche: false });
  });
});

describe("la dernière synchronisation", () => {
  it("passe de à jour à dégradé puis à périmé", () => {
    expect(etatSynchro(T0 - 10_000, false, T0)).toBe("a_jour");
    expect(etatSynchro(T0 - 10_000, true, T0)).toBe("degrade");
    expect(etatSynchro(T0 - 60_000, false, T0)).toBe("degrade");
    expect(etatSynchro(T0 - 91_000, false, T0)).toBe("perime");
    expect(etatSynchro(0, false, T0)).toBe("perime");
  });
  it("et se lit en mots", () => {
    expect(ilYA(T0 - 2_000, T0)).toBe("à l’instant");
    expect(ilYA(T0 - 40_000, T0)).toBe("il y a 40 s");
  });
});

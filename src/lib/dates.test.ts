// L'HEURE DE PARIS, OÙ QUE LA PAGE SOIT CALCULÉE.
//
// Les serveurs de Vercel sont à l'UTC : une date mise en forme sans fuseau y
// sortait avec deux heures de moins l'été. On vérifie ici chaque format contre
// des instants UTC connus, sous un fuseau de processus volontairement lointain,
// et qu'aucune date ne se met plus en forme hors de `lib/dates.ts`.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { dateCourte } from "./activite/temps";
import { anneeParis, dateHeure, horodatage, jour, jourMoyen } from "./dates";

const ETE = "2026-09-26T17:38:05Z"; // 19 h 38 à Paris (UTC+2)
const HIVER = "2026-12-26T17:38:05Z"; // 18 h 38 à Paris (UTC+1)

describe("les dates à l'heure de Paris", () => {
  // Si un format lisait le fuseau du processus, tout changerait ici.
  let avant: string | undefined;
  beforeAll(() => {
    avant = process.env.TZ;
    process.env.TZ = "Pacific/Kiritimati";
  });
  afterAll(() => {
    if (avant === undefined) delete process.env.TZ;
    else process.env.TZ = avant;
  });

  it("à l'heure d'été comme à l'heure d'hiver", () => {
    expect(dateHeure(ETE)).toBe("26/09/2026 19:38");
    expect(dateHeure(HIVER)).toBe("26/12/2026 18:38");
    expect(horodatage(ETE)).toBe("26/09/2026 19:38:05");
  });

  it("le jour est celui de Paris", () => {
    // 22 h 30 UTC le 26 : déjà le 27 à Paris.
    expect(jour("2026-09-26T22:30:00Z")).toBe("27/09/2026");
    expect(jourMoyen("2026-09-26T22:30:00Z")).toBe("27 sept. 2026");
  });

  it("sans date, un tiret", () => {
    expect(dateHeure(null)).toBe("—");
    expect(jour(undefined)).toBe("—");
    expect(jourMoyen(null)).toBe("—");
  });

  it("l'année courante se compte à Paris", () => {
    // Le 31 décembre à 23 h 30 UTC, il est 0 h 30 le 1er janvier à Paris.
    expect(anneeParis("2026-12-31T23:30:00Z")).toBe("2027");
    const nouvelAn = Date.parse("2027-01-01T10:00:00Z");
    expect(dateCourte("2026-12-31T23:30:00Z", nouvelAn)).toBe("01/01 00:30");
    expect(dateCourte(ETE, nouvelAn)).toBe("26/09/2026 19:38");
  });
});

describe("une seule façon de mettre une date en forme", () => {
  const SRC = join(__dirname, "..");

  function fichiers(dossier: string): string[] {
    return readdirSync(dossier).flatMap((e) => {
      const p = join(dossier, e);
      if (statSync(p).isDirectory()) return fichiers(p);
      return /\.(ts|tsx)$/.test(e) && !/\.(test|verif)\.tsx?$/.test(e) ? [p] : [];
    });
  }

  it("hors de lib/dates.ts, rien ne dépend du fuseau de la machine", () => {
    const interdit = /\.toLocale(Date|Time)?String\(|Intl\.DateTimeFormat|\.(get|set)(Hours|Minutes|Date|Day|Month|FullYear)\(/;
    const fautes = fichiers(SRC)
      .filter((f) => f !== join(SRC, "lib", "dates.ts"))
      .flatMap((f) =>
        readFileSync(f, "utf8")
          .split("\n")
          .flatMap((ligne, i) => (interdit.test(ligne) ? [`${relative(SRC, f)}:${i + 1}`] : [])),
      );
    expect(fautes).toEqual([]);
  });
});

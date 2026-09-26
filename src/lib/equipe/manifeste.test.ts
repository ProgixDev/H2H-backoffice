// LE MIROIR DU MANIFESTE DE hand-to-hand, ET LE CONTRAT À JOUR.
//
// `supabase/backoffice-rpc.json` (hand-to-hand) liste les fonctions `bo_*` que
// SEUL ce back-office appelle, avec le fichier qui les appelle. Côté
// hand-to-hand, `aucuneRpcOrpheline.test.ts` les admet parce qu'elles y sont ;
// ici, on vérifie que chacune est réellement appelée là où le manifeste le dit —
// sans quoi l'exception couvrirait une fonction que plus personne n'appelle.
//
// ✅ ON LIT LA COPIE DU CONTRAT (`src/lib/db/contrat/`, `npm run sync:contrat`) :
// le test tourne partout, CI comprise. Quand hand-to-hand est à côté, on vérifie
// en plus que la copie n'a pas pris de retard.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const RACINE = join(__dirname, "..", "..", "..");
const CONTRAT = join(RACINE, "src", "lib", "db", "contrat");
const DEPOT = process.env.H2H_APP_REPO || "C:/dev/hand-to-hand";

const lire = (f: string) => readFileSync(f, "utf8");
const sansEnTete = (texte: string) => texte.slice(texte.indexOf("\n") + 1);

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((e) => {
    const p = join(dossier, e);
    if (statSync(p).isDirectory()) return fichiers(p);
    return /\.(ts|tsx)$/.test(e) && !/\.(test|verif)\.tsx?$/.test(e) ? [p] : [];
  });
}

describe("manifeste des fonctions bo_*", () => {
  const manifeste: Record<string, string> = JSON.parse(lire(join(CONTRAT, "backoffice-rpc.json"))).fonctions;

  it("chaque fonction du manifeste est appelée depuis le fichier indiqué", () => {
    const fautes: string[] = [];
    for (const [nom, fichier] of Object.entries(manifeste)) {
      const chemin = join(RACINE, fichier);
      if (!existsSync(chemin)) fautes.push(`${nom} → ${fichier} (fichier absent)`);
      else if (!lire(chemin).includes(`"${nom}"`)) fautes.push(`${nom} → ${fichier} (pas d'appel)`);
    }
    expect(fautes).toEqual([]);
  });

  it("et tout appel bo_* du back-office figure au manifeste", () => {
    const appeles = new Set<string>();
    for (const f of fichiers(join(RACINE, "src"))) {
      if (f.startsWith(CONTRAT)) continue;
      for (const m of lire(f).matchAll(/["'](bo_[a-z_]+)["']/g)) appeles.add(m[1]);
    }
    expect([...appeles].filter((n) => !(n in manifeste)).sort()).toEqual([]);
  });
});

describe("le contrat avec la base", () => {
  it("dit d'où il vient", () => {
    expect(lire(join(CONTRAT, "database.types.ts"))).toMatch(/^\/\/ Copie de hand-to-hand@[0-9a-f]{7,}/);
    expect(JSON.parse(lire(join(CONTRAT, "backoffice-rpc.json")))._origine).toMatch(/^hand-to-hand@[0-9a-f]{7,}/);
  });

  it.skipIf(!existsSync(join(DEPOT, "supabase", "types", "database.types.ts")))(
    "n'a pas pris de retard sur hand-to-hand (sinon : npm run sync:contrat)",
    () => {
      expect(sansEnTete(lire(join(CONTRAT, "database.types.ts"))))
        .toBe(lire(join(DEPOT, "supabase", "types", "database.types.ts")));
      const { _origine, ...copie } = JSON.parse(lire(join(CONTRAT, "backoffice-rpc.json")));
      void _origine;
      expect(copie).toEqual(JSON.parse(lire(join(DEPOT, "supabase", "backoffice-rpc.json"))));
    },
  );
});

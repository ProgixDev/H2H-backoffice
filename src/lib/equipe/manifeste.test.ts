// LE MIROIR DU MANIFESTE DE hand-to-hand.
//
// `hand-to-hand/supabase/backoffice-rpc.json` liste les fonctions `bo_*` que
// SEUL ce back-office appelle, avec le fichier qui les appelle. Côté
// hand-to-hand, `aucuneRpcOrpheline.test.ts` les admet parce qu'elles y sont ;
// ici, on vérifie que chacune est réellement appelée là où le manifeste le dit —
// sans quoi l'exception couvrirait une fonction que plus personne n'appelle.
//
// ⚠️ SAUTÉ QUAND LE DÉPÔT DE L'APPLICATION N'EST PAS À CÔTÉ (CI) : le chemin se
// règle par H2H_APP_REPO.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const DEPOT = process.env.H2H_APP_REPO || "C:/dev/hand-to-hand";
const MANIFESTE = join(DEPOT, "supabase", "backoffice-rpc.json");
const RACINE = join(__dirname, "..", "..", "..");

function fichiers(dossier: string): string[] {
  return readdirSync(dossier).flatMap((e) => {
    const p = join(dossier, e);
    if (statSync(p).isDirectory()) return fichiers(p);
    return /\.(ts|tsx)$/.test(e) && !/\.test\.tsx?$/.test(e) ? [p] : [];
  });
}

describe.skipIf(!existsSync(MANIFESTE))("manifeste des fonctions bo_*", () => {
  const manifeste: Record<string, string> = JSON.parse(readFileSync(MANIFESTE, "utf8")).fonctions;

  it("chaque fonction du manifeste est appelée depuis le fichier indiqué", () => {
    const fautes: string[] = [];
    for (const [nom, fichier] of Object.entries(manifeste)) {
      const chemin = join(RACINE, fichier);
      if (!existsSync(chemin)) fautes.push(`${nom} → ${fichier} (fichier absent)`);
      else if (!readFileSync(chemin, "utf8").includes(`"${nom}"`)) fautes.push(`${nom} → ${fichier} (pas d'appel)`);
    }
    expect(fautes).toEqual([]);
  });

  it("et tout appel bo_* du back-office figure au manifeste", () => {
    const appeles = new Set<string>();
    for (const f of fichiers(join(RACINE, "src"))) {
      for (const m of readFileSync(f, "utf8").matchAll(/["'](bo_[a-z_]+)["']/g)) appeles.add(m[1]);
    }
    expect([...appeles].filter((n) => !(n in manifeste)).sort()).toEqual([]);
  });
});

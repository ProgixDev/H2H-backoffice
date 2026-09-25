// LES JETONS COMMITÉS SONT CEUX QUE L'APPLICATION PRODUIT AUJOURD'HUI.
//
// `src/styles/tokens.{css,ts}` sont générés depuis `src/constants/` de
// hand-to-hand. Un fichier généré que personne ne régénère a l'air à jour et ne
// l'est plus : le jour où une couleur change dans l'application, ce test le dit.
// (Même règle que `documentAttestationGenere` côté hand-to-hand.)
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { construire, SORTIE_CSS, SORTIE_TS } from "../../scripts/sync-tokens.mjs";

const DEPOT = process.env.H2H_APP_REPO || "C:/dev/hand-to-hand";

describe.skipIf(!existsSync(join(DEPOT, "src", "constants", "Colors.ts")))("jetons de design", () => {
  it("correspondent aux constantes de l'application", () => {
    const css = readFileSync(SORTIE_CSS, "utf8");
    // On regénère avec le commit inscrit dans l'en-tête : seules les VALEURS comptent.
    const commit = /hand-to-hand@([^\s,]+)/.exec(css)?.[1] ?? "inconnu";
    const attendu = construire(DEPOT, commit);
    expect(css).toBe(attendu.css);
    expect(readFileSync(SORTIE_TS, "utf8")).toBe(attendu.ts);
  });
});

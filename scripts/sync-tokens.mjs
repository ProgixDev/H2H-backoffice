// Projette les jetons de design de l'application HandToHand dans le back-office.
//
// Usage :  node scripts/sync-tokens.mjs [chemin/vers/hand-to-hand]
//          (à défaut : $H2H_APP_REPO, puis C:/dev/hand-to-hand)
//
// 🔴 LA SOURCE DE VÉRITÉ EST L'APPLICATION. Couleurs, espacements, rayons et
// typographie vivent dans `src/constants/{Colors,Spacing,Typography}.ts` de
// hand-to-hand. Les recopier à la main, c'est garantir qu'ils divergeront :
// l'application sœur h2h-logistic, recopiée ainsi, n'a déjà plus le même orange.
//
// ⚠️ `Typography.ts` importe un TYPE de react-native sans `import type` : sous
// Node, l'importer chargerait react-native. On retire donc les imports, on
// transpile avec TypeScript, et on évalue dans un bac à sable — ces fichiers ne
// contiennent que des littéraux.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import ts from 'typescript';

const ICI = dirname(fileURLToPath(import.meta.url));
export const RACINE = resolve(ICI, '..');
export const SORTIE_CSS = join(RACINE, 'src', 'styles', 'tokens.css');
export const SORTIE_TS = join(RACINE, 'src', 'styles', 'tokens.ts');

export function depotParDefaut() {
  return process.env.H2H_APP_REPO || 'C:/dev/hand-to-hand';
}

function evaluer(depot, fichier) {
  const source = readFileSync(join(depot, 'src', 'constants', fichier), 'utf8')
    .replace(/^import\s.*$/gm, '');
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const sortie = { exports: {} };
  vm.runInNewContext(js, { module: sortie, exports: sortie.exports }, { filename: fichier, timeout: 1000 });
  return sortie.exports;
}

export function lireConstantes(depot) {
  const { Colors } = evaluer(depot, 'Colors.ts');
  const { Spacing, BorderRadius } = evaluer(depot, 'Spacing.ts');
  const { Typography } = evaluer(depot, 'Typography.ts');
  if (!Colors?.light || !Colors?.dark) throw new Error('Colors.light / Colors.dark introuvables');
  // ⚠️ LES DEUX THÈMES DOIVENT PORTER LES MÊMES CLÉS. Une couleur absente du
  // thème sombre retomberait silencieusement sur la claire.
  const manquantes = Object.keys(Colors.light).filter((k) => !(k in Colors.dark));
  if (manquantes.length) throw new Error(`thème sombre incomplet : ${manquantes.join(', ')}`);
  return { Colors, Spacing, BorderRadius, Typography };
}

export function commitDe(depot) {
  try {
    return execFileSync('git', ['-C', depot, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'inconnu';
  }
}

const kebab = (cle) => cle.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
const graisse = (famille) => Number(/Poppins_(\d{3})/.exec(famille ?? '')?.[1] ?? 400);

export function construire(depot, commit) {
  const { Colors, Spacing, BorderRadius, Typography } = lireConstantes(depot);
  const entete = `Généré par scripts/sync-tokens.mjs — ne pas modifier à la main.\n   Source : hand-to-hand@${commit}, src/constants/{Colors,Spacing,Typography}.ts`;

  const couleurs = (theme) =>
    Object.entries(theme).map(([k, v]) => `  --h2h-${kebab(k)}: ${v};`).join('\n');
  const espaces = Object.entries(Spacing).map(([k, v]) => `  --h2h-espace-${k}: ${v}px;`).join('\n');
  const rayons = Object.entries(BorderRadius).map(([k, v]) => `  --h2h-rayon-${k}: ${v}px;`).join('\n');
  const typo = Object.entries(Typography)
    .map(([k, s]) => [
      `  --h2h-texte-${kebab(k)}-taille: ${s.fontSize}px;`,
      `  --h2h-texte-${kebab(k)}-interligne: ${s.lineHeight}px;`,
      `  --h2h-texte-${kebab(k)}-graisse: ${graisse(s.fontFamily)};`,
    ].join('\n'))
    .join('\n');

  const css = `/* ${entete} */
:root {
${couleurs(Colors.light)}
${espaces}
${rayons}
${typo}
}

.dark {
${couleurs(Colors.dark)}
}
`;

  const typographie = Object.fromEntries(
    Object.entries(Typography).map(([k, s]) => [
      k,
      { taille: s.fontSize, interligne: s.lineHeight, graisse: graisse(s.fontFamily) },
    ]),
  );
  const tsSortie = `// ${entete.replace('\n   ', '\n// ')}
export const SOURCE = { depot: 'hand-to-hand', commit: ${JSON.stringify(commit)} } as const;

export const couleurs = ${JSON.stringify({ light: Colors.light, dark: Colors.dark }, null, 2)} as const;

export const espaces = ${JSON.stringify(Spacing, null, 2)} as const;

export const rayons = ${JSON.stringify(BorderRadius, null, 2)} as const;

export const typographie = ${JSON.stringify(typographie, null, 2)} as const;
`;
  return { css, ts: tsSortie };
}

const lanceDirectement = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (lanceDirectement) {
  const depot = resolve(process.argv[2] || depotParDefaut());
  if (!existsSync(join(depot, 'src', 'constants', 'Colors.ts'))) {
    console.error(`dépôt hand-to-hand introuvable : ${depot}`);
    process.exit(1);
  }
  const commit = commitDe(depot);
  const { css, ts: sortieTs } = construire(depot, commit);
  mkdirSync(dirname(SORTIE_CSS), { recursive: true });
  writeFileSync(SORTIE_CSS, css);
  writeFileSync(SORTIE_TS, sortieTs);
  console.log(`jetons écrits depuis hand-to-hand@${commit}`);
}

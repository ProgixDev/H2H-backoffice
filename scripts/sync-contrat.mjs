// LE CONTRAT AVEC LA BASE — copié depuis hand-to-hand, daté de son commit.
//
// hand-to-hand génère les types de la base (`npm run types`) et tient le
// manifeste des fonctions `bo_*` que seul ce back-office appelle. Ce script les
// recopie dans `src/lib/db/contrat/`, avec le commit d'origine en tête : le
// back-office se vérifie seul (CI comprise), contre une version connue.
//
//   npm run sync:contrat                 (hand-to-hand à côté : C:/dev/hand-to-hand)
//   npm run sync:contrat -- ../hand-to-hand
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DEPOT = process.argv[2] || process.env.H2H_APP_REPO || 'C:/dev/hand-to-hand';
const CIBLE = join(import.meta.dirname, '..', 'src', 'lib', 'db', 'contrat');

const commit = execSync('git rev-parse --short HEAD', { cwd: DEPOT, encoding: 'utf8' }).trim();
const propre = execSync('git status --porcelain -- supabase/types supabase/backoffice-rpc.json', { cwd: DEPOT, encoding: 'utf8' }).trim() === '';
const origine = `hand-to-hand@${commit}${propre ? '' : ' (+ modifications non commitées)'}`;

mkdirSync(CIBLE, { recursive: true });

const types = readFileSync(join(DEPOT, 'supabase', 'types', 'database.types.ts'), 'utf8');
writeFileSync(join(CIBLE, 'database.types.ts'),
  `// Copie de ${origine} : supabase/types/database.types.ts. Ne pas modifier : npm run sync:contrat.\n${types}`);

const manifeste = JSON.parse(readFileSync(join(DEPOT, 'supabase', 'backoffice-rpc.json'), 'utf8'));
writeFileSync(join(CIBLE, 'backoffice-rpc.json'),
  `${JSON.stringify({ _origine: origine, ...manifeste }, null, 2)}\n`);

console.log(`contrat copié depuis ${origine}`);

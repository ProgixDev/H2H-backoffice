// Copie depuis l'application HandToHand les éléments de marque et les
// animations que le back-office affiche.
//
// Usage :  node scripts/sync-marque.mjs [chemin/vers/hand-to-hand]
//          (à défaut : $H2H_APP_REPO, puis C:/dev/hand-to-hand)
//
// ⚠️ ON NE COPIE QUE CE QUI SERT, ET SOUS UN NOM QUI DIT OÙ. Les animations
// inutilisées de l'application (`cotransport`, `hammer`, `relais`) et le doublon
// `cherche.json` (identique à `recherche.json`) restent là-bas.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const depot = resolve(process.argv[2] || process.env.H2H_APP_REPO || 'C:/dev/hand-to-hand');

const COPIES = [
  // La marque : la poignée de main, sans fond, à poser sur la pastille dégradée.
  ['assets/stripe/handtohand-logo.png', 'public/marque/logo-512.png'],
  ['assets/stripe/handtohand-icon.png', 'public/marque/logo-256.png'],
  // L'icône d'onglet : celle de l'application est encore le gabarit d'Expo.
  ['assets/stripe/handtohand-icon.png', 'src/app/icon.png'],
  // Les animations, par usage dans le back-office.
  ...[
    'sandtime', // attente, échéance
    'siren', // urgence de sécurité
    'handoff', // opération menée à son terme
    'vault-shield', // audit, seconde validation
    'flash', // Offres Flash
    'fire', // Offres Flash (ouvertes)
    'live', // Live Shopping
    'car', // co-livraison
    'Diamond', // Pépites
    'coin', // paiements
    'annonce', // annonces
    'recherche', // aucun résultat
    'troquez', // échanges
  ].map((nom) => [`assets/lottie/${nom}.json`, `public/lottie/${nom}.json`]),
];

let manquants = 0;
for (const [source, cible] of COPIES) {
  const de = join(depot, source);
  if (!existsSync(de)) {
    console.error(`introuvable : ${de}`);
    manquants++;
    continue;
  }
  const vers = join(RACINE, cible);
  mkdirSync(dirname(vers), { recursive: true });
  copyFileSync(de, vers);
}
if (manquants) process.exit(1);
console.log(`${COPIES.length} fichiers copiés depuis ${depot}`);

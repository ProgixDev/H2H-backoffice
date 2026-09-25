# Back-office HandtoHand

L'outil de l'équipe HandtoHand pour superviser la Marketplace, H2H Logistic, les
Offres Flash et le Live Shopping, traiter les dossiers et appliquer les procédures.
Le cahier des charges est dans `docs/`.

## La règle de ce dépôt

**La base décide, l'écran montre.** Ce dépôt ne contient que l'interface. Toute
règle — qui peut faire quoi, à quelle étape, avec quel motif, sous quelle seconde
validation — vit dans la base Supabase partagée avec les applications, dans le
dépôt `hand-to-hand` (migrations et tests PGlite). Un bouton n'affiche que les
actions que la base déclare possibles.

## Démarrer

```sh
npm install
npm run dev            # http://localhost:3000
```

## Scripts

| Script | Rôle |
|---|---|
| `npm run sync:tokens -- <chemin/hand-to-hand>` | Régénère `src/styles/tokens.{css,ts}` depuis `src/constants/` de l'application |
| `npm run sync:marque -- <chemin/hand-to-hand>` | Recopie le logo, l'icône d'onglet et les animations Lottie de l'application |
| `npm run lint` · `npm run typecheck` · `npm test` · `npm run build` | Vérifications |

Les jetons, le logo et les animations viennent **de l'application** : on ne les
modifie pas ici, on les resynchronise.

## Pile

Next.js 16 (App Router), React 19, TypeScript strict, Tailwind CSS v4 et
shadcn/ui (Radix), lucide-react (Feather, comme l'application), lottie-react,
TanStack Query, Clerk (même instance que l'application), Supabase.

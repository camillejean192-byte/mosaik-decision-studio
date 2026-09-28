# MOSAÏK — Decision Studio

MOSAÏK est un atelier visuel local-first pour cartographier les décisions complexes. Les options, critères, signaux et risques deviennent des pièces manipulables dont les relations alimentent une lecture de robustesse transparente.

**Application : [mosaik-decision-studio.vercel.app](https://mosaik-decision-studio.vercel.app/)**

## Expérience

- canvas spatial avec glisser-déposer et relations éditables ;
- matrice de robustesse calculée à partir des poids, impacts et niveaux de confiance ;
- inspecteur contextuel, filtres de calques et mode focus ;
- palette de commandes, raccourcis clavier, historique annuler/rétablir ;
- import/export JSON et persistance locale automatique ;
- états de chargement et état vide, notifications et micro-interactions ;
- interface responsive avec navigation mobile dédiée ;
- mode « rayons X » caché pour visualiser les halos de confiance.

## Développement

```bash
npm install
npm run dev
```

Puis ouvrir [http://localhost:3000](http://localhost:3000).

## Vérifications

```bash
npm run typecheck
npm run build
```

## Architecture

L’application utilise Next.js App Router et TypeScript. Le moteur de score est isolé dans `lib/scoring.ts`, le modèle métier dans `types/workspace.ts`, les données de démonstration dans `data/seed.ts`, la persistance et l’historique dans `hooks/use-workspace.ts`, et les surfaces interactives dans `components/`.

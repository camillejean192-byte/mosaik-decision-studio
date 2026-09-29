# ORBE — Jardins vivants

ORBE est le site éditorial d’un atelier de paysage fictif basé à Lyon. Il présente une approche sensible et concrète du jardin, des réalisations détaillées, un calendrier saisonnier interactif et un configurateur qui transforme quelques choix en une première feuille de route exploitable.

**Application : [mosaik-decision-studio.vercel.app](https://mosaik-decision-studio.vercel.app/)**

## Expérience

- direction artistique éditoriale et photographie de jardin originale ;
- transitions d’entrée, révélations au défilement et micro-interactions respectueuses de `prefers-reduced-motion` ;
- portfolio filtrable avec études de cas accessibles ;
- cadran des saisons interactif ;
- parcours projet en quatre étapes, sauvegardé localement ;
- brief généré, copiable et téléchargeable sans service externe ;
- navigation, modales et mise en page entièrement responsive.

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

Le projet utilise Next.js App Router, React et TypeScript. L’expérience principale se trouve dans `components/orbe-site.tsx`, avec son système visuel dans `app/globals.css`.

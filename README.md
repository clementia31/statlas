# Statlas — Vue globale (v0.1)

Premier écran du site codé en vrai (Next.js 14 + Supabase), à faire tourner en local ou déployer sur Vercel.

## Ce qui est déjà branché
- La carte utilise les vraies frontières mondiales (Natural Earth via `world-atlas`), chargées côté client.
- Les couleurs de la carte et la valeur mondiale moyenne de l'IDH viennent de **ta vraie base Supabase**.
- Les 5 autres cartes d'indicateurs (PIB, population, dette, espérance de vie, Gini) sont encore des valeurs d'exemple codées en dur — à brancher de la même façon que l'IDH (voir `lib/supabase.ts`, fonction `getLatestObservationsByIndicator`).

## Mise en route en local

1. Installe les dépendances :
   ```
   npm install
   ```
2. Copie `.env.local.example` en `.env.local` et remplis avec tes identifiants Supabase (Project Settings > API dans ton dashboard) :
   ```
   cp .env.local.example .env.local
   ```
3. Lance le serveur de développement :
   ```
   npm run dev
   ```
4. Ouvre http://localhost:3000

## Déployer sur Vercel

1. Pousse ce dossier sur un dépôt GitHub (nouveau repo, ex: `statlas`)
2. Sur vercel.com, "Add New Project" → importe ce repo
3. Dans les réglages du projet Vercel, ajoute les mêmes variables d'environnement que dans `.env.local`
4. Déploie — Vercel détecte Next.js automatiquement

## Point d'attention : correspondance des noms de pays

La carte (`world-atlas`) utilise des noms anglais officiels parfois différents des nôtres (ex: "United States of America" vs "United States" dans notre base). Un premier correctif est fait dans `app/page.tsx` (`NAME_OVERRIDES`) mais il faudra le compléter au fur et à mesure que des pays n'apparaissent pas correctement coloriés sur la carte.

## Prochaines étapes

- Brancher les 5 autres cartes KPI sur de vraies requêtes Supabase
- Construire les pages Indicateur détaillé et Comparaison (mêmes maquettes que la vue globale, HTML déjà validé)
- Ajouter le multilingue (table `translations` déjà prête côté base)

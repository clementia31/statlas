# Statlas

Site de statistiques mondiales sourcées, avec The Gazette (articles) et le Studio (administration privée).
En ligne : https://www.statlasresearch.com

Next.js 14 (App Router) + Supabase, déployé sur Vercel à chaque envoi sur la branche `main`.

## Ce que contient le dépôt

| Dossier | Rôle |
|---|---|
| `app/` | Pages du site. Public : accueil, `indicateurs`, `carte`, `pays`, `rankings`, `sport`, `lists`, `comparaisons`, `benchmark`, `gazette`, `bibliographie`, `api-export`. Privé : `studio`, `admin`. |
| `components/`, `lib/` | Composants et accès aux données. `lib/supabase-admin.ts` et `lib/studio.ts` ne s'exécutent que côté serveur. |
| `middleware.ts` | Ferme `/studio` et `/admin` à qui n'a pas la clé `ADMIN_KEY`. |
| `data/migrations/` | Modifications de la base, numérotées, dans l'ordre où elles ont été lancées. |
| `data/seeds/` | Fichiers sources convertis et scripts SQL de chargement. |
| `data/articles/` | Texte des articles de la Gazette. |
| `scripts/social/` | Générateur de vidéos et d'images (thèmes Statlas, Gazette, MyInvesta). |
| `scripts/offline/` | Fabrication de la copie hors ligne DuckDB. |
| `.github/workflows/` | Collectes de données et rendu vidéo, lancés à la demande. |

## Règles de données

- Une source identifiée par indicateur.
- Aucune donnée ni source inventée.
- Les projections sont toujours signalées et séparées des valeurs observées.
- « Statlas Research » dès que le chiffre est calculé ou croisé par nous.
- Aucun pays mis en avant dans un visuel s'il ne figure pas dans le classement.

## Base de données

- Après un import, lancer `select public.refresh_statlas();` : sans cela le site garde les anciennes valeurs.
- Chaque import et chaque recalcul est noté dans `common.import_log`.
- Les tables privées (`article_drafts`, `social_posts`, `studio_metric_readings`) ne sont lisibles qu'avec la clé de service.
- Toute modification de structure passe par un nouveau fichier dans `data/migrations/`, testé avant d'être lancé.

## Lancer en local

```
npm install
cp .env.local.example .env.local   # puis remplir les quatre valeurs
npm run dev
```

## Vérifier avant d'envoyer

```
npx tsc --noEmit
npx next build
```

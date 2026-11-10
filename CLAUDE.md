# Statlas — règles du projet

À lire avant toute intervention. Le propriétaire (Clem) n'est pas développeur : répondre en français, sans jargon, et regrouper les étapes. Le contenu du site est en anglais.

## Ce qu'est le projet

- **Statlas** : statistiques mondiales sourcées, gratuites. En ligne : https://www.statlasresearch.com
- **The Gazette** : les articles, dans `/gazette`.
- **Studio** : administration privée dans `/studio` (calendrier, publications, mesures, idées, articles, organisation). Couvre Statlas, Gazette et MyInvesta.
- Next.js 14 (App Router) + Supabase (projet `pkphpvarzbfqmugsjyom`), déployé par Vercel à chaque envoi sur `main`.
- Projets voisins, hors de ce dépôt : MyInvesta (dépôt `investa`, base Supabase séparée, données internes) et Finalea (base séparée, personnelle).

## Règles de données (non négociables)

1. Une seule source identifiée par indicateur.
2. Ne jamais inventer une donnée ni une source. Si la source ne dit rien, le champ reste vide.
3. Les projections sont toujours signalées (`is_projection`) et séparées des valeurs observées.
4. « Statlas Research » dès qu'un chiffre est calculé ou croisé par nous.
5. Neutralité : aucun pays mis en avant dans un visuel s'il ne figure pas dans le classement.
6. Vérifier la licence d'une source avant de l'importer, et la noter dans `sources`. SIPRI et Statista : ne pas importer.
7. Monnaie d'un pays : la monnaie majoritaire quand il y en a plusieurs.

## Règles de travail

- **Maquette avant code** pour tout nouvel écran : envoyer la maquette, la valider ensemble, puis coder.
- **Vérifier avant de livrer** : `npx tsc --noEmit` puis `npx next build`. Pour un écran, le tester réellement (pas seulement le relire) et ne laisser aucun bouton mort.
- **Base de données** : toute modification est un fichier numéroté dans `data/migrations/`, testé à blanc (exécuté puis annulé) avant d'être donné.
- **Qui lance quoi** : Clem clique lui-même sur « Run » dans Supabase. Lui donner le bloc SQL directement dans la conversation, prêt à copier.
- **Ordre de mise en ligne** quand le code dépend d'une migration : pousser la migration seule, faire lancer le bloc, puis pousser le code (sur une branche en attendant).
- **Secrets** : ne jamais demander, afficher ni écrire une clé. `ADMIN_KEY` et `SUPABASE_SERVICE_ROLE_KEY` ne vivent que dans Vercel.
- **Données privées** : tout ce qui est client MyInvesta reste dans la base MyInvesta. Le Studio ne reçoit que des totaux, sans tranche de moins de cinq clients.

## Base de données : à savoir

- Après un import : `select public.refresh_statlas();` (obs_yearly, indicator_stats, indicator_catalog). Sans cela le site garde les anciennes valeurs.
- Fonctions d'import : `import_worldbank`, `import_imf_weo`, `import_psv`, `import_psv_at`, `import_translations`. Chaque import s'inscrit dans `common.import_log`.
- L'unité d'une valeur vient de `indicators.unit` (plus de colonne `unit` sur `observations`).
- Espaces : `public` (Statlas, Gazette, tables du Studio), `common` (journal, `fx_annual`), `immo`, `finance`, `studio` (vides).
- Tables privées dans `public` : `article_drafts`, `social_posts`, `studio_metric_readings`, `studio_ideas`, `studio_idea_items`. Protection par ligne sans règle + droits retirés au public : seule la clé de service les lit.
- Fichiers privés du Studio : espace de stockage `studio` (20 Mo par fichier).
- Offre gratuite : 500 Mo. `observations` et `obs_yearly` en occupent l'essentiel. Les données volumineuses vont sur le disque externe (DuckDB), seuls les agrégats vont en ligne.

## Points ouverts connus

- Le chargement des fichiers de `data/seeds/` et des migrations lit le dépôt sur GitHub sans s'identifier : à remplacer avant de passer ce dépôt en privé.
- `population-total` mélange deux sources (OCDE et FMI) : à recharger depuis une seule.
- 7 indicateurs sans donnée, 16 sources sans licence renseignée.
- Mesures du Studio saisies à la main : aucun compteur de visites branché.
- `studio.finalea.fr` : le code le gère, le domaine reste à brancher (Vercel + OVH).

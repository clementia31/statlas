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
- États disparus (Allemagne de l'Ouest et de l'Est, Union soviétique, Yougoslavie, Tchécoslovaquie) : `iso_code` vide, ce qui les exclut des listes de pays du site ; `hist_code` (SU, YU, CS) sert aux imports par fichier ; dates dans `valid_from` / `valid_to`, successeurs dans `entity_relations`.
- Territoires : les 37 territoires couverts par l'ONU (Réunion, Groenland, Gibraltar…) sont des entités `country` avec fiche d'identité ; 237 pays et territoires au total.
- Maddison : dès qu'un graphique montre ces données, citer aussi les travaux d'origine listés dans l'onglet Sources du fichier (condition de la source, on ne peut pas l'assouplir).
- Espaces : `public` (Statlas, Gazette, tables du Studio), `common` (journal, `fx_annual`), `immo`, `finance`, `studio` (vides).
- Tables privées dans `public` : `article_drafts`, `social_posts`, `studio_metric_readings`, `studio_ideas`, `studio_idea_items`. Protection par ligne sans règle + droits retirés au public : seule la clé de service les lit.
- Fichiers privés du Studio : espace de stockage `studio` (20 Mo par fichier).
- Offre gratuite : 500 Mo. `observations` et `obs_yearly` en occupent l'essentiel. Les données volumineuses vont sur le disque externe (DuckDB), seuls les agrégats vont en ligne.

## Points ouverts connus

- Le chargement des fichiers de `data/seeds/` et des migrations lit le dépôt sur GitHub sans s'identifier : à remplacer avant de passer ce dépôt en privé.
- Plus aucun indicateur vide. ONU (population, âge médian : World Population Prospects 2024, CC BY 3.0 IGO) et V-Dem (deux indices : jeu v16, CC BY-SA 4.0, partage à l'identique) sont chargés depuis l'organisme d'origine. V-Dem note séparément Cisjordanie et Gaza : aucune des deux n'est rattachée à la fiche « West Bank and Gaza ».
- Licences : restent à vérifier CelesTrak (aucune licence de réutilisation publiée) et l'Union mathématique internationale. Les ouvrages cités dans la Gazette sont notés « Not applicable (bibliographic reference) ».
- Figures de la semaine : « The price of war » (21 janv. 2027) montre des chiffres SIPRI (5 pays, usage limité autorisé à condition de nommer SIPRI) : le crédit SIPRI ne doit jamais être remplacé par « Statlas ». Les figures Maddison citent les travaux d'origine dans leur ligne de source ; sur le site, la ligne « Source » (`SourceNote`) déplie la liste complète (`data/credits/maddison-2023.json`).
- `scripts/fetch_seeds.py` (collecte à la demande) ne récupère plus Maddison, UCDP, SIPRI, ONU ni V-Dem : ne pas les y remettre.
- Pas de vérification automatique du style de code (ESLint non configuré) : seuls `tsc` et `next build` font foi.
- Chaque indicateur a une fréquence de mise à jour (`update_frequency`) et la date de son dernier import (`last_checked_on`, tenue à jour par `refresh_statlas`).
- Mesures du Studio saisies à la main : aucun compteur de visites branché.
- `studio.finalea.fr` : le code le gère, le domaine reste à brancher (Vercel + OVH).

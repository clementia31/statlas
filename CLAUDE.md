# Statlas — règles du projet

À lire avant toute intervention. Le propriétaire (Clem) n'est pas développeur : répondre en français, sans jargon, et regrouper les étapes. Le contenu du site est en anglais.

## Ce qu'est le projet

- **Statlas** : statistiques mondiales sourcées, gratuites. En ligne : https://www.statlasresearch.com
- **The Gazette** : les articles, dans `/gazette`.
- Adresses publiques en anglais : `/countries`, `/indicators`, `/map`, `/compare`, `/bibliography`, `/rankings`, `/lists`. Les anciennes adresses françaises (`/pays`, `/indicateurs`, `/carte`, `/comparaisons`, `/bibliographie`) redirigent définitivement (`next.config.mjs`) : ne pas les réutiliser.
- Page `/about` (About & methodology) : résumé public des règles ci-dessous. Si une règle de données change, mettre la page à jour. Le projet reste anonyme : aucun nom de personne sur le site ; contact et lien X dans `lib/site.ts`. Ne pas écrire « free library » (la gratuité se limite à « free to read and to download ») ni mentionner Taïwan / Hong Kong sur cette page.
- Menu du haut : 6 entrées (Countries, Indicators, Rankings, Map, Compare, The Gazette) ; le nom « Statlas » mène à l'accueil. `/sport` et `/lists` sont des onglets de Rankings, `/benchmark` un onglet de Compare (`components/ui/SectionTabs.tsx`). Une nouvelle page se range dans un onglet ou le pied de page, pas dans le menu.
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
- **Textes des publications** (champ `caption` de `social_posts`) : chaque nom de pays est suivi de son drapeau, à chaque mention (ex. « India 🇮🇳 »).
- **Pas deux fois le même graphique** : avant de produire une vidéo ou une image, consulter le registre (`python3 scripts/social/registry.py check --indicator … --countries … --format …`). Un indicateur peut resservir, mais avec d'autres pays ou un autre angle. Après production, ajouter l'entrée dans `scripts/social/registry.json` dans le même envoi.
- **Secrets** : ne jamais demander, afficher ni écrire une clé. `ADMIN_KEY` et `SUPABASE_SERVICE_ROLE_KEY` ne vivent que dans Vercel.
- **Données privées** : tout ce qui est client MyInvesta reste dans la base MyInvesta. Le Studio ne reçoit que des totaux, sans tranche de moins de cinq clients.

## Base de données : à savoir

- Après un import : `select public.refresh_statlas();` (obs_yearly, indicator_stats, indicator_catalog, obs_latest_m, obs_rank_latest_m). Sans cela le site garde les anciennes valeurs.
- `obs_latest` et `obs_rank_latest` (dernière valeur et rang par pays) lisent des tables précalculées (`obs_latest_m`, `obs_rank_latest_m`, migration 024) : ne pas les retransformer en calcul à la volée, les fiches pays dépassaient la limite de 3 secondes de la base.
- Le site public garde chaque lecture de la base une heure (`PUBLIC_CACHE_SECONDS` dans `lib/supabase.ts`) : une nouvelle valeur, un article ou la figure de la semaine peuvent mettre jusqu'à une heure à apparaître. Le Studio lit en direct. Ne pas retirer ce cache : sans lui, un robot qui parcourt les fiches pays épuise le budget disque de l'offre gratuite Supabase (incident du 16-17 nov. 2026).
- Fonctions d'import : `import_worldbank`, `import_imf_weo`, `import_psv`, `import_psv_at`, `import_translations`. Chaque import s'inscrit dans `common.import_log`.
- L'unité d'une valeur vient de `indicators.unit` (plus de colonne `unit` sur `observations`).
- États disparus (Allemagne de l'Ouest et de l'Est, Union soviétique, Yougoslavie, Tchécoslovaquie) : `iso_code` vide, ce qui les exclut des listes de pays du site ; `hist_code` (SU, YU, CS) sert aux imports par fichier ; dates dans `valid_from` / `valid_to`, successeurs dans `entity_relations`.
- Monde et régions : entités `world` et `region` (colonne `wb_code` : WLD, EAS, ECS, LCN, MEA, NAC, SAS, SSF) portant les agrégats publiés par la Banque mondiale, jamais calculés par nous. `import_worldbank` les recharge avec les pays ; `import_worldbank_aggregates(code, slug)` les recharge seuls. Classements, cartes et listes ne lisent que le type `country` ; l'encadré « World and regions » des classements les affiche à part.
- Territoires : les 37 territoires couverts par l'ONU (Réunion, Groenland, Gibraltar…) sont des entités `country` avec fiche d'identité ; 237 pays et territoires au total.
- Maddison : dès qu'un graphique montre ces données, citer aussi les travaux d'origine listés dans l'onglet Sources du fichier (condition de la source, on ne peut pas l'assouplir).
- Espaces : `public` (Statlas, Gazette, tables du Studio), `common` (journal, `fx_annual`), `immo`, `finance`, `studio` (vides).
- Tables privées dans `public` : `article_drafts`, `social_posts`, `studio_metric_readings`, `studio_ideas`, `studio_idea_items`, `studio_visits_daily`, `studio_visitors_daily`, `studio_visitor_seen`. Protection par ligne sans règle + droits retirés au public : seule la clé de service les lit.
- Fichiers privés du Studio : espace de stockage `studio` (20 Mo par fichier).
- Offre gratuite : 500 Mo. `observations` et `obs_yearly` en occupent l'essentiel. Les données volumineuses vont sur le disque externe (DuckDB), seuls les agrégats vont en ligne.

## Points ouverts connus

- Le chargement des fichiers de `data/seeds/` et des migrations lit le dépôt sur GitHub sans s'identifier : à remplacer avant de passer ce dépôt en privé.
- Plus aucun indicateur vide. ONU (population, âge médian : World Population Prospects 2024, CC BY 3.0 IGO) et V-Dem (deux indices : jeu v16, CC BY-SA 4.0, partage à l'identique) sont chargés depuis l'organisme d'origine. V-Dem note séparément Cisjordanie et Gaza : aucune des deux n'est rattachée à la fiche « West Bank and Gaza ».
- World Religion Project (Correlates of War, Maoz & Henderson 2013, v1.1) : aucune licence publiée, seulement une demande de citation. Clem a décidé le 18 nov. 2026 de l'utiliser en citant exactement comme demandé (« Maoz & Henderson (2013), World Religion Dataset v1.1 ») ; noter « No licence published; citation requested » dans `sources`. Données tous les cinq ans, 1945-2010.
- Licences : restent à vérifier CelesTrak (aucune licence de réutilisation publiée) et l'Union mathématique internationale. Les ouvrages cités dans la Gazette sont notés « Not applicable (bibliographic reference) ».
- Figures de la semaine : « The price of war » (21 janv. 2027) montre des chiffres SIPRI (5 pays, usage limité autorisé à condition de nommer SIPRI) : le crédit SIPRI ne doit jamais être remplacé par « Statlas ». Les figures Maddison citent les travaux d'origine dans leur ligne de source ; sur le site, la ligne « Source » (`SourceNote`) déplie la liste complète (`data/credits/maddison-2023.json`).
- `scripts/fetch_seeds.py` (collecte à la demande) ne récupère plus Maddison, UCDP, SIPRI, ONU ni V-Dem : ne pas les y remettre.
- Hébergement (18 nov. 2026) : le compte Vercel gratuit a été mis en pause (4 h de calcul « Fluid Active CPU » dépassées), ce qui a aussi coupé MyInvesta, hébergé sur le même compte. Clem est passé à l'offre Pro, avec l'idée de revenir au gratuit si la consommation le permet. Depuis, toutes les pages publiques sont préparées à l'avance et gardées une heure (`export const revalidate = 3600`, jamais `force-dynamic`). Une page qui lit des paramètres d'adresse est coupée en trois : `view.tsx` (le contenu), `page.tsx` (version sans paramètre, statique) et une jumelle dans `app/q/…` (calculée à la demande), reliées par les réécritures de `next.config.mjs`. Toute nouvelle page publique suit ce modèle ; ne jamais lire `searchParams`, `cookies()` ou `headers()` dans un `page.tsx` public. `robots.txt` interdit aux robots les adresses à paramètres. À surveiller dans Vercel › Usage : Fluid Active CPU et ISR Writes.
- Pas de vérification automatique du style de code (ESLint non configuré) : seuls `tsc` et `next build` font foi.
- Chaque indicateur a une fréquence de mise à jour (`update_frequency`) et la date de son dernier import (`last_checked_on`, tenue à jour par `refresh_statlas`).
- Compteur de visites maison (migration 021) : `components/VisitBeacon.tsx` → `/api/visit` → totaux par jour dans `studio_visits_daily` / `studio_visitors_daily` (page, provenance, pays). Sans cookie ; l'empreinte du jour (`studio_visitor_seen`) est effacée le lendemain ; robots, pages du Studio et visites du propriétaire connecté non comptés. Abonnés et clics Google restent saisis à la main ; MyInvesta n'est pas couvert.
- Images des articles de la Gazette (décidé le 18 nov. 2026, à construire) : une image en tête de chaque article, avec légende et crédit. Choix de Clem : des documents anciens authentiques du domaine public (cartes, gravures, registres, unes de journaux, photographies d'époque), à valeur historique et en lien direct avec le sujet. Jamais d'image générée ni retouchée. Pour chaque image, noter la source, l'institution et le statut de domaine public vérifié. Pas de portraits de personnalités récupérés sur le web : Clem les dépose lui-même dans le Studio. Maquette de l'article avec image à valider avant de coder. Les vidéos réseaux doivent être reliées à un article et à l'actualité.
- Idée notée, non lancée : comptes lecteurs pour commenter les articles de la Gazette (les commentaires vivent sur X pour l'instant).
- Référencement (nov. 2026) : image d'aperçu par page (`lib/og.tsx` et fichiers `opengraph-image.tsx`), adresse de référence par page (canonical), étiquette « jeu de données » sur chaque classement (schema.org/Dataset, licence seulement si elle est dans `sources`), plan du site avec articles et listes. Reste à faire par Clem : déclarer le site dans Google Search Console et Bing Webmaster Tools.
- `studio.finalea.fr` : le code le gère, le domaine reste à brancher (Vercel + OVH).

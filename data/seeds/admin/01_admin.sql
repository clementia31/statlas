-- Statlas : espace admin (rédaction) et préparation du site multilingue (FR / EN / ES).
-- À coller dans l'éditeur SQL de Supabase, puis Run (« Run without RLS » si l'alerte apparaît : la table est protégée ci-dessous).

-- 1. Articles : langue et regroupement des traductions (un même article en FR, EN, ES partage translation_key)
alter table public.articles add column if not exists lang text not null default 'en';
alter table public.articles add column if not exists translation_key text;

-- 2. Suivi éditorial : une ligne par article en préparation, dans chaque langue
create table if not exists public.article_drafts (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  lang text not null default 'fr' check (lang in ('fr','en','es')),
  status text not null default 'draft' check (status in ('idea','draft','review','translating','ready','published')),
  project text not null default 'gazette',
  series text,
  series_order int,
  doc_url text,
  published_slug text,
  notes text,
  updated_at timestamptz not null default now(),
  unique (slug, lang)
);
-- Protégée : aucune lecture publique, seul l'espace admin (clé de service) y accède
alter table public.article_drafts enable row level security;

-- 3. La série « Le retour des extrêmes »
insert into public.article_drafts (slug, title, lang, status, series, series_order, doc_url, notes) values
  ('les-extremes-sont-revenus', 'Les extrêmes sont revenus', 'fr', 'ready', 'Le retour des extrêmes', 1,
   'https://claude.ai/artifact/1aobSuHNcFLCDBCPzJ837a', 'Relu et validé le 5 novembre 2026 ; à traduire en anglais.'),
  ('extremes-are-back', 'The Return of the Extremes', 'en', 'idea', 'Le retour des extrêmes', 1, null, 'Traduction du volet 1.'),
  ('1930-et-aujourdhui', '1930 et aujourd''hui', 'fr', 'idea', 'Le retour des extrêmes', 2,
   'https://claude.ai/artifact/VNQYt1f5YTCoeA3XrXP5EE', 'Esquisse dans le document des esquisses ; comparaison descriptive.'),
  ('kondratiev-contre-slutsky', 'Kondratiev contre Slutsky', 'fr', 'idea', 'Le retour des extrêmes', 3,
   'https://claude.ai/artifact/KWSrw97UKXghUxmsunjdtP', 'Matière dans le premier brouillon long (sections 4 et 5).'),
  ('une-theorie-des-generations', 'Une théorie des générations', 'fr', 'idea', 'Le retour des extrêmes', 4,
   'https://claude.ai/artifact/KWSrw97UKXghUxmsunjdtP', 'Matière dans le premier brouillon long (sections 6 et 7) ; essai signé.'),
  ('un-monde-des-bulles', 'Un monde, des bulles', 'fr', 'idea', 'Le retour des extrêmes', 5,
   'https://claude.ai/artifact/KWSrw97UKXghUxmsunjdtP', 'Matière dans le premier brouillon long (section 8) ; état chimère, corrélations par bloc.')
on conflict (slug, lang) do nothing;

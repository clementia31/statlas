-- Statlas admin : bibliothèque et calendrier des contenus (réseaux sociaux + Gazette).
-- Table privée : RLS activée sans règle publique ; seul l'espace admin (clé de service) la lit et la modifie.
create table if not exists public.social_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  kind text not null check (kind in ('video','image')),
  media_url text not null,
  poster_url text,
  platforms text[] not null default '{x,instagram}',
  status text not null default 'draft' check (status in ('draft','scheduled','published')),
  scheduled_at timestamptz,
  published_at timestamptz,
  caption text,
  notes text,
  links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.social_posts enable row level security;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes)
values
  ('nobel-top5', 'Who wins the Nobel Prize? (top 5)', 'video', '/gazette/figures/nobel-top5-1901-2025.mp4', '/gazette/figures/nobel-top5-1901-2025.jpg', '{gazette}', 'published', '2026-11-06 12:00:00 Europe/Paris', null, 'Figure of the week, Gazette'),
  ('nobel-top5-social', 'Who wins the Nobel Prize? (top 5)', 'video', '/gazette/figures/nobel-top5-1901-2025.mp4', '/gazette/figures/nobel-top5-1901-2025.jpg', '{x,instagram}', 'draft', null, 'Who wins the Nobel Prize? Laureates born in each country, 1901–2025. Sweden edges Japan for 5th: its first prize came in 1903, 46 years before Japan''s.', 'À publier dès la création des comptes'),
  ('gazette-debt', 'The weight of debt', 'video', '/gazette/figures/debt.mp4', '/gazette/figures/debt.jpg', '{gazette}', 'scheduled', '2026-11-13 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('gazette-world-2100', 'The world in 2100', 'video', '/gazette/figures/world-2100.mp4', '/gazette/figures/world-2100.jpg', '{gazette}', 'scheduled', '2026-11-20 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('gazette-wealth-200y', '200 years of wealth', 'video', '/gazette/figures/wealth-200y.mp4', '/gazette/figures/wealth-200y.jpg', '{gazette}', 'scheduled', '2026-11-27 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('gazette-fields', 'Who wins the Fields Medal?', 'video', '/gazette/figures/fields.mp4', '/gazette/figures/fields.jpg', '{gazette}', 'scheduled', '2026-12-04 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('gazette-co2', 'Who emits the most CO2?', 'video', '/gazette/figures/co2.mp4', '/gazette/figures/co2.jpg', '{gazette}', 'scheduled', '2026-12-11 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('gazette-births', 'The end of babies?', 'video', '/gazette/figures/births.mp4', '/gazette/figures/births.jpg', '{gazette}', 'scheduled', '2026-12-18 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('gazette-nobel-top10', 'Who wins the Nobel Prize? (top 10)', 'video', '/gazette/figures/nobel-top10.mp4', '/gazette/figures/nobel-top10.jpg', '{gazette}', 'scheduled', '2026-12-25 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('gazette-oldest', 'The oldest countries on Earth', 'video', '/gazette/figures/oldest.mp4', '/gazette/figures/oldest.jpg', '{gazette}', 'scheduled', '2027-01-01 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('gazette-rd', 'Who invents the future?', 'video', '/gazette/figures/rd.mp4', '/gazette/figures/rd.jpg', '{gazette}', 'scheduled', '2027-01-08 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('gazette-industry', 'Factories vs services', 'video', '/gazette/figures/industry.mp4', '/gazette/figures/industry.jpg', '{gazette}', 'scheduled', '2027-01-15 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('gazette-military', 'The price of war', 'video', '/gazette/figures/military.mp4', '/gazette/figures/military.jpg', '{gazette}', 'scheduled', '2027-01-22 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('gazette-richest-top10', 'The richest countries', 'video', '/gazette/figures/richest-top10.mp4', '/gazette/figures/richest-top10.jpg', '{gazette}', 'scheduled', '2027-01-29 12:00:00 Europe/Paris', null, 'Figure of the week (programmée dans chart_of_the_week)'),
  ('nobel-top3', 'Who wins the Nobel Prize? (top 3)', 'video', '/social/nobel-top3.mp4', '/social/nobel-top3.jpg', '{x,instagram}', 'draft', null, null, null),
  ('hosts-mega-video', 'The world''s favourite hosts (courbes)', 'video', '/social/hosts-mega-events.mp4', '/social/hosts-mega-events.jpg', '{x,instagram}', 'draft', null, null, 'Version courbes ; à comparer avec l''image fixe'),
  ('hosts-world-cup-bars', 'Who hosts the World Cup?', 'image', '/social/hosts-world-cup-bars.jpg', '/social/hosts-world-cup-bars.jpg', '{x,instagram}', 'draft', null, null, 'Statistique maison — source Statlas Research'),
  ('hosts-summer-bars', 'Who hosts the Summer Olympics?', 'image', '/social/hosts-summer-bars.jpg', '/social/hosts-summer-bars.jpg', '{x,instagram}', 'draft', null, null, 'Statistique maison — source Statlas Research'),
  ('hosts-winter-bars', 'Who hosts the Winter Olympics?', 'image', '/social/hosts-winter-bars.jpg', '/social/hosts-winter-bars.jpg', '{x,instagram}', 'draft', null, null, 'Statistique maison — source Statlas Research'),
  ('hosts-mega-bars', 'The world''s favourite hosts', 'image', '/social/hosts-mega-bars.jpg', '/social/hosts-mega-bars.jpg', '{x,instagram}', 'draft', null, null, 'Statistique maison — source Statlas Research'),
  ('football-world-cup', 'Who wins the World Cup?', 'image', '/social/football-world-cup.jpg', '/social/football-world-cup.jpg', '{x,instagram}', 'draft', null, null, 'Aperçu (image finale) ; la vidéo se génère à la demande'),
  ('olympics-summer', 'The Olympic superpowers', 'image', '/social/olympics-summer.jpg', '/social/olympics-summer.jpg', '{x,instagram}', 'draft', null, null, 'Aperçu (image finale) ; la vidéo se génère à la demande'),
  ('tennis-men', 'The kings of Grand Slam', 'image', '/social/tennis-men.jpg', '/social/tennis-men.jpg', '{x,instagram}', 'draft', null, null, 'Aperçu (image finale) ; la vidéo se génère à la demande'),
  ('formula1', 'Who rules Formula One?', 'image', '/social/formula1.jpg', '/social/formula1.jpg', '{x,instagram}', 'draft', null, null, 'Aperçu (image finale) ; la vidéo se génère à la demande'),
  ('satellites', 'Who owns the sky?', 'image', '/social/satellites.jpg', '/social/satellites.jpg', '{x,instagram}', 'draft', null, null, 'Aperçu (image finale) ; la vidéo se génère à la demande')
on conflict (slug) do nothing;
update public.social_posts set published_at = scheduled_at where status = 'published' and published_at is null;

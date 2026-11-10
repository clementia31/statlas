-- Etape 8a : Studio. Projet et format sur les publications, releves de mesures saisis a la main.
-- Tables privees : protection par ligne sans aucune regle + droits retires au public.
begin;

alter table public.social_posts
  add column if not exists project text not null default 'statlas',
  add column if not exists format text;
alter table public.social_posts drop constraint if exists social_posts_project_check;
alter table public.social_posts add constraint social_posts_project_check check (project in ('statlas','gazette','myinvesta'));
alter table public.social_posts drop constraint if exists social_posts_format_check;
alter table public.social_posts add constraint social_posts_format_check
  check (format is null or format in ('ranking','map','key_figure','quote','article','list','chart'));
update public.social_posts set project = 'gazette' where 'gazette' = any(platforms) and project = 'statlas';
update public.social_posts set format = 'chart' where format is null;

create table if not exists public.studio_metric_readings (
  id bigint generated always as identity primary key,
  project text not null check (project in ('statlas','gazette','myinvesta')),
  metric text not null check (metric in ('followers_instagram','followers_x','visitors','page_views','google_clicks')),
  reading_date date not null default current_date,
  value numeric not null check (value >= 0),
  note text,
  created_at timestamptz not null default now(),
  unique (project, metric, reading_date)
);
alter table public.studio_metric_readings enable row level security;
revoke all on public.studio_metric_readings from anon, authenticated;
revoke all on public.social_posts, public.article_drafts from anon, authenticated;

commit;

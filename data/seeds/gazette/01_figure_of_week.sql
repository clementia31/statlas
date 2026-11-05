-- Figure of the week : support vidéo + lien vers la page Statlas, puis première figure (Nobel top 5).
create table if not exists public.chart_of_the_week (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  active boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.chart_of_the_week add column if not exists video_url text;
alter table public.chart_of_the_week add column if not exists poster_url text;
alter table public.chart_of_the_week add column if not exists link_url text;
alter table public.chart_of_the_week add column if not exists source text;
alter table public.chart_of_the_week enable row level security;
drop policy if exists "public read chart_of_the_week" on public.chart_of_the_week;
create policy "public read chart_of_the_week" on public.chart_of_the_week for select using (true);

update public.chart_of_the_week set active = false where active;
insert into public.chart_of_the_week (title, description, active, video_url, poster_url, link_url, source)
values (
  'Who wins the Nobel Prize?',
  'Laureates born in each country (current borders), 1901–2025. The United States only overtook Europe after 1945; Sweden edges Japan for fifth place, having won its first prize in 1903, 46 years before Japan.',
  true,
  '/gazette/figures/nobel-top5-1901-2025.mp4',
  '/gazette/figures/nobel-top5-1901-2025.jpg',
  '/rankings/nobel-laureates',
  'Nobel Foundation · count by Statlas Research'
);

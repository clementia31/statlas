-- Compteur de visites du Studio : sans cookie, sans donnee personnelle conservee.
-- On ne garde que des totaux par jour. L'empreinte anonyme qui sert a ne pas compter deux fois
-- le meme visiteur dans la journee est effacee des le lendemain.
-- Tables privees : protection par ligne sans aucune regle + droits retires au public.
begin;

create table if not exists public.studio_visits_daily (
  day date not null,
  project text not null check (project in ('statlas','gazette','myinvesta')),
  path text not null,
  source text not null,
  country text not null,
  views integer not null default 0 check (views >= 0),
  primary key (day, project, path, source, country)
);

create table if not exists public.studio_visitors_daily (
  day date not null,
  project text not null check (project in ('statlas','gazette','myinvesta')),
  visitors integer not null default 0 check (visitors >= 0),
  primary key (day, project)
);

create table if not exists public.studio_visitor_seen (
  day date not null,
  project text not null,
  visitor text not null,
  primary key (day, project, visitor)
);

alter table public.studio_visits_daily enable row level security;
alter table public.studio_visitors_daily enable row level security;
alter table public.studio_visitor_seen enable row level security;
revoke all on public.studio_visits_daily, public.studio_visitors_daily, public.studio_visitor_seen from public, anon, authenticated;

-- Enregistre une page vue. Appelee uniquement par le site, avec la cle de service.
create or replace function public.studio_track_visit(p_project text, p_path text, p_source text, p_country text, p_visitor text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_day date := (now() at time zone 'Europe/Paris')::date;
  v_new integer;
begin
  if p_project not in ('statlas','gazette','myinvesta') or p_path is null or left(p_path, 1) <> '/' then
    return;
  end if;

  insert into public.studio_visits_daily (day, project, path, source, country, views)
  values (v_day, p_project, left(p_path, 200), left(coalesce(nullif(p_source, ''), 'direct'), 80), left(coalesce(nullif(p_country, ''), '??'), 2), 1)
  on conflict (day, project, path, source, country) do update set views = public.studio_visits_daily.views + 1;

  if coalesce(p_visitor, '') <> '' then
    delete from public.studio_visitor_seen where day < v_day;
    insert into public.studio_visitor_seen (day, project, visitor) values (v_day, p_project, left(p_visitor, 64))
    on conflict do nothing;
    get diagnostics v_new = row_count;
    if v_new > 0 then
      insert into public.studio_visitors_daily (day, project, visitors) values (v_day, p_project, 1)
      on conflict (day, project) do update set visitors = public.studio_visitors_daily.visitors + 1;
    end if;
  end if;
end
$fn$;

-- Resume pour l'ecran "Audience" du Studio : une seule lecture, deja additionnee.
create or replace function public.studio_visit_summary(p_project text, p_from date, p_to date)
returns json
language sql
stable
security definer
set search_path = public
as $fn$
  with v as (
    select * from public.studio_visits_daily where project = p_project and day between p_from and p_to
  ), prev as (
    select coalesce(sum(views), 0) as views from public.studio_visits_daily
    where project = p_project and day between p_from - (p_to - p_from + 1) and p_from - 1
  ), prev_u as (
    select coalesce(sum(visitors), 0) as visitors from public.studio_visitors_daily
    where project = p_project and day between p_from - (p_to - p_from + 1) and p_from - 1
  ), u as (
    select day, visitors from public.studio_visitors_daily where project = p_project and day between p_from and p_to
  ), entries as (
    select * from v where source <> 'internal'
  )
  select json_build_object(
    'first_day', (select min(day) from public.studio_visits_daily where project = p_project),
    'views', (select coalesce(sum(views), 0) from v),
    'visitors', (select coalesce(sum(visitors), 0) from u),
    'prev_views', (select views from prev),
    'prev_visitors', (select visitors from prev_u),
    'days', coalesce((select json_agg(json_build_object('day', d.day, 'views', d.views, 'visitors', coalesce(u.visitors, 0)) order by d.day)
                      from (select day, sum(views) as views from v group by day) d left join u on u.day = d.day), '[]'::json),
    'pages', coalesce((select json_agg(x) from (select path, sum(views) as views from v group by path order by 2 desc, 1 limit 15) x), '[]'::json),
    'sources', coalesce((select json_agg(x) from (select source, sum(views) as views from entries group by source order by 2 desc, 1 limit 40) x), '[]'::json),
    'countries', coalesce((select json_agg(x) from (select country, sum(views) as views from entries group by country order by 2 desc, 1 limit 10) x), '[]'::json),
    'entries', (select coalesce(sum(views), 0) from entries)
  );
$fn$;

-- Vues d'une page (ou de tout le projet) sur deux jours : sert a mesurer l'effet d'une publication.
create or replace function public.studio_views_after(p_project text, p_day date, p_path text default null)
returns integer
language sql
stable
security definer
set search_path = public
as $fn$
  select coalesce(sum(views), 0)::integer from public.studio_visits_daily
  where project = p_project and day between p_day and p_day + 1 and (p_path is null or path = p_path);
$fn$;

revoke all on function public.studio_track_visit(text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.studio_visit_summary(text, date, date) from public, anon, authenticated;
revoke all on function public.studio_views_after(text, date, text) from public, anon, authenticated;
grant execute on function public.studio_track_visit(text, text, text, text, text) to service_role;
grant execute on function public.studio_visit_summary(text, date, date) to service_role;
grant execute on function public.studio_views_after(text, date, text) to service_role;

commit;

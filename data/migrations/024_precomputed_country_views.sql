-- Fiches pays : les deux lectures les plus lourdes (derniere valeur et rang de chaque indicateur)
-- etaient recalculees sur toute la base a chaque page vue. Sous la charge d'un robot, elles depassaient
-- la limite de 3 secondes ("statement timeout"). Elles sont maintenant calculees une fois, a chaque
-- refresh_statlas(), et lues par un index. Les noms obs_latest et obs_rank_latest ne changent pas.
begin;

create materialized view if not exists public.obs_latest_m as
select distinct on (entity_id, indicator_id) entity_id, indicator_id, value_number, period_start, is_projection
from public.obs_yearly y
order by entity_id, indicator_id, is_projection, year desc;

create unique index if not exists obs_latest_m_pk on public.obs_latest_m (entity_id, indicator_id);

create materialized view if not exists public.obs_rank_latest_m as
with sel as (
  select y.indicator_id, y.entity_id, y.year, y.value_number, coalesce(i.higher_is_better, true) as hib
  from public.obs_yearly y
  join public.indicator_stats st on st.indicator_id = y.indicator_id and y.year = st.ref_year
  join public.indicators i on i.id = y.indicator_id
  join public.entities e on e.id = y.entity_id and e.entity_type = 'country'
)
select indicator_id, entity_id, year, value_number,
       rank() over (partition by indicator_id order by case when hib then - value_number else value_number end) as rank,
       count(*) over (partition by indicator_id) as total
from sel;

create unique index if not exists obs_rank_latest_m_pk on public.obs_rank_latest_m (entity_id, indicator_id);
create index if not exists obs_rank_latest_m_rank on public.obs_rank_latest_m (rank);

grant select on public.obs_latest_m, public.obs_rank_latest_m to anon, authenticated;

create or replace view public.obs_latest with (security_invoker = true) as
select entity_id, indicator_id, value_number, period_start, is_projection from public.obs_latest_m;

create or replace view public.obs_rank_latest with (security_invoker = true) as
select indicator_id, entity_id, year, value_number, rank, total from public.obs_rank_latest_m;

create or replace function public.refresh_statlas()
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  refresh materialized view obs_yearly;
  refresh materialized view indicator_stats;
  refresh materialized view indicator_catalog;
  refresh materialized view obs_latest_m;
  refresh materialized view obs_rank_latest_m;
  update indicators i set last_checked_on = l.d
    from (select indicator_slug, max(logged_at)::date as d from common.import_log
          where indicator_slug is not null group by indicator_slug) l
   where i.slug = l.indicator_slug and i.last_checked_on is distinct from l.d;
  insert into common.import_log (action, row_count) values ('refresh_statlas', (select count(*) from obs_yearly));
end;
$function$;

commit;

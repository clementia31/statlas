-- 1. Population totale : une seule source (Banque mondiale, CC BY 4.0) au lieu de OCDE + FMI.
-- 2. Suivi des mises a jour : frequence de publication de la source et date du dernier import, par indicateur.
begin;

select public.import_worldbank('SP.POP.TOTL', 'population-total', 'people',
  'World Development Indicators — Population, total', current_date);

alter table public.indicators
  add column if not exists update_frequency text,
  add column if not exists last_checked_on date;
alter table public.indicators drop constraint if exists indicators_update_frequency_check;
alter table public.indicators add constraint indicators_update_frequency_check
  check (update_frequency is null or update_frequency in
    ('continuous','monthly','quarterly','twice_a_year','annual','every_four_years','after_each_event','irregular'));
comment on column public.indicators.update_frequency is 'Rythme auquel la source publie de nouvelles valeurs';
comment on column public.indicators.last_checked_on is 'Date du dernier import depuis la source';

-- Le recalcul tient aussi a jour la date du dernier import, a partir du journal
create or replace function public.refresh_statlas()
 returns void language plpgsql security definer set search_path to 'public'
as $function$
begin
  refresh materialized view obs_yearly;
  refresh materialized view indicator_stats;
  refresh materialized view indicator_catalog;
  update indicators i set last_checked_on = l.d
    from (select indicator_slug, max(logged_at)::date as d from common.import_log
          where indicator_slug is not null group by indicator_slug) l
   where i.slug = l.indicator_slug and i.last_checked_on is distinct from l.d;
  insert into common.import_log (action, row_count) values ('refresh_statlas', (select count(*) from obs_yearly));
end;
$function$;

select public.refresh_statlas();

-- Date du dernier import pour les indicateurs charges avant l'existence du journal
update public.indicators i set last_checked_on = o.d
  from (select indicator_id, max(created_at)::date as d from public.observations group by indicator_id) o
 where o.indicator_id = i.id and i.last_checked_on is null;

-- Frequence selon la source de chaque indicateur
update public.indicators i set update_frequency = f.freq
  from (select distinct y.indicator_id, s.slug from public.obs_yearly y
          join public.source_documents d on d.id = y.source_document_id
          join public.sources s on s.id = d.source_id) x
  join (values ('world-bank','annual'), ('imf','twice_a_year'), ('undp','annual'), ('oecd','annual'),
               ('nobel-foundation','annual'), ('imu','every_four_years'), ('celestrak','continuous'),
               ('sport-results','after_each_event')) as f(slug, freq) on f.slug = x.slug
 where x.indicator_id = i.id;

commit;

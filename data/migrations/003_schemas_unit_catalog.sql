-- Etape 3 : nouveaux espaces, suppression de observations.unit (doublon de indicators.unit),
-- catalogue pre-calcule. Tout ou rien : en cas d'erreur, rien n'est modifie.
begin;

-- 1. Nouveaux espaces (vides, non exposes au public)
create schema if not exists common;
create schema if not exists immo;
create schema if not exists finance;
create schema if not exists studio;
comment on schema common is 'References communes a tous les projets (sources, licences, journal des imports, villes, regions)';
comment on schema immo is 'Donnees immobilieres publiques (agregats)';
comment on schema finance is 'Series macro partagees avec Finalea (pas de cours de marche)';
comment on schema studio is 'Prive : calendrier, publications, mesures. Jamais expose au public';

-- 2. Fonctions d'import : meme signature, n'ecrivent plus unit
create or replace function public.import_worldbank(p_code text, p_slug text, p_unit text, p_title text, p_updated date)
 returns integer language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare
  v_doc uuid;
  v_n integer;
begin
  insert into source_documents (id, source_id, title, url, dataset_id_external, published_at)
  select gen_random_uuid(), s.id, p_title, 'https://data.worldbank.org/indicator/' || p_code, p_code, p_updated
  from sources s where s.slug = 'world-bank'
  and not exists (select 1 from source_documents where dataset_id_external = p_code);
  select id into v_doc from source_documents where dataset_id_external = p_code limit 1;

  delete from observations where indicator_id = (select id from indicators where slug = p_slug);

  insert into observations (entity_id, indicator_id, value_number, raw_value, period_start, source_document_id, status, is_projection)
  select e.id, i.id, (x ->> 'value')::numeric, x ->> 'value', make_date((x ->> 'date')::int, 1, 1), v_doc, 'validated', false
  from (
    select jsonb_array_elements(content::jsonb -> 1) as x
    from http_get('https://api.worldbank.org/v2/country/all/indicator/' || p_code || '?format=json&per_page=20000&date=1960:2025')
  ) t
  join entities e on e.iso_code = t.x -> 'country' ->> 'id' and e.entity_type = 'country'
  join indicators i on i.slug = p_slug
  where t.x ->> 'value' is not null;
  get diagnostics v_n = row_count;
  return v_n;
end;
$function$;

create or replace function public.import_imf_weo(p_code text, p_slug text, p_unit text, p_title text, p_updated date, p_proj_from integer)
 returns integer language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare
  v_doc uuid;
  v_n integer;
begin
  insert into source_documents (id, source_id, title, url, dataset_id_external, published_at)
  select gen_random_uuid(), s.id, p_title, 'https://www.imf.org/external/datamapper/' || p_code, 'IMF.WEO.' || p_code, p_updated
  from sources s where s.slug = 'imf'
  and not exists (select 1 from source_documents where dataset_id_external = 'IMF.WEO.' || p_code);
  select id into v_doc from source_documents where dataset_id_external = 'IMF.WEO.' || p_code limit 1;

  delete from observations where indicator_id = (select id from indicators where slug = p_slug);

  with iso as (
    select c ->> 'id' as iso3, c ->> 'iso2Code' as iso2
    from (select jsonb_array_elements(content::jsonb -> 1) as c
          from http_get('https://api.worldbank.org/v2/country?format=json&per_page=400')) z
  ), vals as (
    select k.key as iso3, y.key as yr, y.value as v
    from (select content::jsonb -> 'values' -> p_code as j
          from http_get('https://www.imf.org/external/datamapper/api/v1/' || p_code)) r,
         jsonb_each(r.j) k, jsonb_each(k.value) y
  )
  insert into observations (entity_id, indicator_id, value_number, raw_value, period_start, source_document_id, status, is_projection)
  select e.id, i.id, (vals.v #>> '{}')::numeric, vals.v #>> '{}', make_date(vals.yr::int, 1, 1), v_doc, 'validated', vals.yr::int >= p_proj_from
  from vals
  join iso on iso.iso3 = vals.iso3
  join entities e on e.iso_code = iso.iso2 and e.entity_type = 'country'
  join indicators i on i.slug = p_slug
  where jsonb_typeof(vals.v) = 'number';
  get diagnostics v_n = row_count;
  return v_n;
end;
$function$;

create or replace function public.import_psv(p_file text, p_slug text, p_unit text, p_source text, p_title text, p_dataset text, p_doc_url text, p_published date, p_max_year integer default 9999)
 returns integer language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare v_doc uuid; v_n integer;
begin
  insert into source_documents (id, source_id, title, url, dataset_id_external, published_at)
  select gen_random_uuid(), s.id, p_title, p_doc_url, p_dataset, p_published from sources s where s.slug = p_source
  and not exists (select 1 from source_documents where dataset_id_external = p_dataset);
  select id into v_doc from source_documents where dataset_id_external = p_dataset limit 1;
  delete from observations where indicator_id = (select id from indicators where slug = p_slug);
  insert into observations (entity_id, indicator_id, value_number, raw_value, period_start, source_document_id, status, is_projection)
  select e.id, i.id, f[3]::numeric, f[3], make_date(f[2]::int, 1, 1), v_doc, 'validated', f[4] = '1'
  from (
    select string_to_array(l, '|') as f
    from regexp_split_to_table((select content from http_get('https://raw.githubusercontent.com/clementia31/statlas/main/data/seeds/history/' || p_file)), E'\n') as l
    where l <> '' and left(l, 1) <> '#'
  ) t
  join entities e on e.iso_code = t.f[1] and e.entity_type = 'country'
  join indicators i on i.slug = p_slug
  where t.f[2]::int <= p_max_year;
  get diagnostics v_n = row_count;
  return v_n;
end $function$;

create or replace function public.import_psv_at(p_dir text, p_file text, p_slug text, p_unit text, p_source text, p_title text, p_dataset text, p_doc_url text, p_published date, p_max_year integer default 9999)
 returns integer language plpgsql security definer set search_path to 'public', 'extensions'
as $function$
declare v_doc uuid; v_n integer;
begin
  insert into source_documents (id, source_id, title, url, dataset_id_external, published_at)
  select gen_random_uuid(), s.id, p_title, p_doc_url, p_dataset, p_published from sources s where s.slug = p_source
  and not exists (select 1 from source_documents where dataset_id_external = p_dataset);
  select id into v_doc from source_documents where dataset_id_external = p_dataset limit 1;
  delete from observations where indicator_id = (select id from indicators where slug = p_slug);
  insert into observations (entity_id, indicator_id, value_number, raw_value, period_start, source_document_id, status, is_projection)
  select e.id, i.id, f[3]::numeric, f[3], make_date(f[2]::int, 1, 1), v_doc, 'validated', f[4] = '1'
  from (
    select string_to_array(l, '|') as f
    from regexp_split_to_table((select content from http_get('https://raw.githubusercontent.com/clementia31/statlas/main/data/seeds/' || p_dir || '/' || p_file)), E'\n') as l
    where l <> '' and left(l, 1) <> '#'
  ) t
  join entities e on e.iso_code = t.f[1] and e.entity_type = 'country'
  join indicators i on i.slug = p_slug
  where t.f[2]::int <= p_max_year;
  get diagnostics v_n = row_count;
  return v_n;
end $function$;

-- 3. Ancienne fonction du declencheur supprime a l'etape 1
drop function if exists public.refresh_statlas_trigger();

-- 4. Vues : on retire tout, on supprime la colonne, on reconstruit
drop materialized view public.obs_yearly cascade;
alter table public.observations drop column unit;

create materialized view public.obs_yearly as
 select distinct on (indicator_id, entity_id, (extract(year from period_start))) indicator_id,
    entity_id,
    extract(year from period_start)::integer as year,
    value_number,
    period_start,
    coalesce(is_projection, false) as is_projection,
    source_document_id
   from public.observations o
  where status = 'validated'::text
  order by indicator_id, entity_id, (extract(year from period_start)), period_start desc;
create unique index obs_yearly_pk on public.obs_yearly using btree (indicator_id, entity_id, year);
create index obs_yearly_entity on public.obs_yearly using btree (entity_id);
create index obs_yearly_ind_year on public.obs_yearly using btree (indicator_id, year);

create view public.obs_latest with (security_invoker = true) as
 select distinct on (entity_id, indicator_id) entity_id,
    indicator_id,
    value_number,
    period_start,
    is_projection
   from public.obs_yearly y
  order by entity_id, indicator_id, is_projection, year desc;

create view public.obs_values with (security_invoker = true) as
 select i.slug as indicator_slug,
    e.slug as entity_slug,
    e.name_default as entity_name,
    e.iso_code,
    e.entity_type,
    y.year,
    y.value_number as value,
    y.is_projection,
    y.period_start
   from public.obs_yearly y
     join public.indicators i on i.id = y.indicator_id
     join public.entities e on e.id = y.entity_id;

create view public.indicator_years with (security_invoker = true) as
 select i.slug as indicator_slug,
    y.year,
    count(*) as n_countries,
    bool_and(y.is_projection) as is_projection
   from public.obs_yearly y
     join public.indicators i on i.id = y.indicator_id
     join public.entities e on e.id = y.entity_id and e.entity_type = 'country'::text
  group by i.slug, y.year;

create view public.indicator_world_series with (security_invoker = true) as
 select i.slug as indicator_slug,
    y.year,
    count(*) as n_countries,
    avg(y.value_number) as mean,
    percentile_cont(0.5::double precision) within group (order by (y.value_number::double precision)) as median,
    sum(y.value_number) as total
   from public.obs_yearly y
     join public.indicators i on i.id = y.indicator_id
     join public.entities e on e.id = y.entity_id and e.entity_type = 'country'::text
  where not y.is_projection
  group by i.slug, y.year;

create materialized view public.indicator_stats as
 with per_year as (
         select y.indicator_id,
            y.year,
            count(*) as n,
            bool_and(y.is_projection) as all_proj,
            max(extract(month from y.period_start)) as last_month
           from public.obs_yearly y
             join public.entities e on e.id = y.entity_id and (e.entity_type = any (array['country'::text, 'city'::text]))
          group by y.indicator_id, y.year
        ), freq as (
         select observations.indicator_id,
            bool_or(extract(month from observations.period_start) <> 1::numeric) as sub_annual
           from public.observations
          group by observations.indicator_id
        ), mx as (
         select per_year.indicator_id,
            max(per_year.n) filter (where not per_year.all_proj) as max_n
           from per_year
          group by per_year.indicator_id
        )
 select p.indicator_id,
    coalesce(max(f.sub_annual::integer), 0)::boolean as sub_annual,
    min(p.year) as first_year,
    max(p.year) filter (where not p.all_proj) as last_actual_year,
    max(p.year) as last_year,
    max(p.year) filter (where not p.all_proj and p.n::numeric >= (0.8 * m.max_n::numeric) and (not coalesce(f.sub_annual, false) or p.last_month >= 10::numeric)) as ref_year,
    max(m.max_n) as max_coverage
   from per_year p
     join mx m on m.indicator_id = p.indicator_id
     left join freq f on f.indicator_id = p.indicator_id
  group by p.indicator_id;
create unique index indicator_stats_pk on public.indicator_stats using btree (indicator_id);

-- Catalogue : desormais pre-calcule (etait recalcule a chaque visite)
create materialized view public.indicator_catalog as
 with src as (
         select distinct on (y.indicator_id) y.indicator_id,
            s.name as source_name,
            s.url as source_url,
            sd.title as dataset_title
           from public.obs_yearly y
             join public.source_documents sd on sd.id = y.source_document_id
             join public.sources s on s.id = sd.source_id
          order by y.indicator_id, y.year desc
        ), cov as (
         select y.indicator_id,
            count(*) as ref_coverage
           from public.obs_yearly y
             join public.indicator_stats st_1 on st_1.indicator_id = y.indicator_id and y.year = st_1.ref_year
          group by y.indicator_id
        )
 select i.id,
    i.slug,
    i.name_default as name,
    i.unit,
    i.definition,
    i.higher_is_better,
    c.slug as category_slug,
    c.name_default as category,
    st.first_year,
    st.last_actual_year,
    st.last_year,
    st.ref_year,
    st.max_coverage,
    coalesce(cov.ref_coverage, 0::bigint) as ref_coverage,
    src.source_name,
    src.source_url,
    src.dataset_title,
    coalesce(st.sub_annual, false) as sub_annual
   from public.indicators i
     left join public.categories c on c.id = i.category_id
     left join public.indicator_stats st on st.indicator_id = i.id
     left join cov on cov.indicator_id = i.id
     left join src on src.indicator_id = i.id;
create unique index indicator_catalog_pk on public.indicator_catalog using btree (id);
create index indicator_catalog_slug on public.indicator_catalog using btree (slug);

create view public.obs_rank_latest with (security_invoker = true) as
 with sel as (
         select y.indicator_id,
            y.entity_id,
            y.year,
            y.value_number,
            coalesce(i.higher_is_better, true) as hib
           from public.obs_yearly y
             join public.indicator_stats st on st.indicator_id = y.indicator_id and y.year = st.ref_year
             join public.indicators i on i.id = y.indicator_id
             join public.entities e on e.id = y.entity_id and e.entity_type = 'country'::text
        )
 select indicator_id,
    entity_id,
    year,
    value_number,
    rank() over (partition by indicator_id order by (
        case
            when hib then - value_number
            else value_number
        end)) as rank,
    count(*) over (partition by indicator_id) as total
   from sel;

-- 5. Lecture publique, comme avant
grant select on public.obs_yearly, public.obs_latest, public.obs_values, public.indicator_years,
  public.indicator_world_series, public.indicator_stats, public.indicator_catalog, public.obs_rank_latest
  to anon, authenticated;

-- 6. Recalcul a la demande : inclut maintenant le catalogue
create or replace function public.refresh_statlas()
 returns void language plpgsql security definer set search_path to 'public'
as $function$
begin
  refresh materialized view obs_yearly;
  refresh materialized view indicator_stats;
  refresh materialized view indicator_catalog;
end;
$function$;

commit;

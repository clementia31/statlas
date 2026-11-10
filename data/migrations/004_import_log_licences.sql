-- Etape 4a : journal des imports + registre des licences des sources.
-- Uniquement des ajouts. Tout ou rien.
begin;

-- 1. Journal des imports (prive, espace common)
create table if not exists common.import_log (
  id bigint generated always as identity primary key,
  logged_at timestamptz not null default now(),
  project text not null default 'statlas',
  action text not null,
  indicator_slug text,
  dataset text,
  row_count integer,
  run_by text not null default current_user
);
alter table common.import_log enable row level security;
create index if not exists import_log_slug on common.import_log (indicator_slug, logged_at desc);
comment on table common.import_log is 'Une ligne par import ou recalcul : quoi, quand, combien de lignes';

-- 2. Licences des sources (a remplir apres verification source par source)
alter table public.sources
  add column if not exists licence text,
  add column if not exists licence_url text,
  add column if not exists attribution text,
  add column if not exists commercial_use boolean,
  add column if not exists redistribution boolean,
  add column if not exists licence_checked_on date,
  add column if not exists licence_notes text;

-- 3. Les fonctions d'import ecrivent dans le journal
create or replace function public.import_worldbank(p_code text, p_slug text, p_unit text, p_title text, p_updated date)
 returns integer language plpgsql security definer set search_path to 'public', 'extensions', 'common'
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
  insert into common.import_log (action, indicator_slug, dataset, row_count) values ('import_worldbank', p_slug, p_code, v_n);
  return v_n;
end;
$function$;

create or replace function public.import_imf_weo(p_code text, p_slug text, p_unit text, p_title text, p_updated date, p_proj_from integer)
 returns integer language plpgsql security definer set search_path to 'public', 'extensions', 'common'
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
  insert into common.import_log (action, indicator_slug, dataset, row_count) values ('import_imf_weo', p_slug, 'IMF.WEO.' || p_code, v_n);
  return v_n;
end;
$function$;

create or replace function public.import_psv(p_file text, p_slug text, p_unit text, p_source text, p_title text, p_dataset text, p_doc_url text, p_published date, p_max_year integer default 9999)
 returns integer language plpgsql security definer set search_path to 'public', 'extensions', 'common'
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
  insert into common.import_log (action, indicator_slug, dataset, row_count) values ('import_psv', p_slug, p_dataset, v_n);
  return v_n;
end $function$;

create or replace function public.import_psv_at(p_dir text, p_file text, p_slug text, p_unit text, p_source text, p_title text, p_dataset text, p_doc_url text, p_published date, p_max_year integer default 9999)
 returns integer language plpgsql security definer set search_path to 'public', 'extensions', 'common'
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
  insert into common.import_log (action, indicator_slug, dataset, row_count) values ('import_psv_at', p_slug, p_dataset, v_n);
  return v_n;
end $function$;

create or replace function public.refresh_statlas()
 returns void language plpgsql security definer set search_path to 'public'
as $function$
begin
  refresh materialized view obs_yearly;
  refresh materialized view indicator_stats;
  refresh materialized view indicator_catalog;
  insert into common.import_log (action, row_count) values ('refresh_statlas', (select count(*) from obs_yearly));
end;
$function$;

commit;

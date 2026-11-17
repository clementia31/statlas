-- Totaux "Monde" et par region publies par la Banque mondiale elle-meme (ses agregats : rien n'est calcule par nous).
-- Ils deviennent des entites a part, jamais melangees aux pays : classements, cartes et listes de pays
-- ne lisent que les entites de type "country".
begin;

alter table public.entities add column if not exists wb_code text;
create unique index if not exists entities_wb_code on public.entities (wb_code) where wb_code is not null;

-- Noms tels que renvoyes par la Banque mondiale le 2026-11-17
insert into public.entities (slug, entity_type, name_default, wb_code)
select v.slug, v.kind, v.name, v.code
from (values
  ('world', 'world', 'World', 'WLD'),
  ('region-east-asia-pacific', 'region', 'East Asia & Pacific', 'EAS'),
  ('region-europe-central-asia', 'region', 'Europe & Central Asia', 'ECS'),
  ('region-latin-america-caribbean', 'region', 'Latin America & Caribbean', 'LCN'),
  ('region-middle-east-north-africa-afghanistan-pakistan', 'region', 'Middle East, North Africa, Afghanistan & Pakistan', 'MEA'),
  ('region-north-america', 'region', 'North America', 'NAC'),
  ('region-south-asia', 'region', 'South Asia', 'SAS'),
  ('region-sub-saharan-africa', 'region', 'Sub-Saharan Africa', 'SSF')
) as v(slug, kind, name, code)
where not exists (select 1 from public.entities e where e.wb_code = v.code);

-- Charge les agregats de la Banque mondiale pour un indicateur, sans toucher aux valeurs des pays.
create or replace function public.import_worldbank_aggregates(p_code text, p_slug text)
returns integer
language plpgsql
security definer
set search_path to 'public', 'extensions', 'common'
as $function$
declare
  v_doc uuid; v_n integer; v_rows jsonb;
begin
  select id into v_doc from source_documents where dataset_id_external = p_code limit 1;
  if v_doc is null then return 0; end if;

  -- Le service de la Banque mondiale est parfois tres lent : on attend 20 secondes au plus, et on n'echoue jamais.
  begin
    perform http_set_curlopt('CURLOPT_TIMEOUT_MS', '20000');
    select content::jsonb -> 1 into v_rows
    from http_get('https://api.worldbank.org/v2/country/WLD;EAS;ECS;LCN;MEA;NAC;SAS;SSF/indicator/' || p_code || '?format=json&per_page=2000&date=1960:2025');
  exception when others then
    raise notice 'Banque mondiale injoignable pour % : %', p_code, sqlerrm;
    return -1;
  end;
  if v_rows is null or jsonb_typeof(v_rows) <> 'array' then return 0; end if;

  delete from observations o using entities e
  where o.entity_id = e.id and e.wb_code is not null
    and o.indicator_id = (select id from indicators where slug = p_slug);

  insert into observations (entity_id, indicator_id, value_number, raw_value, period_start, source_document_id, status, is_projection)
  select e.id, i.id, (x ->> 'value')::numeric, x ->> 'value', make_date((x ->> 'date')::int, 1, 1), v_doc, 'validated', false
  from jsonb_array_elements(v_rows) x
  join entities e on e.wb_code = x ->> 'countryiso3code'
  join indicators i on i.slug = p_slug
  where x ->> 'value' is not null;
  get diagnostics v_n = row_count;
  insert into common.import_log (action, indicator_slug, dataset, row_count) values ('import_worldbank_aggregates', p_slug, p_code, v_n);
  return v_n;
end;
$function$;

revoke all on function public.import_worldbank_aggregates(text, text) from public, anon, authenticated;

-- L'import habituel recharge desormais aussi les agregats (sinon ils disparaitraient a chaque mise a jour d'un indicateur).
create or replace function public.import_worldbank(p_code text, p_slug text, p_unit text, p_title text, p_updated date)
returns integer
language plpgsql
security definer
set search_path to 'public', 'extensions', 'common'
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
  join entities e on (e.iso_code = t.x -> 'country' ->> 'id' and e.entity_type = 'country')
                  or (e.wb_code is not null and e.wb_code = t.x ->> 'countryiso3code')
  join indicators i on i.slug = p_slug
  where t.x ->> 'value' is not null;
  get diagnostics v_n = row_count;
  insert into common.import_log (action, indicator_slug, dataset, row_count) values ('import_worldbank', p_slug, p_code, v_n);
  return v_n;
end;
$function$;


-- Chargement depuis le fichier fige du depot (49 indicateurs), valeurs de la Banque mondiale inchangees
do $load$
declare v_n integer;
begin
  create temp table _agg on commit drop as
  select f[1] as slug, f[2] as code, f[3] as wb, f[4]::int as year, f[5] as value
  from (
    select string_to_array(l, '|') as f
    from regexp_split_to_table((select content from extensions.http_get('https://raw.githubusercontent.com/clementia31/statlas/11a39d6e8080393a9351cc40456698523813a8cd/data/seeds/aggregates/world-bank-aggregates.psv')), E'\n') as l
    where l <> '' and left(l, 1) <> '#'
  ) t;

  delete from public.observations o using public.entities e
  where o.entity_id = e.id and e.wb_code is not null
    and o.indicator_id in (select i.id from public.indicators i where i.slug in (select distinct slug from _agg));

  insert into public.observations (entity_id, indicator_id, value_number, raw_value, period_start, source_document_id, status, is_projection)
  select e.id, i.id, a.value::numeric, a.value, make_date(a.year, 1, 1), d.id, 'validated', false
  from _agg a
  join public.entities e on e.wb_code = a.wb
  join public.indicators i on i.slug = a.slug
  join public.source_documents d on d.dataset_id_external = a.code;
  get diagnostics v_n = row_count;
  if v_n < 17000 then raise exception 'Chargement incomplet : % lignes', v_n; end if;
  insert into common.import_log (action, dataset, row_count) values ('import_worldbank_aggregates', 'seed 2026-11-17', v_n);
end
$load$;

-- Quatre indicateurs absents du fichier (le service ne repondait pas au moment de la collecte) : lus en direct.
-- Si le service ne repond pas, ils sont simplement laisses pour plus tard, sans faire echouer le reste.
select public.import_worldbank_aggregates('SP.DYN.IMRT.IN', 'infant-mortality'),
       public.import_worldbank_aggregates('SP.POP.65UP.TO.ZS', 'population-65-plus'),
       public.import_worldbank_aggregates('ST.INT.ARVL', 'tourist-arrivals'),
       public.import_worldbank_aggregates('VC.IHR.PSRC.P5', 'homicide-rate');

select public.refresh_statlas();

commit;

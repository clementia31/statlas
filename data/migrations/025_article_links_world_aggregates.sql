-- 1. Articles de reference de la Gazette relies aux indicateurs deja en base.
-- 2. Totaux "Monde" et par region fournis par la Banque mondiale (ses propres agregats : rien n'est calcule par nous).
begin;

-- 1. Liens article -> indicateurs. Seuls les indicateurs existants sont gardes ; un article deja relie n'est pas modifie.
with links(article, indicators) as (values
  ('quantitative-demography', array['population-total','fertility-rate','life-expectancy-birth','median-age','birth-rate','death-rate']),
  ('epidemiology',            array['life-expectancy-birth','infant-mortality','under5-mortality','maternal-mortality']),
  ('polemology',              array['conflict-deaths','military-expenditure-gdp','armed-forces-personnel']),
  ('correlates-of-war',       array['conflict-deaths','military-expenditure-gdp','armed-forces-personnel']),
  ('psephology',              array['electoral-democracy-index','women-in-parliament']),
  ('cliometrics',             array['gdp-per-capita-maddison']),
  ('cliodynamics',            array['gdp-per-capita-maddison','conflict-deaths']),
  ('quantitative-geography',  array['population-density','urban-population-share','land-area'])
)
update public.articles a
set related_indicators = (select array_agg(s order by ord) from unnest(l.indicators) with ordinality as u(s, ord) where exists (select 1 from public.indicators i where i.slug = u.s))
from links l
where a.slug = l.article and (a.related_indicators is null or cardinality(a.related_indicators) = 0);

-- 2. Le monde et les regions de la Banque mondiale deviennent des entites a part (jamais melangees aux pays :
--    classements, cartes et listes de pays ne lisent que les entites de type "country").
alter table public.entities add column if not exists wb_code text;
create unique index if not exists entities_wb_code on public.entities (wb_code) where wb_code is not null;

-- Charge les agregats de la Banque mondiale pour un indicateur, sans toucher aux valeurs des pays.
-- Le nom de chaque region est celui que renvoie la Banque mondiale.
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

  select content::jsonb -> 1 into v_rows
  from http_get('https://api.worldbank.org/v2/country/WLD;EAS;ECS;LCN;MEA;NAC;SAS;SSF/indicator/' || p_code || '?format=json&per_page=2000&date=1960:2025');
  if v_rows is null or jsonb_typeof(v_rows) <> 'array' then return 0; end if;

  insert into entities (slug, entity_type, name_default, wb_code)
  select distinct on (x ->> 'countryiso3code')
         case when x ->> 'countryiso3code' = 'WLD' then 'world'
              else 'region-' || trim(both '-' from regexp_replace(lower(x -> 'country' ->> 'value'), '[^a-z0-9]+', '-', 'g')) end,
         case when x ->> 'countryiso3code' = 'WLD' then 'world' else 'region' end,
         x -> 'country' ->> 'value',
         x ->> 'countryiso3code'
  from jsonb_array_elements(v_rows) x
  where x ->> 'countryiso3code' in ('WLD','EAS','ECS','LCN','MEA','NAC','SAS','SSF')
    and not exists (select 1 from entities e where e.wb_code = x ->> 'countryiso3code');

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

-- Chargement pour tous les indicateurs de la Banque mondiale deja en base
do $load$
declare r record; v_total integer := 0;
begin
  for r in
    select d.dataset_id_external as code,
           (select i.slug from indicators i where i.id = (select o.indicator_id from observations o where o.source_document_id = d.id limit 1)) as slug
    from source_documents d join sources s on s.id = d.source_id
    where s.slug = 'world-bank' and d.dataset_id_external is not null
  loop
    if r.slug is not null then v_total := v_total + public.import_worldbank_aggregates(r.code, r.slug); end if;
  end loop;
  raise notice 'Agregats Banque mondiale : % valeurs', v_total;
end
$load$;

select public.refresh_statlas();

commit;

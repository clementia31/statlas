-- Etats disparus : Union sovietique, Yougoslavie et Tchecoslovaquie, avec leur PIB par habitant historique (Maddison).
-- Les etats disparus n'ont pas de code pays officiel actuel (iso_code reste vide, le site les distingue ainsi) :
-- un code historique a part (hist_code) permet aux imports de les reconnaitre.
begin;

alter table public.entities add column if not exists hist_code text;
create unique index if not exists entities_hist_code_key on public.entities (hist_code) where hist_code is not null;
comment on column public.entities.hist_code is 'Code d''un etat disparu (ancien code ISO 3166, ex. SU, YU, CS), utilise par les imports. iso_code reste vide pour ces etats';

insert into public.entities (slug, entity_type, name_default, iso_code, hist_code, valid_from, valid_to)
select v.slug, 'country', v.name, null, v.code, v.vfrom::date, v.vto::date
from (values ('soviet-union', 'Soviet Union', 'SU', '1922-12-30', '1991-12-26'),
             ('yugoslavia', 'Yugoslavia', 'YU', '1918-12-01', '1992-04-27'),
             ('czechoslovakia', 'Czechoslovakia', 'CS', '1918-10-28', '1992-12-31')) as v(slug, name, code, vfrom, vto)
where not exists (select 1 from public.entities e where e.slug = v.slug);

insert into public.entity_relations (predecessor_id, successor_id, relation_type, event_date, note)
select p.id, s.id, 'dissolution', v.d::date, v.note
from (values ('soviet-union', '1991-12-26', 'Dissolution of the Soviet Union', array['RU','UA','BY','UZ','KZ','GE','AZ','LT','MD','LV','KG','TJ','AM','TM','EE']),
             ('yugoslavia', '1992-04-27', 'Breakup of Yugoslavia (successor states as they exist today)', array['SI','HR','BA','MK','RS','ME']),
             ('czechoslovakia', '1993-01-01', 'Dissolution of Czechoslovakia', array['CZ','SK'])) as v(slug, d, note, codes)
join public.entities p on p.slug = v.slug
join public.entities s on s.iso_code = any(v.codes) and s.entity_type = 'country'
where not exists (select 1 from public.entity_relations r where r.predecessor_id = p.id and r.successor_id = s.id);

-- Les imports par fichier reconnaissent aussi le code historique
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
  join entities e on (e.iso_code = t.f[1] or e.hist_code = t.f[1]) and e.entity_type = 'country'
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
  join entities e on (e.iso_code = t.f[1] or e.hist_code = t.f[1]) and e.entity_type = 'country'
  join indicators i on i.slug = p_slug
  where t.f[2]::int <= p_max_year;
  get diagnostics v_n = row_count;
  insert into common.import_log (action, indicator_slug, dataset, row_count) values ('import_psv_at', p_slug, p_dataset, v_n);
  return v_n;
end $function$;

-- PIB par habitant historique des trois etats (fichier Maddison officiel, version figee du depot) :
-- on ajoute seulement leurs lignes, sans recharger tout l'indicateur.
with src as (
  select string_to_array(l, '|') as f
  from regexp_split_to_table((select content from extensions.http_get(
    'https://raw.githubusercontent.com/clementia31/statlas/9e536040636024825b73e1f68379b686125605d0/data/seeds/history/gdp-per-capita-maddison.psv')), E'\n') as l
  where l <> '' and left(l, 1) <> '#'
), added as (
  insert into public.observations (entity_id, indicator_id, value_number, raw_value, period_start, source_document_id, status, is_projection)
  select e.id, i.id, s.f[3]::numeric, s.f[3], make_date(s.f[2]::int, 1, 1),
         (select id from public.source_documents where dataset_id_external = 'maddison-2023' limit 1), 'validated', false
  from src s
  join public.entities e on e.hist_code = s.f[1]
  join public.indicators i on i.slug = 'gdp-per-capita-maddison'
  where not exists (select 1 from public.observations o where o.entity_id = e.id and o.indicator_id = i.id)
  returning 1
)
insert into common.import_log (action, indicator_slug, dataset, row_count)
select 'import_former_states', 'gdp-per-capita-maddison', 'maddison-2023', count(*) from added;

select public.refresh_statlas();

commit;

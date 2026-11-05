-- Statlas : section Sport (+ satellites). À coller dans l'éditeur SQL de Supabase, puis Run. Relançable sans doublon.

insert into categories (slug, name_default)
select v.slug, v.name from (values ('sport','Sport'),('space','Space')) v(slug, name)
where not exists (select 1 from categories c where c.slug = v.slug);

insert into sources (slug, name, source_type, url)
select v.slug, v.name, (select source_type from sources where slug = 'world-bank' limit 1), v.url from (values
  ('sport-results','Official competition results (IOC, FIFA, World Rugby, IHF, FIBA, Grand Slams, FIA, ASO, France Football)','https://github.com/clementia31/statlas/tree/main/data/seeds/sport'),
  ('celestrak','CelesTrak satellite catalog (SATCAT)','https://celestrak.org/satcat/')
) v(slug, name, url)
where not exists (select 1 from sources s where s.slug = v.slug);

insert into indicators (slug, name_default, category_id, unit, definition, higher_is_better)
select v.slug, v.name, c.id, v.unit, v.def, v.hib from (values
  ('olympics-summer-medals','Olympic medals, Summer Games (cumulative)','sport','medals','Total Summer Olympic medals won since 1896, cumulated at each Games. Successor-state convention: USSR, Unified Team and ROC counted with Russia; East and West Germany with Germany; Czechoslovakia with Czechia; Yugoslavia with Serbia. Count by Statlas Research.',null::boolean),
  ('olympics-summer-gold','Olympic gold medals, Summer Games (cumulative)','sport','medals','Gold medals won at the Summer Olympics since 1896, cumulated; same successor-state convention. Count by Statlas Research.',null::boolean),
  ('olympics-winter-medals','Olympic medals, Winter Games (cumulative)','sport','medals','Total Winter Olympic medals won since 1924, cumulated; same successor-state convention. Count by Statlas Research.',null::boolean),
  ('olympics-winter-gold','Olympic gold medals, Winter Games (cumulative)','sport','medals','Gold medals won at the Winter Olympics since 1924, cumulated; same successor-state convention. Count by Statlas Research.',null::boolean),
  ('football-world-cup-titles','FIFA World Cup titles (men)','sport','titles','Men''s FIFA World Cup titles since 1930, cumulated (West Germany counted with Germany). Count by Statlas Research.',null::boolean),
  ('football-women-world-cup-titles','FIFA Women''s World Cup titles','sport','titles','Women''s World Cup titles since 1991, cumulated. Count by Statlas Research.',null::boolean),
  ('rugby-world-cup-titles','Rugby World Cup titles','sport','titles','Men''s Rugby World Cup titles since 1987, cumulated (England counted under the United Kingdom). Count by Statlas Research.',null::boolean),
  ('handball-men-world-titles','Handball world titles (men)','sport','titles','IHF World Men''s Handball Championship titles since 1938, cumulated; successor-state convention. Count by Statlas Research.',null::boolean),
  ('handball-women-world-titles','Handball world titles (women)','sport','titles','IHF World Women''s Handball Championship titles since 1957, cumulated; successor-state convention. Count by Statlas Research.',null::boolean),
  ('basketball-world-cup-titles','FIBA Basketball World Cup titles','sport','titles','FIBA Basketball World Cup titles since 1950, cumulated (Yugoslavia counted with Serbia, USSR with Russia). Count by Statlas Research.',null::boolean),
  ('tennis-grand-slam-men','Grand Slam singles titles (men)','sport','titles','Men''s singles titles at the four Grand Slam tournaments since 1877, by the player''s nationality, cumulated. Count by Statlas Research.',null::boolean),
  ('tennis-grand-slam-women','Grand Slam singles titles (women)','sport','titles','Women''s singles titles at the four Grand Slam tournaments since 1884, by the player''s nationality, cumulated. Count by Statlas Research.',null::boolean),
  ('formula1-drivers-titles','Formula One drivers'' world titles','sport','titles','Formula One World Drivers'' Championships since 1950 by the driver''s nationality, cumulated. Count by Statlas Research.',null::boolean),
  ('ballon-dor-wins','Ballon d''Or wins','sport','awards','Ballon d''Or (men) since 1956 by the winner''s nationality, cumulated (England, Scotland, Wales and Northern Ireland under the United Kingdom). Count by Statlas Research.',null::boolean),
  ('tour-de-france-wins','Tour de France wins','sport','wins','Tour de France general classification wins since 1903 by the rider''s nationality, cumulated (stripped titles left vacant). Count by Statlas Research.',null::boolean),
  ('satellites-in-orbit','Satellites in orbit (by owner country)','space','satellites','Payloads in Earth orbit at the end of each year, active or not, by owner country (multinational operators excluded). Count by Statlas Research from the CelesTrak catalog.',null::boolean),
  ('satellites-active','Active satellites (by owner country)','space','satellites','Payloads currently operational according to the CelesTrak catalog, by owner country (multinational operators excluded). Count by Statlas Research.',null::boolean)
) v(slug, name, cat, unit, def, hib) join categories c on c.slug = v.cat
on conflict (slug) do nothing;

-- Même import que public.import_psv, mais depuis n'importe quel dossier de data/seeds
create or replace function public.import_psv_at(p_dir text, p_file text, p_slug text, p_unit text, p_source text, p_title text,
                                                p_dataset text, p_doc_url text, p_published date, p_max_year int default 9999)
returns integer language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare v_doc uuid; v_n integer;
begin
  insert into source_documents (id, source_id, title, url, dataset_id_external, published_at)
  select gen_random_uuid(), s.id, p_title, p_doc_url, p_dataset, p_published from sources s where s.slug = p_source
  and not exists (select 1 from source_documents where dataset_id_external = p_dataset);
  select id into v_doc from source_documents where dataset_id_external = p_dataset limit 1;
  delete from observations where indicator_id = (select id from indicators where slug = p_slug);
  insert into observations (entity_id, indicator_id, value_number, raw_value, unit, period_start, source_document_id, status, is_projection)
  select e.id, i.id, f[3]::numeric, f[3], p_unit, make_date(f[2]::int, 1, 1), v_doc, 'validated', f[4] = '1'
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
end $$;

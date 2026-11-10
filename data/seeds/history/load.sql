-- Statlas : chargement du lot « histoire » (Maddison, ONU, V-Dem, UCDP, SIPRI, Nobel, Fields)
-- À coller tel quel dans l'éditeur SQL de Supabase, puis Run. Relançable sans doublon (chaque indicateur est rechargé à neuf).

-- 1. Catégories manquantes
insert into categories (slug, name_default)
select v.slug, v.name from (values ('history','History'),('demographics','Demographics'),('politics','Politics'),
  ('military','Military'),('science','Science')) v(slug, name)
where not exists (select 1 from categories c where c.slug = v.slug);

-- 2. Sources d'origine (même type que la Banque mondiale)
insert into sources (slug, name, source_type, url)
select v.slug, v.name, (select source_type from sources where slug = 'world-bank' limit 1), v.url from (values
  ('maddison-project','Maddison Project (University of Groningen)','https://www.rug.nl/ggdc/historicaldevelopment/maddison/'),
  ('un-population-division','United Nations, Population Division','https://population.un.org/wpp/'),
  ('v-dem','V-Dem Institute (University of Gothenburg)','https://www.v-dem.net/'),
  ('ucdp','Uppsala Conflict Data Program (UCDP)','https://ucdp.uu.se/'),
  ('sipri','Stockholm International Peace Research Institute (SIPRI)','https://www.sipri.org/databases/milex'),
  ('nobel-foundation','Nobel Foundation','https://www.nobelprize.org/'),
  ('imu','International Mathematical Union','https://www.mathunion.org/imu-awards/fields-medal')
) v(slug, name, url)
where not exists (select 1 from sources s where s.slug = v.slug);

-- 3. Indicateurs
insert into indicators (slug, name_default, category_id, unit, definition, higher_is_better)
select v.slug, v.name, c.id, v.unit, v.def, v.hib from (values
  ('gdp-per-capita-maddison','GDP per capita (Maddison, long run)','history','international-$ 2011','Real GDP per person in 2011 international dollars, reconstructed over centuries by the Maddison Project.',true),
  ('population-un-wpp','Population (UN, with projections)','demographics','people','Total population at mid-year; values after the last observed year are the UN medium-variant projection.',null::boolean),
  ('median-age','Median age','demographics','years','Age that divides the population into two halves of equal size; includes UN medium-variant projections.',null::boolean),
  ('electoral-democracy-index','Electoral democracy index (V-Dem)','politics','index 0-1','Extent to which the ideal of electoral democracy is achieved: free and fair elections, freedom of expression and association, suffrage.',true),
  ('liberal-democracy-index','Liberal democracy index (V-Dem)','politics','index 0-1','Electoral democracy combined with protection of individual and minority rights, rule of law and checks on the executive.',true),
  ('conflict-deaths','Deaths in armed conflicts','military','deaths','Deaths of combatants and civilians from state-based, non-state and one-sided violence, counted in the country where they occurred.',false),
  ('nobel-laureates','Nobel laureates (by country of birth)','science','laureates','Number of individual Nobel Prize laureates born in the territory of today''s country, cumulated up to the given year (organisations excluded). Count by Statlas Research.',null::boolean),
  ('fields-medalists','Fields Medal laureates (by country of birth)','science','laureates','Number of Fields Medal laureates born in the territory of today''s country, cumulated up to the given year. Where sources disagree on the country of birth, the International Mathematical Union is followed. Count by Statlas Research.',null::boolean)
) v(slug, name, cat, unit, def, hib) join categories c on c.slug = v.cat
on conflict (slug) do nothing;

-- 4. Fonction d'import générique : lit un fichier iso2|année|valeur|projection publié sur GitHub
create or replace function public.import_psv(p_file text, p_slug text, p_unit text, p_source text, p_title text,
                                             p_dataset text, p_doc_url text, p_published date, p_max_year int default 9999)
returns integer language plpgsql security definer set search_path to 'public', 'extensions' as $$
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
end $$;

-- 5. Chargement (une ligne par jeu ; le nombre de valeurs chargées s'affiche)
select * from (values
  ('gdp-per-capita-maddison', public.import_psv('gdp-per-capita-maddison.psv','gdp-per-capita-maddison','international-$ 2011','maddison-project','Maddison Project Database 2023 (via Our World in Data)','maddison-2023','https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2023','2024-04-26')),
  ('population-un-wpp', public.import_psv('population-un-wpp.psv','population-un-wpp','people','un-population-division','World Population Prospects 2024, total population (via Our World in Data)','wpp2024-population','https://population.un.org/wpp/','2024-07-11')),
  ('median-age', public.import_psv('median-age.psv','median-age','years','un-population-division','World Population Prospects 2024, median age (via Our World in Data)','wpp2024-median-age','https://population.un.org/wpp/','2024-07-11')),
  ('electoral-democracy-index', public.import_psv('electoral-democracy-index.psv','electoral-democracy-index','index 0-1','v-dem','V-Dem dataset, electoral democracy index v2x_polyarchy (via Our World in Data)','vdem-polyarchy','https://www.v-dem.net/data/the-v-dem-dataset/','2026-03-01')),
  ('liberal-democracy-index', public.import_psv('liberal-democracy-index.psv','liberal-democracy-index','index 0-1','v-dem','V-Dem dataset, liberal democracy index v2x_libdem (via Our World in Data)','vdem-libdem','https://www.v-dem.net/data/the-v-dem-dataset/','2026-03-01')),
  ('conflict-deaths', public.import_psv('conflict-deaths.psv','conflict-deaths','deaths','ucdp','UCDP Country-Year Dataset on Organized Violence within Country Borders, version 26.1','ucdp-organizedviolencecy-26.1','https://ucdp.uu.se/downloads/','2026-06-01')),
  ('nobel-laureates', public.import_psv('nobel-laureates-cumulative.psv','nobel-laureates','laureates','nobel-foundation','Nobel Prize laureates, api.nobelprize.org v2.1 (count by Statlas Research)','nobel-laureates','https://www.nobelprize.org/prizes/lists/all-nobel-prizes/','2026-11-04')),
  ('fields-medalists', public.import_psv('fields-medalists-cumulative.psv','fields-medalists','laureates','imu','Fields Medal laureates, IMU and Wikidata (count by Statlas Research)','fields-medalists','https://www.mathunion.org/imu-awards/fields-medal','2026-11-04'))
) t(indicator, rows_loaded);

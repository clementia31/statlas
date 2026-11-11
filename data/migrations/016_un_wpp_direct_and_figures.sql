-- Population et age median de l'ONU, charges directement depuis le fichier officiel
-- (World Population Prospects 2024, CC BY 3.0 IGO), puis mise au propre des figures de la semaine deja programmees.
begin;

-- 1. La source ONU : licence verifiee le 2026-11-11 sur la page de telechargement officielle. Le doublon vide est retire.
update public.sources set
  url = 'https://population.un.org/wpp/',
  licence = 'CC BY 3.0 IGO',
  licence_url = 'https://creativecommons.org/licenses/by/3.0/igo/',
  attribution = 'United Nations, Department of Economic and Social Affairs, Population Division (2024). World Population Prospects 2024, Online Edition.',
  commercial_use = true, redistribution = true, licence_checked_on = '2026-11-11',
  licence_notes = 'Licence and suggested citation as stated on the WPP download page (population.un.org/wpp/downloads).'
where slug = 'un-wpp';

delete from public.sources s
where s.slug = 'un-population-division'
  and not exists (select 1 from public.source_documents d where d.source_id = s.id)
  and not exists (select 1 from public.articles a where a.source_id = s.id);

-- 2. Un rythme de mise a jour de plus : tous les deux ans (cas des projections de l'ONU)
alter table public.indicators drop constraint if exists indicators_update_frequency_check;
alter table public.indicators add constraint indicators_update_frequency_check
  check (update_frequency is null or update_frequency in
    ('continuous','monthly','quarterly','twice_a_year','annual','every_two_years','every_four_years','after_each_event','irregular'));

-- 3. Chargement des deux indicateurs depuis une version figee des fichiers du depot
do $load$
declare
  r record; v_doc uuid; v_n integer;
  v_base text := 'https://raw.githubusercontent.com/clementia31/statlas/b29a07b4f9188107432615e9b40def7158dec13e/data/seeds/history/';
begin
  for r in select * from (values
    ('population-un-wpp.psv', 'population-un-wpp', 'World Population Prospects 2024 — Total population, 1 July (medium variant)', 'wpp2024-population'),
    ('median-age.psv', 'median-age', 'World Population Prospects 2024 — Median age (medium variant)', 'wpp2024-median-age')
  ) v(file, slug, title, dataset)
  loop
    insert into public.source_documents (id, source_id, title, url, dataset_id_external, published_at)
    select gen_random_uuid(), s.id, r.title, 'https://population.un.org/wpp/downloads', r.dataset, date '2024-07-11'
    from public.sources s
    where s.slug = 'un-wpp'
      and not exists (select 1 from public.source_documents where dataset_id_external = r.dataset);
    select id into v_doc from public.source_documents where dataset_id_external = r.dataset limit 1;
    if v_doc is null then raise exception 'Source un-wpp introuvable'; end if;

    delete from public.observations where indicator_id = (select id from public.indicators where slug = r.slug);

    insert into public.observations (entity_id, indicator_id, value_number, raw_value, period_start, source_document_id, status, is_projection)
    select e.id, i.id, t.f[3]::numeric, t.f[3], make_date(t.f[2]::int, 1, 1), v_doc, 'validated', t.f[4] = '1'
    from (
      select string_to_array(l, '|') as f
      from regexp_split_to_table((select content from extensions.http_get(v_base || r.file)), E'\n') as l
      where l <> '' and left(l, 1) <> '#'
    ) t
    join public.entities e on e.iso_code = t.f[1] and e.entity_type = 'country'
    join public.indicators i on i.slug = r.slug;
    get diagnostics v_n = row_count;
    if v_n < 30000 then raise exception 'Chargement incomplet pour % : % lignes', r.slug, v_n; end if;

    insert into common.import_log (action, indicator_slug, dataset, row_count) values ('import_un_wpp', r.slug, r.dataset, v_n);
  end loop;
end
$load$;

update public.indicators set update_frequency = 'every_two_years' where slug in ('population-un-wpp', 'median-age');

-- 4. Figures de la semaine deja programmees
-- "The weight of debt" : lien vers le classement de la dette (FMI), qui manquait
update public.chart_of_the_week set link_url = '/rankings/public-debt-gdp-percent'
where title = 'The weight of debt' and link_url is null;

-- "The price of war" : le lien visait un indicateur supprime. Les chiffres restent credites a leur auteur (SIPRI).
update public.chart_of_the_week set link_url = '/rankings/military-expenditure-gdp',
  source = 'SIPRI Military Expenditure Database, via World Bank'
where title = 'The price of war';

-- Maddison : la source demande de citer aussi les travaux d'origine des qu'un graphique montre ses donnees
update public.chart_of_the_week set
  source = 'Maddison Project Database 2023 (Bolt & van Zanden, 2024). Original studies: Sutch (2006); Broadberry et al. (2015); Bassino et al. (2018); Fukao et al. (2015); Broadberry, Guan & Li (2018); Xu et al. (2016); Wu (2014); Maddison (2010); The Conference Board, Total Economy Database'
where title = '200 years of wealth';

update public.chart_of_the_week set
  source = 'Maddison Project Database 2023 (Bolt & van Zanden, 2024). Original sources: Maddison (2010); Stohr (2016) for Switzerland; Pamuk (2006) for Saudi Arabia; The Conference Board, Total Economy Database, and UN national accounts'
where title = 'The richest countries';

select public.refresh_statlas();

commit;

-- Indices de democratie V-Dem charges directement depuis le jeu officiel (V-Dem Country-Year Dataset v16, mars 2026).
-- Licence verifiee le 2026-11-11 sur la FAQ officielle (v-dem.net/about/faq) : CC BY-SA 4.0.
begin;

update public.sources set
  licence = 'CC BY-SA 4.0',
  licence_url = 'https://creativecommons.org/licenses/by-sa/4.0/',
  attribution = 'Coppedge, Michael, et al. 2026. "V-Dem Country-Year Dataset v16". Varieties of Democracy (V-Dem) Project. https://doi.org/10.23696/vdemds26',
  commercial_use = true, redistribution = true, licence_checked_on = '2026-11-11',
  licence_notes = 'Share-alike: anything derived from V-Dem data must be distributed under the same licence (CC BY-SA 4.0). Stated in the official FAQ (v-dem.net/about/faq).'
where slug = 'v-dem';

do $load$
declare
  r record; v_doc uuid; v_n integer;
  v_base text := 'https://raw.githubusercontent.com/clementia31/statlas/f6d6348a2ca607004bda06667591c2b01668b336/data/seeds/history/';
begin
  for r in select * from (values
    ('electoral-democracy-index.psv', 'electoral-democracy-index', 'V-Dem Country-Year Dataset v16 — Electoral democracy index (v2x_polyarchy)', 'vdem-polyarchy'),
    ('liberal-democracy-index.psv', 'liberal-democracy-index', 'V-Dem Country-Year Dataset v16 — Liberal democracy index (v2x_libdem)', 'vdem-libdem')
  ) v(file, slug, title, dataset)
  loop
    insert into public.source_documents (id, source_id, title, url, dataset_id_external, published_at)
    select gen_random_uuid(), s.id, r.title, 'https://www.v-dem.net/data/the-v-dem-dataset/', r.dataset, date '2026-03-01'
    from public.sources s
    where s.slug = 'v-dem'
      and not exists (select 1 from public.source_documents where dataset_id_external = r.dataset);
    update public.source_documents set title = r.title, url = 'https://www.v-dem.net/data/the-v-dem-dataset/' where dataset_id_external = r.dataset;
    select id into v_doc from public.source_documents where dataset_id_external = r.dataset limit 1;
    if v_doc is null then raise exception 'Source v-dem introuvable'; end if;

    delete from public.observations where indicator_id = (select id from public.indicators where slug = r.slug);

    insert into public.observations (entity_id, indicator_id, value_number, raw_value, period_start, source_document_id, status, is_projection)
    select e.id, i.id, t.f[3]::numeric, t.f[3], make_date(t.f[2]::int, 1, 1), v_doc, 'validated', false
    from (
      select string_to_array(l, '|') as f
      from regexp_split_to_table((select content from extensions.http_get(v_base || r.file)), E'\n') as l
      where l <> '' and left(l, 1) <> '#'
    ) t
    join public.entities e on e.iso_code = t.f[1] and e.entity_type = 'country'
    join public.indicators i on i.slug = r.slug;
    get diagnostics v_n = row_count;
    if v_n < 20000 then raise exception 'Chargement incomplet pour % : % lignes', r.slug, v_n; end if;

    insert into common.import_log (action, indicator_slug, dataset, row_count) values ('import_vdem', r.slug, r.dataset, v_n);
  end loop;
end
$load$;

update public.indicators set update_frequency = 'annual' where slug in ('electoral-democracy-index', 'liberal-democracy-index');

select public.refresh_statlas();

commit;

-- Correctif : depuis l'ajout des agregats "Monde" et regions (migration 026), le nombre de pays couverts affiche
-- dans le catalogue comptait aussi ces 8 entites (par exemple 207 au lieu de 199). Le decompte ne retient
-- desormais que les pays (et les villes), comme le reste du site.
begin;

drop materialized view public.indicator_catalog;

create materialized view public.indicator_catalog as
with src as (
  select distinct on (y.indicator_id) y.indicator_id, s.name as source_name, s.url as source_url, sd.title as dataset_title
  from public.obs_yearly y
  join public.source_documents sd on sd.id = y.source_document_id
  join public.sources s on s.id = sd.source_id
  order by y.indicator_id, y.year desc
), cov as (
  select y.indicator_id, count(*) as ref_coverage
  from public.obs_yearly y
  join public.indicator_stats st_1 on st_1.indicator_id = y.indicator_id and y.year = st_1.ref_year
  join public.entities e on e.id = y.entity_id and e.entity_type in ('country', 'city')
  group by y.indicator_id
)
select i.id, i.slug, i.name_default as name, i.unit, i.definition, i.higher_is_better,
       c.slug as category_slug, c.name_default as category,
       st.first_year, st.last_actual_year, st.last_year, st.ref_year, st.max_coverage,
       coalesce(cov.ref_coverage, 0::bigint) as ref_coverage,
       src.source_name, src.source_url, src.dataset_title,
       coalesce(st.sub_annual, false) as sub_annual
from public.indicators i
left join public.categories c on c.id = i.category_id
left join public.indicator_stats st on st.indicator_id = i.id
left join cov on cov.indicator_id = i.id
left join src on src.indicator_id = i.id;

create unique index indicator_catalog_pk on public.indicator_catalog (id);
create index indicator_catalog_slug on public.indicator_catalog (slug);
grant select on public.indicator_catalog to anon, authenticated, service_role;

commit;

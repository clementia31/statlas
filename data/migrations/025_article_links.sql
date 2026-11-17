-- Articles de reference de la Gazette relies aux indicateurs deja en base.
begin;

-- Liens article -> indicateurs. Seuls les indicateurs existants sont gardes ; un article deja relie n'est pas modifie.
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

commit;

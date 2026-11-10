-- Etape 4c : taux de change annuels (Banque mondiale, CC BY 4.0) + vue par devise.
begin;

insert into public.indicators (slug, name_default, category_id, unit, definition, higher_is_better)
select v.slug, v.name, c.id, v.unit, v.def, null::boolean from (values
('official-exchange-rate','Official exchange rate','economy','local currency units per US$','Official exchange rate determined by national authorities or the legally sanctioned market, annual average, in local currency units per US dollar.'),
('ppp-conversion-factor','PPP conversion factor, GDP','economy','local currency units per international $','Number of units of a country''s currency required to buy the same amount of goods and services in the domestic market as one US dollar would buy in the United States.')
) as v(slug, name, unit, def)
join public.categories c on c.slug = 'economy'
where not exists (select 1 from public.indicators i where i.slug = v.slug);

select public.import_worldbank('PA.NUS.FCRF','official-exchange-rate','local currency units per US$','World Development Indicators — Official exchange rate (LCU per US$, period average)', current_date);
select public.import_worldbank('PA.NUS.PPP','ppp-conversion-factor','local currency units per international $','World Development Indicators — PPP conversion factor, GDP (LCU per international $)', current_date);

select public.refresh_statlas();

-- Une ligne par devise et par annee, pour convertir dans tous les projets
create or replace view common.fx_annual as
 select cf.currency_code,
    y.year,
    percentile_cont(0.5) within group (order by y.value_number::double precision) as lcu_per_usd,
    count(*) as n_countries
   from public.obs_yearly y
     join public.indicators i on i.id = y.indicator_id and i.slug = 'official-exchange-rate'
     join public.country_facts cf on cf.entity_id = y.entity_id and cf.currency_code is not null
  group by cf.currency_code, y.year;
comment on view common.fx_annual is 'Taux de change annuel moyen par devise (unites de monnaie locale pour 1 US$). Source : Banque mondiale PA.NUS.FCRF';

commit;

select * from (values
('services-share-gdp', public.import_worldbank('NV.SRV.TOTL.ZS','services-share-gdp','percent of gdp','Services',date '2026-11-04')),
('gni-per-capita-atlas', public.import_worldbank('NY.GNP.PCAP.CD','gni-per-capita-atlas','usd','GNI per capita (Atlas method)',date '2026-11-04')),
('extreme-poverty', public.import_worldbank('SI.POV.DDAY','extreme-poverty','percent of population','Extreme poverty',date '2026-11-04')),
('rd-expenditure-gdp', public.import_worldbank('GB.XPD.RSDV.GD.ZS','rd-expenditure-gdp','percent of gdp','Research and development spending',date '2026-11-04')),
('tourist-arrivals', public.import_worldbank('ST.INT.ARVL','tourist-arrivals','people','International tourist arrivals',date '2026-11-04')),
('tax-revenue-gdp', public.import_worldbank('GC.TAX.TOTL.GD.ZS','tax-revenue-gdp','percent of gdp','Tax revenue',date '2026-11-04'))
) t(slug, rows_loaded);
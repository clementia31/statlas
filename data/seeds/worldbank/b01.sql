select * from (values
('net-migration', public.import_worldbank('SM.POP.NETM','net-migration','people','Net migration',date '2026-11-04')),
('land-area', public.import_worldbank('AG.LND.TOTL.K2','land-area','km2','Land area',date '2026-11-04')),
('infant-mortality', public.import_worldbank('SP.DYN.IMRT.IN','infant-mortality','per 1,000 live births','Infant mortality rate',date '2026-11-04')),
('under5-mortality', public.import_worldbank('SH.DYN.MORT','under5-mortality','per 1,000 live births','Under-5 mortality rate',date '2026-11-04')),
('maternal-mortality', public.import_worldbank('SH.STA.MMRT','maternal-mortality','per 100,000 live births','Maternal mortality ratio',date '2026-11-04')),
('health-expenditure-gdp', public.import_worldbank('SH.XPD.CHEX.GD.ZS','health-expenditure-gdp','percent of gdp','Health expenditure',date '2026-11-04'))
) t(slug, rows_loaded);
select * from (values
('military-expenditure-gdp', public.import_worldbank('MS.MIL.XPND.GD.ZS','military-expenditure-gdp','percent of gdp','Military expenditure',date '2026-11-04')),
('military-expenditure-usd', public.import_worldbank('MS.MIL.XPND.CD','military-expenditure-usd','usd','Military expenditure (US$)',date '2026-11-04')),
('armed-forces-personnel', public.import_worldbank('MS.MIL.TOTL.P1','armed-forces-personnel','people','Armed forces personnel',date '2026-11-04')),
('labor-force-participation', public.import_worldbank('SL.TLF.CACT.ZS','labor-force-participation','percent of population 15+','Labour force participation',date '2026-11-04')),
('female-labor-participation', public.import_worldbank('SL.TLF.CACT.FE.ZS','female-labor-participation','percent of female population 15+','Female labour force participation',date '2026-11-04')),
('youth-unemployment', public.import_worldbank('SL.UEM.1524.ZS','youth-unemployment','percent of labor force 15-24','Youth unemployment',date '2026-11-04'))
) t(slug, rows_loaded);
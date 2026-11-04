select * from (values
('health-expenditure-per-capita', public.import_worldbank('SH.XPD.CHEX.PC.CD','health-expenditure-per-capita','usd','Health expenditure per person',date '2026-11-04')),
('physicians-density', public.import_worldbank('SH.MED.PHYS.ZS','physicians-density','per 1,000 people','Physicians',date '2026-11-04')),
('literacy-rate-adult', public.import_worldbank('SE.ADT.LITR.ZS','literacy-rate-adult','percent of population 15+','Adult literacy rate',date '2026-11-04')),
('school-enrollment-primary', public.import_worldbank('SE.PRM.ENRR','school-enrollment-primary','percent gross','Primary school enrollment',date '2026-11-04')),
('school-enrollment-tertiary', public.import_worldbank('SE.TER.ENRR','school-enrollment-tertiary','percent gross','Tertiary education enrollment',date '2026-11-04')),
('education-expenditure-gdp', public.import_worldbank('SE.XPD.TOTL.GD.ZS','education-expenditure-gdp','percent of gdp','Public spending on education',date '2026-11-04'))
) t(slug, rows_loaded);
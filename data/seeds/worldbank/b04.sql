select * from (values
('imports-gdp', public.import_worldbank('NE.IMP.GNFS.ZS','imports-gdp','percent of gdp','Imports',date '2026-11-04')),
('trade-gdp', public.import_worldbank('NE.TRD.GNFS.ZS','trade-gdp','percent of gdp','Trade openness',date '2026-11-04')),
('current-account-gdp', public.import_worldbank('BN.CAB.XOKA.GD.ZS','current-account-gdp','percent of gdp','Current account balance',date '2026-11-04')),
('remittances-gdp', public.import_worldbank('BX.TRF.PWKR.DT.GD.ZS','remittances-gdp','percent of gdp','Remittances received',date '2026-11-04')),
('agriculture-share-gdp', public.import_worldbank('NV.AGR.TOTL.ZS','agriculture-share-gdp','percent of gdp','Agriculture',date '2026-11-04')),
('industry-share-gdp', public.import_worldbank('NV.IND.TOTL.ZS','industry-share-gdp','percent of gdp','Industry',date '2026-11-04'))
) t(slug, rows_loaded);
select * from (values
('renewable-energy-share', public.import_worldbank('EG.FEC.RNEW.ZS','renewable-energy-share','percent of final energy consumption','Renewable energy',date '2026-11-04')),
('forest-area-share', public.import_worldbank('AG.LND.FRST.ZS','forest-area-share','percent of land area','Forest area',date '2026-11-04')),
('electricity-access', public.import_worldbank('EG.ELC.ACCS.ZS','electricity-access','percent of population','Access to electricity',date '2026-11-04')),
('co2-emissions-total', public.import_worldbank('EN.GHG.CO2.MT.CE.AR5','co2-emissions-total','mt co2e','CO2 emissions',date '2026-11-04')),
('pm25-exposure', public.import_worldbank('EN.ATM.PM25.MC.M3','pm25-exposure','µg/m3','Air pollution (PM2.5)',date '2026-11-04')),
('exports-gdp', public.import_worldbank('NE.EXP.GNFS.ZS','exports-gdp','percent of gdp','Exports',date '2026-11-04'))
) t(slug, rows_loaded);
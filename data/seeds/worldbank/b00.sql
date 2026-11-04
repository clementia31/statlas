select * from (values
('population-density', public.import_worldbank('EN.POP.DNST','population-density','people per km2','Population density',date '2026-11-04')),
('urban-population-share', public.import_worldbank('SP.URB.TOTL.IN.ZS','urban-population-share','percent of population','Urban population',date '2026-11-04')),
('population-65-plus', public.import_worldbank('SP.POP.65UP.TO.ZS','population-65-plus','percent of population','Population aged 65 and over',date '2026-11-04')),
('population-0-14', public.import_worldbank('SP.POP.0014.TO.ZS','population-0-14','percent of population','Population aged 0 to 14',date '2026-11-04')),
('birth-rate', public.import_worldbank('SP.DYN.CBRT.IN','birth-rate','per 1,000 people','Birth rate',date '2026-11-04')),
('death-rate', public.import_worldbank('SP.DYN.CDRT.IN','death-rate','per 1,000 people','Death rate',date '2026-11-04'))
) t(slug, rows_loaded);
select * from (values
('internet-users', public.import_worldbank('IT.NET.USER.ZS','internet-users','percent of population','Internet users',date '2026-11-04')),
('mobile-subscriptions', public.import_worldbank('IT.CEL.SETS.P2','mobile-subscriptions','per 100 people','Mobile phone subscriptions',date '2026-11-04')),
('homicide-rate', public.import_worldbank('VC.IHR.PSRC.P5','homicide-rate','per 100,000 people','Homicide rate',date '2026-11-04')),
('women-in-parliament', public.import_worldbank('SG.GEN.PARL.ZS','women-in-parliament','percent of seats','Women in parliament',date '2026-11-04'))
) t(slug, rows_loaded);
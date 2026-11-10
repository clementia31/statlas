-- PIB par habitant sur le long terme : chargement direct depuis le fichier officiel Maddison Project Database 2023 (CC BY 4.0).
begin;

select public.import_psv('gdp-per-capita-maddison.psv', 'gdp-per-capita-maddison', 'international-$ 2011', 'maddison-project',
  'Maddison Project Database 2023', 'maddison-2023',
  'https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2023', '2024-04-26');

update public.indicators set update_frequency = 'irregular' where slug = 'gdp-per-capita-maddison';

update public.sources set
  licence_notes = 'Citation policy of the release file: if the data is shown in any graphical form, or for a subset of fewer than 12 countries, the original papers listed in its Sources sheet must be cited as well.'
where slug = 'maddison-project';

select public.refresh_statlas();

commit;

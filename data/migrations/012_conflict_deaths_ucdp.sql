-- Morts dans les conflits : chargement direct depuis le fichier officiel UCDP (version 26.1, CC BY 4.0).
-- Retrait de l'indicateur SIPRI, vide, dont la licence interdit l'import.
begin;

select public.import_psv('conflict-deaths.psv', 'conflict-deaths', 'deaths', 'ucdp',
  'UCDP Country-Year Dataset on Organized Violence within Country Borders, version 26.1',
  'ucdp-organizedviolencecy-26.1', 'https://ucdp.uu.se/downloads/', '2026-06-01');

update public.indicators set update_frequency = 'annual' where slug = 'conflict-deaths';

update public.sources set
  attribution = 'Davies, Pettersson and Öberg (2026), Organized violence 1989–2025, and violent political protests, Journal of Peace Research; Sundberg and Melander (2013), Introducing the UCDP Georeferenced Event Dataset, Journal of Peace Research 50(4)'
where slug = 'ucdp';

delete from public.indicators i
 where i.slug = 'military-expenditure-gdp-sipri'
   and not exists (select 1 from public.observations o where o.indicator_id = i.id);

select public.refresh_statlas();

commit;

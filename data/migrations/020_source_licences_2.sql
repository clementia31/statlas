-- Licences des sources restantes, verifiees le 2026-11-11 sur les pages officielles.
-- Restent sans licence : CelesTrak (aucune licence de reutilisation publiee) et l'Union mathematique internationale (non verifiee).
begin;

-- Fondation Nobel : conditions d'utilisation de api.nobelprize.org
update public.sources set
  licence = 'CC0 (Terms of Use for api.nobelprize.org and data.nobelprize.org)',
  licence_url = 'https://www.nobelprize.org/about/terms-of-use-for-api-nobelprize-org-and-data-nobelprize-org',
  attribution = 'Nobel Prize Outreach, api.nobelprize.org',
  commercial_use = true, redistribution = true, licence_checked_on = '2026-11-11',
  licence_notes = 'The data must not be deliberately altered or used to mislead. The Nobel name, logos and trademarks must not be used in a way that implies endorsement.'
where slug = 'nobel-foundation';

-- OCDE : conditions generales, partie "Data"
update public.sources set
  licence = 'OECD Terms and Conditions (Data)',
  licence_url = 'https://www.oecd.org/en/about/terms-conditions.html',
  attribution = 'OECD (year), (dataset name), (data source) DOI or URL (accessed on (date))',
  commercial_use = true, redistribution = true, licence_checked_on = '2026-11-11',
  licence_notes = 'Free to copy, adapt and share for any purpose, including commercial use, with the citation. Some datasets belong to third parties or carry extra restrictions: check the metadata of each dataset.'
where slug = 'oecd';

-- Resultats sportifs : comptages faits par Statlas Research a partir de resultats officiels publics
update public.sources set
  licence = 'Statlas Research compilation',
  licence_checked_on = '2026-11-11',
  licence_notes = 'Counts compiled by Statlas Research from publicly announced official results. No third-party dataset is imported.'
where slug = 'sport-results';

-- Ouvrages et articles cites dans la Gazette : references bibliographiques, aucune donnee importee
update public.sources s set
  licence = 'Not applicable (bibliographic reference)',
  licence_checked_on = '2026-11-11',
  licence_notes = 'Work cited in Gazette articles. No data is imported from it.'
where s.slug in ('bouthoul', 'conrad-meyer', 'graunt', 'matheron', 'mccallum', 'schaefer', 'singer-small', 'snow', 'turchin')
  and s.licence is null
  and not exists (
    select 1 from public.observations o join public.source_documents d on d.id = o.source_document_id where d.source_id = s.id
  );

commit;

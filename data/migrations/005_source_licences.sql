-- Etape 4b : licences verifiees le 2026-11-10 sur les pages officielles.
-- Les sources non listees restent vides tant qu'elles ne sont pas verifiees.
begin;

update public.sources set licence = 'CC BY 4.0', licence_url = 'https://www.worldbank.org/ext/en/legal/terms-conditions/datasets',
  attribution = 'The World Bank: <dataset name>', commercial_use = true, redistribution = true, licence_checked_on = '2026-11-10',
  licence_notes = 'Default licence. Some indicators come from third parties and carry their own terms: check the indicator metadata.'
where slug = 'world-bank';

update public.sources set licence = 'IMF Copyright and Usage (data terms)', licence_url = 'https://www.imf.org/en/About/copyright-and-terms',
  attribution = 'Source: International Monetary Fund, <database name>, with a link to the dataset', commercial_use = null, redistribution = true, licence_checked_on = '2026-11-10',
  licence_notes = 'Free to copy, publish and build on with attribution; transformations must be stated. Commercial reuse: IMF asks to request permission (copyright@imf.org). Bulk automated download requires permission.'
where slug = 'imf';

update public.sources set licence = 'CC BY 3.0 IGO', licence_url = 'https://hdr.undp.org/en/content/copyright-and-terms-use',
  attribution = 'UNDP, Human Development Report, with link to the licence; indicate changes', commercial_use = true, redistribution = true, licence_checked_on = '2026-11-10',
  licence_notes = 'Must not suggest UNDP endorsement.'
where slug = 'undp';

update public.sources set licence = 'CC BY 4.0', licence_url = 'https://ucdp.uu.se/downloads/',
  attribution = 'Cite the publications listed with each UCDP dataset', commercial_use = true, redistribution = true, licence_checked_on = '2026-11-10'
where slug = 'ucdp';

update public.sources set licence = 'CC BY 4.0', licence_url = 'https://www.rug.nl/ggdc/historicaldevelopment/maddison/releases/maddison-project-database-2023',
  attribution = 'Bolt, Jutta and Jan Luiten van Zanden (2024), "Maddison style estimates of the evolution of the world economy: A new 2023 update", Journal of Economic Surveys. DOI: 10.1111/joes.12618',
  commercial_use = true, redistribution = true, licence_checked_on = '2026-11-10',
  licence_notes = 'For charts or subsets under 12 countries, cite the original papers listed in the database source sheet.'
where slug = 'maddison-project';

update public.sources set licence = 'SIPRI terms (restricted)', licence_url = 'https://www.sipri.org/databases/terms',
  attribution = 'Information from the Stockholm International Peace Research Institute (SIPRI), <URL>', commercial_use = false, redistribution = false, licence_checked_on = '2026-11-10',
  licence_notes = 'Fair use only: under 10% of a dataset, source clearly identified. Commercial use (including ad-funded sites) requires a paid licence. Do not import in bulk.'
where slug = 'sipri';

update public.sources set licence_url = 'https://www.celestrak.org/usage-policy.php', licence_checked_on = '2026-11-10',
  licence_notes = 'No reuse licence stated on the usage policy page, only access limits (no repeated automated queries). Reuse terms to confirm.'
where slug = 'celestrak';

commit;

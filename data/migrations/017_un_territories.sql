-- Les 37 territoires presents dans les donnees de l'ONU (World Population Prospects 2024) et absents de notre liste.
-- Fiches d'identite : jeu de donnees ouvert mledoze/countries (le meme que pour les autres fiches).
-- Ecarts assumes par rapport a ce fichier :
--   * monnaie principale quand il en liste plusieurs (regle du 2026-11-10) : NZD (iles Cook), DKK (Feroe), GBP (Guernesey, Jersey, Man),
--     SHP (Sainte-Helene), MAD (Sahara occidental) ;
--   * Curacao et Sint Maarten : florin caribeen (XCG), qui a remplace le florin des Antilles neerlandaises en 2025 ;
--   * Vatican : non membre de l'ONU (Etat observateur) ;
--   * Sahara occidental : nom officiel laisse a "Western Sahara" (terme de l'ONU), statut conteste ;
--   * Pays-Bas caribeens : pas de capitale unique, champ laisse vide.
begin;

insert into public.entities (slug, entity_type, name_default, iso_code)
select v.slug, 'country', v.name, v.iso2
from (values
  ('AI', 'anguilla', 'Anguilla'),
  ('AS', 'american-samoa', 'American Samoa'),
  ('BL', 'saint-barthelemy', 'Saint Barthélemy'),
  ('BM', 'bermuda', 'Bermuda'),
  ('BQ', 'caribbean-netherlands', 'Caribbean Netherlands'),
  ('CK', 'cook-islands', 'Cook Islands'),
  ('CW', 'curacao', 'Curaçao'),
  ('EH', 'western-sahara', 'Western Sahara'),
  ('FK', 'falkland-islands', 'Falkland Islands'),
  ('FO', 'faroe-islands', 'Faroe Islands'),
  ('GF', 'french-guiana', 'French Guiana'),
  ('GG', 'guernsey', 'Guernsey'),
  ('GI', 'gibraltar', 'Gibraltar'),
  ('GL', 'greenland', 'Greenland'),
  ('GP', 'guadeloupe', 'Guadeloupe'),
  ('GU', 'guam', 'Guam'),
  ('IM', 'isle-of-man', 'Isle of Man'),
  ('JE', 'jersey', 'Jersey'),
  ('KY', 'cayman-islands', 'Cayman Islands'),
  ('MF', 'saint-martin', 'Saint Martin'),
  ('MP', 'northern-mariana-islands', 'Northern Mariana Islands'),
  ('MQ', 'martinique', 'Martinique'),
  ('MS', 'montserrat', 'Montserrat'),
  ('NC', 'new-caledonia', 'New Caledonia'),
  ('NU', 'niue', 'Niue'),
  ('PF', 'french-polynesia', 'French Polynesia'),
  ('PM', 'saint-pierre-and-miquelon', 'Saint Pierre and Miquelon'),
  ('RE', 'reunion', 'Réunion'),
  ('SH', 'saint-helena', 'Saint Helena'),
  ('SX', 'sint-maarten', 'Sint Maarten'),
  ('TC', 'turks-and-caicos-islands', 'Turks and Caicos Islands'),
  ('TK', 'tokelau', 'Tokelau'),
  ('VA', 'vatican-city', 'Vatican City'),
  ('VG', 'british-virgin-islands', 'British Virgin Islands'),
  ('VI', 'united-states-virgin-islands', 'United States Virgin Islands'),
  ('WF', 'wallis-and-futuna', 'Wallis and Futuna'),
  ('YT', 'mayotte', 'Mayotte')
) as v(iso2, slug, name)
where not exists (select 1 from public.entities e where e.iso_code = v.iso2 and e.entity_type = 'country');

insert into public.currencies (code, name) values
  ('BMD', 'Bermudian dollar'),
  ('XCG', 'Caribbean guilder'),
  ('FKP', 'Falkland Islands pound'),
  ('GIP', 'Gibraltar pound'),
  ('KYD', 'Cayman Islands dollar'),
  ('XPF', 'CFP franc'),
  ('SHP', 'Saint Helena pound')
on conflict (code) do nothing;

insert into public.country_facts (entity_id, official_name, capital, official_languages, area_km2, currency_code, landlocked, un_member, borders_iso3)
select e.id, v.official_name, v.capital, v.langs, v.area, v.cur, v.landlocked, v.un_member, v.borders
from (values
  ('AI', 'Anguilla', 'The Valley', array['English'], 91, 'XCD', false, false, array[]::text[]),
  ('AS', 'American Samoa', 'Pago Pago', array['English','Samoan'], 199, 'USD', false, false, array[]::text[]),
  ('BL', 'Collectivity of Saint Barthélemy', 'Gustavia', array['French'], 21, 'EUR', false, false, array[]::text[]),
  ('BM', 'Bermuda', 'Hamilton', array['English'], 54, 'BMD', false, false, array[]::text[]),
  ('BQ', 'Bonaire, Sint Eustatius and Saba', null, array['Dutch','English','Papiamento'], 328, 'USD', false, false, array[]::text[]),
  ('CK', 'Cook Islands', 'Avarua', array['Cook Islands Māori','English'], 236, 'NZD', false, false, array[]::text[]),
  ('CW', 'Country of Curaçao', 'Willemstad', array['Dutch','English','Papiamento'], 444, 'XCG', false, false, array[]::text[]),
  ('EH', 'Western Sahara', 'El Aaiún', array['Berber','Hassaniya','Spanish'], 266000, 'MAD', false, false, array['DZA','MRT','MAR']::text[]),
  ('FK', 'Falkland Islands', 'Stanley', array['English'], 12173, 'FKP', false, false, array[]::text[]),
  ('FO', 'Faroe Islands', 'Tórshavn', array['Danish','Faroese'], 1393, 'DKK', false, false, array[]::text[]),
  ('GF', 'Guiana', 'Cayenne', array['French'], 83534, 'EUR', false, false, array['BRA','SUR']::text[]),
  ('GG', 'Bailiwick of Guernsey', 'St. Peter Port', array['English','French','Guernésiais'], 78, 'GBP', false, false, array[]::text[]),
  ('GI', 'Gibraltar', 'Gibraltar', array['English'], 6, 'GIP', false, false, array['ESP']::text[]),
  ('GL', 'Greenland', 'Nuuk', array['Greenlandic'], 2166086, 'DKK', false, false, array[]::text[]),
  ('GP', 'Guadeloupe', 'Basse-Terre', array['French'], 1628, 'EUR', false, false, array[]::text[]),
  ('GU', 'Guam', 'Hagåtña', array['Chamorro','English','Spanish'], 549, 'USD', false, false, array[]::text[]),
  ('IM', 'Isle of Man', 'Douglas', array['English','Manx'], 572, 'GBP', false, false, array[]::text[]),
  ('JE', 'Bailiwick of Jersey', 'Saint Helier', array['English','French','Jèrriais'], 116, 'GBP', false, false, array[]::text[]),
  ('KY', 'Cayman Islands', 'George Town', array['English'], 264, 'KYD', false, false, array[]::text[]),
  ('MF', 'Saint Martin', 'Marigot', array['French'], 53, 'EUR', false, false, array['SXM']::text[]),
  ('MP', 'Commonwealth of the Northern Mariana Islands', 'Saipan', array['Carolinian','Chamorro','English'], 464, 'USD', false, false, array[]::text[]),
  ('MQ', 'Martinique', 'Fort-de-France', array['French'], 1128, 'EUR', false, false, array[]::text[]),
  ('MS', 'Montserrat', 'Plymouth', array['English'], 102, 'XCD', false, false, array[]::text[]),
  ('NC', 'New Caledonia', 'Nouméa', array['French'], 18575, 'XPF', false, false, array[]::text[]),
  ('NU', 'Niue', 'Alofi', array['English','Niuean'], 260, 'NZD', false, false, array[]::text[]),
  ('PF', 'French Polynesia', 'Papeetē', array['French'], 4167, 'XPF', false, false, array[]::text[]),
  ('PM', 'Saint Pierre and Miquelon', 'Saint-Pierre', array['French'], 242, 'EUR', false, false, array[]::text[]),
  ('RE', 'Réunion Island', 'Saint-Denis', array['French'], 2511, 'EUR', false, false, array[]::text[]),
  ('SH', 'Saint Helena, Ascension and Tristan da Cunha', 'Jamestown', array['English'], 394, 'SHP', false, false, array[]::text[]),
  ('SX', 'Sint Maarten', 'Philipsburg', array['Dutch','English','French'], 34, 'XCG', false, false, array['MAF']::text[]),
  ('TC', 'Turks and Caicos Islands', 'Cockburn Town', array['English'], 948, 'USD', false, false, array[]::text[]),
  ('TK', 'Tokelau', 'Fakaofo', array['English','Samoan','Tokelauan'], 12, 'NZD', false, false, array[]::text[]),
  ('VA', 'Vatican City State', 'Vatican City', array['Italian','Latin'], 0.44, 'EUR', true, false, array['ITA']::text[]),
  ('VG', 'Virgin Islands', 'Road Town', array['English'], 151, 'USD', false, false, array[]::text[]),
  ('VI', 'Virgin Islands of the United States', 'Charlotte Amalie', array['English'], 347, 'USD', false, false, array[]::text[]),
  ('WF', 'Territory of the Wallis and Futuna Islands', 'Mata-Utu', array['French'], 142, 'XPF', false, false, array[]::text[]),
  ('YT', 'Department of Mayotte', 'Mamoudzou', array['French'], 374, 'EUR', false, false, array[]::text[])
) as v(iso2, official_name, capital, langs, area, cur, landlocked, un_member, borders)
join public.entities e on e.iso_code = v.iso2 and e.entity_type = 'country'
where not exists (select 1 from public.country_facts f where f.entity_id = e.id);

-- Population et age median de l'ONU pour ces territoires : on ajoute seulement leurs lignes (fichiers figes du depot)
do $load$
declare
  r record; v_n integer;
  v_base text := 'https://raw.githubusercontent.com/clementia31/statlas/b29a07b4f9188107432615e9b40def7158dec13e/data/seeds/history/';
begin
  for r in select * from (values
    ('population-un-wpp.psv', 'population-un-wpp', 'wpp2024-population'),
    ('median-age.psv', 'median-age', 'wpp2024-median-age')
  ) v(file, slug, dataset)
  loop
    insert into public.observations (entity_id, indicator_id, value_number, raw_value, period_start, source_document_id, status, is_projection)
    select e.id, i.id, t.f[3]::numeric, t.f[3], make_date(t.f[2]::int, 1, 1),
           (select id from public.source_documents where dataset_id_external = r.dataset limit 1), 'validated', t.f[4] = '1'
    from (
      select string_to_array(l, '|') as f
      from regexp_split_to_table((select content from extensions.http_get(v_base || r.file)), E'\n') as l
      where l <> '' and left(l, 1) <> '#'
    ) t
    join public.entities e on e.iso_code = t.f[1] and e.entity_type = 'country'
    join public.indicators i on i.slug = r.slug
    where not exists (select 1 from public.observations o where o.entity_id = e.id and o.indicator_id = i.id);
    get diagnostics v_n = row_count;
    insert into common.import_log (action, indicator_slug, dataset, row_count) values ('import_un_territories', r.slug, r.dataset, v_n);
  end loop;
end
$load$;

select public.refresh_statlas();

commit;

-- Fiches d'identite des 8 pays et territoires qui n'en avaient pas.
-- Source : jeu de donnees ouvert mledoze/countries (le meme que pour les 192 fiches existantes), releve le 2026-11-10.
begin;

insert into public.currencies (code, name) values
  ('AWG', 'Aruban florin'),
  ('HKD', 'Hong Kong dollar'),
  ('MOP', 'Macanese pataca'),
  ('TWD', 'New Taiwan dollar'),
  ('TZS', 'Tanzanian shilling'),
  ('VES', 'Venezuelan bolívar soberano'),
  ('ZWG', 'Zimbabwe Gold')
on conflict (code) do nothing;

insert into public.country_facts (entity_id, official_name, capital, official_languages, area_km2, currency_code, landlocked, un_member, borders_iso3)
select e.id, v.official_name, v.capital, v.langs, v.area, v.cur, v.landlocked, v.un_member, v.borders
from (values
  ('AW', 'Aruba', 'Oranjestad', array['Dutch','Papiamento'], 180, 'AWG', false, false, array[]::text[]),
  ('HK', 'Hong Kong Special Administrative Region of the People''s Republic of China', null, array['Chinese','English'], 1104, 'HKD', false, false, array['CHN']),
  ('MO', 'Macao Special Administrative Region of the People''s Republic of China', null, array['Chinese','Portuguese'], 30, 'MOP', false, false, array['CHN']),
  ('FM', 'Federated States of Micronesia', 'Palikir', array['English'], 702, 'USD', false, true, array[]::text[]),
  ('TW', 'Republic of China (Taiwan)', 'Taipei', array['Chinese'], 36193, 'TWD', false, false, array[]::text[]),
  ('TZ', 'United Republic of Tanzania', 'Dodoma', array['English','Swahili'], 945087, 'TZS', false, true, array['BDI','COD','KEN','MWI','MOZ','RWA','UGA','ZMB']),
  ('VE', 'Bolivarian Republic of Venezuela', 'Caracas', array['Spanish'], 916445, 'VES', false, true, array['BRA','COL','GUY']),
  ('PS', 'State of Palestine', 'Ramallah', array['Arabic'], 6220, 'ILS', false, false, array['ISR','EGY','JOR'])
) as v(iso2, official_name, capital, langs, area, cur, landlocked, un_member, borders)
join public.entities e on e.iso_code = v.iso2 and e.entity_type = 'country'
where not exists (select 1 from public.country_facts f where f.entity_id = e.id);

-- Monnaie principale quand la source en liste plusieurs ou aucune (regle validee le 2026-11-10) :
-- Palestine = shekel israelien (le dinar jordanien et la livre egyptienne circulent aussi), Micronesie = dollar americain.
update public.country_facts f set currency_code = v.cur
from public.entities e, (values ('PS','ILS'), ('FM','USD')) as v(iso2, cur)
where e.id = f.entity_id and e.iso_code = v.iso2 and e.entity_type = 'country' and f.currency_code is null;

-- Correction : le Zimbabwe affichait le pula du Botswana (premiere devise de la liste par ordre alphabetique)
update public.country_facts f set currency_code = 'ZWG'
from public.entities e
where e.id = f.entity_id and e.iso_code = 'ZW' and e.entity_type = 'country' and f.currency_code = 'BWP';

commit;

-- Pays-Bas caribeens : chef-lieu de la plus grande des trois iles (Bonaire), choix valide le 2026-11-11.
-- Il n'existe pas de capitale commune : Oranjestad (Saint-Eustache) et The Bottom (Saba) sont les deux autres chefs-lieux.
begin;

update public.country_facts f set capital = 'Kralendijk'
from public.entities e
where e.id = f.entity_id and e.iso_code = 'BQ' and e.entity_type = 'country' and f.capital is null;

commit;

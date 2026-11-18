-- Audit du 18 nov. 2026 : dans le texte de la video population, le pic de l'Indonesie etait arrondi a tort
-- (322 millions vers 2060). La serie de l'ONU donne 322,6 millions en 2058.
begin;

update public.social_posts set
  caption = replace(caption, 'Indonesia 🇮🇩 peaks at about 322 million around 2060.', 'Indonesia 🇮🇩 peaks at about 323 million in 2058.'),
  updated_at = now()
where slug = 'vid-population-top6';

commit;

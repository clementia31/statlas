-- Calendrier : image "Nobel Prizes per million people" (calcul Statlas Research) pour le 3 decembre 2026, en brouillon.
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('img-nobel-per-million', 'Nobel Prizes per million people — top 10', 'image', '/social/2026-12/nobel-per-million.jpg', '/social/2026-12/nobel-per-million.jpg', '{x,instagram}', 'draft', '2026-12-03 18:00:00 Europe/Paris',
   'Which country wins the most Nobel Prizes for its size? Sweden 🇸🇪, with 2.84 laureates per million people, ahead of Norway 🇳🇴 (2.36), Denmark 🇩🇰 (2.19), Switzerland 🇨🇭 (2.14) and Austria 🇦🇹 (2.08). The United States 🇺🇸 has by far the most laureates, 302, but ranks only 15th on this measure with 0.88 per million, behind the United Kingdom 🇬🇧 (1.62), Germany 🇩🇪 (1.02) and France 🇫🇷 (0.98). Calculation by Statlas Research from Nobel Foundation and UN data, by country of birth. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/nobel-laureates — add ?utm_source=x or ?utm_source=instagram at the end. Ratio computed by us: laureates born in the country (current borders), 1901-2026, divided by the 2023 population (UN estimate, last observed year). Countries of more than one million people, 79 in the ranking. Timor-Leste is 7th with two laureates (1996 Peace Prize): expect comments. Credit stays "Statlas Research".', 'statlas', 'ranking')
on conflict (slug) do nothing;

commit;

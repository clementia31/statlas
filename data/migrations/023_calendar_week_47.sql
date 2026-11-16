-- Calendrier : deuxieme serie d'images fixes pour la semaine du 17 novembre 2026 (6 statistiques + 2 citations).
-- Une a deux publications par jour. Elles arrivent en "Idea" : chacune se valide dans le Studio avant publication.
begin;

insert into public.quotes (quote, author, source_note, year, attribution) values
  ('It is a capital mistake to theorise before one has data.', 'Arthur Conan Doyle', 'Sherlock Holmes in "A Scandal in Bohemia", The Strand Magazine, 1891', 1891, 'confirmed'),
  ('Some people hate the very name of statistics, but I find them full of beauty and interest.', 'Francis Galton', 'Natural Inheritance (1889), pp. 62-63', 1889, 'confirmed')
on conflict (quote) do nothing;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('img-women-parliament-top10', 'Women in parliament — top 10', 'image', '/social/2026-11/women-parliament-top10.jpg', '/social/2026-11/women-parliament-top10.jpg', '{x,instagram}', 'draft', '2026-11-17 12:00:00 Europe/Paris',
   'Where do women hold the most seats in parliament? Rwanda leads with 63.8% in 2025, ahead of Cuba (55.7%) and Nicaragua (55.0%). Source: World Bank (Inter-Parliamentary Union). Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/women-in-parliament — add ?utm_source=x or ?utm_source=instagram at the end. Lower or single chamber.', 'statlas', 'ranking'),
  ('quote-holmes', 'Quote — Sherlock Holmes', 'image', '/social/2026-11/quote-holmes.jpg', '/social/2026-11/quote-holmes.jpg', '{x,instagram}', 'draft', '2026-11-17 18:00:00 Europe/Paris',
   '"It is a capital mistake to theorise before one has data." — Sherlock Holmes, in Arthur Conan Doyle''s A Scandal in Bohemia, 1891.',
   'Attribution confirmed: A Scandal in Bohemia (The Strand Magazine, 1891). Original British spelling "theorise".', 'gazette', 'quote'),
  ('img-korea-fertility', 'South Korea — fewer than one child per woman', 'image', '/social/2026-11/korea-fertility.jpg', '/social/2026-11/korea-fertility.jpg', '{x,instagram}', 'draft', '2026-11-18 18:00:00 Europe/Paris',
   'In 1960, South Korean women had six children on average. In 2024: 0.75, the lowest rate among countries of more than one million people. Source: World Bank, World Development Indicators. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/fertility-rate — add ?utm_source=x or ?utm_source=instagram at the end.', 'statlas', 'key_figure'),
  ('img-hdi-map', 'Human development — map', 'image', '/social/2026-11/hdi-map.jpg', '/social/2026-11/hdi-map.jpg', '{x,instagram}', 'draft', '2026-11-19 12:00:00 Europe/Paris',
   'The Human Development Index combines health, education and income. In 2023, Iceland (0.972), Switzerland and Norway (0.970) came first among 193 countries. Source: UNDP, Human Development Report. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/human-development-index — add ?utm_source=x or ?utm_source=instagram at the end.', 'statlas', 'map'),
  ('img-youngest-top10', 'The youngest countries — top 10', 'image', '/social/2026-11/youngest-top10.jpg', '/social/2026-11/youngest-top10.jpg', '{x,instagram}', 'draft', '2026-11-20 18:00:00 Europe/Paris',
   'The ten youngest countries in the world are all in Africa. In the Central African Republic, half the population is under 14.3 years old (2023). Source: United Nations, World Population Prospects 2024. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/median-age — add ?utm_source=x or ?utm_source=instagram at the end. Countries of over one million people; UN estimates, not projections.', 'statlas', 'ranking'),
  ('img-internet-map', 'Who is online? — map', 'image', '/social/2026-11/internet-map.jpg', '/social/2026-11/internet-map.jpg', '{x,instagram}', 'draft', '2026-11-21 12:00:00 Europe/Paris',
   'Share of the population using the internet in 2024, for 182 countries. Fewer than one person in ten is online in Burundi and Uganda. Source: World Bank (International Telecommunication Union). Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/internet-users — add ?utm_source=x or ?utm_source=instagram at the end.', 'statlas', 'map'),
  ('quote-galton', 'Quote — Francis Galton', 'image', '/social/2026-11/quote-galton.jpg', '/social/2026-11/quote-galton.jpg', '{x,instagram}', 'draft', '2026-11-22 12:00:00 Europe/Paris',
   '"Some people hate the very name of statistics, but I find them full of beauty and interest." — Francis Galton, Natural Inheritance, 1889.',
   'Attribution confirmed: Natural Inheritance (1889), pp. 62-63. Note: Galton is also the founder of eugenics; some readers may react to his name.', 'gazette', 'quote'),
  ('img-renewable-map', 'Renewable energy — map', 'image', '/social/2026-11/renewable-map.jpg', '/social/2026-11/renewable-map.jpg', '{x,instagram}', 'draft', '2026-11-22 18:00:00 Europe/Paris',
   'Renewable energy as a share of final energy consumption, 2021. The highest shares are in countries that still rely on firewood and charcoal: DR Congo (96%), Somalia (95%), Liberia (93%). Source: World Bank. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/renewable-energy-share — add ?utm_source=x or ?utm_source=instagram at the end. Latest year with broad coverage: 2021.', 'statlas', 'map')
on conflict (slug) do nothing;

commit;

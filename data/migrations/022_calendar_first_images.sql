-- Calendrier : premieres images fixes (4 statistiques + 4 citations), validees le 2026-11-16.
-- Elles arrivent en "Idea" (brouillon) : chacune se valide dans le Studio avant publication.
begin;

-- Deux citations de plus, attribution verifiee (texte du domaine public)
insert into public.quotes (quote, author, source_note, year, attribution) values
  ('When you can measure what you are speaking about, and express it in numbers, you know something about it.', 'Lord Kelvin', 'Lecture "Electrical Units of Measurement", Institution of Civil Engineers, 3 May 1883', 1883, 'confirmed'),
  ('The theory of probabilities is at bottom nothing but common sense reduced to calculus.', 'Pierre-Simon Laplace', 'A Philosophical Essay on Probabilities (1814), translation by Truscott and Emory, 1902', 1814, 'confirmed')
on conflict (quote) do nothing;
update public.quotes set source_note = 'Robustness in the Strategy of Scientific Model Building', year = 1979
where author = 'George E. P. Box' and source_note is null;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('img-world-2100-top10', 'The world in 2100 — top 10', 'image', '/social/2026-11/world-2100-top10.jpg', '/social/2026-11/world-2100-top10.jpg', '{x,instagram}', 'draft', '2026-11-18 12:00:00 Europe/Paris',
   'The ten most populous countries in 2100, according to the UN''s medium projection. India stays first with 1.5 billion people; China falls to 633 million; Pakistan, Nigeria and DR Congo complete the top five. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/population-un-wpp — add ?utm_source=x or ?utm_source=instagram at the end. Projection, not an observed figure.', 'statlas', 'ranking'),
  ('quote-box', 'Quote — George Box', 'image', '/social/2026-11/quote-box.jpg', '/social/2026-11/quote-box.jpg', '{x,instagram}', 'draft', '2026-11-23 12:00:00 Europe/Paris',
   '"All models are wrong, but some are useful." — George E. P. Box, 1979. A good rule for reading any statistic, ours included.',
   'Attribution confirmed: Robustness in the Strategy of Scientific Model Building (1979).', 'gazette', 'quote'),
  ('img-debt-map', 'The weight of debt — map', 'image', '/social/2026-11/debt-map.jpg', '/social/2026-11/debt-map.jpg', '{x,instagram}', 'draft', '2026-11-25 12:00:00 Europe/Paris',
   'Government debt as a share of GDP in 2025, for 189 countries. Japan (205%) and Sudan (204%) are the highest, ahead of Singapore (166%). Source: IMF, World Economic Outlook. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/public-debt-gdp-percent — add ?utm_source=x or ?utm_source=instagram at the end.', 'statlas', 'map'),
  ('quote-feynman', 'Quote — Richard Feynman', 'image', '/social/2026-11/quote-feynman.jpg', '/social/2026-11/quote-feynman.jpg', '{x,instagram}', 'draft', '2026-11-30 12:00:00 Europe/Paris',
   '"The first principle is that you must not fool yourself, and you are the easiest person to fool." — Richard Feynman, Caltech, 1974.',
   'Attribution confirmed: Caltech commencement address (1974).', 'gazette', 'quote'),
  ('img-rd-top10', 'Who invests in research? — top 10', 'image', '/social/2026-11/rd-top10.jpg', '/social/2026-11/rd-top10.jpg', '{x,instagram}', 'draft', '2026-12-02 12:00:00 Europe/Paris',
   'Research and development spending as a share of GDP, 2023. Israel (6.3%) and Liechtenstein (6.0%) lead, ahead of South Korea (4.9%). Source: World Bank (UNESCO Institute for Statistics). Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/rd-expenditure-gdp — add ?utm_source=x or ?utm_source=instagram at the end. 84 countries have data for 2023.', 'statlas', 'ranking'),
  ('quote-kelvin', 'Quote — Lord Kelvin', 'image', '/social/2026-11/quote-kelvin.jpg', '/social/2026-11/quote-kelvin.jpg', '{x,instagram}', 'draft', '2026-12-07 12:00:00 Europe/Paris',
   '"When you can measure what you are speaking about, and express it in numbers, you know something about it." — Lord Kelvin, 1883.',
   'Attribution confirmed: lecture "Electrical Units of Measurement", 3 May 1883. First part of a longer sentence.', 'gazette', 'quote'),
  ('img-japan-median-age', 'Japan, the oldest large country', 'image', '/social/2026-11/japan-median-age.jpg', '/social/2026-11/japan-median-age.jpg', '{x,instagram}', 'draft', '2026-12-09 12:00:00 Europe/Paris',
   'In 1950, half of Japan was under 21. In 2023, half of Japan was over 49: the highest median age among countries of more than one million people. Source: United Nations, World Population Prospects 2024. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/median-age — add ?utm_source=x or ?utm_source=instagram at the end. UN estimates (not projections).', 'statlas', 'key_figure'),
  ('quote-laplace', 'Quote — Pierre-Simon Laplace', 'image', '/social/2026-11/quote-laplace.jpg', '/social/2026-11/quote-laplace.jpg', '{x,instagram}', 'draft', '2026-12-14 12:00:00 Europe/Paris',
   '"The theory of probabilities is at bottom nothing but common sense reduced to calculus." — Pierre-Simon Laplace, 1814.',
   'Attribution confirmed: A Philosophical Essay on Probabilities (1814), English translation of 1902.', 'gazette', 'quote')
on conflict (slug) do nothing;

commit;

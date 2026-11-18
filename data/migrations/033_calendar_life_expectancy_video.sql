-- Calendrier : video "Living longer" (esperance de vie 1960-2024, Banque mondiale) pour le 24 novembre 2026.
-- Arrive en brouillon : elle se valide dans le Studio avant publication.
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-life-expectancy-top6', 'Living longer — 1960–2024', 'video', '/social/2026-11/life-expectancy-top6.mp4', '/social/2026-11/life-expectancy-top6.jpg', '{x,instagram}', 'draft', '2026-11-24 18:00:00 Europe/Paris',
   'In 1960, during the Great Famine, life expectancy in China 🇨🇳 was 33 years. In 2024 it is 78.0, almost level with the United States 🇺🇸 (78.9). India 🇮🇳 has gained nearly 27 years since 1960 (72.2) and Indonesia 🇮🇩 more than 24 (71.3). Pakistan 🇵🇰 stands at 67.8. Nigeria 🇳🇬 remains far behind, at 54.6. Source: World Bank, World Development Indicators. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/life-expectancy-birth — add ?utm_source=x or ?utm_source=instagram at the end. The six most populous countries today; observed values only. The dips: China 1960 (famine), Indonesia 1965, Pakistan 1971, and 2020-2021 (Covid-19) almost everywhere.', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

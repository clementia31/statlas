-- Calendrier : video "The most populous countries" (population 1950-2100, ONU) pour le 19 novembre 2026.
-- Arrive en brouillon : elle se valide dans le Studio avant publication.
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-population-top6', 'The most populous countries — 1950–2100', 'video', '/social/2026-11/population-top6.mp4', '/social/2026-11/population-top6.jpg', '{x,instagram}', 'draft', '2026-11-19 18:00:00 Europe/Paris',
   'India 🇮🇳 is now the most populous country in the world, ahead of China 🇨🇳. By 2100, the UN projects 1.5 billion people in India 🇮🇳 and 633 million in China 🇨🇳, while Pakistan 🇵🇰 (511 million) and Nigeria 🇳🇬 (477 million) pass the United States 🇺🇸 (421 million). Indonesia 🇮🇩 peaks at about 322 million around 2060. Source: United Nations, World Population Prospects 2024 (medium-variant projection from 2024). Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/population-un-wpp — add ?utm_source=x or ?utm_source=instagram at the end. The six most populous countries today; figures after 2023 are UN projections, shown as dashed lines.', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

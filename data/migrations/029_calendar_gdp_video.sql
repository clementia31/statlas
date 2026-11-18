-- Calendrier : video "The five largest economies" (PIB 1980-2031, FMI) pour le 20 novembre 2026.
-- Arrive en brouillon : elle se valide dans le Studio avant publication.
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-gdp-top5', 'The five largest economies — 1980–2031', 'video', '/social/2026-11/gdp-top5.mp4', '/social/2026-11/gdp-top5.jpg', '{x,instagram}', 'draft', '2026-11-20 12:00:00 Europe/Paris',
   'The United States 🇺🇸 is still the largest economy in the world: $29.3 trillion in 2024, ahead of China 🇨🇳 ($18.9 trillion). China 🇨🇳 passed Germany 🇩🇪 in 2007 and Japan 🇯🇵 in 2010. Germany 🇩🇪 overtook Japan 🇯🇵 in 2023, and the IMF projects India 🇮🇳 ahead of Japan 🇯🇵 in 2027 and of Germany 🇩🇪 in 2031. Source: IMF, World Economic Outlook, April 2026 (projections from 2025). Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/gdp-nominal-usd — add ?utm_source=x or ?utm_source=instagram at the end. The five largest economies in 2024, the latest observed year; GDP at current prices and market exchange rates; figures from 2025 are IMF projections, shown as dashed lines.', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

-- Calendrier : video "Who wins the Tour de France?" (victoires cumulees 1903-2026) pour le 29 novembre 2026.
-- Arrive en brouillon : elle se valide dans le Studio avant publication.
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-tour-de-france-race', 'Who wins the Tour de France? — 1903–2026', 'video', '/social/2026-11/tour-de-france-race.mp4', '/social/2026-11/tour-de-france-race.jpg', '{x,instagram}', 'draft', '2026-11-29 18:00:00 Europe/Paris',
   'France 🇫🇷 has won its own Tour 36 times, twice as often as Belgium 🇧🇪 (18). But the last French victory dates back to 1985. Spain 🇪🇸 has 12 wins, Italy 🇮🇹 10 and the United Kingdom 🇬🇧 6, all between 2012 and 2018. Luxembourg 🇱🇺 and Slovenia 🇸🇮 have 5 each, and all five wins for Slovenia 🇸🇮 came since 2020. Count by Statlas Research, by rider nationality. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/tour-de-france-wins — add ?utm_source=x or ?utm_source=instagram at the end. No winner is recorded for 1999–2005 (titles withdrawn), which is why the United States shows 3 wins: expect comments. The race was not held during the two world wars. Credit stays "Statlas Research".', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

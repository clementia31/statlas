-- Calendrier : video "Democracy, rise and retreat" (indice V-Dem 1900-2025) pour le 27 novembre 2026.
-- Arrive en brouillon : elle se valide dans le Studio avant publication.
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-democracy-1900-2025', 'Democracy, rise and retreat — 1900–2025', 'video', '/social/2026-11/democracy-1900-2025.mp4', '/social/2026-11/democracy-1900-2025.jpg', '{x,instagram}', 'draft', '2026-11-27 18:00:00 Europe/Paris',
   'How democratic is a country? The V-Dem Institute scores it from 0 to 1 every year. Germany 🇩🇪 fell from 0.56 in 1932 to 0.07 in 1944, then recovered: 0.83 in 2025. The United States 🇺🇸 peaked above 0.90 in 2013 and stands at 0.73. India 🇮🇳 is at 0.38, down from 0.75 in 1998. Türkiye 🇹🇷 is at 0.29 and Russia 🇷🇺 at 0.17, after 0.50 in 1992. Source: V-Dem Institute, V-Dem Dataset v16, electoral democracy index (CC BY-SA 4.0). Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/electoral-democracy-index — add ?utm_source=x or ?utm_source=instagram at the end. These are V-Dem scores, not a Statlas judgement: keep "V-Dem" in the text. Licence CC BY-SA 4.0 (share-alike): keep the licence mention with the video. V-Dem codes Russia as one unit including the Soviet period. Expect strong reactions on the United States, India and Türkiye.', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

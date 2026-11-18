-- Calendrier : video "Who wins the Summer Olympics?" (medailles cumulees 1896-2024) pour le 22 novembre 2026.
-- Arrive en brouillon : elle se valide dans le Studio avant publication.
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-olympics-summer-race', 'Who wins the Summer Olympics? — 1896–2024', 'video', '/social/2026-11/olympics-summer-race.mp4', '/social/2026-11/olympics-summer-race.jpg', '{x,instagram}', 'draft', '2026-11-22 15:00:00 Europe/Paris',
   'Since 1896, the United States 🇺🇸 has won 2,783 medals at the Summer Olympics, far ahead of Russia 🇷🇺 (1,622) and Germany 🇩🇪 (1,435). The United Kingdom 🇬🇧 (991) and France 🇫🇷 (829) follow. China 🇨🇳 won its first medals in 1984 and is already sixth, with 727. Count by Statlas Research: the USSR is counted with Russia 🇷🇺, East and West Germany with Germany 🇩🇪. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/olympics-summer-medals — add ?utm_source=x or ?utm_source=instagram at the end. Successor-state convention (USSR with Russia, both Germanys with Germany): expect comments on this choice. Credit stays "Statlas Research".', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

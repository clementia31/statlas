-- Calendrier : video "Who wins the Ballon d'Or?" (1956-2026) pour le 30 novembre 2026, en brouillon.
-- Nouveau texte pour la video du Tour de France : les titres retires a Lance Armstrong (demande de Clem).
begin;

update public.social_posts set
  caption = 'France 🇫🇷 has won its own Tour 36 times, twice as often as Belgium 🇧🇪 (18), but not since 1985. Spain 🇪🇸 has 12 wins, Italy 🇮🇹 10, the United Kingdom 🇬🇧 6. And the United States 🇺🇸? Lance Armstrong finished first seven times in a row, from 1999 to 2005. In 2012 he was stripped of all seven titles for doping, and they were given to no one: those years have no winner. With them, the United States 🇺🇸 would have 10 wins, level with Italy 🇮🇹. It has 3. Two other titles did change hands: 2006 went from the United States 🇺🇸 to Spain 🇪🇸, and 2010 from Spain 🇪🇸 to Luxembourg 🇱🇺. Count by Statlas Research, by rider nationality. Full ranking on Statlas.',
  updated_at = now()
where slug = 'vid-tour-de-france-race';

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-ballon-dor-race', 'Who wins the Ballon d''Or? — 1956–2026', 'video', '/social/2026-11/ballon-dor-race.mp4', '/social/2026-11/ballon-dor-race.jpg', '{x,instagram}', 'draft', '2026-11-30 18:00:00 Europe/Paris',
   'Three countries share the lead: the United Kingdom 🇬🇧, France 🇫🇷 and Argentina 🇦🇷 have 8 Ballons d''Or each. Portugal 🇵🇹, Germany 🇩🇪 and the Netherlands 🇳🇱 follow with 7, then Italy 🇮🇹 and Brazil 🇧🇷 with 5. Argentina 🇦🇷 won all of its 8 since 2009. Until 1995 only European players could win, which is why Brazil 🇧🇷 and Argentina 🇦🇷 start so late. Count by Statlas Research, by the winner''s nationality. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/ballon-dor-wins — add ?utm_source=x or ?utm_source=instagram at the end. Men''s award; not awarded in 2020. English, Scottish and Northern Irish winners are counted under the United Kingdom, and the three Soviet winners (two of them from Ukraine) under Russia: expect comments on both. The 2026 winner is as recorded in the base: check it before publishing. Credit stays "Statlas Research".', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

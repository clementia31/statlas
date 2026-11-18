-- Calendrier : la video "200 years of wealth" du 23 novembre faisait doublon avec la figure de la semaine de la Gazette
-- (memes pays, meme periode). Elle est remplacee par "Who caught up?" (autres pays, 1950-2022).
-- Ajout de "Who wins the Champions League?" pour le 25 novembre. Les deux arrivent en brouillon.
begin;

delete from public.social_posts where slug = 'vid-wealth-200y' and status = 'draft';

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-catching-up', 'Who caught up? — 1950–2022', 'video', '/social/2026-11/catching-up.mp4', '/social/2026-11/catching-up.jpg', '{x,instagram}', 'draft', '2026-11-23 18:00:00 Europe/Paris',
   'In 1950, Argentina 🇦🇷 was richer than Germany 🇩🇪: $7,949 per person against $6,186. South Korea 🇰🇷 stood at $998, level with India 🇮🇳 ($987). By 2022, South Korea 🇰🇷 had multiplied its income per person by 41, to $41,321, close to Germany 🇩🇪 ($46,648). It passed Brazil 🇧🇷 in 1983 and Argentina 🇦🇷 in 1988. Argentina 🇦🇷 is now at $18,292, Brazil 🇧🇷 at $14,640 and India 🇮🇳 at $7,766. GDP per capita in 2011 international dollars. Source: Maddison Project Database 2023 (Bolt & van Zanden, 2024) and the original sources named in the video.',
   'Link: https://www.statlasresearch.com/rankings/gdp-per-capita-maddison — add ?utm_source=x or ?utm_source=instagram at the end. Maddison condition: the original sources must stay cited (they are in the video source line): Maddison (2010); Cha, Kim, Park & Park (2020) for South Korea; The Conference Board, Total Economy Database. Do not crop the bottom of the video. Replaces "200 years of wealth", which duplicated the Gazette figure of the week.', 'statlas', 'chart'),
  ('vid-champions-league-race', 'Who wins the Champions League? — 1956–2026', 'video', '/social/2026-11/champions-league-race.mp4', '/social/2026-11/champions-league-race.jpg', '{x,instagram}', 'draft', '2026-11-25 18:00:00 Europe/Paris',
   'Clubs from Spain 🇪🇸 have won the European Cup or Champions League 20 times since 1956, ahead of the United Kingdom 🇬🇧 (16), Italy 🇮🇹 (12), Germany 🇩🇪 (8) and the Netherlands 🇳🇱 (6). Portugal 🇵🇹 has 4 titles, France 🇫🇷 3, Romania 🇷🇴 and Serbia 🇷🇸 one each. Count by Statlas Research, by the country of the winning club. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/football-champions-league-countries — add ?utm_source=x or ?utm_source=instagram at the end. English and Scottish clubs are counted together under the United Kingdom; Red Star Belgrade (1991) is counted with Serbia: expect comments on both. Credit stays "Statlas Research".', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

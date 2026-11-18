-- Calendrier : video "200 years of wealth" (PIB par habitant 1820-2022, Maddison) pour le 23 novembre 2026.
-- Arrive en brouillon : elle se valide dans le Studio avant publication.
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-wealth-200y', '200 years of wealth — 1820–2022', 'video', '/social/2026-11/wealth-200y.mp4', '/social/2026-11/wealth-200y.jpg', '{x,instagram}', 'draft', '2026-11-23 18:00:00 Europe/Paris',
   'In 1820, the United Kingdom 🇬🇧 was the richest of these five countries, with $3,306 per person. China 🇨🇳 stood at $882. Two centuries later, the United States 🇺🇸 leads with $58,487, ahead of France 🇫🇷 ($39,066), the United Kingdom 🇬🇧 ($38,407) and Japan 🇯🇵 ($38,269). China 🇨🇳 reached $19,238 in 2022, 24 times its 1950 level. GDP per capita in 2011 international dollars. Source: Maddison Project Database 2023 (Bolt & van Zanden, 2024) and the original studies named in the video.',
   'Link: https://www.statlasresearch.com/rankings/gdp-per-capita-maddison — add ?utm_source=x or ?utm_source=instagram at the end. Maddison condition: the original studies must stay cited (they are in the video source line): Sutch (2006); Broadberry et al. (2015); Bassino et al. (2018); Fukao et al. (2015); Broadberry, Guan & Li (2018); Xu et al. (2016); Wu (2014); Maddison (2010); The Conference Board, Total Economy Database. Do not crop the bottom of the video. Same five countries as the figure of the week "200 years of wealth".', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

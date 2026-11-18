-- Calendrier : video "The fall of extreme poverty" (1981-2022, Banque mondiale) pour le 28 novembre 2026, en brouillon.
-- Nouveau texte pour la video "Democracy, rise and retreat" : recit du cas allemand (demande de Clem).
begin;

update public.social_posts set
  caption = 'Germany 🇩🇪 draws the sharpest line on this chart. Under the Empire, V-Dem scores its democracy at 0.25 in 1918. The Weimar Republic lifts it to 0.64 by 1920. Then Hitler takes power: 0.56 in 1932, 0.20 in 1933, 0.07 in 1939, where it stays through the war. The series is silent from 1945 to 1948, under Allied occupation. With the Federal Republic in 1949 the score returns at 0.79, and reaches 0.89 at reunification in 1990. In 2025 Germany 🇩🇪 stands at 0.83, ahead of the United States 🇺🇸 (0.73), India 🇮🇳 (0.38), Türkiye 🇹🇷 (0.29) and Russia 🇷🇺 (0.17). Source: V-Dem Institute, V-Dem Dataset v16, electoral democracy index from 0 to 1 (CC BY-SA 4.0). Full ranking on Statlas.',
  updated_at = now()
where slug = 'vid-democracy-1900-2025';

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-extreme-poverty', 'The fall of extreme poverty — 1981–2022', 'video', '/social/2026-11/extreme-poverty.mp4', '/social/2026-11/extreme-poverty.jpg', '{x,instagram}', 'draft', '2026-11-28 18:00:00 Europe/Paris',
   'In 1981, 97% of people in China 🇨🇳 lived on less than $3 a day. In 2022, the share is close to zero. Indonesia 🇮🇩 went from 86% in 1984 to 7.9%, India 🇮🇳 from 51% in 1983 to 5.3%, Brazil 🇧🇷 from 31% in 1981 to 4.9%. In Nigeria 🇳🇬 the share was 51% in 1985 and is still 41.8%. Source: World Bank, World Development Indicators (extreme poverty line of $3.00 a day at 2021 prices). Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/extreme-poverty — add ?utm_source=x or ?utm_source=instagram at the end. Poverty is measured by household surveys, not every year: the lines join survey years (India and Nigeria have few). The $3.00 line is the World Bank''s current international line (2021 PPP), which replaced $2.15. The Indonesia spike of 1998 is the Asian financial crisis.', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

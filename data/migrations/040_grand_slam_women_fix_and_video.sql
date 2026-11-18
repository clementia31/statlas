-- 1) Correction de donnees : cinq titres du Grand Chelem feminin (2023-2026) etaient attribues au Royaume-Uni par erreur.
--    La source affiche Aryna Sabalenka (4 titres) et Mirra Andreeva (1 titre) sans drapeau (banniere neutre) ; le script
--    de construction avait pris un pays par defaut. Corrige dans data/seeds/sport : Bielorussie +4, Russie +1, Royaume-Uni -5.
-- 2) Calendrier : video "The queens of Grand Slam" (1884-2026) pour le 1er decembre 2026, en brouillon.
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-grand-slam-women-race', 'The queens of Grand Slam — 1884–2026', 'video', '/social/2026-12/grand-slam-women-race.mp4', '/social/2026-12/grand-slam-women-race.jpg', '{x,instagram}', 'draft', '2026-12-01 18:00:00 Europe/Paris',
   'Players from the United States 🇺🇸 have won 204 women''s singles Grand Slam titles since 1884, more than three times as many as Australia 🇦🇺 (64). The United Kingdom 🇬🇧 has 51, France 🇫🇷 42 and Germany 🇩🇪 27. Czechia 🇨🇿 and Belgium 🇧🇪 follow with 11 each, ahead of Serbia 🇷🇸 (10) and Russia 🇷🇺 (9). Count by Statlas Research, by player nationality. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/tennis-grand-slam-women — add ?utm_source=x or ?utm_source=instagram at the end. Czechoslovakia is counted with Czechia and Yugoslavia with Serbia (successor states); players competing under a neutral banner are counted under their nationality (Belarus, Russia): expect comments. Credit stays "Statlas Research".', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

select public.import_psv_at('sport','tennis-grand-slam-women-titles.psv','tennis-grand-slam-women','titles','sport-results','Grand Slam singles titles (women) — official results compiled by Statlas Research','statlas-tennis-grand-slam-women','https://github.com/clementia31/statlas/tree/main/data/seeds/sport','2026-11-05');
select public.refresh_statlas();

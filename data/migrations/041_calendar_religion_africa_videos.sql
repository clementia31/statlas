-- Calendrier : deux videos sur les religions en Afrique (World Religion Project, 1960-2010), en brouillon.
-- "Christianity in Africa" le 2 decembre 2026, "Islam in West Africa" le 4 decembre (le 3 est garde pour la diversite religieuse).
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-africa-christians', 'Christianity in Africa — 1960–2010', 'video', '/social/2026-12/africa-christians.mp4', '/social/2026-12/africa-christians.jpg', '{x,instagram}', 'draft', '2026-12-02 18:00:00 Europe/Paris',
   'In 1960, about one person in ten in Côte d''Ivoire 🇨🇮 was Christian. In 2010: more than one in three (37.5%). Over the same years the share rose from 44% to 70% in Ghana 🇬🇭 and, since 1965, from 58% to 81% in Kenya 🇰🇪 and from 65% to 83% in Uganda 🇺🇬. In Nigeria 🇳🇬 it barely moved: 39% in 1960, 42% in 2010. Everywhere the share of traditional religions fell, from 66% to 24% in Côte d''Ivoire 🇨🇮. Source: Maoz & Henderson (2013), World Religion Dataset v1.1, Correlates of War.',
   'No page on Statlas for this indicator yet: no link to add. Citation required by the source, keep it exactly: Zeev Maoz and Errol A. Henderson (2013), "The World Religion Dataset, 1945-2010", International Interactions 39: 265-291, version 1.1. No licence published, citation requested (decision of 18 Nov 2026). Estimates every five years, joined by straight lines; the series stops in 2010. Describe, never rank religions.', 'statlas', 'chart'),
  ('vid-west-africa-muslims', 'Islam in West Africa — 1960–2010', 'video', '/social/2026-12/west-africa-muslims.mp4', '/social/2026-12/west-africa-muslims.jpg', '{x,instagram}', 'draft', '2026-12-04 18:00:00 Europe/Paris',
   'In 1960, fewer than one person in four in Burkina Faso 🇧🇫 was Muslim (23%). In 2010: 58%. The share went from about 50% to 85% in Guinea 🇬🇳, from 37% in 1965 to 55% in Sierra Leone 🇸🇱, from 76% to 94% in Mali 🇲🇱 and from 73% to 94% in Senegal 🇸🇳. Over the same years the share of traditional religions in Burkina Faso 🇧🇫 fell from 74% to 12%. Source: Maoz & Henderson (2013), World Religion Dataset v1.1, Correlates of War.',
   'No page on Statlas for this indicator yet: no link to add. Citation required by the source, keep it exactly: Zeev Maoz and Errol A. Henderson (2013), "The World Religion Dataset, 1945-2010", International Interactions 39: 265-291, version 1.1. No licence published, citation requested (decision of 18 Nov 2026). Estimates every five years, joined by straight lines; the jump for Guinea between 1995 and 2000 is in the source. Describe, never rank religions.', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

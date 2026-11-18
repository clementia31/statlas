-- Calendrier : video "Fewer and fewer children" (fecondite 1960-2024, Banque mondiale) pour le 21 novembre 2026.
-- Arrive en brouillon : elle se valide dans le Studio avant publication.
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-fertility-1960-2024', 'Fewer and fewer children — 1960–2024', 'video', '/social/2026-11/fertility-1960-2024.mp4', '/social/2026-11/fertility-1960-2024.jpg', '{x,instagram}', 'draft', '2026-11-21 18:00:00 Europe/Paris',
   'In 1960, women in South Korea 🇰🇷 had six children on average. In 2024: 0.75, the lowest rate among countries of more than one million people. China 🇨🇳 is at 1.01, the United States 🇺🇸 at 1.63 and India 🇮🇳 at 1.96, all below the level of about 2.1 at which a generation replaces itself. Nigeria 🇳🇬 is at 4.38. Source: World Bank, World Development Indicators. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/fertility-rate — add ?utm_source=x or ?utm_source=instagram at the end. Observed values only, no projection. The 2.1 replacement level is a general demographic benchmark, not a World Bank figure.', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

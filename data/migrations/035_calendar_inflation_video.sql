-- Calendrier : video "Where prices run away" (inflation 2000-2024, Banque mondiale) pour le 26 novembre 2026.
-- Arrive en brouillon : elle se valide dans le Studio avant publication.
begin;

insert into public.social_posts (slug, title, kind, media_url, poster_url, platforms, status, scheduled_at, caption, notes, project, format) values
  ('vid-inflation-top5', 'Where prices run away — 2000–2024', 'video', '/social/2026-11/inflation-top5.mp4', '/social/2026-11/inflation-top5.jpg', '{x,instagram}', 'draft', '2026-11-26 18:00:00 Europe/Paris',
   'In 2024, prices in Argentina 🇦🇷 rose by 220% over the year, the highest rate among the 176 countries with data. Türkiye 🇹🇷 stood at 58.5%, after 72% in 2022. Nigeria 🇳🇬 (33.2%), Iran 🇮🇷 (32.5%) and Egypt 🇪🇬 (28.3%) follow. These are the five largest economies where inflation exceeded 20% in 2024. Source: World Bank, World Development Indicators. Full ranking on Statlas.',
   'Link: https://www.statlasresearch.com/rankings/inflation-rate-cpi — add ?utm_source=x or ?utm_source=instagram at the end. Annual average consumer price inflation. Countries chosen by rule: the five largest economies (IMF GDP 2024) with inflation above 20% in 2024. The World Bank series for Argentina starts in 2018, which is why its line appears late; Venezuela and Zimbabwe have no recent World Bank figure: expect comments.', 'statlas', 'chart')
on conflict (slug) do nothing;

commit;

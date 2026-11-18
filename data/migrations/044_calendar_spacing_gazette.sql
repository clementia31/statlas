-- Calendrier : espacer les videos reseaux des figures de la semaine de la Gazette qui portent sur le meme theme.
-- Population : la video passe du 19 au 24 novembre (figure Gazette "The world in 2100" le 20) ; l'esperance de vie prend le 19.
-- Maddison : "Who caught up?" passe du 23 novembre au 3 decembre (figure Gazette "200 years of wealth" le 27) ; le Nobel par million prend le 23.
begin;

update public.social_posts set scheduled_at = '2026-11-19 18:00:00 Europe/Paris', updated_at = now() where slug = 'vid-life-expectancy-top6';
update public.social_posts set scheduled_at = '2026-11-24 18:00:00 Europe/Paris', updated_at = now() where slug = 'vid-population-top6';
update public.social_posts set scheduled_at = '2026-11-23 18:00:00 Europe/Paris', updated_at = now() where slug = 'img-nobel-per-million';
update public.social_posts set scheduled_at = '2026-12-03 18:00:00 Europe/Paris', updated_at = now() where slug = 'vid-catching-up';

commit;

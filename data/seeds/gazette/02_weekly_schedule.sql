-- Figure of the week programmée : chaque figure démarre un vendredi à 00:00 (heure de Paris) et reste 7 jours,
-- jusqu'à ce que la figure du vendredi suivant prenne le relais.
alter table public.chart_of_the_week add column if not exists starts_at timestamptz;
update public.chart_of_the_week
   set starts_at = '2026-11-06 00:00:00 Europe/Paris'
 where video_url = '/gazette/figures/nobel-top5-1901-2025.mp4';

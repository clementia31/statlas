-- Publications : on peut en creer une sans visuel (il sera ajoute plus tard), et envoyer l'image ou la video
-- directement depuis le Studio. Stockage prive : 50 Mo par fichier, videos acceptees.
begin;

alter table public.social_posts alter column media_url drop not null;

update storage.buckets
   set file_size_limit = 52428800,
       allowed_mime_types = array[
         'image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif',
         'video/mp4','video/quicktime','video/webm',
         'application/pdf','text/plain','text/markdown','text/csv',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
         'application/msword','application/vnd.oasis.opendocument.text','application/rtf']
 where id = 'studio';

commit;

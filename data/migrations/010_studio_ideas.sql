-- Studio : idees et sujets a traiter, avec notes et pieces jointes ajoutees au fil du temps.
-- Tout est prive : tables sans regle de lecture, droits retires au public, fichiers dans un espace de stockage prive.
begin;

create table if not exists public.studio_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(trim(title)) > 0),
  body text,
  kind text not null default 'article' check (kind in ('article','chart','topic')),
  project text not null default 'gazette' check (project in ('statlas','gazette','myinvesta')),
  status text not null default 'open' check (status in ('open','done')),
  draft_slug text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  done_at timestamptz
);

create table if not exists public.studio_idea_items (
  id uuid primary key default gen_random_uuid(),
  idea_id uuid not null references public.studio_ideas(id) on delete cascade,
  kind text not null check (kind in ('note','file')),
  body text,
  file_path text,
  file_name text,
  mime text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  check ((kind = 'note' and body is not null) or (kind = 'file' and file_path is not null))
);
create index if not exists studio_idea_items_idea on public.studio_idea_items (idea_id, created_at);

alter table public.studio_ideas enable row level security;
alter table public.studio_idea_items enable row level security;
revoke all on public.studio_ideas, public.studio_idea_items from anon, authenticated;

-- Espace de stockage prive : 20 Mo par fichier, images, PDF et fichiers texte ou bureautiques
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('studio', 'studio', false, 20971520, array[
  'image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif',
  'application/pdf','text/plain','text/markdown','text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword','application/vnd.oasis.opendocument.text','application/rtf'])
on conflict (id) do nothing;

-- Les sujets notes le 10 novembre 2026
insert into public.studio_ideas (title, body, kind, project)
select v.title, v.body, v.kind, v.project from (values
  ('Capitals that are not capitals: Hong Kong, Macao, Taiwan', 'Our country sheets leave the capital empty for Hong Kong and Macao. Explain why, and how different sources answer the question. To confirm and verify before writing.', 'article', 'gazette'),
  ('Total population: one source instead of two', 'The indicator mixes OECD (1950-2024) and IMF (1980-2031). Reload from a single source.', 'topic', 'statlas'),
  ('Maps for the Geopolitics category', 'The category exists with no indicator. Think about which maps would make sense.', 'topic', 'statlas')
) as v(title, body, kind, project)
where not exists (select 1 from public.studio_ideas);

commit;

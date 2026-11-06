alter table public.article_drafts add column if not exists subtitle text;
alter table public.article_drafts add column if not exists body text;
alter table public.article_drafts add column if not exists key_findings jsonb;
alter table public.article_drafts add column if not exists translation_key text;
alter table public.article_drafts add column if not exists article_type text;
alter table public.article_drafts add column if not exists domain_slug text;
alter table public.article_drafts add column if not exists discipline_slug text;
alter table public.article_drafts add column if not exists author_name text;

update public.articles set translation_key = slug where translation_key is null;

insert into public.article_drafts (slug, title, lang, status, project, published_slug, translation_key, subtitle, article_type, domain_slug, discipline_slug, author_name, notes)
select slug, title, 'en', 'published', 'gazette', slug, slug, subtitle, article_type, domain_slug, discipline_slug, author_name, 'Version originale publiée'
from public.articles
on conflict (slug, lang) do nothing;

create or replace function public.import_translations(p_file text)
returns integer language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare v_n integer;
begin
  insert into public.article_drafts (slug, title, lang, status, project, translation_key, subtitle, body, key_findings, article_type, domain_slug, discipline_slug, author_name, notes, updated_at)
  select t->>'slug', t->>'title', t->>'lang', 'ready', 'gazette', t->>'translation_key', t->>'subtitle', t->>'body',
         case when jsonb_typeof(t->'key_findings') = 'array' then t->'key_findings' end,
         t->>'article_type', t->>'domain_slug', t->>'discipline_slug', t->>'author_name',
         'Traduction de /gazette/' || (t->>'translation_key') || ' — prête pour le passage en trilingue', now()
  from jsonb_array_elements((select content from http_get('https://raw.githubusercontent.com/clementia31/statlas/main/data/seeds/gazette/translations/' || p_file))::jsonb) t
  on conflict (slug, lang) do update set title = excluded.title, subtitle = excluded.subtitle, body = excluded.body,
    key_findings = excluded.key_findings, translation_key = excluded.translation_key, updated_at = now();
  get diagnostics v_n = row_count;
  return v_n;
end $$;

select public.import_translations('gazette-2026-11.json');

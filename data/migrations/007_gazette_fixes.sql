-- Etape 5 : correctifs Gazette. Vraie date de publication, type editorial, table des citations.
begin;

-- 1. Les fiches de reference stockaient l'annee de l'oeuvre (1662, 1855...) dans published_at.
--    On la range dans reference_year et published_at redevient la vraie date de mise en ligne.
alter table public.articles add column if not exists reference_year integer;
comment on column public.articles.reference_year is 'Annee de l''oeuvre ou de l''evenement decrit (fiches de reference). published_at = date reelle de publication';
update public.articles
   set reference_year = extract(year from published_at)::integer,
       published_at = created_at::date
 where article_type = 'reference' and reference_year is null;

-- 2. Nouveau type : editorial
alter table public.articles drop constraint articles_article_type_check;
alter table public.articles add constraint articles_article_type_check
  check (article_type = any (array['analysis','data_story','brief','reference','methodology','editorial']));
update public.articles set article_type = 'editorial' where slug in ('men-lie-numbers-dont','our-bubbles');

-- 3. Citations : une fiche par citation, avec le niveau de certitude sur l'attribution
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote text not null unique,
  author text not null,
  source_note text,
  year integer,
  attribution text not null default 'confirmed' check (attribution in ('confirmed','attributed','disputed')),
  lang text not null default 'en',
  created_at timestamptz not null default now()
);
create table if not exists public.quote_uses (
  quote_id uuid not null references public.quotes(id) on delete cascade,
  article_slug text not null references public.articles(slug) on delete cascade,
  primary key (quote_id, article_slug)
);
alter table public.quotes enable row level security;
alter table public.quote_uses enable row level security;
drop policy if exists "quotes public read" on public.quotes;
create policy "quotes public read" on public.quotes for select using (true);
drop policy if exists "quote_uses public read" on public.quote_uses;
create policy "quote_uses public read" on public.quote_uses for select using (true);
revoke insert, update, delete, truncate on public.quotes, public.quote_uses from anon, authenticated;

insert into public.quotes (quote, author, source_note, year, attribution) values
('Forming your worldview by relying on the media would be like forming your view about me by looking only at a picture of my foot.', 'Hans Rosling', 'Factfulness', 2018, 'confirmed'),
('Everyone is entitled to his own opinion, but not to his own facts.', 'Daniel Patrick Moynihan', null, null, 'attributed'),
('There are three kinds of lies: lies, damned lies, and statistics.', 'Mark Twain', 'Twain attributed the line to Benjamin Disraeli', 1906, 'disputed'),
('It is easy to lie with statistics. It is hard to tell the truth without them.', 'Andrejs Dunkels', 'Often attributed to the mathematician Andrejs Dunkels', null, 'attributed'),
('All models are wrong, but some are useful.', 'George E. P. Box', null, null, 'confirmed'),
('The first principle is that you must not fool yourself, and you are the easiest person to fool.', 'Richard Feynman', 'Caltech commencement address', 1974, 'confirmed')
on conflict (quote) do nothing;

insert into public.quote_uses (quote_id, article_slug)
select q.id, 'men-lie-numbers-dont' from public.quotes q
on conflict do nothing;
insert into public.quote_uses (quote_id, article_slug)
select q.id, 'our-bubbles' from public.quotes q where q.author = 'Daniel Patrick Moynihan'
on conflict do nothing;

commit;

-- Statlas Lists : classements thématiques (hors indicateurs pays × année)
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  subtitle text,
  category text,
  value_label text,          -- ex. "Price (US$ million)"
  unit text,                 -- unité pour le formatage
  method text,               -- règles de construction du classement
  sources text,              -- sources citées
  is_research boolean not null default false,  -- calcul / croisement Statlas Research
  updated_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  rank integer not null,
  title text not null,
  subtitle text,             -- artiste, auteur…
  country_iso text,          -- ISO alpha-2 (drapeau)
  year integer,
  value numeric,
  status text not null default 'verified' check (status in ('verified','reported','estimate')),
  detail text,               -- maison de vente, éditeur…
  source_name text,
  source_url text,
  note text,
  unique (list_id, rank)
);

alter table public.lists enable row level security;
alter table public.list_items enable row level security;
drop policy if exists lists_read on public.lists;
drop policy if exists list_items_read on public.list_items;
create policy lists_read on public.lists for select using (true);
create policy list_items_read on public.list_items for select using (true);
grant select on public.lists, public.list_items to anon, authenticated;
alter table public.lists add column if not exists sources text;

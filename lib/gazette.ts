import { supabase } from './supabase';

export async function getDomains() {
  const { data, error } = await supabase
    .from('domains')
    .select('slug, name, tagline, description')
    .order('name', { ascending: true });
  if (error) console.error('Erreur getDomains:', error.message);
  return data ?? [];
}

export async function getDisciplines() {
  const { data, error } = await supabase
    .from('quantitative_disciplines')
    .select('slug, name, description')
    .order('name', { ascending: true });
  if (error) console.error('Erreur getDisciplines:', error.message);
  return data ?? [];
}

export async function getDomainBySlug(slug: string) {
  const { data } = await supabase
    .from('domains')
    .select('slug, name, tagline, description')
    .eq('slug', slug)
    .maybeSingle();
  return data;
}

export async function getArticlesByDomain(domainSlug: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('slug, title, subtitle, article_type, author_name, published_at, discipline_slug')
    .eq('domain_slug', domainSlug)
    .order('published_at', { ascending: false });
  if (error) console.error('Erreur getArticlesByDomain:', error.message);
  return data ?? [];
}

export async function getFeaturedAndLatest() {
  const { data, error } = await supabase
    .from('articles')
    .select('slug, title, subtitle, article_type, domain_slug, author_name, published_at')
    .order('published_at', { ascending: false })
    .limit(9);
  if (error) console.error('Erreur getFeaturedAndLatest:', error.message);
  const all = data ?? [];
  return { featured: all[0] ?? null, latest: all.slice(1) };
}

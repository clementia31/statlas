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

export async function getRelatedForArticle(countrySlugs: string[] | null, indicatorSlugs: string[] | null) {
  const countries: { slug: string; name_default: string }[] = [];
  const indicators: { slug: string; name_default: string }[] = [];

  if (countrySlugs && countrySlugs.length > 0) {
    const { data } = await supabase
      .from('entities')
      .select('slug, name_default')
      .in('slug', countrySlugs);
    if (data) countries.push(...data);
  }

  if (indicatorSlugs && indicatorSlugs.length > 0) {
    const { data } = await supabase
      .from('indicators')
      .select('slug, name_default')
      .in('slug', indicatorSlugs);
    if (data) indicators.push(...data);
  }

  return { countries, indicators };
}

export async function getArchiveArticles(filters: { year?: string; domain?: string; type?: string }) {
  let query = supabase
    .from('articles')
    .select('slug, title, subtitle, article_type, domain_slug, author_name, published_at')
    .order('published_at', { ascending: false });

  if (filters.domain) query = query.eq('domain_slug', filters.domain);
  if (filters.type) query = query.eq('article_type', filters.type);

  const { data, error } = await query;
  if (error) {
    console.error('Erreur getArchiveArticles:', error.message);
    return [];
  }

  if (filters.year) {
    return (data ?? []).filter((a) => a.published_at?.startsWith(filters.year!));
  }
  return data ?? [];
}

export async function getActiveChartOfWeek() {
  const { data } = await supabase
    .from('chart_of_the_week')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

export async function getDossiers() {
  const { data, error } = await supabase
    .from('dossiers')
    .select('slug, title, description')
    .order('title', { ascending: true });
  if (error) console.error('Erreur getDossiers:', error.message);
  return data ?? [];
}

export async function getDossierBySlug(slug: string) {
  const { data: dossier } = await supabase
    .from('dossiers')
    .select('slug, title, description')
    .eq('slug', slug)
    .maybeSingle();

  if (!dossier) return { dossier: null, articles: [] };

  const { data: articles } = await supabase
    .from('articles')
    .select('slug, title, subtitle, article_type, published_at')
    .eq('dossier_slug', slug)
    .order('published_at', { ascending: true });

  return { dossier, articles: articles ?? [] };
}

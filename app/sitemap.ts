import type { MetadataRoute } from 'next';
import { getCatalog, getCountries } from '@/lib/data';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const BASE = 'https://www.statlasresearch.com';

// Plan du site lu par les moteurs de recherche : pages principales, classements, fiches pays, articles et listes.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, countries, articles, lists, domains] = await Promise.all([
    getCatalog(),
    getCountries(),
    supabase.from('articles').select('slug, published_at'),
    supabase.from('lists').select('slug'),
    supabase.from('domains').select('slug'),
  ]);
  const pages = ['', '/indicators', '/map', '/countries', '/compare', '/rankings', '/sport', '/lists', '/benchmark', '/gazette', '/gazette/archive', '/bibliography', '/api-export', '/about'];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: 'weekly' as const })),
    ...catalog.filter((m) => m.ref_year !== null).map((m) => ({ url: `${BASE}/rankings/${m.slug}`, changeFrequency: 'monthly' as const })),
    ...countries.map((c) => ({ url: `${BASE}/countries/${c.slug}`, changeFrequency: 'monthly' as const })),
    ...((domains.data as { slug: string }[] | null) ?? []).map((d) => ({ url: `${BASE}/gazette/${d.slug}`, changeFrequency: 'weekly' as const })),
    ...((articles.data as { slug: string; published_at: string | null }[] | null) ?? []).map((a) => ({
      url: `${BASE}/gazette/${a.slug}`,
      changeFrequency: 'monthly' as const,
      ...(a.published_at ? { lastModified: new Date(a.published_at) } : {}),
    })),
    ...((lists.data as { slug: string }[] | null) ?? []).map((l) => ({ url: `${BASE}/lists/${l.slug}`, changeFrequency: 'monthly' as const })),
  ];
}

import type { MetadataRoute } from 'next';
import { getCatalog, getCountries } from '@/lib/data';

export const dynamic = 'force-dynamic';

const BASE = 'https://statlas-inky.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, countries] = await Promise.all([getCatalog(), getCountries()]);
  const pages = ['', '/indicateurs', '/carte', '/pays', '/comparaisons', '/rankings', '/benchmark', '/gazette', '/bibliographie', '/api-export'];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: 'weekly' as const })),
    ...catalog.map((m) => ({ url: `${BASE}/rankings/${m.slug}`, changeFrequency: 'monthly' as const })),
    ...countries.map((c) => ({ url: `${BASE}/pays/${c.slug}`, changeFrequency: 'monthly' as const })),
  ];
}

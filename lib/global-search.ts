import { supabase } from './supabase';

// Nettoie la saisie : les caractères spéciaux cassent les filtres de l'API
function clean(q: string) {
  return q.replace(/[%,()*\\]/g, ' ').trim().slice(0, 80);
}

export async function getGlobalSearchResults(query: string) {
  const q = clean(query);
  if (!q) return { countries: [], indicators: [], articles: [] };

  const [countries, aliases, indicators, articles] = await Promise.all([
    supabase.from('entities').select('id, slug, name_default, iso_code').eq('entity_type', 'country').ilike('name_default', `%${q}%`).limit(12),
    supabase.from('entity_aliases').select('entity_id').ilike('alias', `%${q}%`).limit(12),
    supabase.from('indicators').select('slug, name_default').or(`name_default.ilike.%${q}%,definition.ilike.%${q}%`).limit(12),
    supabase.from('articles').select('slug, title, subtitle').or(`title.ilike.%${q}%,subtitle.ilike.%${q}%`).limit(12),
  ]);

  let countryRows = countries.data ?? [];
  const aliasIds = (aliases.data ?? []).map((a) => a.entity_id).filter((id) => !countryRows.some((c) => c.id === id));
  if (aliasIds.length) {
    const { data } = await supabase.from('entities').select('id, slug, name_default, iso_code').eq('entity_type', 'country').in('id', aliasIds);
    countryRows = [...countryRows, ...(data ?? [])];
  }

  return {
    countries: countryRows,
    indicators: indicators.data ?? [],
    articles: articles.data ?? [],
  };
}

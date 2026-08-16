import { supabase } from './supabase';

export async function getGlobalSearchResults(query: string) {
  if (!query.trim()) {
    return { countries: [], indicators: [], articles: [] };
  }

  const { data: countries, error: cError } = await supabase
    .from('entities')
    .select('slug, name_default')
    .eq('entity_type', 'country')
    .ilike('name_default', `%${query}%`)
    .limit(10);

  if (cError) console.error('Erreur recherche pays:', cError.message);

  const { data: indicators, error: iError } = await supabase
    .from('indicators')
    .select('slug, name_default')
    .ilike('name_default', `%${query}%`)
    .limit(10);

  if (iError) console.error('Erreur recherche indicateurs:', iError.message);

  const { data: articles, error: aError } = await supabase
    .from('articles')
    .select('slug, title, subtitle')
    .or(`title.ilike.%${query}%,subtitle.ilike.%${query}%`)
    .limit(10);

  if (aError) console.error('Erreur recherche articles:', aError.message);

  return {
    countries: countries ?? [],
    indicators: indicators ?? [],
    articles: articles ?? [],
  };
}

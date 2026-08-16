import { supabase } from './supabase';

export async function getSourcesForIndicator(indicatorSlug: string) {
  const { data: indicator } = await supabase
    .from('indicators')
    .select('id')
    .eq('slug', indicatorSlug)
    .single();

  if (!indicator) return [];

  const { data: obsRows, error } = await supabase
    .from('observations')
    .select('source_document_id')
    .eq('indicator_id', indicator.id)
    .eq('status', 'validated')
    .not('source_document_id', 'is', null);

  if (error || !obsRows) {
    console.error('Erreur getSourcesForIndicator:', error?.message);
    return [];
  }

  const docIds = Array.from(new Set(obsRows.map((r) => r.source_document_id)));
  if (docIds.length === 0) return [];

  const { data: docs } = await supabase
    .from('source_documents')
    .select('id, title, url, source_id')
    .in('id', docIds);

  if (!docs || docs.length === 0) return [];

  const sourceIds = Array.from(new Set(docs.map((d) => d.source_id)));
  const { data: sources } = await supabase
    .from('sources')
    .select('id, name, url')
    .in('id', sourceIds);

  const sourceById = new Map((sources ?? []).map((s) => [s.id, s]));

  return docs.map((d) => ({
    title: d.title,
    url: d.url,
    sourceName: sourceById.get(d.source_id)?.name ?? 'Unknown',
    sourceUrl: sourceById.get(d.source_id)?.url,
  }));
}

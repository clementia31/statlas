import { supabase } from './supabase';

// Statlas Lists : classements thématiques sourcés (tableaux, livres…)
export type ListMeta = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  value_label: string | null;
  unit: string | null;
  method: string | null;
  sources: string | null;
  is_research: boolean;
  updated_at: string;
};

export type ListItem = {
  rank: number;
  title: string;
  subtitle: string | null;
  country_iso: string | null;
  year: number | null;
  value: number | null;
  status: 'verified' | 'reported' | 'estimate';
  detail: string | null;
  source_name: string | null;
  source_url: string | null;
  note: string | null;
};

export async function getLists(): Promise<(ListMeta & { n: number; top: ListItem | null })[]> {
  const { data, error } = await supabase.from('lists').select('*, list_items(rank, title, subtitle, country_iso, year, value, status, detail)').order('title');
  if (error) console.error('getLists:', error.message);
  return (data ?? []).map((l: any) => {
    const items = ((l.list_items ?? []) as ListItem[]).sort((a, b) => a.rank - b.rank);
    const { list_items, ...meta } = l;
    return { ...(meta as ListMeta), n: items.length, top: items[0] ?? null };
  });
}

export async function getList(slug: string): Promise<{ meta: ListMeta; items: ListItem[] } | null> {
  const { data: meta, error } = await supabase.from('lists').select('*').eq('slug', slug).maybeSingle();
  if (error) console.error('getList:', error.message);
  if (!meta) return null;
  const { data: items } = await supabase.from('list_items').select('*').eq('list_id', meta.id).order('rank');
  return { meta: meta as ListMeta, items: (items ?? []) as ListItem[] };
}

export function formatListValue(value: number | null, unit: string | null): string {
  if (value === null || value === undefined) return '—';
  const u = (unit ?? '').toLowerCase();
  if (u === 'usd million') return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M';
  if (u === 'copies million') return value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + 'M';
  return value.toLocaleString('en-US');
}

export const STATUS_LABEL: Record<ListItem['status'], string> = {
  verified: 'Verified',
  reported: 'Reported',
  estimate: 'Estimate',
};

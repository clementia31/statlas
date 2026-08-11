import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types de base reflétant le schéma Statlas
export type Entity = {
  id: string;
  slug: string;
  entity_type: string;
  name_default: string;
  iso_code: string | null;
};

export type Observation = {
  entity_id: string;
  indicator_id: string;
  value_number: number;
  period_start: string;
  is_projection: boolean;
};

// Récupère la dernière observation validée par pays pour un indicateur donné
export async function getLatestObservationsByIndicator(indicatorSlug: string) {
  const { data: indicator } = await supabase
    .from('indicators')
    .select('id, name_default, unit')
    .eq('slug', indicatorSlug)
    .single();

  if (!indicator) return { indicator: null, rows: [] };

  const { data: rows } = await supabase
    .from('observations')
    .select('entity_id, value_number, period_start, entities(slug, name_default)')
    .eq('indicator_id', indicator.id)
    .eq('status', 'validated')
    .order('period_start', { ascending: false });

  // Garde uniquement la ligne la plus récente par pays
  const latestByEntity = new Map<string, any>();
  for (const row of rows ?? []) {
    if (!latestByEntity.has(row.entity_id)) {
      latestByEntity.set(row.entity_id, row);
    }
  }

  return { indicator, rows: Array.from(latestByEntity.values()) };
}

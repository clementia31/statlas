import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Entity = {
  id: string;
  slug: string;
  entity_type: string;
  name_default: string;
  iso_code: string | null;
};

export type ObservationRow = {
  entity_id: string;
  value_number: number;
  period_start: string;
  entity?: { id: string; slug: string; name_default: string };
};

// Récupère la dernière observation validée par pays pour un indicateur donné.
// Fait deux requêtes séparées (observations, puis entités) plutôt qu'une
// jointure imbriquée — plus simple à déboguer et plus fiable.
export async function getLatestObservationsByIndicator(indicatorSlug: string) {
  const { data: indicator } = await supabase
    .from('indicators')
    .select('id, name_default, unit')
    .eq('slug', indicatorSlug)
    .single();

  if (!indicator) return { indicator: null, rows: [] as ObservationRow[] };

  const { data: obsRows, error: obsError } = await supabase
    .from('observations')
    .select('entity_id, value_number, period_start')
    .eq('indicator_id', indicator.id)
    .eq('status', 'validated')
    .order('period_start', { ascending: false });

  if (obsError) {
    console.error('Erreur observations:', obsError.message);
    return { indicator, rows: [] as ObservationRow[] };
  }

  // Garde uniquement la ligne la plus récente par pays
  const latestByEntity = new Map<string, { entity_id: string; value_number: number; period_start: string }>();
  for (const row of obsRows ?? []) {
    if (!latestByEntity.has(row.entity_id)) {
      latestByEntity.set(row.entity_id, row);
    }
  }

  const entityIds = Array.from(latestByEntity.keys());
  if (entityIds.length === 0) return { indicator, rows: [] as ObservationRow[] };

  const { data: entities, error: entError } = await supabase
    .from('entities')
    .select('id, slug, name_default')
    .in('id', entityIds);

  if (entError) {
    console.error('Erreur entities:', entError.message);
  }

  const entityById = new Map((entities ?? []).map((e) => [e.id, e]));

  const rows: ObservationRow[] = Array.from(latestByEntity.values()).map((r) => ({
    ...r,
    entity: entityById.get(r.entity_id),
  }));

  return { indicator, rows };
}

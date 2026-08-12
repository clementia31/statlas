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

// Liste tous les pays (id, slug, name) pour la page /pays
export async function getAllCountries() {
  const { data, error } = await supabase
    .from('entities')
    .select('id, slug, name_default, entity_type')
    .eq('entity_type', 'country')
    .order('name_default', { ascending: true });

  if (error) {
    console.error('Erreur getAllCountries:', error.message);
    return [];
  }
  return data ?? [];
}

// Fiche complète d'un pays : toutes les dernières valeurs disponibles,
// tous indicateurs confondus.
export async function getCountryProfile(entitySlug: string) {
  const { data: entity } = await supabase
    .from('entities')
    .select('id, slug, name_default, entity_type, iso_code')
    .eq('slug', entitySlug)
    .single();

  if (!entity) return { entity: null, indicators: [] as any[] };

  const { data: obsRows, error: obsError } = await supabase
    .from('observations')
    .select('indicator_id, value_number, period_start, unit, is_projection')
    .eq('entity_id', entity.id)
    .eq('status', 'validated')
    .order('period_start', { ascending: false });

  if (obsError || !obsRows) {
    console.error('Erreur getCountryProfile observations:', obsError?.message);
    return { entity, indicators: [] as any[] };
  }

  const latestByIndicator = new Map<string, { indicator_id: string; value_number: number; period_start: string; unit: string }>();
  for (const row of obsRows) {
    if (!latestByIndicator.has(row.indicator_id)) {
      latestByIndicator.set(row.indicator_id, row);
    }
  }

  const indicatorIds = Array.from(latestByIndicator.keys());
  if (indicatorIds.length === 0) return { entity, indicators: [] as any[] };

  const { data: indicatorsData } = await supabase
    .from('indicators')
    .select('id, slug, name_default, unit')
    .in('id', indicatorIds);

  const indicatorById = new Map((indicatorsData ?? []).map((i) => [i.id, i]));

  const indicators = Array.from(latestByIndicator.values())
    .map((r) => ({
      ...r,
      indicator: indicatorById.get(r.indicator_id),
    }))
    .filter((r) => r.indicator)
    .sort((a, b) => (a.indicator!.name_default).localeCompare(b.indicator!.name_default));

  return { entity, indicators };
}

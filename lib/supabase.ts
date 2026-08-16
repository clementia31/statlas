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

// Liste toutes les sources avec leurs documents, pour la page Bibliographie
export async function getAllSources() {
  const { data: sources, error } = await supabase
    .from('sources')
    .select('id, slug, name, source_type, url')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erreur getAllSources:', error.message);
    return [];
  }

  const { data: documents } = await supabase
    .from('source_documents')
    .select('id, source_id, title, url, published_at');

  const docsBySource = new Map<string, any[]>();
  for (const doc of documents ?? []) {
    if (!docsBySource.has(doc.source_id)) docsBySource.set(doc.source_id, []);
    docsBySource.get(doc.source_id)!.push(doc);
  }

  return (sources ?? []).map((s) => ({
    ...s,
    documents: docsBySource.get(s.id) ?? [],
  }));
}

// Série temporelle (moyenne mondiale par année) pour un indicateur donné
export async function getIndicatorTimeSeries(indicatorSlug: string) {
  const { data: indicator } = await supabase
    .from('indicators')
    .select('id, name_default, unit')
    .eq('slug', indicatorSlug)
    .single();

  if (!indicator) return { indicator: null, series: [] as { year: string; average: number }[] };

  const { data: obsRows, error } = await supabase
    .from('observations')
    .select('value_number, period_start')
    .eq('indicator_id', indicator.id)
    .eq('status', 'validated')
    .order('period_start', { ascending: true });

  if (error || !obsRows) {
    console.error('Erreur getIndicatorTimeSeries:', error?.message);
    return { indicator, series: [] as { year: string; average: number }[] };
  }

  const sums = new Map<string, { sum: number; count: number }>();
  for (const row of obsRows) {
    const year = row.period_start.slice(0, 4);
    const entry = sums.get(year) ?? { sum: 0, count: 0 };
    entry.sum += row.value_number;
    entry.count += 1;
    sums.set(year, entry);
  }

  const series = Array.from(sums.entries())
    .map(([year, { sum, count }]) => ({ year, average: sum / count }))
    .sort((a, b) => a.year.localeCompare(b.year));

  return { indicator, series };
}

// Série temporelle par pays (pour le graphique superposé multi-pays)
export async function getCountryYearlySeries(indicatorSlug: string, entitySlugs: string[]) {
  const { data: indicator } = await supabase
    .from('indicators')
    .select('id, name_default')
    .eq('slug', indicatorSlug)
    .single();

  if (!indicator) return { indicator: null, seriesByEntity: {} as Record<string, { year: string; value: number }[]> };

  const { data: entities } = await supabase
    .from('entities')
    .select('id, slug, name_default')
    .in('slug', entitySlugs);

  const entityIds = (entities ?? []).map((e) => e.id);
  const idToSlug = new Map((entities ?? []).map((e) => [e.id, e.slug]));
  const idToName = new Map((entities ?? []).map((e) => [e.id, e.name_default]));

  const { data: obsRows, error } = await supabase
    .from('observations')
    .select('entity_id, value_number, period_start')
    .eq('indicator_id', indicator.id)
    .in('entity_id', entityIds)
    .eq('status', 'validated')
    .order('period_start', { ascending: true });

  if (error || !obsRows) {
    console.error('Erreur getCountryYearlySeries:', error?.message);
    return { indicator, seriesByEntity: {} as Record<string, { year: string; value: number }[]> };
  }

  const seriesByEntity: Record<string, { year: string; value: number }[]> = {};
  for (const slug of entitySlugs) seriesByEntity[slug] = [];

  for (const row of obsRows) {
    const slug = idToSlug.get(row.entity_id);
    if (!slug) continue;
    seriesByEntity[slug].push({ year: row.period_start.slice(0, 4), value: row.value_number });
  }

  return { indicator, seriesByEntity, namesBySlug: Object.fromEntries(Array.from(idToName.entries()).map(([id, name]) => [idToSlug.get(id), name])) };
}

// Toutes les années disponibles pour un indicateur, groupées par année,
// pour l'animation temporelle de la carte (onglet Map).
export async function getIndicatorAllYears(indicatorSlug: string) {
  const { data: indicator } = await supabase
    .from('indicators')
    .select('id, name_default, unit')
    .eq('slug', indicatorSlug)
    .single();

  if (!indicator) return { indicator: null, years: [] as string[], yearsData: {} as Record<string, { slug: string; name: string; value: number }[]> };

  const { data: obsRows, error } = await supabase
    .from('observations')
    .select('entity_id, value_number, period_start')
    .eq('indicator_id', indicator.id)
    .eq('status', 'validated')
    .order('period_start', { ascending: true });

  if (error || !obsRows) {
    console.error('Erreur getIndicatorAllYears:', error?.message);
    return { indicator, years: [] as string[], yearsData: {} as Record<string, { slug: string; name: string; value: number }[]> };
  }

  const entityIds = Array.from(new Set(obsRows.map((r) => r.entity_id)));
  const { data: entities } = await supabase
    .from('entities')
    .select('id, slug, name_default')
    .in('id', entityIds);

  const entityById = new Map((entities ?? []).map((e) => [e.id, e]));

  const yearsData: Record<string, { slug: string; name: string; value: number }[]> = {};
  for (const row of obsRows) {
    const year = row.period_start.slice(0, 4);
    const entity = entityById.get(row.entity_id);
    if (!entity) continue;
    if (!yearsData[year]) yearsData[year] = [];
    yearsData[year].push({ slug: entity.slug, name: entity.name_default, value: row.value_number });
  }

  const years = Object.keys(yearsData).sort();

  return { indicator, years, yearsData };
}

// Articles de la Gazette
export async function getAllArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, subtitle, article_type, discipline_slug, author_name, published_at')
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Erreur getAllArticles:', error.message);
    return [];
  }
  return data ?? [];
}

export async function getArticleBySlug(slug: string) {
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !article) {
    if (error) console.error('Erreur getArticleBySlug:', error.message);
    return null;
  }

  let source: { name: string; url: string | null } | null = null;
  let doc: { title: string; url: string | null; published_at: string | null } | null = null;

  if (article.source_id) {
    const { data: sourceRow } = await supabase
      .from('sources')
      .select('id, name, url')
      .eq('id', article.source_id)
      .maybeSingle();
    if (sourceRow) {
      source = { name: sourceRow.name, url: sourceRow.url };
      const { data: docRow } = await supabase
        .from('source_documents')
        .select('title, url, published_at')
        .eq('source_id', sourceRow.id)
        .limit(1)
        .maybeSingle();
      if (docRow) doc = docRow;
    }
  }

  return { ...article, source, doc };
}

// Couche de données unique du site.
// Toutes les pages lisent les mêmes vues SQL (voir Supabase) : mêmes années, mêmes sources, mêmes rangs.
import { supabase, fetchAllRows } from './supabase';

export type IndicatorMeta = {
  id: string;
  slug: string;
  name: string;
  unit: string;
  definition: string | null;
  higher_is_better: boolean | null;
  category_slug: string | null;
  category: string | null;
  first_year: number | null;
  last_actual_year: number | null;
  last_year: number | null;
  ref_year: number | null;
  max_coverage: number | null;
  ref_coverage: number;
  source_name: string | null;
  source_url: string | null;
  dataset_title: string | null;
  sub_annual: boolean;
};

export type YearValue = {
  entity_slug: string;
  entity_name: string;
  iso_code: string | null;
  value: number;
  is_projection: boolean;
  year: number;
};

export type YearInfo = { year: number; n_countries: number; is_projection: boolean };

// Indicateurs mis en avant (ordre d'affichage par défaut)
export const DEFAULT_INDICATOR = 'human-development-index';

// Indicateurs qui portent sur des villes et non des pays : exclus des vues « pays »
// Aucun pour l'instant : l'ancien « population-density-urban » (source non conforme) a été retiré le 10 nov. 2026.
const CITY_INDICATORS = new Set<string>();

export function isCityIndicator(slug: string) {
  return CITY_INDICATORS.has(slug);
}

export async function getCatalog(): Promise<IndicatorMeta[]> {
  const { data, error } = await supabase.from('indicator_catalog').select('*');
  if (error) {
    console.error('getCatalog:', error.message);
    return [];
  }
  return ((data ?? []) as IndicatorMeta[])
    .filter((i) => i.ref_year !== null)
    .sort((a, b) => (a.category ?? '').localeCompare(b.category ?? '') || a.name.localeCompare(b.name));
}

export async function getCountryCatalog(): Promise<IndicatorMeta[]> {
  return (await getCatalog()).filter((i) => !isCityIndicator(i.slug));
}

export async function getIndicatorMeta(slug: string): Promise<IndicatorMeta | null> {
  const { data, error } = await supabase.from('indicator_catalog').select('*').eq('slug', slug).maybeSingle();
  if (error) console.error('getIndicatorMeta:', error.message);
  return (data as IndicatorMeta) ?? null;
}

export async function getIndicatorYears(slug: string): Promise<YearInfo[]> {
  const { data, error } = await supabase
    .from('indicator_years')
    .select('year, n_countries, is_projection')
    .eq('indicator_slug', slug)
    .order('year', { ascending: true });
  if (error) console.error('getIndicatorYears:', error.message);
  return (data ?? []).map((r: any) => ({ year: Number(r.year), n_countries: Number(r.n_countries), is_projection: !!r.is_projection }));
}

// Valeurs de tous les pays (ou villes) pour un indicateur et une année
export async function getYearValues(slug: string, year: number): Promise<YearValue[]> {
  const entityType = isCityIndicator(slug) ? 'city' : 'country';
  const { data, error } = await fetchAllRows<any>(() =>
    supabase
      .from('obs_values')
      .select('entity_slug, entity_name, iso_code, value, is_projection, year')
      .eq('indicator_slug', slug)
      .eq('year', year)
      .eq('entity_type', entityType)
      .order('entity_slug', { ascending: true })
  );
  if (error) console.error('getYearValues:', error.message);
  return (data ?? []).map((r) => ({ ...r, value: Number(r.value), year: Number(r.year) }));
}

// Toutes les années d'un indicateur (pour la carte animée)
export async function getAllYearValues(slug: string): Promise<Record<number, YearValue[]>> {
  const entityType = isCityIndicator(slug) ? 'city' : 'country';
  const { data, error } = await fetchAllRows<any>(() =>
    supabase
      .from('obs_values')
      .select('entity_slug, entity_name, iso_code, value, is_projection, year')
      .eq('indicator_slug', slug)
      .eq('entity_type', entityType)
      .order('year', { ascending: true })
      .order('entity_slug', { ascending: true })
  );
  if (error) console.error('getAllYearValues:', error.message);
  const out: Record<number, YearValue[]> = {};
  for (const r of data ?? []) {
    const y = Number(r.year);
    (out[y] ??= []).push({ ...r, value: Number(r.value), year: y });
  }
  return out;
}

export type WorldPoint = { year: number; n: number; mean: number; median: number; total: number };

export async function getWorldSeries(slug: string): Promise<WorldPoint[]> {
  const { data, error } = await supabase
    .from('indicator_world_series')
    .select('year, n_countries, mean, median, total')
    .eq('indicator_slug', slug)
    .order('year', { ascending: true });
  if (error) console.error('getWorldSeries:', error.message);
  return (data ?? []).map((r: any) => ({
    year: Number(r.year),
    n: Number(r.n_countries),
    mean: Number(r.mean),
    median: Number(r.median),
    total: Number(r.total),
  }));
}

// Séries par pays (graphique multi-pays)
export async function getCountrySeries(slug: string, countrySlugs: string[]) {
  if (countrySlugs.length === 0) return {} as Record<string, { year: number; value: number; is_projection: boolean }[]>;
  const { data, error } = await fetchAllRows<any>(() =>
    supabase
      .from('obs_values')
      .select('entity_slug, entity_name, year, value, is_projection')
      .eq('indicator_slug', slug)
      .in('entity_slug', countrySlugs)
      .order('year', { ascending: true })
      .order('entity_slug', { ascending: true })
  );
  if (error) console.error('getCountrySeries:', error.message);
  const out: Record<string, { year: number; value: number; is_projection: boolean }[]> = {};
  for (const s of countrySlugs) out[s] = [];
  for (const r of data ?? []) {
    out[r.entity_slug]?.push({ year: Number(r.year), value: Number(r.value), is_projection: !!r.is_projection });
  }
  return out;
}

export type Country = { id: string; slug: string; name: string; iso: string | null };

export async function getCountries(): Promise<Country[]> {
  const { data, error } = await supabase
    .from('entities')
    .select('id, slug, name_default, iso_code')
    .eq('entity_type', 'country')
    .not('iso_code', 'is', null) // exclut les entités historiques (RDA, RFA)
    .order('name_default', { ascending: true });
  if (error) console.error('getCountries:', error.message);
  return (data ?? []).map((e: any) => ({ id: e.id, slug: e.slug, name: e.name_default, iso: e.iso_code }));
}

export type CountryIndicator = {
  meta: IndicatorMeta;
  value: number;
  year: number;
  is_projection: boolean;
  rank: number | null;
  rankTotal: number | null;
  rankYear: number | null;
};

export async function getCountryIndicators(countryId: string): Promise<CountryIndicator[]> {
  const [catalog, latest, ranks] = await Promise.all([
    getCountryCatalog(),
    supabase.from('obs_latest').select('indicator_id, value_number, period_start, is_projection').eq('entity_id', countryId),
    supabase.from('obs_rank_latest').select('indicator_id, year, rank, total').eq('entity_id', countryId),
  ]);
  if (latest.error) console.error('getCountryIndicators latest:', latest.error.message);
  if (ranks.error) console.error('getCountryIndicators ranks:', ranks.error.message);

  const metaById = new Map(catalog.map((m) => [m.id, m]));
  const rankById = new Map((ranks.data ?? []).map((r: any) => [r.indicator_id, r]));

  return (latest.data ?? [])
    .map((r: any) => {
      const meta = metaById.get(r.indicator_id);
      if (!meta) return null;
      const rk: any = rankById.get(r.indicator_id);
      return {
        meta,
        value: Number(r.value_number),
        year: Number(String(r.period_start).slice(0, 4)),
        is_projection: !!r.is_projection,
        rank: rk ? Number(rk.rank) : null,
        rankTotal: rk ? Number(rk.total) : null,
        rankYear: rk ? Number(rk.year) : null,
      } as CountryIndicator;
    })
    .filter((x): x is CountryIndicator => x !== null)
    .sort((a, b) => (a.meta.category ?? '').localeCompare(b.meta.category ?? '') || a.meta.name.localeCompare(b.meta.name));
}

// Valeur projetée la plus lointaine (prévision officielle de la source) pour un pays
export async function getCountryForecasts(countrySlug: string) {
  const { data, error } = await supabase
    .from('obs_values')
    .select('indicator_slug, year, value')
    .eq('entity_slug', countrySlug)
    .eq('is_projection', true)
    .order('year', { ascending: false });
  if (error) console.error('getCountryForecasts:', error.message);
  const out = new Map<string, { year: number; value: number }>();
  for (const r of data ?? []) {
    if (!out.has(r.indicator_slug)) out.set(r.indicator_slug, { year: Number(r.year), value: Number(r.value) });
  }
  return out;
}

export type Ranked = YearValue & { rank: number; score: number };

// Classement d'un indicateur pour une année : rang (ex aequo gérés) et score 0-100
export function rankValues(rows: YearValue[], higherIsBetter: boolean | null): Ranked[] {
  const dir = higherIsBetter === false ? 1 : -1; // tri décroissant par défaut
  const sorted = [...rows].sort((a, b) => dir * (a.value - b.value) || a.entity_name.localeCompare(b.entity_name));
  const values = rows.map((r) => r.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  let prev: number | null = null;
  let prevRank = 0;
  return sorted.map((r, i) => {
    const rank = prev !== null && r.value === prev ? prevRank : i + 1;
    prev = r.value;
    prevRank = rank;
    const raw = max === min ? 100 : ((r.value - min) / (max - min)) * 100;
    const score = higherIsBetter === false ? 100 - raw : raw;
    return { ...r, rank, score: Math.round(score * 10) / 10 };
  });
}

// Année demandée si elle existe, sinon année de référence de l'indicateur
export function pickYear(years: YearInfo[], requested: string | undefined, refYear: number | null): number | null {
  const n = requested ? Number(requested) : NaN;
  if (!Number.isNaN(n) && years.some((y) => y.year === n)) return n;
  if (refYear !== null) return refYear;
  return years.length ? years[years.length - 1].year : null;
}

// Chiffres clés de l'accueil, calculés depuis la base (année de référence de chaque indicateur)
export type Kpi = { label: string; value: number; unit: string; year: number; n: number; previous: number | null; mode: 'total' | 'median'; slug: string };

export async function getOverviewKpis(): Promise<Kpi[]> {
  const specs: { slug: string; label: string; mode: 'total' | 'median' }[] = [
    { slug: 'population-total', label: 'World population', mode: 'total' },
    { slug: 'gdp-nominal-usd', label: 'World GDP (nominal)', mode: 'total' },
    { slug: 'gdp-ppp-intl-dollar', label: 'World GDP (PPP)', mode: 'total' },
    { slug: 'life-expectancy-birth', label: 'Median life expectancy', mode: 'median' },
    { slug: 'human-development-index', label: 'Median HDI', mode: 'median' },
    { slug: 'gdp-ppp-per-capita-intl-dollar', label: 'Median GDP per capita (PPP)', mode: 'median' },
  ];
  const catalog = await getCatalog();
  const bySlug = new Map(catalog.map((c) => [c.slug, c]));
  const series = await Promise.all(specs.map((s) => getWorldSeries(s.slug)));
  const out: Kpi[] = [];
  specs.forEach((s, i) => {
    const meta = bySlug.get(s.slug);
    if (!meta || meta.ref_year === null) return;
    const pts = series[i];
    const cur = pts.find((p) => p.year === meta.ref_year);
    const prev = pts.find((p) => p.year === (meta.ref_year as number) - 1);
    if (!cur) return;
    const pick = (p: WorldPoint) => (s.mode === 'total' ? p.total : p.median);
    // Une variation n'a de sens que si la couverture est comparable d'une année sur l'autre
    const comparable = prev && Math.abs(prev.n - cur.n) <= Math.max(2, cur.n * 0.02);
    out.push({
      label: s.label,
      value: pick(cur),
      unit: meta.unit,
      year: cur.year,
      n: cur.n,
      previous: comparable && prev ? pick(prev) : null,
      mode: s.mode,
      slug: s.slug,
    });
  });
  return out;
}

// Podium (rangs 1 à 3) de chaque indicateur sur son année de référence — une seule requête
export async function getPodiums(): Promise<Map<string, { rank: number; slug: string; name: string; iso: string | null; value: number }[]>> {
  const [{ data: rows, error }, countries] = await Promise.all([
    supabase.from('obs_rank_latest').select('indicator_id, entity_id, rank, value_number').lte('rank', 3),
    getCountries(),
  ]);
  if (error) console.error('getPodiums:', error.message);
  const byId = new Map(countries.map((c) => [c.id, c]));
  const out = new Map<string, { rank: number; slug: string; name: string; iso: string | null; value: number }[]>();
  for (const r of rows ?? []) {
    const c = byId.get(r.entity_id);
    if (!c) continue;
    if (!out.has(r.indicator_id)) out.set(r.indicator_id, []);
    out.get(r.indicator_id)!.push({ rank: Number(r.rank), slug: c.slug, name: c.name, iso: c.iso, value: Number(r.value_number) });
  }
  out.forEach((v) => v.sort((a, b) => a.rank - b.rank));
  return out;
}

import { supabase } from './supabase';
import { getIndicatorAllYears } from './supabase';
import { normalizeMinMax } from './rankings-engine';

export async function getAllRankableIndicators() {
  const { data, error } = await supabase
    .from('indicators')
    .select('slug, name_default, unit, higher_is_better')
    .order('name_default', { ascending: true });
  if (error) console.error('Erreur getAllRankableIndicators:', error.message);
  return data ?? [];
}

export async function getRankingForIndicator(indicatorSlug: string, year?: string) {
  const { indicator, years, yearsData, latestActualYear } = await getIndicatorAllYears(indicatorSlug);
  if (!indicator) return { indicator: null, year: null, ranked: [] };

  const selectedYear = year && years.includes(year) ? year : latestActualYear ?? years[years.length - 1];
  const rows = yearsData[selectedYear] ?? [];
  const higherIsBetter = indicator.higher_is_better ?? true;

  const values = rows.map((r) => r.value);
  const ranked = rows
    .map((r) => ({
      ...r,
      score: normalizeMinMax(values, r.value, higherIsBetter),
    }))
    .sort((a, b) => (higherIsBetter ? b.value - a.value : a.value - b.value));

  return { indicator, year: selectedYear, years, ranked };
}

export async function getCountryRankings(countrySlug: string) {
  // Vue SQL obs_rank_latest : rang de chaque pays sur la dernière année observée (hors projections)
  const { data: entity } = await supabase
    .from('entities')
    .select('id')
    .eq('slug', countrySlug)
    .maybeSingle();
  if (!entity) return [];

  const [{ data: rankRows, error }, { data: indicators }] = await Promise.all([
    supabase
      .from('obs_rank_latest')
      .select('indicator_id, year, rank, total')
      .eq('entity_id', entity.id),
    supabase.from('indicators').select('id, slug, name_default'),
  ]);
  if (error) console.error('Erreur getCountryRankings:', error.message);

  const indicatorById = new Map((indicators ?? []).map((i) => [i.id, i]));

  return (rankRows ?? [])
    .map((r) => {
      const ind = indicatorById.get(r.indicator_id);
      if (!ind) return null;
      return {
        indicatorSlug: ind.slug as string,
        indicatorName: ind.name_default as string,
        rank: Number(r.rank),
        total: Number(r.total),
        year: String(r.year),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

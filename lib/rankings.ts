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
  const { indicator, years, yearsData } = await getIndicatorAllYears(indicatorSlug);
  if (!indicator) return { indicator: null, year: null, ranked: [] };

  const selectedYear = year && years.includes(year) ? year : years[years.length - 1];
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
  const indicators = await getAllRankableIndicators();
  const results = await Promise.all(indicators.map((i) => getRankingForIndicator(i.slug)));

  return results
    .map((r, idx) => {
      const position = r.ranked.findIndex((row) => row.slug === countrySlug);
      if (position === -1) return null;
      return {
        indicatorSlug: indicators[idx].slug,
        indicatorName: indicators[idx].name_default,
        rank: position + 1,
        total: r.ranked.length,
        year: r.year,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

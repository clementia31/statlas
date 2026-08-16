import { supabase } from './supabase';
import { getIndicatorAllYears } from './supabase';
import { normalizeMinMax, percentileRank } from './rankings-engine';

export const OVERVIEW_PRESET = [
  { slug: 'human-development-index', label: 'HDI' },
  { slug: 'gdp-nominal-per-capita-usd', label: 'GDP per capita' },
  { slug: 'population-total', label: 'Population' },
  { slug: 'life-expectancy-birth', label: 'Life expectancy' },
  { slug: 'fertility-rate', label: 'Fertility rate' },
  { slug: 'gini-index', label: 'Gini index' },
  { slug: 'gni-per-capita-ppp-2017', label: 'GNI per capita' },
  { slug: 'net-debt-gdp-percent', label: 'Net debt' },
];

export async function getBenchmarkData(countrySlugs: string[], mode: 'minmax' | 'percentile') {
  const results = await Promise.all(
    OVERVIEW_PRESET.map((i) => getIndicatorAllYears(i.slug))
  );

  const countryNames: Record<string, string> = {};
  const scoresByCountry: Record<string, number[]> = {};
  const rawByCountry: Record<string, (number | null)[]> = {};

  for (const slug of countrySlugs) {
    scoresByCountry[slug] = [];
    rawByCountry[slug] = [];
  }

  OVERVIEW_PRESET.forEach((preset, idx) => {
    const { indicator, years, yearsData } = results[idx];
    if (!indicator || years.length === 0) {
      countrySlugs.forEach((s) => {
        scoresByCountry[s].push(0);
        rawByCountry[s].push(null);
      });
      return;
    }
    const latestYear = years[years.length - 1];
    const rows = yearsData[latestYear] ?? [];
    const values = rows.map((r) => r.value);
    const higherIsBetter = indicator.higher_is_better ?? true;

    countrySlugs.forEach((slug) => {
      const row = rows.find((r) => r.slug === slug);
      if (!row) {
        scoresByCountry[slug].push(0);
        rawByCountry[slug].push(null);
        return;
      }
      countryNames[slug] = row.name;
      const score =
        mode === 'percentile'
          ? percentileRank(values, row.value, higherIsBetter)
          : normalizeMinMax(values, row.value, higherIsBetter);
      scoresByCountry[slug].push(score);
      rawByCountry[slug].push(row.value);
    });
  });

  return {
    labels: OVERVIEW_PRESET.map((p) => p.label),
    units: [] as string[],
    countryNames,
    scoresByCountry,
    rawByCountry,
    indicatorUnits: results.map((r) => r.indicator?.unit),
  };
}

export async function getAllCountriesForSelect() {
  const { data, error } = await supabase
    .from('entities')
    .select('slug, name_default')
    .eq('entity_type', 'country')
    .order('name_default', { ascending: true });
  if (error) console.error('Erreur getAllCountriesForSelect:', error.message);
  return data ?? [];
}

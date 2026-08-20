import { supabase } from './supabase';
import { getIndicatorAllYears } from './supabase';
import { normalizeMinMax, percentileRank } from './rankings-engine';

export const PRESETS: Record<string, { label: string; indicators: { slug: string; label: string }[] }> = {
  overview: {
    label: 'Overview',
    indicators: [
      { slug: 'human-development-index', label: 'HDI' },
      { slug: 'gdp-nominal-per-capita-usd', label: 'GDP per capita' },
      { slug: 'population-total', label: 'Population' },
      { slug: 'life-expectancy-birth', label: 'Life expectancy' },
      { slug: 'fertility-rate', label: 'Fertility rate' },
      { slug: 'gini-index', label: 'Gini index' },
      { slug: 'gni-per-capita-ppp-2017', label: 'GNI per capita' },
      { slug: 'net-debt-gdp-percent', label: 'Net debt' },
    ],
  },
  economy: {
    label: 'Economy',
    indicators: [
      { slug: 'gdp-nominal-usd', label: 'Nominal GDP' },
      { slug: 'gdp-nominal-per-capita-usd', label: 'GDP per capita' },
      { slug: 'gdp-ppp-per-capita-intl-dollar', label: 'GDP (PPP) per capita' },
      { slug: 'gni-per-capita-ppp-2017', label: 'GNI per capita' },
      { slug: 'net-debt-gdp-percent', label: 'Net debt' },
      { slug: 'fdi-inward-stock', label: 'Inward FDI' },
      { slug: 'gini-index', label: 'Gini index' },
      { slug: 'population-total', label: 'Population' },
    ],
  },
};

export type BenchmarkMode = 'minmax' | 'percentile' | 'base100';

export async function getBenchmarkData(countrySlugs: string[], mode: BenchmarkMode, presetKey: string) {
  const preset = PRESETS[presetKey] ?? PRESETS.overview;

  const results = await Promise.all(
    preset.indicators.map((i) => getIndicatorAllYears(i.slug))
  );

  // Pays ayant une donnée pour CHAQUE indicateur du préréglage (aucun trou)
  const nameBySlug = new Map<string, string>();
  const perIndicatorSlugSets = results.map(({ years, yearsData }) => {
    if (years.length === 0) return new Set<string>();
    const latestYear = years[years.length - 1];
    const rows = yearsData[latestYear] ?? [];
    rows.forEach((r) => {
      if (!nameBySlug.has(r.slug)) nameBySlug.set(r.slug, r.name);
    });
    return new Set(rows.map((r) => r.slug));
  });

  let completeSlugSet: Set<string> | null = null;
  for (const set of perIndicatorSlugSets) {
    completeSlugSet = completeSlugSet === null ? set : new Set([...completeSlugSet].filter((s) => set.has(s)));
  }
  const completeCountries = Array.from(completeSlugSet ?? [])
    .map((slug) => ({ slug, name_default: nameBySlug.get(slug) ?? slug }))
    .sort((a, b) => a.name_default.localeCompare(b.name_default));

  const countryNames: Record<string, string> = {};
  const scoresByCountry: Record<string, number[]> = {};
  const rawByCountry: Record<string, (number | null)[]> = {};

  for (const slug of countrySlugs) {
    scoresByCountry[slug] = [];
    rawByCountry[slug] = [];
  }

  const referenceSlug = countrySlugs[0];

  preset.indicators.forEach((p, idx) => {
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

    const referenceRow = rows.find((r) => r.slug === referenceSlug);
    const referenceValue = referenceRow?.value;

    countrySlugs.forEach((slug) => {
      const row = rows.find((r) => r.slug === slug);
      if (!row) {
        scoresByCountry[slug].push(0);
        rawByCountry[slug].push(null);
        return;
      }
      countryNames[slug] = row.name;

      let score: number;
      if (mode === 'percentile') {
        score = percentileRank(values, row.value, higherIsBetter);
      } else if (mode === 'base100') {
        score = referenceValue && referenceValue !== 0 ? Math.round((row.value / referenceValue) * 1000) / 10 : 0;
      } else {
        score = normalizeMinMax(values, row.value, higherIsBetter);
      }
      scoresByCountry[slug].push(score);
      rawByCountry[slug].push(row.value);
    });
  });

  const maxScore =
    mode === 'base100'
      ? Math.max(100, ...Object.values(scoresByCountry).flat()) * 1.1
      : 100;

  return {
    presetLabel: preset.label,
    labels: preset.indicators.map((p) => p.label),
    countryNames,
    scoresByCountry,
    rawByCountry,
    indicatorUnits: results.map((r) => r.indicator?.unit),
    maxScore,
    referenceSlug,
    completeCountries,
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

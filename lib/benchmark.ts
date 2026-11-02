import { getCountryCatalog, getYearValues } from './data';
import { normalizeMinMax, percentileRank } from './rankings-engine';

// Préréglages du benchmark : uniquement des indicateurs avec un sens « meilleur / moins bon »
export const PRESETS: Record<string, { label: string; indicators: { slug: string; label: string }[] }> = {
  development: {
    label: 'Human development',
    indicators: [
      { slug: 'human-development-index', label: 'HDI' },
      { slug: 'life-expectancy-birth', label: 'Life expectancy' },
      { slug: 'gni-per-capita-ppp-2017', label: 'GNI per capita' },
      { slug: 'gdp-ppp-per-capita-intl-dollar', label: 'GDP per capita (PPP)' },
      { slug: 'school-enrollment-secondary', label: 'Secondary schooling' },
      { slug: 'gini-index', label: 'Equality (Gini)' },
    ],
  },
  economy: {
    label: 'Economy',
    indicators: [
      { slug: 'gdp-nominal-usd', label: 'GDP' },
      { slug: 'gdp-nominal-per-capita-usd', label: 'GDP per capita' },
      { slug: 'gdp-ppp-per-capita-intl-dollar', label: 'GDP per capita (PPP)' },
      { slug: 'public-debt-gdp-percent', label: 'Low public debt' },
      { slug: 'unemployment-rate', label: 'Low unemployment' },
      { slug: 'gini-index', label: 'Equality (Gini)' },
    ],
  },
};

export type BenchmarkMode = 'percentile' | 'minmax';

export async function getBenchmarkData(countrySlugs: string[], mode: BenchmarkMode, presetKey: string) {
  const preset = PRESETS[presetKey] ?? PRESETS.development;
  const catalog = await getCountryCatalog();
  const metas = preset.indicators.map((p) => ({ ...p, meta: catalog.find((c) => c.slug === p.slug) }));
  const yearRows = await Promise.all(metas.map((m) => (m.meta?.ref_year ? getYearValues(m.slug, m.meta.ref_year) : Promise.resolve([]))));

  const names: Record<string, string> = {};
  const scores: Record<string, (number | null)[]> = {};
  const raw: Record<string, (number | null)[]> = {};
  countrySlugs.forEach((s) => {
    scores[s] = [];
    raw[s] = [];
  });

  // Pays disposant d'une valeur pour chaque indicateur du préréglage
  let complete: Set<string> | null = null;
  yearRows.forEach((rows) => {
    const set = new Set(rows.map((r) => r.entity_slug));
    complete = complete === null ? set : new Set(Array.from(complete as Set<string>).filter((s) => set.has(s)));
    rows.forEach((r) => (names[r.entity_slug] ??= r.entity_name));
  });
  const completeSet: Set<string> = complete ?? new Set<string>();

  metas.forEach((m, i) => {
    const rows = yearRows[i];
    const values = rows.map((r) => r.value);
    const hib = m.meta?.higher_is_better ?? true;
    countrySlugs.forEach((s) => {
      const row = rows.find((r) => r.entity_slug === s);
      if (!row) {
        scores[s].push(null);
        raw[s].push(null);
        return;
      }
      scores[s].push(mode === 'minmax' ? normalizeMinMax(values, row.value, hib) : percentileRank(values, row.value, hib));
      raw[s].push(row.value);
    });
  });

  return {
    preset,
    columns: metas.map((m) => ({ slug: m.slug, label: m.label, unit: m.meta?.unit ?? '', year: m.meta?.ref_year ?? null, source: m.meta?.source_name ?? '' })),
    names,
    scores,
    raw,
    completeCountries: Array.from(completeSet)
      .map((slug) => ({ slug, name_default: names[slug] ?? slug }))
      .sort((a, b) => a.name_default.localeCompare(b.name_default)),
  };
}

// Formatage des valeurs selon leur unité — une seule règle pour tout le site.

const nf = (digits: number) =>
  new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });

function abbreviateNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return nf(2).format(n / 1e12) + 'T';
  if (abs >= 1e9) return nf(2).format(n / 1e9) + 'B';
  if (abs >= 1e6) return nf(2).format(n / 1e6) + 'M';
  if (abs >= 1e4) return nf(1).format(n / 1e3) + 'K';
  return nf(0).format(n);
}

export function formatValue(value: number | null | undefined, unit?: string | null): string {
  if (value === undefined || value === null || Number.isNaN(value)) return '—';
  const u = (unit ?? '').toLowerCase();

  if (u.endsWith('million')) return '$' + abbreviateNumber(value * 1e6);
  if (u === 'people') return abbreviateNumber(value);
  if (u.startsWith('percent')) return nf(1).format(value) + '%';
  if (u === 'index (0-1)') return nf(3).format(value);
  if (u.startsWith('index')) return nf(1).format(value);
  if (u === 'years') return nf(1).format(value) + ' yrs';
  if (u === 'children per woman') return nf(2).format(value);
  if (u.includes('per sq mi')) return nf(0).format(value) + ' /mi²';
  if (u.startsWith('t co2')) return nf(2).format(value) + ' t';
  if (u === 'mt co2e') return nf(value < 10 ? 2 : value < 1000 ? 1 : 0).format(value) + ' Mt';
  if (u === 'people per km2') return nf(value < 10 ? 1 : 0).format(value) + ' /km²';
  if (u === 'km2') return abbreviateNumber(value) + ' km²';
  if (u.startsWith('per ')) return nf(value < 10 ? 2 : 1).format(value);
  if (u === 'µg/m3') return nf(1).format(value) + ' µg/m³';
  if (u.includes('dollar') || u === 'usd') return '$' + abbreviateNumber(value);
  return nf(Math.abs(value) < 10 ? 2 : 0).format(value);
}

// Variation lisible entre deux valeurs (points pour les pourcentages et indices, % sinon)
export function formatChange(current: number, previous: number, unit?: string | null): { text: string; up: boolean } {
  const u = (unit ?? '').toLowerCase();
  const diff = current - previous;
  if (u.startsWith('percent') || u.startsWith('index') || u === 'years' || u === 'children per woman') {
    const digits = u === 'index (0-1)' ? 3 : u === 'children per woman' ? 2 : 1;
    const suffix = u.startsWith('percent') ? ' pt' : u === 'years' ? ' yrs' : '';
    return { text: (diff >= 0 ? '+' : '') + nf(digits).format(diff) + suffix, up: diff >= 0 };
  }
  const pct = previous !== 0 ? (diff / Math.abs(previous)) * 100 : 0;
  return { text: (pct >= 0 ? '+' : '') + nf(1).format(pct) + '%', up: pct >= 0 };
}

// Libellé humain de l'unité
export function unitLabel(unit?: string | null): string {
  const u = (unit ?? '').toLowerCase();
  if (u === 'usd million') return 'US dollars, current prices';
  if (u === 'usd') return 'US dollars, current prices';
  if (u === 'ppp international dollar million' || u === 'ppp international dollar') return 'International dollars (PPP), current prices';
  if (u.includes('2017')) return 'International dollars (PPP, 2017 prices)';
  if (u === 'people') return 'People';
  if (u === 'percent of gdp') return '% of GDP';
  if (u === 'percent of labor force') return '% of labour force';
  if (u === 'percent') return '%';
  if (u === 'percent gross') return '% of official school-age population (gross)';
  if (u.startsWith('percent of ')) return '% of ' + unit!.slice('percent of '.length);
  if (u === 'mt co2e') return 'Million tonnes of CO2';
  if (u === 'people per km2') return 'People per square kilometre';
  if (u === 'km2') return 'Square kilometres';
  if (u === 'µg/m3') return 'Micrograms per cubic metre';
  if (u.startsWith('per ')) return unit!.charAt(0).toUpperCase() + unit!.slice(1);
  if (u.startsWith('t co2')) return 'Tonnes of CO2 per person';
  if (u === 'years') return 'Years';
  if (u === 'children per woman') return 'Children per woman';
  if (u === 'index (0-1)') return 'Index, 0 to 1';
  if (u === 'index (0-100)') return 'Index, 0 to 100';
  if (u.includes('per sq mi')) return 'People per square mile';
  return unit ?? '';
}

// Les montants (PIB, population…) s'additionnent ; les ratios et indices non
export function isAdditive(unit?: string | null): boolean {
  const u = (unit ?? '').toLowerCase();
  return u === 'people' || u.endsWith('million') || u === 'km2' || u === 'mt co2e';
}

// Nom court d'une source pour les espaces étroits
export function shortSource(name?: string | null): string {
  const n = (name ?? '').toLowerCase();
  if (n.includes('international monetary fund')) return 'IMF';
  if (n.includes('development programme')) return 'UNDP';
  if (n.includes('world population prospects')) return 'UN WPP';
  if (n === 'oecd') return 'OECD';
  if (n === 'world bank') return 'World Bank';
  return name ?? '';
}

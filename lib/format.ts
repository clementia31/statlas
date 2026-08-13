// Formatte un nombre brut en version lisible (K/M/B/T) selon son unité.

function abbreviateNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (abs >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function formatValue(value: number, unit?: string): string {
  if (value === undefined || value === null || isNaN(value)) return '—';
  const u = (unit ?? '').toLowerCase();

  if (u === 'usd million') {
    // Valeur stockée en millions -> on repasse en dollars bruts avant d'abréger
    return '$' + abbreviateNumber(value * 1e6);
  }
  if (u === 'people') {
    return abbreviateNumber(value);
  }
  if (u === 'percent of gdp') {
    return value.toFixed(1) + '%';
  }
  if (u.startsWith('index')) {
    return value.toFixed(3);
  }
  if (u === 'years') {
    return value.toFixed(1) + ' yrs';
  }
  if (u === 'children per woman') {
    return value.toFixed(2);
  }
  if (u.includes('dollar')) {
    return '$' + abbreviateNumber(value);
  }
  return value.toLocaleString();
}

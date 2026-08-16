// Moteur de transformation partagé entre Rankings et Benchmark
// (le document exige qu'ils partagent le même moteur de calcul)

export function normalizeMinMax(values: number[], value: number, higherIsBetter: boolean): number {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 50;
  let score = ((value - min) / (max - min)) * 100;
  if (!higherIsBetter) score = 100 - score;
  return Math.round(score * 10) / 10;
}

export function percentileRank(values: number[], value: number, higherIsBetter: boolean): number {
  const sorted = [...values].sort((a, b) => a - b);
  const below = sorted.filter((v) => v < value).length;
  let pct = (below / sorted.length) * 100;
  if (!higherIsBetter) pct = 100 - pct;
  return Math.round(pct * 10) / 10;
}

export function baseHundred(values: { year: string; value: number }[]): { year: string; value: number }[] {
  if (values.length === 0) return [];
  const base = values[0].value;
  if (base === 0) return values;
  return values.map((v) => ({ year: v.year, value: Math.round((v.value / base) * 1000) / 10 }));
}

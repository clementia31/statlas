'use client';

import { useEffect, useRef } from 'react';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatValue } from '@/lib/format';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

import { SERIES_COLORS } from '@/lib/colors';
export { SERIES_COLORS };

export type Series = { label: string; points: { x: number; y: number | null; projection?: boolean }[] };

export default function LineChart({ series, unit, height = 280, fill = false }: { series: Series[]; unit?: string | null; height?: number; fill?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const labels = Array.from(new Set(series.flatMap((s) => s.points.map((p) => p.x)))).sort((a, b) => a - b);
    const chart = new Chart(ref.current, {
      type: 'line',
      data: {
        labels,
        datasets: series.map((s, i) => {
          const byX = new Map(s.points.map((p) => [p.x, p]));
          const color = SERIES_COLORS[i % SERIES_COLORS.length];
          return {
            label: s.label,
            data: labels.map((x) => byX.get(x)?.y ?? null),
            borderColor: color,
            backgroundColor: fill ? color + '1A' : color,
            fill,
            tension: 0.25,
            pointRadius: 0,
            pointHoverRadius: 3,
            borderWidth: 2,
            spanGaps: true,
            segment: {
              borderDash: (ctx: any) => (byX.get(labels[ctx.p1DataIndex])?.projection ? [5, 4] : undefined),
            },
          };
        }),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: series.length > 1,
            labels: { color: '#97A3BC', boxWidth: 10, boxHeight: 10, font: { size: 11 } },
          },
          tooltip: {
            backgroundColor: '#16213A',
            borderColor: '#232F49',
            borderWidth: 1,
            titleColor: '#EEF1F6',
            bodyColor: '#EEF1F6',
            callbacks: {
              label: (ctx: any) => `${ctx.dataset.label}: ${formatValue(ctx.parsed.y, unit)}`,
            },
          },
        },
        scales: {
          x: { ticks: { color: '#5D6A88', font: { size: 10 }, maxRotation: 0, autoSkipPadding: 12 }, grid: { color: '#1B2640' } },
          y: {
            ticks: { color: '#5D6A88', font: { size: 10 }, callback: (v: any) => formatValue(Number(v), unit) },
            grid: { color: '#1B2640' },
          },
        },
      },
    });
    return () => chart.destroy();
  }, [series, unit, fill]);

  if (series.every((s) => s.points.length === 0)) {
    return <div className="flex items-center justify-center text-textMuted text-sm" style={{ height }}>No time series available.</div>;
  }
  return (
    <div style={{ height }}>
      <canvas ref={ref} />
    </div>
  );
}

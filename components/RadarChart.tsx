'use client';

import { useEffect, useRef } from 'react';
import { Chart, RadarController, LineElement, PointElement, RadialLinearScale, Legend, Filler } from 'chart.js';

Chart.register(RadarController, LineElement, PointElement, RadialLinearScale, Legend, Filler);

const COLORS = ['#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#F97316'];

export default function RadarChart({
  labels,
  datasets,
}: {
  labels: string[];
  datasets: { label: string; data: number[] }[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'radar',
      data: {
        labels,
        datasets: datasets.map((d, i) => ({
          label: d.label,
          data: d.data,
          borderColor: COLORS[i % COLORS.length],
          backgroundColor: COLORS[i % COLORS.length] + '20',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: COLORS[i % COLORS.length],
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false, stepSize: 25 },
            grid: { color: '#232F49' },
            angleLines: { color: '#232F49' },
            pointLabels: { color: '#97A3BC', font: { size: 11 } },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [labels, datasets]);

  return (
    <div className="h-[360px]">
      <canvas ref={canvasRef} />
    </div>
  );
}

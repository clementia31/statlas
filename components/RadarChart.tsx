'use client';

import { useEffect, useRef } from 'react';
import { Chart, RadarController, LineElement, PointElement, RadialLinearScale, Legend, Filler } from 'chart.js';

Chart.register(RadarController, LineElement, PointElement, RadialLinearScale, Legend, Filler);

const COLORS = ['#1F4FD1', '#D9822B', '#15171A', '#2E9C8F', '#B4381F', '#7A4FB5'];

export default function RadarChart({
  labels,
  datasets,
  max = 100,
}: {
  labels: string[];
  datasets: { label: string; data: (number | null)[] }[];
  max?: number;
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
          spanGaps: true,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: max,
            ticks: { display: false, stepSize: 25 },
            grid: { color: '#DEDAD0' },
            angleLines: { color: '#DEDAD0' },
            pointLabels: { color: '#3F4550', font: { size: 11 } },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [labels, datasets, max]);

  return (
    <div className="h-[360px]">
      <canvas ref={canvasRef} />
    </div>
  );
}

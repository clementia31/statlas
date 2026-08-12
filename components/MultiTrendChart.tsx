'use client';

import { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Legend);

const COLORS = ['#3B82F6', '#22C55E', '#EAB308', '#EF4444', '#A855F7', '#F97316'];

export default function MultiTrendChart({
  labels,
  datasets,
}: {
  labels: string[];
  datasets: { label: string; data: (number | null)[] }[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    if (chartRef.current) chartRef.current.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: datasets.map((d, i) => ({
          label: d.label,
          data: d.data,
          borderColor: COLORS[i % COLORS.length],
          pointRadius: 0,
          borderWidth: 2,
          tension: 0.3,
        })),
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: '#97A3BC', boxWidth: 10, font: { size: 11 } } },
        },
        scales: {
          x: { ticks: { color: '#5D6A88', font: { size: 10 } }, grid: { color: '#232F49' } },
          y: { ticks: { color: '#5D6A88', font: { size: 10 } }, grid: { color: '#232F49' } },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [labels, datasets]);

  return (
    <div className="h-[260px]">
      <canvas ref={canvasRef} />
    </div>
  );
}

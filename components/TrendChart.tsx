'use client';

import { useEffect, useRef } from 'react';
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler } from 'chart.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler);

export default function TrendChart({
  labels,
  values,
}: {
  labels: string[];
  values: number[];
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
        datasets: [
          {
            data: values,
            borderColor: '#22C55E',
            backgroundColor: 'rgba(34,197,94,0.08)',
            fill: true,
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#5D6A88', font: { size: 10 } }, grid: { color: '#232F49' } },
          y: { ticks: { color: '#5D6A88', font: { size: 10 } }, grid: { color: '#232F49' } },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [labels, values]);

  if (values.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-textMuted text-sm">
        No historical data available.
      </div>
    );
  }

  return (
    <div className="h-[220px]">
      <canvas ref={canvasRef} />
    </div>
  );
}

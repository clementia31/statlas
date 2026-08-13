'use client';

import { useEffect, useRef, useState } from 'react';
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import { formatValue } from '@/lib/format';

type CountryValue = { slug: string; name: string; value: number };

const NAME_OVERRIDES: Record<string, string> = {
  'United States': 'United States of America',
};

function computeThresholds(values: number[]): { low: number; high: number } {
  if (values.length === 0) return { low: 0, high: 1 };
  const sorted = [...values].sort((a, b) => a - b);
  const low = sorted[Math.floor(sorted.length * 0.33)];
  const high = sorted[Math.floor(sorted.length * 0.66)];
  return { low, high };
}

function bucketColor(v: number | undefined, low: number, high: number): string {
  if (v === undefined) return '#3A4560';
  if (v > high) return '#22C55E';
  if (v > low) return '#EAB308';
  return '#F97316';
}

export default function AnimatedWorldMap({
  years,
  yearsData,
  indicatorLabel,
  indicatorUnit,
}: {
  years: string[];
  yearsData: Record<string, CountryValue[]>;
  indicatorLabel: string;
  indicatorUnit?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [yearIndex, setYearIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1200);
  const [zoom, setZoom] = useState(1);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; value: string } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then((world) => {
        const countries = (feature(world, world.objects.countries as any) as any).features;
        setGeoData(countries);
      });
  }, []);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setYearIndex((i) => (i + 1 >= years.length ? 0 : i + 1));
      }, speedMs);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, speedMs, years.length]);

  if (!geoData || years.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-textMuted text-sm">
        {years.length === 0 ? 'No historical data available.' : 'Loading map...'}
      </div>
    );
  }

  const width = 940;
  const height = 460;
  const projection = geoNaturalEarth1().scale(155).translate([width / 2, height / 2 + 10]);
  const path = geoPath(projection as any);

  const currentYear = years[yearIndex];
  const currentData = yearsData[currentYear] ?? [];
  const valueByName = new Map<string, number>();
  for (const d of currentData) {
    const name = NAME_OVERRIDES[d.name] ?? d.name;
    valueByName.set(name, d.value);
  }
  const { low, high } = computeThresholds(currentData.map((d) => d.value));

  return (
    <div>
      <div className="relative">
        <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block overflow-hidden">
          <g style={{ transform: `scale(${zoom})`, transformOrigin: '50% 50%', transition: 'transform 0.15s' }}>
            {geoData.map((d: any, i: number) => {
              const value = valueByName.get(d.properties.name);
              return (
                <path
                  key={i}
                  d={path(d as GeoPermissibleObjects) || undefined}
                  fill={bucketColor(value, low, high)}
                  stroke="#0B1220"
                  strokeWidth={0.5}
                  onMouseMove={(e) => {
                    const rect = svgRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    setTooltip({
                      x: e.clientX - rect.left + 14,
                      y: e.clientY - rect.top - 10,
                      name: d.properties.name,
                      value: value !== undefined ? formatValue(value, indicatorUnit) : 'not available',
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </g>
        </svg>

        {tooltip && (
          <div
            className="absolute bg-panel2 border border-border rounded-lg px-4 py-3 min-w-[160px] pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="font-serif text-[15px] text-white">{tooltip.name}</div>
            <div className="text-textMuted text-[11px] mt-0.5">{indicatorLabel}</div>
            <div className="font-mono text-xl font-medium mt-1 text-white">{tooltip.value}</div>
          </div>
        )}

        <div className="absolute top-3.5 left-3.5 bg-panel/95 border border-border rounded-lg px-3 py-1.5 font-mono text-lg text-white">
          {currentYear}
          <span className="text-textMuted text-[10px] ml-2">({yearIndex + 1}/{years.length})</span>
        </div>

        <div className="absolute right-3.5 top-3.5 flex flex-col gap-1">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
            className="w-7 h-7 bg-panel2 border border-border rounded text-textSecondary hover:text-white text-sm"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
            className="w-7 h-7 bg-panel2 border border-border rounded text-textSecondary hover:text-white text-sm"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            onClick={() => setZoom(1)}
            className="w-7 h-7 bg-panel2 border border-border rounded text-textSecondary hover:text-white text-xs"
            aria-label="Reset zoom"
          >
            ⟲
          </button>
        </div>

        <div className="absolute left-3.5 bottom-3.5 bg-panel/95 border border-border rounded-lg px-3 py-2.5 text-[11px]">
          <div className="text-textSecondary font-medium mb-1.5">{indicatorLabel}</div>
          <div className="flex items-center gap-1.5 py-0.5 text-textSecondary">
            <span className="w-2.5 h-2.5 rounded-sm bg-green shrink-0" /> top third
          </div>
          <div className="flex items-center gap-1.5 py-0.5 text-textSecondary">
            <span className="w-2.5 h-2.5 rounded-sm bg-yellow shrink-0" /> middle third
          </div>
          <div className="flex items-center gap-1.5 py-0.5 text-textSecondary">
            <span className="w-2.5 h-2.5 rounded-sm bg-orange shrink-0" /> bottom third
          </div>
          <div className="flex items-center gap-1.5 py-0.5 text-textSecondary">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#3A4560] shrink-0" /> not available
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="w-9 h-9 flex items-center justify-center rounded-md bg-panel2 border border-border text-white text-sm shrink-0"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <input
          type="range"
          min={0}
          max={years.length - 1}
          value={yearIndex}
          onChange={(e) => {
            setPlaying(false);
            setYearIndex(Number(e.target.value));
          }}
          className="flex-1"
        />
        <span className="font-mono text-xs text-textMuted w-24 text-right shrink-0">
          {years[0]}–{years[years.length - 1]}
        </span>
        <select
          value={speedMs}
          onChange={(e) => setSpeedMs(Number(e.target.value))}
          className="bg-panel2 border border-border rounded-md px-2 py-1 text-xs font-mono text-textSecondary shrink-0"
        >
          <option value={2000}>Slow</option>
          <option value={1200}>Normal</option>
          <option value={600}>Fast</option>
        </select>
      </div>
    </div>
  );
}

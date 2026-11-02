'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { feature } from 'topojson-client';
import { formatValue } from '@/lib/format';
import { isoNumeric } from '@/lib/iso';

export type MapDatum = { slug: string; name: string; iso: string | null; value: number; projection?: boolean };

// Palette séquentielle (5 classes) : plus foncé = valeur plus élevée, sans jugement bon/mauvais
const PALETTE = ['#1E3A5F', '#1F5F8B', '#2B86B4', '#4FB0D6', '#9BDCF2'];
const NO_DATA = '#273148';

let worldCache: any[] | null = null;

function useWorld() {
  const [world, setWorld] = useState<any[] | null>(worldCache);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (worldCache) return;
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json')
      .then((r) => r.json())
      .then((topo) => {
        worldCache = (feature(topo, topo.objects.countries as any) as any).features.filter(
          (f: any) => f.properties?.name !== 'Antarctica'
        );
        setWorld(worldCache);
      })
      .catch(() => setFailed(true));
  }, []);
  return { world, failed };
}

function quantileBreaks(values: number[]): number[] {
  if (values.length === 0) return [];
  const s = [...values].sort((a, b) => a - b);
  return [0.2, 0.4, 0.6, 0.8].map((q) => s[Math.min(s.length - 1, Math.floor(s.length * q))]);
}

function classOf(v: number, breaks: number[]) {
  let i = 0;
  while (i < breaks.length && v >= breaks[i]) i++;
  return i;
}

export default function ChoroplethMap({
  data,
  unit,
  label,
  height = 460,
  scaleValues,
}: {
  data: MapDatum[];
  unit?: string | null;
  label: string;
  height?: number;
  scaleValues?: number[]; // valeurs servant à fixer l'échelle (ex. toutes les années pour l'animation)
}) {
  const router = useRouter();
  const { world, failed } = useWorld();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; name: string; value: string; projection?: boolean } | null>(null);
  const [zoom, setZoom] = useState(1);

  const width = 960;
  const projection = useMemo(() => geoNaturalEarth1().scale(175).translate([width / 2, height / 2 + 20]), [height]);
  const path = useMemo(() => geoPath(projection as any), [projection]);

  const { byNum, byName, breaks } = useMemo(() => {
    const byNum = new Map<string, MapDatum>();
    const byName = new Map<string, MapDatum>();
    for (const d of data) {
      const n = isoNumeric(d.iso);
      if (n) byNum.set(n, d);
      byName.set(d.name.toLowerCase(), d);
    }
    return { byNum, byName, breaks: quantileBreaks(scaleValues ?? data.map((d) => d.value)) };
  }, [data, scaleValues]);

  if (failed) return <div className="h-[300px] flex items-center justify-center text-textMuted text-sm">Map could not be loaded.</div>;
  if (!world) return <div className="aspect-[2/1] w-full animate-pulse rounded-lg bg-panel2/60" aria-label="Loading map" />;

  const lookup = (f: any): MapDatum | undefined => byNum.get(String(f.id)) ?? byName.get(String(f.properties?.name ?? '').toLowerCase());

  const scale = scaleValues ?? data.map((d) => d.value);
  const legend = [0, 1, 2, 3, 4].map((i) => {
    const lo = i === 0 ? Math.min(...scale) : breaks[i - 1];
    const hi = i === 4 ? Math.max(...scale) : breaks[i];
    return { color: PALETTE[i], text: `${formatValue(lo, unit)} – ${formatValue(hi, unit)}` };
  });

  return (
    <div ref={wrapRef} className="relative select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block" role="img" aria-label={`World map: ${label}`}>
        <g style={{ transform: `scale(${zoom})`, transformOrigin: '50% 45%', transition: 'transform .2s' }}>
          {world.map((f: any, i: number) => {
            const d = lookup(f);
            return (
              <path
                key={i}
                d={path(f as GeoPermissibleObjects) || undefined}
                fill={d ? PALETTE[classOf(d.value, breaks)] : NO_DATA}
                stroke="#0B1220"
                strokeWidth={0.5 / zoom}
                className={d ? 'cursor-pointer hover:opacity-80' : ''}
                onClick={() => d && router.push(`/pays/${d.slug}`)}
                onMouseMove={(e) => {
                  const r = wrapRef.current?.getBoundingClientRect();
                  if (!r) return;
                  const x = Math.min(e.clientX - r.left + 12, r.width - 190);
                  setTip({
                    x,
                    y: e.clientY - r.top + 12,
                    name: d?.name ?? f.properties?.name,
                    value: d ? formatValue(d.value, unit) : 'No data',
                    projection: d?.projection,
                  });
                }}
                onMouseLeave={() => setTip(null)}
              />
            );
          })}
        </g>
      </svg>

      {tip && (
        <div className="absolute z-10 pointer-events-none rounded-lg border border-border bg-panel2/95 px-3 py-2 shadow-xl min-w-[150px]" style={{ left: tip.x, top: tip.y }}>
          <div className="text-[13px] text-white font-medium">{tip.name}</div>
          <div className="font-mono text-[15px] text-white mt-0.5">{tip.value}</div>
          {tip.projection && <div className="text-[10.5px] text-yellow mt-0.5">Projection</div>}
        </div>
      )}

      <div className="absolute right-2 top-2 flex flex-col gap-1">
        {[
          { l: '+', a: 'Zoom in', f: () => setZoom((z) => Math.min(z + 0.5, 4)) },
          { l: '−', a: 'Zoom out', f: () => setZoom((z) => Math.max(z - 0.5, 1)) },
          { l: '⟲', a: 'Reset zoom', f: () => setZoom(1) },
        ].map((b) => (
          <button key={b.a} type="button" onClick={b.f} aria-label={b.a} className="w-7 h-7 rounded-md border border-border bg-panel2/90 text-textSecondary hover:text-white text-sm">
            {b.l}
          </button>
        ))}
      </div>

      {data.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-textSecondary">
          {legend.map((l) => (
            <span key={l.color} className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
              {l.text}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ background: NO_DATA }} />
            No data
          </span>
        </div>
      )}
    </div>
  );
}

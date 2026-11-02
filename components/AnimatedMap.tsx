'use client';

import { useEffect, useMemo, useState } from 'react';
import ChoroplethMap, { type MapDatum } from './ChoroplethMap';

export default function AnimatedMap({
  years,
  frames,
  unit,
  label,
  initialYear,
}: {
  years: number[];
  frames: Record<number, MapDatum[]>;
  unit?: string | null;
  label: string;
  initialYear: number;
}) {
  const [idx, setIdx] = useState(Math.max(0, years.indexOf(initialYear)));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(900);

  const allValues = useMemo(() => Object.values(frames).flat().map((d) => d.value), [frames]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setIdx((i) => {
        if (i >= years.length - 1) {
          setPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, speed);
    return () => clearInterval(t);
  }, [playing, speed, years.length]);

  const year = years[idx];
  const data = frames[year] ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <button
          type="button"
          onClick={() => {
            if (idx >= years.length - 1) setIdx(0);
            setPlaying((p) => !p);
          }}
          className="inline-flex h-11 items-center rounded-lg bg-accent px-4 text-[14px] font-medium text-white hover:bg-accent/90"
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <div className="font-mono text-[22px] text-text w-[64px]">{year}</div>
        <input
          type="range"
          min={0}
          max={years.length - 1}
          value={idx}
          onChange={(e) => {
            setPlaying(false);
            setIdx(Number(e.target.value));
          }}
          aria-label="Year"
          className="flex-1 min-w-[160px] accent-[#1F4FD1]"
        />
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          aria-label="Speed"
          className="h-11 rounded-lg border border-borderStrong bg-panel px-2 text-[14px] text-text"
        >
          <option value={1600}>Slow</option>
          <option value={900}>Normal</option>
          <option value={400}>Fast</option>
        </select>
      </div>
      <div className="text-[13px] text-textMuted mb-2">
        {data.length} countries with data in {year}
        {data.some((d) => d.projection) ? ' · includes projections' : ''}
      </div>
      <ChoroplethMap data={data} unit={unit} label={`${label} (${year})`} scaleValues={allValues} />
    </div>
  );
}

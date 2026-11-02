'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Flag from './ui/Flag';

export type DirCountry = { slug: string; name: string; iso: string | null; region: string };

export default function CountryDirectory({ countries }: { countries: DirCountry[] }) {
  const [q, setQ] = useState('');
  const [region, setRegion] = useState('All');
  const regions = useMemo(() => ['All', ...Array.from(new Set(countries.map((c) => c.region))).sort()], [countries]);

  const filtered = countries.filter(
    (c) => (region === 'All' || c.region === region) && c.name.toLowerCase().includes(q.toLowerCase().trim())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter countries…"
          aria-label="Filter countries"
          className="flex-1 rounded-lg border border-borderStrong bg-panel h-11 px-3 text-[14px] text-text placeholder:text-textMuted outline-none focus:border-accent"
        />
        <div className="flex flex-wrap gap-1.5">
          {regions.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRegion(r)}
              aria-pressed={region === r}
              className={`inline-flex h-10 items-center rounded-full border px-4 text-[14px] ${
                region === r ? 'border-text bg-text text-white' : 'border-borderStrong bg-panel text-text hover:border-accent'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="text-[13px] text-textMuted mb-3">{filtered.length} countries</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {filtered.map((c) => (
          <Link
            key={c.slug}
            href={`/pays/${c.slug}`}
            className="flex items-center gap-3 rounded-lg border border-border bg-panel px-3 py-2.5 hover:border-accent transition-colors"
          >
            <Flag iso={c.iso} size="md" />
            <span className="min-w-0">
              <span className="block text-[14px] text-text truncate">{c.name}</span>
              <span className="block text-[12px] text-textMuted">{c.region}</span>
            </span>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-textMuted text-sm mt-6">No country matches your filter.</div>}
    </div>
  );
}

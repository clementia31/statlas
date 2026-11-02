'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Flag from './ui/Flag';
import { formatValue } from '@/lib/format';

export type CompareColumn = { slug: string; label: string; unit: string; year: number | null };
export type CompareRow = { slug: string; name: string; iso: string | null; values: Record<string, number | undefined> };

export default function CompareTable({ columns, rows }: { columns: CompareColumn[]; rows: CompareRow[] }) {
  const [sortKey, setSortKey] = useState<string>('name');
  const [desc, setDesc] = useState(false);
  const [q, setQ] = useState('');

  const sorted = useMemo(() => {
    const f = rows.filter((r) => r.name.toLowerCase().includes(q.toLowerCase().trim()));
    return f.sort((a, b) => {
      if (sortKey === 'name') return desc ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      const va = a.values[sortKey];
      const vb = b.values[sortKey];
      if (va === undefined && vb === undefined) return 0;
      if (va === undefined) return 1; // les valeurs manquantes toujours en bas
      if (vb === undefined) return -1;
      return desc ? vb - va : va - vb;
    });
  }, [rows, sortKey, desc, q]);

  function toggle(key: string) {
    if (key === sortKey) setDesc((d) => !d);
    else {
      setSortKey(key);
      setDesc(key !== 'name');
    }
  }

  const arrow = (key: string) => (sortKey === key ? (desc ? ' ↓' : ' ↑') : '');

  return (
    <div>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Filter countries…"
        aria-label="Filter countries"
        className="mb-3 w-full sm:w-72 rounded-lg border border-border bg-panel2 px-3 py-2 text-[13px] text-white placeholder:text-textMuted outline-none focus:border-accent"
      />
      <div className="overflow-auto max-h-[70vh] rounded-lg border border-border">
        <table className="w-full min-w-[860px] text-[13px]">
          <thead className="sticky top-0 z-10 bg-panel">
            <tr className="border-b border-border text-[11px] text-textMuted">
              <th className="sticky left-0 bg-panel text-left font-medium px-3 py-2.5">
                <button type="button" onClick={() => toggle('name')} className="hover:text-white">
                  Country{arrow('name')}
                </button>
              </th>
              {columns.map((c) => (
                <th key={c.slug} className="text-right font-medium px-3 py-2.5 align-bottom">
                  <button type="button" onClick={() => toggle(c.slug)} className="hover:text-white text-right">
                    {c.label}
                    {arrow(c.slug)}
                    <span className="block text-[10px] text-textMuted/80 font-normal">{c.year ?? ''}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.slug} className="border-b border-border/60 hover:bg-panel2/50">
                <td className="sticky left-0 bg-bg/95 px-3 py-2">
                  <Link href={`/pays/${r.slug}`} className="inline-flex items-center gap-2 text-white hover:text-accent">
                    <Flag iso={r.iso} />
                    <span className="truncate max-w-[180px]">{r.name}</span>
                  </Link>
                </td>
                {columns.map((c) => (
                  <td key={c.slug} className="px-3 py-2 text-right font-mono text-white whitespace-nowrap">
                    {r.values[c.slug] !== undefined ? formatValue(r.values[c.slug], c.unit) : <span className="text-textMuted">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-[12px] text-textMuted">{sorted.length} countries · click a column to sort</div>
    </div>
  );
}

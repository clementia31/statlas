'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const INDICATORS = [
  { slug: 'human-development-index', label: 'IDH' },
  { slug: 'gdp-nominal-usd', label: 'PIB nominal' },
  { slug: 'fertility-rate', label: 'Fécondité' },
];

export default function TopBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentIndicator = searchParams.get('indicator') ?? 'human-development-index';

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(`/?indicator=${e.target.value}`);
  }

  return (
    <div className="h-[54px] border-b border-border flex items-center gap-3.5 px-[22px] shrink-0">
      <input
        type="text"
        placeholder="Rechercher un indicateur, un pays..."
        className="flex-1 max-w-[380px] bg-panel2 border border-border rounded-md px-3 py-1.5 text-[13px] text-textSecondary outline-none"
      />
      <select
        value={currentIndicator}
        onChange={handleChange}
        className="bg-panel2 border border-border rounded-md px-3 py-1.5 text-xs font-mono text-textSecondary"
      >
        {INDICATORS.map((i) => (
          <option key={i.slug} value={i.slug}>{i.label}</option>
        ))}
      </select>
      <select className="bg-panel2 border border-border rounded-md px-3 py-1.5 text-xs font-mono text-textSecondary">
        <option>2024</option>
        <option>2023</option>
        <option>2020</option>
      </select>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';

const GROUPS: { title: string; items: { label: string; href: string }[] }[] = [
  {
    title: 'Explore',
    items: [
      { label: 'Overview', href: '/' },
      { label: 'Indicators', href: '/indicateurs' },
      { label: 'Map', href: '/carte' },
      { label: 'Countries', href: '/pays' },
    ],
  },
  {
    title: 'Compare',
    items: [
      { label: 'Comparisons', href: '/comparaisons' },
      { label: 'Rankings', href: '/rankings' },
      { label: 'Benchmark', href: '/benchmark' },
    ],
  },
  {
    title: 'Read',
    items: [
      { label: 'The Gazette', href: '/gazette' },
      { label: 'Bibliography', href: '/bibliographie' },
    ],
  },
  {
    title: 'Data',
    items: [{ label: 'Export & API', href: '/api-export' }],
  },
];

function SearchBox({ onDone }: { onDone?: () => void }) {
  return (
    <form action="/search" method="get" onSubmit={onDone} role="search">
      <label htmlFor="global-search" className="sr-only">
        Search
      </label>
      <input
        id="global-search"
        name="q"
        type="search"
        placeholder="Search countries, indicators…"
        className="w-full bg-panel2 border border-border rounded-lg px-3 py-2 text-[13px] text-text placeholder:text-textMuted outline-none focus:border-accent"
      />
    </form>
  );
}

function Links({ active, onNavigate }: { active: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Main">
      {GROUPS.map((g) => (
        <div key={g.title} className="mb-4">
          <div className="px-3 mb-1 text-[10px] uppercase tracking-[0.12em] text-textMuted">{g.title}</div>
          {g.items.map((item) => {
            const isActive = item.label === active;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                className={`block rounded-md px-3 py-2 text-[13px] transition-colors ${
                  isActive ? 'bg-panel2 text-white font-medium' : 'text-textSecondary hover:text-white hover:bg-panel2/60'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

export default function Nav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Ordinateur : barre latérale fixe */}
      <aside className="hidden lg:flex lg:flex-col w-[232px] shrink-0 border-r border-border bg-panel sticky top-0 h-screen">
        <Link href="/" className="px-5 pt-5 pb-4 block">
          <span className="font-serif text-[22px] text-white">Statlas</span>
          <span className="block text-[11px] text-textMuted mt-0.5">Sourced world statistics</span>
        </Link>
        <div className="px-4 mb-4">
          <SearchBox />
        </div>
        <div className="px-2 overflow-y-auto flex-1">
          <Links active={active} />
        </div>
        <div className="px-5 py-3 border-t border-border text-[11px] text-textMuted">
          Data: IMF, World Bank, UNDP, OECD, UN
        </div>
      </aside>

      {/* Mobile et tablette : en-tête + menu déroulant */}
      <header className="lg:hidden sticky top-0 z-40 bg-panel/95 backdrop-blur border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="font-serif text-xl text-white">
            Statlas
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="rounded-md border border-border px-3 py-1.5 text-[13px] text-textSecondary hover:text-white"
          >
            {open ? 'Close' : 'Menu'}
          </button>
        </div>
        {open && (
          <div id="mobile-menu" className="px-3 pb-4 border-t border-border max-h-[80vh] overflow-y-auto">
            <div className="py-3">
              <SearchBox onDone={() => setOpen(false)} />
            </div>
            <Links active={active} onNavigate={() => setOpen(false)} />
          </div>
        )}
      </header>
    </>
  );
}

'use client';

import Link from 'next/link';
import { useState } from 'react';

// Navigation principale (direction A : barre horizontale en haut)
const ITEMS: { label: string; href: string; match: string[] }[] = [
  { label: 'Overview', href: '/', match: ['Overview'] },
  { label: 'Indicators', href: '/indicateurs', match: ['Indicators'] },
  { label: 'Map', href: '/carte', match: ['Map'] },
  { label: 'Countries', href: '/pays', match: ['Countries'] },
  { label: 'Rankings', href: '/rankings', match: ['Rankings'] },
  { label: 'Compare', href: '/comparaisons', match: ['Comparisons', 'Benchmark', 'Compare'] },
  { label: 'The Gazette', href: '/gazette', match: ['The Gazette'] },
];

function SearchBox({ id, onDone }: { id: string; onDone?: () => void }) {
  return (
    <form action="/search" method="get" onSubmit={onDone} role="search" className="w-full">
      <label htmlFor={id} className="sr-only">
        Search
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Search a country or indicator"
        className="w-full h-11 lg:h-10 rounded-lg border border-borderStrong bg-panel px-3.5 text-[14px] text-text placeholder:text-textMuted outline-none focus:border-accent"
      />
    </form>
  );
}

export default function Nav({ active }: { active: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-[64px] max-w-[1280px] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-serif text-[24px] font-semibold tracking-tight text-text">
          Statlas
        </Link>

        <nav aria-label="Main" className="hidden lg:flex flex-1 items-center gap-6 text-[14px]">
          {ITEMS.map((item) => {
            const isActive = item.match.includes(active);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`py-1 border-b-2 transition-colors ${
                  isActive ? 'border-text font-semibold text-text' : 'border-transparent text-textSecondary hover:text-text'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:block w-[260px] shrink-0">
          <SearchBox id="global-search" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="lg:hidden ml-auto flex h-11 w-11 items-center justify-center rounded-lg border border-borderStrong bg-panel"
        >
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="lg:hidden border-t border-border bg-bg px-4 pb-5 max-h-[80vh] overflow-y-auto">
          <div className="py-4">
            <SearchBox id="mobile-search" onDone={() => setOpen(false)} />
          </div>
          <nav aria-label="Main">
            {[...ITEMS, { label: 'Benchmark', href: '/benchmark', match: ['Benchmark'] }].map((item) => {
              const isActive = item.label === 'Compare' ? active === 'Comparisons' || active === 'Compare' : item.match.includes(active);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex h-12 items-center border-b border-border text-[16px] ${isActive ? 'font-semibold text-text' : 'text-textSecondary'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

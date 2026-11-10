import Link from 'next/link';

const NAV = [
  ['Calendar', '/studio'],
  ['Publications', '/studio/publications'],
  ['Metrics', '/studio/metrics'],
  ['Organisation', '/studio/organisation'],
  ['Articles', '/admin'],
] as const;

export default function StudioShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="border-b border-border bg-panel">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-1 px-4 sm:px-6">
          <Link href="/studio" className="flex min-h-[56px] items-baseline gap-2.5 py-3">
            <span className="font-serif text-[24px] font-bold leading-none">Studio</span>
            <span className="hidden text-[12px] text-textMuted sm:inline">Statlas · Gazette · MyInvesta</span>
          </Link>
          <nav className="flex flex-1 gap-1 overflow-x-auto">
            {NAV.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className={`flex h-11 shrink-0 items-center px-2.5 text-[14.5px] ${active === label ? 'font-semibold underline decoration-2 underline-offset-[10px]' : 'text-textSecondary hover:text-text'}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <a href="https://www.statlasresearch.com" target="_blank" rel="noopener" className="hidden h-11 items-center text-[13.5px] text-textSecondary hover:text-text md:flex">
            View public site ↗
          </a>
          <span className="hidden h-11 items-center text-[13.5px] text-textMuted md:flex">Private</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-4 pb-20 pt-7 sm:px-6">{children}</main>
    </div>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="text-[11.5px] font-semibold uppercase tracking-[0.16em] text-accent">{children}</div>;
}

export function Notice({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 rounded-lg border border-[#E7D9A8] bg-[#FDF6DC] px-4 py-3 text-[13.5px] text-[#5C4300]">{children}</p>;
}

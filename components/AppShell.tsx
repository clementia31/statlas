import Link from 'next/link';
import Nav from './Nav';

export default function AppShell({ active, children, paper = false }: { active: string; children: React.ReactNode; paper?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav active={active} />
      <main className={paper ? 'flex-1 bg-paper text-ink' : 'flex-1'}>
        {paper ? children : <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8 py-8 lg:py-10">{children}</div>}
      </main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 px-4 py-6 text-[14px] text-textMuted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>
            <span className="font-serif text-[16px] font-semibold text-text">Statlas</span> · Sourced world statistics from the IMF, World Bank, UNDP, OECD and UN.
          </span>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/benchmark" className="hover:text-accent">Benchmark</Link>
            <Link href="/bibliographie" className="hover:text-accent">Bibliography</Link>
            <Link href="/api-export" className="hover:text-accent">Export &amp; API</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

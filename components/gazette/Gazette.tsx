import Link from 'next/link';

// Éléments de mise en page « journal » de la Gazette

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function editionDate() {
  const now = new Date();
  return {
    long: now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }),
    short: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' }),
    volume: ROMAN[Math.max(0, Math.min(ROMAN.length - 1, now.getFullYear() - 2026))],
  };
}

export function GazettePage({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div className={`mx-auto w-full px-4 sm:px-8 lg:px-10 pt-6 pb-16 ${narrow ? 'max-w-[1180px]' : 'max-w-[1180px]'}`}>{children}</div>;
}

export function Masthead({ domains }: { domains: { slug: string; name: string }[] }) {
  const d = editionDate();
  return (
    <div>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 pb-2.5 font-sans text-[11px] uppercase tracking-[0.16em] text-inkMuted">
        <span>Vol. {d.volume}</span>
        <span className="hidden sm:inline">{d.long}</span>
        <span className="sm:hidden">{d.short}</span>
        <span className="hidden md:inline">Free of charge · Every figure sourced</span>
      </div>
      <div className="h-[7px] border-t-[3px] border-b border-ink" />
      <div className="py-5 sm:py-7 text-center">
        <h1 className="font-masthead text-[44px] sm:text-[72px] lg:text-[88px] leading-none tracking-[0.005em]">The Statlas Gazette</h1>
        <p className="mt-2.5 font-headline italic text-[15px] sm:text-[19px] text-inkSoft">“A quantitative journal of the world” — Est. 2026</p>
      </div>
      <nav
        aria-label="Gazette sections"
        className="flex gap-x-1 overflow-x-auto sm:flex-wrap sm:justify-center border-t border-ink font-sans text-[12px] uppercase tracking-[0.14em] whitespace-nowrap"
      >
        {domains.map((dm) => (
          <Link key={dm.slug} href={`/gazette/${dm.slug}`} className="inline-flex h-11 items-center px-2.5 hover:text-press">
            {dm.name}
          </Link>
        ))}
      </nav>
      <DoubleRule />
    </div>
  );
}

export function DoubleRule({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`h-[5px] border-y border-ink ${className}`} />;
}

export function CompactMasthead({ section }: { section?: string }) {
  return (
    <div>
    <div className="flex items-center justify-between gap-4 pb-2.5">
      <Link href="/gazette" className="font-masthead text-[26px] sm:text-[34px] leading-none hover:text-press">
        The Statlas Gazette
      </Link>
      {section && <span className="hidden sm:inline font-sans text-[11px] uppercase tracking-[0.16em] text-inkMuted">{section}</span>}
    </div>
    <DoubleRule />
    </div>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-press">{children}</div>;
}

export function Ornament() {
  return (
    <div aria-hidden="true" className="my-6 text-center tracking-[0.6em] text-ruleStrong">
      ✦ ✦ ✦
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em]">{children}</div>;
}

// Fiches de référence : on affiche l'année de l'œuvre décrite ; sinon l'année de publication.
export function articleYear(a: { published_at?: string | null; reference_year?: number | null }) {
  return a.reference_year != null ? String(a.reference_year) : a.published_at?.slice(0, 4) ?? '';
}

export function articleDate(a: { published_at?: string | null; reference_year?: number | null }) {
  if (a.reference_year != null) return String(a.reference_year);
  if (!a.published_at) return '';
  const d = new Date(`${a.published_at.slice(0, 10)}T00:00:00Z`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function typeLabel(t?: string | null) {
  if (!t) return '';
  return t.replace(/_/g, ' ');
}

export function ArticleList({
  articles,
}: {
  articles: { slug: string; title: string; article_type?: string | null; published_at?: string | null; reference_year?: number | null }[];
}) {
  return (
    <ol className="border-t border-ink">
      {articles.map((a) => (
        <li key={a.slug} className="border-b border-rule">
          <Link href={`/gazette/${a.slug}`} className="flex min-h-[52px] items-baseline gap-4 py-3 hover:text-press">
            <span className="w-12 shrink-0 font-mono text-[13px] text-press">{articleYear(a)}</span>
            <span className="flex-1 font-headline text-[20px] font-semibold leading-snug">{a.title}</span>
            {a.article_type && (
              <span className="hidden sm:inline shrink-0 font-sans text-[11px] uppercase tracking-[0.14em] text-inkMuted">{typeLabel(a.article_type)}</span>
            )}
          </Link>
        </li>
      ))}
    </ol>
  );
}

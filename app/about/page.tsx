import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { CONTACT_EMAIL, X_URL } from '@/lib/site';

export const metadata = {
  title: 'About & methodology | Statlas',
  description:
    'The rules Statlas follows: one named source per indicator, nothing invented, projections flagged, licences checked, no country favoured.',
  alternates: { canonical: '/about' },
};

const RULES: [string, string][] = [
  ['One source per indicator', 'Each indicator comes from a single, named organisation. We never blend two sources into one series, so a figure can always be traced back to where it was published.'],
  ['Nothing is invented', 'If the source gives no value for a country or a year, the cell stays empty. We do not estimate, round up or fill gaps.'],
  ['Projections are flagged', 'Forecasts published by a source are marked as projections and kept apart from observed values, in tables and in charts.'],
  ['“Statlas Research” means we computed it', 'When a figure is counted, combined or cross-referenced by us, the credit reads Statlas Research. Otherwise the credit is the original source, and only the original source.'],
  ['Licence checked before anything is loaded', 'We read the reuse terms of every dataset first and record them in the Bibliography. Datasets whose terms do not allow republication are not imported.'],
  ['No country is favoured', 'A chart or ranking never highlights a country that is not part of the data shown. Countries appear in the order the figures give them.'],
  ['World and regional totals are published, not computed', 'The lines for the world and for regions are the aggregates released by the World Bank. We do not build our own.'],
  ['Rankings compare countries with countries', 'Rankings, maps and lists include countries and territories only. World, regions and former states are shown apart.'],
  ['Every indicator has an update rhythm', 'Each indicator records how often its source is revised and when we last checked it. A new value can take up to one hour to appear on the site.'],
];

const CONVENTIONS: [string, string][] = [
  ['Countries and territories', '237 entries: sovereign states and the territories the United Nations reports on separately, each with its own page.'],
  ['Former states', 'The Soviet Union, Yugoslavia, Czechoslovakia, West and East Germany are kept as historical entries, with their dates and successor states.'],
  ['Year shown', 'Rankings use the latest year with broad coverage for that indicator. The year is always written next to the figure.'],
  ['Currency', 'When a country uses several currencies, the page shows the one most widely used.'],
  ['Rankings by country of birth', 'An overseas territory counts for its country.'],
  ['Original works', 'When a dataset asks for the underlying studies to be cited, as the Maddison Project does, the full list is one click away under the chart.'],
];

const card = 'rounded-xl border border-border bg-panel p-6';
const cardTitle = 'font-serif text-[22px] font-semibold text-text';
const cardText = 'mt-2.5 text-[15px] leading-relaxed text-textSecondary';

export default function AboutPage() {
  return (
    <AppShell active="">
      <div className="text-[13px] text-textMuted">About</div>
      <h1 className="mt-2.5 font-serif text-[34px] sm:text-[48px] font-semibold leading-[1.05] tracking-[-0.02em] text-text">About &amp; methodology</h1>
      <p className="mt-4 max-w-[760px] text-[17px] sm:text-[19px] leading-[1.55] text-textSecondary">
        Statlas is a library of world statistics. Every figure on this site can be traced to the organisation that published it. This page lists the rules we hold
        ourselves to.
      </p>
      <p className="mt-3.5 max-w-[760px] text-[16px] sm:text-[17px] leading-[1.6] text-textSecondary">
        Why statistics? Every country tells the world’s story from its own point of view. We use numbers to step outside that view: to read events, follow change
        over time and compare countries with the same measure and the same source for everyone.
      </p>

      <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 border-t-2 border-text border-b border-b-border">
        {[
          ['237', 'countries and territories'],
          ['1', 'source per indicator, always named'],
          ['Free', 'to read and to download'],
        ].map(([n, label]) => (
          <div key={label} className="py-5 pr-6">
            <div className="font-serif text-[34px] font-semibold text-text">{n}</div>
            <div className="mt-1 text-[14px] text-textSecondary">{label}</div>
          </div>
        ))}
      </section>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14 items-start">
        <section className="lg:col-span-2 min-w-0">
          <h2 className="mb-4 font-serif text-[26px] sm:text-[30px] font-semibold text-text">The rules we follow</h2>
          <ol className="border-b border-border">
            {RULES.map(([title, text], i) => (
              <li key={title} className="grid grid-cols-[36px_minmax(0,1fr)] sm:grid-cols-[56px_minmax(0,1fr)] gap-3 sm:gap-5 border-t border-border py-5">
                <span className="pt-1 font-mono text-[14px] text-textMuted">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-serif text-[20px] sm:text-[22px] font-semibold leading-tight text-text">{title}</h3>
                  <p className="mt-2 max-w-[720px] text-[16px] leading-[1.6] text-textSecondary">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="grid grid-cols-1 gap-6 min-w-0">
          <section className={card}>
            <h2 className={cardTitle}>Who is behind Statlas</h2>
            <p className={cardText}>
              Statlas is an independent, non-commercial project published under the name Statlas Research. It is not affiliated with any of the organisations it
              cites.
            </p>
          </section>
          <section id="contact" className={card}>
            <h2 className={cardTitle}>Contact and corrections</h2>
            <p className={cardText}>Found a figure that does not match its source? Send us the page and the number. We check it against the source and correct it.</p>
            <div className="mt-4 grid grid-cols-1 gap-2.5">
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex h-11 items-center rounded-lg bg-text px-4 text-[14px] font-medium text-white hover:opacity-90 break-all">
                {CONTACT_EMAIL}
              </a>
              <a href={X_URL} target="_blank" rel="noopener noreferrer" className="flex h-11 items-center rounded-lg border border-borderStrong bg-panel px-4 text-[14px] font-medium text-text hover:border-accent hover:text-accent">
                @statlasresearch on X
              </a>
            </div>
          </section>
          <section className={card}>
            <h2 className={cardTitle}>Your privacy</h2>
            <p className={cardText}>No cookies and no accounts. We count visits as daily totals by page, origin and country. Nothing that identifies a reader is kept beyond the day.</p>
          </section>
          <section className={card}>
            <h2 className={cardTitle}>Sources and licences</h2>
            <p className={cardText}>The Bibliography lists every source, its publisher and its licence.</p>
            <Link href="/bibliography" className="mt-1.5 inline-flex h-11 items-center text-[14px] font-semibold text-accent hover:underline">
              Open the Bibliography →
            </Link>
          </section>
        </aside>
      </div>

      <section className="mt-14">
        <h2 className="mb-5 font-serif text-[26px] sm:text-[30px] font-semibold text-text">Conventions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
          {CONVENTIONS.map(([title, text]) => (
            <div key={title} className="border-t-2 border-text pt-3.5">
              <h3 className="text-[15px] font-semibold text-text">{title}</h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-textSecondary">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 max-w-[760px] border-t border-border pt-7">
        <h2 className="font-serif text-[26px] sm:text-[30px] font-semibold text-text">The Gazette</h2>
        <p className="mt-3 text-[16px] leading-[1.6] text-textSecondary">
          <Link href="/gazette" className="text-accent hover:underline">The Gazette</Link> is the editorial side of Statlas: essays and reference pieces on the
          quantitative study of the world. Its charts follow the same rules as the rest of the site, and each one names its source.
        </p>
      </section>
    </AppShell>
  );
}

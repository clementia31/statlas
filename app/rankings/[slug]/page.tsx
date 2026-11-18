import Link from 'next/link';
import { notFound } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import Panel from '@/components/ui/Panel';
import SourceNote from '@/components/ui/SourceNote';
import Flag from '@/components/ui/Flag';
import EmptyState from '@/components/ui/EmptyState';
import RankingTable from '@/components/RankingTable';
import YearSelect from '@/components/controls/YearSelect';
import { getAggregates, getIndicatorMeta, getSourceLicence, getIndicatorYears, getYearValues, isCityIndicator, pickYear, rankValues } from '@/lib/data';
import { formatValue, shortSource } from '@/lib/format';

// Lectures gardées une heure (voir lib/supabase.ts) : un robot qui repasse sur la page ne sollicite plus la base.
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const meta = await getIndicatorMeta(params.slug);
  if (!meta) return { title: 'Ranking not found | Statlas' };
  return {
    title: `${meta.name} — world ranking ${meta.ref_year} | Statlas`,
    description: `${meta.ref_coverage} countries ranked by ${meta.name} in ${meta.ref_year}. Source: ${meta.source_name}.`,
    // Une seule adresse de référence par classement, quelle que soit l'année choisie dans la page
    alternates: { canonical: `/rankings/${meta.slug}` },
  };
}

export default async function RankingPage({ params, searchParams }: { params: { slug: string }; searchParams: { year?: string } }) {
  const meta = await getIndicatorMeta(params.slug);
  if (!meta || meta.ref_year === null) notFound();

  const years = await getIndicatorYears(meta.slug);
  const year = pickYear(years, searchParams.year, meta.ref_year) ?? meta.ref_year;
  const [rows, aggregates] = await Promise.all([getYearValues(meta.slug, year), getAggregates(meta.slug, year)]);
  const ranked = rankValues(rows, meta.higher_is_better);
  const leader = ranked[0];
  const city = isCityIndicator(meta.slug);
  const direction = meta.higher_is_better === null ? 'Sorted from highest to lowest' : meta.higher_is_better ? 'Higher is better' : 'Lower is better';

  // Étiquette « jeu de données » (schema.org/Dataset) : invisible pour le visiteur, lue par Google Dataset Search et les assistants.
  // Rien d'inventé : la licence n'est indiquée que si elle figure dans le registre des sources.
  const lic = await getSourceLicence(meta.source_name);
  const dataset = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${meta.name} — world ranking`,
    description: meta.definition ?? `${meta.name}, by country.`,
    url: `https://www.statlasresearch.com/rankings/${meta.slug}`,
    isAccessibleForFree: true,
    variableMeasured: meta.name,
    ...(meta.first_year && meta.last_year ? { temporalCoverage: `${meta.first_year}/${meta.last_year}` } : {}),
    spatialCoverage: 'World',
    ...(meta.source_name ? { creator: { '@type': 'Organization', name: meta.source_name, ...(meta.source_url ? { url: meta.source_url } : {}) } } : {}),
    ...(meta.dataset_title ? { isBasedOn: meta.dataset_title } : {}),
    ...(lic?.licence_url ? { license: lic.licence_url } : {}),
    publisher: { '@type': 'Organization', name: 'Statlas', url: 'https://www.statlasresearch.com' },
    distribution: [{ '@type': 'DataDownload', encodingFormat: 'text/csv', contentUrl: `https://www.statlasresearch.com/api/export/${meta.slug}` }],
  };

  return (
    <AppShell active="Rankings">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dataset).replace(/</g, '\\u003c') }} />
      <Link href="/rankings" className="inline-flex h-11 items-center text-[15px] text-textMuted hover:text-accent">
        ← All rankings
      </Link>
      <div className="mt-3">
        <PageHeader
          kicker={meta.category ?? 'Ranking'}
          title={`${meta.name}`}
          description={meta.definition ?? undefined}
          actions={<YearSelect years={years} value={year} refYear={meta.ref_year} />}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl border border-accent/50 bg-panel p-4">
          <div className="text-[12px] text-textMuted">{meta.higher_is_better === false ? 'Lowest' : 'Highest'} · {year}</div>
          {leader ? (
            <Link href={city ? '#' : `/countries/${leader.entity_slug}`} className="mt-1 flex items-center gap-2 text-text hover:text-accent">
              <Flag iso={leader.iso_code} size="md" />
              <span className="font-serif text-[18px]">{leader.entity_name}</span>
            </Link>
          ) : (
            <div className="text-textMuted">—</div>
          )}
          <div className="font-mono text-[16px] text-text mt-1">{leader ? formatValue(leader.value, meta.unit) : ''}</div>
        </div>
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="text-[12px] text-textMuted">Coverage · {year}</div>
          <div className="font-mono text-[22px] text-text mt-1">{rows.length}</div>
          <div className="text-[12px] text-textMuted">{city ? 'cities' : 'countries'}</div>
        </div>
        <div className="rounded-xl border border-border bg-panel p-4">
          <div className="text-[12px] text-textMuted">Method</div>
          <div className="text-[14px] text-text mt-1">{direction}</div>
          {meta.higher_is_better !== null && <div className="text-[12px] text-textMuted mt-1">Score: 0 = worst, 100 = best in {year}</div>}
        </div>
      </div>

      {aggregates.length > 0 && (
        <section aria-label="World and regions" className="mb-6 rounded-xl border border-border bg-panel p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="font-serif text-[18px] font-semibold">World and regions · {year}</h2>
            <p className="text-[12px] text-textMuted">Aggregates published by the {shortSource(meta.source_name)}, not computed by Statlas. Not part of the ranking.</p>
          </div>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
            {aggregates.map((a) => (
              <div key={a.slug} className={`flex min-w-0 items-baseline justify-between gap-3 border-b border-border py-1.5 ${a.kind === 'world' ? 'font-semibold' : ''}`}>
                <dt className="min-w-0 truncate text-[13.5px]" title={a.name}>{a.name}</dt>
                <dd className="shrink-0 font-mono text-[13.5px]">{formatValue(a.value, meta.unit)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <Panel
        title={`Ranking ${year}`}
        right={
          <a href={`/api/export/${meta.slug}`} className="inline-flex h-11 items-center rounded-lg border border-borderStrong bg-panel px-4 text-[14px] font-medium text-text hover:border-accent">
            Download CSV
          </a>
        }
      >
        {ranked.length ? <RankingTable rows={ranked} unit={meta.unit} showScore={meta.higher_is_better !== null} linkable={!city} /> : <EmptyState title="No data for this year" />}
        <div className="mt-4">
          <SourceNote meta={meta} year={year} count={rows.length} />
        </div>
      </Panel>
    </AppShell>
  );
}

import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { ArticleList, CompactMasthead, GazettePage, Kicker, Ornament, SectionLabel, typeLabel } from '@/components/gazette/Gazette';
import { getArticleBySlug } from '@/lib/supabase';
import { getDomainBySlug, getArticlesByDomain, getDisciplines, getRelatedForArticle } from '@/lib/gazette';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function GazetteSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const domain = await getDomainBySlug(params.slug);

  if (domain) {
    const [articles, disciplines] = await Promise.all([
      getArticlesByDomain(domain.slug),
      getDisciplines(),
    ]);

    return (
      <AppShell active="The Gazette" paper>
        <GazettePage>
          <CompactMasthead section="Section" />
          <div className="mx-auto max-w-[760px] pt-10 text-center">
            <Kicker>Section</Kicker>
            <h1 className="mt-2 font-headline text-[44px] sm:text-[60px] font-extrabold leading-none">{domain.name}</h1>
            {domain.tagline && <p className="mt-3 font-headline italic text-[20px] text-inkSoft">{domain.tagline}</p>}
            {domain.description && <p className="mx-auto mt-3 max-w-[560px] font-serif text-[16px] leading-relaxed text-inkSoft">{domain.description}</p>}
          </div>
          <div className="mx-auto mt-10 max-w-[760px]">
            <div className="pb-2">
              <SectionLabel>
                {articles.length} {articles.length === 1 ? 'article' : 'articles'}
              </SectionLabel>
            </div>
            {articles.length > 0 ? (
              <ArticleList articles={articles} />
            ) : (
              <p className="border-t border-ink pt-4 font-serif italic text-inkMuted">No articles published in this section yet.</p>
            )}
            {disciplines.length > 0 && (
              <div className="mt-10 border-y border-ink py-5 text-center">
                <SectionLabel>Index of quantitative disciplines</SectionLabel>
                <p className="mt-3 font-serif italic text-[15px] leading-[1.9] text-inkSoft">{disciplines.map((d) => d.name).join(' · ')}</p>
              </div>
            )}
            <Link href="/gazette" className="mt-6 inline-flex h-11 items-center font-sans text-[13px] uppercase tracking-[0.1em] hover:text-press">
              ← Back to the front page
            </Link>
          </div>
        </GazettePage>
      </AppShell>
    );
  }

  const article = await getArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  const source = article.source;
  const doc = article.doc;
  const { countries, indicators } = await getRelatedForArticle(
    article.related_countries,
    article.related_indicators
  );

  const words = (article.body ?? '').split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  const label = 'font-sans text-[11px] font-semibold uppercase tracking-[0.16em]';

  return (
    <AppShell active="The Gazette" paper>
      <GazettePage>
        <CompactMasthead section={[typeLabel(article.article_type), article.domain_slug].filter(Boolean).join(' · ')} />

        <article className="mx-auto max-w-[720px] pt-10">
          <header className="text-center">
            <Kicker>
              {typeLabel(article.article_type)}
              {article.domain_slug && (
                <>
                  {' · '}
                  <Link href={`/gazette/${article.domain_slug}`} className="hover:underline">
                    {article.domain_slug}
                  </Link>
                </>
              )}
            </Kicker>
            <h1 className="mt-3 font-headline text-[44px] sm:text-[68px] font-extrabold leading-none tracking-[-0.01em]">{article.title}</h1>
            {article.subtitle && <p className="mt-4 font-headline italic text-[21px] sm:text-[26px] leading-snug text-inkSoft">{article.subtitle}</p>}
            <div className="mt-6 border-y border-ink py-2.5 font-sans text-[12px] uppercase tracking-[0.1em] text-inkSoft">
              By {article.author_name ?? 'Statlas Editorial'} · {minutes} min read
            </div>
          </header>

          <div className="mt-8 font-serif text-[18px] sm:text-[19px] leading-[1.7] whitespace-pre-line first-letter:float-left first-letter:font-headline first-letter:font-extrabold first-letter:text-[76px] sm:first-letter:text-[84px] first-letter:leading-[0.8] first-letter:pr-2.5 first-letter:pt-2">
            {article.body}
          </div>

          {article.key_findings && article.key_findings.length > 0 && (
            <section className="mt-10 border-t border-ink pt-4">
              <div className={label}>Key findings</div>
              <ol className="mt-3">
                {article.key_findings.map((f: string, i: number) => (
                  <li key={i} className="flex gap-4 border-b border-rule py-3 font-serif text-[17px] leading-relaxed">
                    <span className="shrink-0 font-mono text-[14px] text-press">{String(i + 1).padStart(2, '0')}</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {article.data_scope && (
            <section className="mt-10 border-t border-ink pt-4">
              <div className={label}>Data scope</div>
              <p className="mt-2 font-serif text-[16px] text-inkSoft">
                {[
                  article.data_scope.countriesCount && `${article.data_scope.countriesCount} countries`,
                  article.data_scope.startYear && article.data_scope.endYear && `${article.data_scope.startYear}–${article.data_scope.endYear}`,
                  article.data_scope.indicatorsCount && `${article.data_scope.indicatorsCount} indicators`,
                  article.data_scope.observationsCount && `${Number(article.data_scope.observationsCount).toLocaleString('en-US')} observations`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              {article.data_scope.sources && <p className="mt-1 font-sans text-[13px] text-inkMuted">Sources: {article.data_scope.sources.join(' · ')}</p>}
            </section>
          )}

          {article.methods && article.methods.length > 0 && (
            <section className="mt-8 border-t border-ink pt-4">
              <div className={label}>Methods</div>
              <p className="mt-2 font-serif text-[16px] text-inkSoft">{article.methods.join(' · ')}</p>
            </section>
          )}

          {article.limitations && article.limitations.length > 0 && (
            <section className="mt-8 border-t border-ink pt-4">
              <div className={label}>Limitations</div>
              {article.limitations.map((l: string, i: number) => (
                <p key={i} className="mt-2 font-serif text-[16px] text-inkSoft">
                  {l}
                </p>
              ))}
            </section>
          )}

          {source && (
            <aside className="mt-10 border-[3px] border-double border-ink bg-paperLight px-5 py-4 sm:px-6">
              <div className={label}>Foundational text</div>
              {doc?.title && <div className="mt-2 font-headline italic text-[22px] sm:text-[24px] leading-snug">{doc.title}</div>}
              <div className="mt-1.5 font-sans text-[14px] text-inkSoft">
                {source.name}
                {doc?.published_at ? (
                  <>
                    {' — '}
                    <span className="font-mono">{doc.published_at.slice(0, 4)}</span>
                  </>
                ) : null}
              </div>
            </aside>
          )}

          {(countries.length > 0 || indicators.length > 0) && (
            <section className="mt-10 border-t-[3px] border-double border-ink pt-4">
              <div className={label}>Explore the data on Statlas</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {indicators.map((i) => (
                  <Link
                    key={i.slug}
                    href={`/indicateurs?indicator=${i.slug}`}
                    className="inline-flex h-11 items-center border border-ink px-3.5 font-sans text-[14px] hover:bg-ink hover:text-paper"
                  >
                    {i.name_default}
                  </Link>
                ))}
                {countries.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/pays/${c.slug}`}
                    className="inline-flex h-11 items-center border border-rule px-3.5 font-sans text-[14px] hover:bg-ink hover:text-paper"
                  >
                    {c.name_default}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <Ornament />
          <Link href="/gazette" className="inline-flex h-11 items-center font-sans text-[13px] uppercase tracking-[0.1em] hover:text-press">
            ← Back to the front page
          </Link>
        </article>
      </GazettePage>
    </AppShell>
  );
}

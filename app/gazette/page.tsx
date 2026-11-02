import Link from 'next/link';
import AppShell from '@/components/AppShell';
import { getDomains, getDisciplines, getFeaturedAndLatest, getActiveChartOfWeek } from '@/lib/gazette';
import { ArticleList, DoubleRule, GazettePage, Kicker, Masthead, Ornament, SectionLabel, typeLabel } from '@/components/gazette/Gazette';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'The Statlas Gazette — A quantitative journal of the world',
  description: 'Essays and references on the quantitative social sciences, backed by sourced data.',
};

function excerpt(body: string | null | undefined, max = 520) {
  if (!body) return '';
  const t = body.replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, t.lastIndexOf(' ', max)) + '…' : t;
}

export default async function GazetteHome() {
  const [domains, disciplines, { featured, latest }, chartOfWeek] = await Promise.all([
    getDomains(),
    getDisciplines(),
    getFeaturedAndLatest(),
    getActiveChartOfWeek(),
  ]);

  const secondary = latest.slice(0, 2);
  const rest = latest.slice(2);
  const lead = excerpt(featured?.body);

  return (
    <AppShell active="The Gazette" paper>
      <GazettePage>
        <Masthead domains={domains} />

        {featured ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:gap-0">
            <article className="lg:pr-8 lg:border-r lg:border-ink">
              <Kicker>
                {typeLabel(featured.article_type)}
                {featured.domain_slug ? ` · ${featured.domain_slug}` : ''}
              </Kicker>
              <h2 className="mt-2.5 font-headline text-[40px] sm:text-[60px] font-extrabold leading-[0.98] tracking-[-0.01em]">
                <Link href={`/gazette/${featured.slug}`} className="hover:text-press">
                  {featured.title}
                </Link>
              </h2>
              {featured.subtitle && (
                <p className="mt-3 font-headline italic text-[20px] sm:text-[24px] leading-snug text-inkSoft">{featured.subtitle}</p>
              )}
              <div className="mt-4 border-y border-ruleStrong py-2 font-sans text-[12px] uppercase tracking-[0.08em] text-inkMuted">
                By {featured.author_name ?? 'Statlas Editorial'}
                {featured.published_at ? ` · ${featured.published_at.slice(0, 4)}` : ''}
              </div>
              {lead && (
                <div className="mt-5 font-serif text-[17px] leading-[1.65] sm:columns-2 sm:gap-7 sm:[column-rule:1px_solid_#CFC5B0]">
                  <p className="first-letter:float-left first-letter:font-headline first-letter:font-extrabold first-letter:text-[64px] first-letter:leading-[0.82] first-letter:pr-2 first-letter:pt-1.5">
                    {lead}
                  </p>
                  <p className="mt-3">
                    <Link
                      href={`/gazette/${featured.slug}`}
                      className="inline-flex h-11 items-center font-sans text-[13px] font-semibold uppercase tracking-[0.06em] text-press hover:underline"
                    >
                      Continue reading →
                    </Link>
                  </p>
                </div>
              )}
            </article>

            <aside className="lg:pl-7">
              {secondary.map((a, i) => (
                <div key={a.slug}>
                  {i > 0 && <Ornament />}
                  <Kicker>
                    {typeLabel(a.article_type)}
                    {a.domain_slug ? ` · ${a.domain_slug}` : ''}
                  </Kicker>
                  <h3 className="mt-2 font-headline text-[26px] sm:text-[30px] font-semibold leading-[1.1]">
                    <Link href={`/gazette/${a.slug}`} className="hover:text-press">
                      {a.title}
                    </Link>
                  </h3>
                  {a.subtitle && <p className="mt-2 font-headline italic text-[17px] text-inkSoft">{a.subtitle}</p>}
                </div>
              ))}

              <div className="mt-8 border-[3px] border-double border-ink bg-paperLight p-4 sm:p-5">
                <div className="text-center">
                  <SectionLabel>Figure of the week</SectionLabel>
                </div>
                {chartOfWeek ? (
                  <div className="mt-3">
                    <div className="font-headline text-[22px] font-semibold leading-snug">{chartOfWeek.title}</div>
                    {chartOfWeek.description && <p className="mt-2 font-serif text-[15px] leading-relaxed text-inkSoft">{chartOfWeek.description}</p>}
                  </div>
                ) : (
                  <p className="mt-3 text-center font-serif italic text-[15px] text-inkMuted">The first figure of the week will appear here.</p>
                )}
              </div>
            </aside>
          </div>
        ) : (
          <p className="mt-10 text-center font-serif italic text-inkMuted">The first edition is being prepared.</p>
        )}

        {rest.length > 0 && (
          <section className="mt-12">
            <DoubleRule />
            <div className="flex items-baseline justify-between pt-3 pb-3">
              <h2 className="font-headline text-[26px] font-extrabold">More from the Gazette</h2>
              <Link href="/gazette/archive" className="inline-flex h-11 items-center font-sans text-[12px] uppercase tracking-[0.12em] hover:text-press">
                Archive →
              </Link>
            </div>
            <ArticleList articles={rest} />
          </section>
        )}

        {disciplines.length > 0 && (
          <section className="mt-12 border-y border-ink py-5 text-center">
            <SectionLabel>Index of quantitative disciplines</SectionLabel>
            <p className="mx-auto mt-3 max-w-[900px] font-serif italic text-[16px] leading-[1.9] text-inkSoft">
              {disciplines.map((d, i) => (
                <span key={d.slug}>
                  {i > 0 && <span className="mx-1.5 not-italic text-ruleStrong">·</span>}
                  {d.name}
                </span>
              ))}
            </p>
          </section>
        )}

        <div className="mt-5 flex justify-center gap-6 font-sans text-[12px] uppercase tracking-[0.12em] text-inkMuted">
          <Link href="/gazette/archive" className="inline-flex h-11 items-center hover:text-press">
            Archive
          </Link>
          <Link href="/gazette/dossiers" className="inline-flex h-11 items-center hover:text-press">
            Dossiers
          </Link>
        </div>
      </GazettePage>
    </AppShell>
  );
}

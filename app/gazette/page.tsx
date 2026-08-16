import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getDomains, getDisciplines, getFeaturedAndLatest } from '@/lib/gazette';

export const dynamic = 'force-dynamic';

export default async function GazettePage() {
  const [domains, disciplines, { featured, latest }] = await Promise.all([
    getDomains(),
    getDisciplines(),
    getFeaturedAndLatest(),
  ]);

  return (
    <div className="flex min-h-screen">
      <Sidebar active="The Gazette" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px] max-w-4xl">
          {/* IDENTITY */}
          <div className="mb-6 pb-6 border-b border-border">
            <div className="text-textMuted text-[11px] font-mono uppercase tracking-wide mb-2">
              The Gazette
            </div>
            <div className="font-serif text-3xl mb-2">A quantitative journal of the world.</div>
            <div className="text-textSecondary text-sm max-w-2xl">
              Data-driven analysis across economics, history, politics, demography, geography, science and society.
            </div>
          </div>

          {/* DOMAIN NAVIGATION */}
          <div className="flex flex-wrap gap-2 mb-8">
            {domains.map((d) => (
              <a
                key={d.slug}
                href={`/gazette/${d.slug}`}
                className="bg-panel border border-border rounded-md px-3 py-1.5 text-xs text-textSecondary hover:text-white hover:border-accent"
              >
                {d.name}
              </a>
            ))}
          </div>

          {/* FEATURED STORY */}
          {featured && (
            <a
              href={`/gazette/${featured.slug}`}
              className="block bg-panel border border-border rounded-[10px] p-6 mb-8 hover:border-accent"
            >
              <div className="text-textMuted text-[10px] font-mono uppercase mb-2">
                {featured.article_type} {featured.domain_slug ? `· ${featured.domain_slug}` : ''}
              </div>
              <div className="font-serif text-2xl mb-2 text-white">{featured.title}</div>
              {featured.subtitle && (
                <div className="text-textSecondary text-base mb-3">{featured.subtitle}</div>
              )}
              <div className="text-textMuted text-xs font-mono">
                {featured.author_name} — {featured.published_at?.slice(0, 10)}
              </div>
            </a>
          )}

          {/* LATEST ANALYSIS */}
          {latest.length > 0 && (
            <div className="mb-10">
              <div className="text-textMuted text-[11px] font-medium uppercase mb-3">Latest Analysis</div>
              <div className="flex flex-col gap-1">
                {latest.map((a) => (
                  <a
                    key={a.slug}
                    href={`/gazette/${a.slug}`}
                    className="flex justify-between items-baseline py-2.5 border-b border-border hover:text-accent group"
                  >
                    <div>
                      <span className="text-textMuted text-[10px] font-mono uppercase mr-2">
                        {a.article_type}
                      </span>
                      <span className="text-sm text-textSecondary group-hover:text-accent">{a.title}</span>
                    </div>
                    <span className="text-textMuted text-[11px] font-mono shrink-0 ml-3">
                      {a.published_at?.slice(0, 10)}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* QUANTITATIVE DISCIPLINES */}
          <div>
            <div className="text-textMuted text-[11px] font-medium uppercase mb-1">Quantitative Disciplines</div>
            <div className="text-textMuted text-xs mb-3">The methods behind the analysis.</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {disciplines.map((d) => (
                <div key={d.slug} className="bg-panel border border-border rounded-md px-3 py-2">
                  <div className="text-sm text-textSecondary">{d.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

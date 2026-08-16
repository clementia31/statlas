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

  const secondary = latest.slice(0, 2);
  const rest = latest.slice(2);

  return (
    <div className="flex min-h-screen">
      <Sidebar active="The Gazette" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[28px] max-w-2xl mx-auto w-full">
          {/* MASTHEAD */}
          <div className="text-center pb-4 mb-6 border-b-2 border-white/20">
            <div className="font-serif text-4xl">The Gazette</div>
            <div className="font-serif italic text-textSecondary text-sm mt-1">
              A quantitative journal of the world
            </div>
          </div>

          {/* DOMAIN NAV — plain text, no pills */}
          <div className="text-center text-[11px] text-textMuted tracking-wide pb-5 mb-6 border-b border-border">
            {domains.map((d, i) => (
              <span key={d.slug}>
                {i > 0 && <span className="mx-2 opacity-50">·</span>}
                <a href={`/gazette/${d.slug}`} className="hover:text-white">{d.name}</a>
              </span>
            ))}
          </div>

          {/* FEATURED STORY — pure typography, no card */}
          {featured && (
            <a href={`/gazette/${featured.slug}`} className="block pb-6 mb-6 border-b border-border group">
              <div className="text-[11px] text-textMuted mb-1.5">
                {featured.article_type}
                {featured.domain_slug ? ` · ${featured.domain_slug}` : ''}
              </div>
              <div className="font-serif text-[26px] font-medium leading-tight mb-2 group-hover:text-accent">
                {featured.title}
              </div>
              {featured.subtitle && (
                <div className="text-textSecondary text-[15px] leading-relaxed mb-2.5">
                  {featured.subtitle}
                </div>
              )}
              <div className="text-textMuted text-[11px] font-mono">
                {featured.author_name} — {featured.published_at?.slice(0, 10)}
              </div>
            </a>
          )}

          {/* SECONDARY STORIES — side by side, typography only */}
          {secondary.length > 0 && (
            <div className="grid grid-cols-2 gap-6 pb-6 mb-6 border-b border-border">
              {secondary.map((a) => (
                <a key={a.slug} href={`/gazette/${a.slug}`} className="group">
                  <div className="text-[10px] text-textMuted mb-1">
                    {a.article_type}
                    {a.domain_slug ? ` · ${a.domain_slug}` : ''}
                  </div>
                  <div className="font-serif text-[17px] font-medium leading-snug group-hover:text-accent">
                    {a.title}
                  </div>
                </a>
              ))}
            </div>
          )}

          {/* LATEST — plain list, hairline dividers */}
          {rest.length > 0 && (
            <div className="mb-8">
              <div className="text-[11px] text-textMuted mb-2">Latest</div>
              {rest.map((a) => (
                <a
                  key={a.slug}
                  href={`/gazette/${a.slug}`}
                  className="flex justify-between items-baseline py-2.5 border-b border-border hover:text-accent"
                >
                  <span className="text-[14px] text-textSecondary">{a.title}</span>
                  <span className="text-textMuted text-[11px] font-mono shrink-0 ml-3">
                    {a.published_at?.slice(0, 10)}
                  </span>
                </a>
              ))}
            </div>
          )}

          {/* QUANTITATIVE DISCIPLINES — plain inline list */}
          <div>
            <div className="text-[11px] text-textMuted mb-1">Quantitative disciplines</div>
            <div className="text-textSecondary text-[13px] leading-loose">
              {disciplines.map((d, i) => (
                <span key={d.slug}>
                  {i > 0 && <span className="mx-1.5 opacity-50">·</span>}
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

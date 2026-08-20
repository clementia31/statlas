import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getAllRankableIndicators } from '@/lib/rankings';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Rankings — Statlas',
  description: 'Every Statlas indicator, ranked across nearly 200 countries with sourced data.',
};

export default async function RankingsPage() {
  const indicators = await getAllRankableIndicators();

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Rankings" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px] max-w-3xl">
          <div className="font-serif text-2xl mb-1">Rankings</div>
          <div className="text-textMuted text-xs mb-6">
            {indicators.length} rankings available — every Statlas indicator, ranked
          </div>

          <div className="bg-panel border border-border rounded-[10px] overflow-hidden">
            {indicators.map((i) => (
              <a
                key={i.slug}
                href={`/rankings/${i.slug}`}
                className="flex justify-between items-center px-4 py-3 border-b border-border last:border-b-0 hover:bg-panel2 hover:text-accent"
              >
                <span className="text-sm text-textSecondary">{i.name_default}</span>
                <span className="text-textMuted text-[11px] font-mono">
                  {i.higher_is_better === false ? 'lower is better' : 'higher is better'}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

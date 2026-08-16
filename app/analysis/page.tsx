import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export const dynamic = 'force-dynamic';

export default function AnalysisPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar active="Analysis" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <div className="font-serif text-3xl mb-1">Analysis</div>
          <div className="text-textMuted text-xs mb-6">
            Interactive tools to explore how historical events shaped the numbers.
          </div>

          <div className="bg-panel border border-border rounded-[10px] p-8 max-w-2xl text-center">
            <div className="text-textMuted text-sm italic">
              Coming in a later phase — this section will let you overlay historical events
              directly on indicator trend charts (e.g. the 2008 crisis on GDP, German
              reunification on population).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

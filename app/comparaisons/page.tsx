import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

export const dynamic = 'force-dynamic';

// NOTE: still a static page (fixed sample data), not yet wired to Supabase.
// Possible next step: connect it to real country/indicator selections.

export default function ComparisonsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar active="Comparisons" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <div className="font-serif text-2xl mb-1">Country comparison</div>
          <div className="text-textMuted text-xs mb-4">
            Preview — page not yet connected to the database (fixed examples)
          </div>

          <div className="bg-panel border border-border rounded-[10px] overflow-hidden max-w-3xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-textMuted text-[11px] border-b border-border">
                  <th className="text-left p-2 font-medium">Country</th>
                  <th className="text-left p-2 font-medium">HDI</th>
                  <th className="text-left p-2 font-medium">Nominal GDP</th>
                  <th className="text-left p-2 font-medium">Population</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-border">
                  <td className="p-2 font-sans font-medium">United States</td>
                  <td className="p-2 text-green">0.938</td>
                  <td className="p-2">27.4 t$</td>
                  <td className="p-2">339 M</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-2 font-sans font-medium">Germany</td>
                  <td className="p-2">0.950</td>
                  <td className="p-2">4.7 t$</td>
                  <td className="p-2">83 M</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-2 font-sans font-medium">France</td>
                  <td className="p-2">0.910</td>
                  <td className="p-2">3.1 t$</td>
                  <td className="p-2">68 M</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans font-medium">India</td>
                  <td className="p-2 text-red">0.644</td>
                  <td className="p-2">3.9 t$</td>
                  <td className="p-2">1.42 bn</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

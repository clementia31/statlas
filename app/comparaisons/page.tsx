import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';

// NOTE : page encore statique (exemples fixes), pas branchée sur Supabase.
// Prochaine étape possible : la connecter à de vraies sélections pays/indicateurs.

export default function ComparaisonsPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar active="Comparaisons" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <div className="font-serif text-2xl mb-1">Comparaison de pays</div>
          <div className="text-textMuted text-xs mb-4">
            Aperçu — page pas encore connectée à la base (exemples fixes)
          </div>

          <div className="bg-panel border border-border rounded-[10px] overflow-hidden max-w-3xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-textMuted text-[11px] border-b border-border">
                  <th className="text-left p-2 font-medium">Pays</th>
                  <th className="text-left p-2 font-medium">IDH</th>
                  <th className="text-left p-2 font-medium">PIB nominal</th>
                  <th className="text-left p-2 font-medium">Population</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-border">
                  <td className="p-2 font-sans font-medium">États-Unis</td>
                  <td className="p-2 text-green">0.938</td>
                  <td className="p-2">27.4 t$</td>
                  <td className="p-2">339 M</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="p-2 font-sans font-medium">Allemagne</td>
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
                  <td className="p-2 font-sans font-medium">Inde</td>
                  <td className="p-2 text-red">0.644</td>
                  <td className="p-2">3.9 t$</td>
                  <td className="p-2">1.42 md</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import { getAllCountries } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function CountriesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const countries = await getAllCountries();
  const query = (searchParams.q ?? '').toLowerCase().trim();
  const filtered = countries.filter((c) => c.name_default.toLowerCase().includes(query));

  return (
    <div className="flex min-h-screen">
      <Sidebar active="Countries" />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />

        <div className="p-[22px]">
          <div className="font-serif text-2xl mb-1">Countries</div>
          <div className="text-textMuted text-xs mb-4">
            {filtered.length} countries — click one to see its full profile
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-w-4xl">
            {filtered.map((c) => (
              <a
                key={c.id}
                href={`/pays/${c.slug}`}
                className="bg-panel border border-border rounded-lg px-3 py-2.5 text-sm text-textSecondary hover:text-white hover:border-accent"
              >
                {c.name_default}
              </a>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-textMuted text-sm mt-6">No country matches your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}

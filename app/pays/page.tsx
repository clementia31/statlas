import AppShell from '@/components/AppShell';
import PageHeader from '@/components/ui/PageHeader';
import CountryDirectory from '@/components/CountryDirectory';
import { getCountries } from '@/lib/data';
import { regionOf } from '@/lib/iso';

export const dynamic = 'force-dynamic';

export default async function CountriesPage() {
  const countries = await getCountries();
  return (
    <AppShell active="Countries">
      <PageHeader
        kicker="Countries"
        title="Country profiles"
        description={`${countries.length} countries and territories. Each profile gathers every indicator available, its year, its source and the country's world rank.`}
      />
      <CountryDirectory countries={countries.map((c) => ({ slug: c.slug, name: c.name, iso: c.iso, region: regionOf(c.iso) }))} />
    </AppShell>
  );
}

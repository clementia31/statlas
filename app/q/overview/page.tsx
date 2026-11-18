import View, { metadata } from '@/app/view';

// Variante avec paramètres de / : calculée à la demande. Atteinte uniquement par réécriture interne.
export { metadata };
export const dynamic = 'force-dynamic';

export default function Page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <View searchParams={searchParams} />;
}

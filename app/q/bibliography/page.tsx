import View, { metadata } from '@/app/bibliography/view';

// Variante avec paramètres de /bibliography : calculée à la demande. Atteinte uniquement par réécriture interne.
export { metadata };
export const dynamic = 'force-dynamic';

export default function Page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <View searchParams={searchParams} />;
}

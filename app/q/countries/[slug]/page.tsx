import View, { generateMetadata } from '@/app/countries/[slug]/view';

// Variante avec paramètres de /countries/:slug : calculée à la demande. Atteinte uniquement par réécriture interne.
export { generateMetadata };
export const dynamic = 'force-dynamic';

export default function Page({ params, searchParams }: { params: { slug: string }; searchParams: Record<string, string | undefined> }) {
  return <View params={params} searchParams={searchParams} />;
}

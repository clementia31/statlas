import View, { generateMetadata } from './view';

// Page préparée à l'avance et gardée une heure : elle ne coûte presque rien à servir, même à un robot.
// Les variantes avec paramètres (?…) passent par la page jumelle sous /q (voir next.config.mjs).
export { generateMetadata };
export const revalidate = 3600;
export function generateStaticParams() {
  return [];
}

export default function Page({ params }: { params: { slug: string } }) {
  return <View params={params} searchParams={{}} />;
}

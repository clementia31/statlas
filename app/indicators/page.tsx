import View, { metadata } from './view';

// Page préparée à l'avance et gardée une heure : elle ne coûte presque rien à servir, même à un robot.
// Les variantes avec paramètres (?…) passent par la page jumelle sous /q (voir next.config.mjs).
export { metadata };
export const revalidate = 3600;

export default function Page() {
  return <View searchParams={{}} />;
}

import type { Metadata } from 'next';
import { getAllItems } from '@/lib/sheets';
import PanierView from './PanierView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Panier',
  description: 'Votre panier Keur Bally',
  robots: { index: false, follow: false },
};

export default async function PanierPage() {
  // On passe la liste complète pour pouvoir détecter les items devenus
  // indisponibles depuis l'ajout au panier (refresh ISR).
  const all = await getAllItems();
  const availability = Object.fromEntries(
    all.map((i) => [i.id, i.disponible] as const),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 pb-40">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold text-kb-ink">
        Mon panier
      </h1>
      <PanierView availability={availability} />
    </div>
  );
}

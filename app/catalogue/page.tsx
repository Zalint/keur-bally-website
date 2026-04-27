import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getAvailableItems, getCategories } from '@/lib/items';
import CatalogueView from './CatalogueView';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Catalogue',
  description:
    'Tous nos produits et packs : épicerie, viande, boissons, snacks. Livraison à Dakar.',
};

export default async function CataloguePage() {
  const [items, categories] = await Promise.all([
    getAvailableItems(),
    getCategories(),
  ]);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-kb-ink">
          Le catalogue
        </h1>
        <p className="mt-2 text-kb-olive text-sm">
          Tous nos produits et packs disponibles cette semaine.
        </p>
        <div className="mt-6">
          <Suspense fallback={null}>
            <CatalogueView items={items} categories={categories} />
          </Suspense>
        </div>
      </div>
      <WhatsAppFloatingButton />
    </>
  );
}

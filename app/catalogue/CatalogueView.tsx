'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CatalogueItem } from '@/lib/types';
import ItemGrid from '@/components/ItemGrid';
import TypeFilter from '@/components/TypeFilter';
import CategoryFilter from '@/components/CategoryFilter';

type TypeValue = 'tous' | 'viande' | 'produit' | 'pack';
const VIANDE_CAT = 'Viande fraîche';
const PACK_CAT = 'Pack';

export default function CatalogueView({
  items,
  categories,
}: {
  items: CatalogueItem[];
  categories: string[];
}) {
  const params = useSearchParams();
  const initialCat = params.get('cat');
  const [type, setType] = useState<TypeValue>('tous');
  const [cat, setCat] = useState<string | null>(initialCat);

  useEffect(() => {
    setCat(initialCat);
  }, [initialCat]);

  // Quand on change l'onglet, on remet la catégorie à zéro pour
  // éviter qu'une catégorie incohérente reste sélectionnée.
  const onChangeType = (t: TypeValue) => {
    setType(t);
    setCat(null);
  };

  // Catégories à proposer selon l'onglet :
  // - Boucherie / Packs : pas de barre (un seul groupe)
  // - Produits : on exclut "Viande fraîche" et "Pack"
  // - Tous : toutes
  const visibleCategories = useMemo(() => {
    if (type === 'viande' || type === 'pack') return [];
    if (type === 'produit') {
      return categories.filter((c) => c !== VIANDE_CAT && c !== PACK_CAT);
    }
    return categories;
  }, [categories, type]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (type === 'viande' && i.categorie !== VIANDE_CAT) return false;
      if (
        type === 'produit' &&
        (i.type !== 'produit' || i.categorie === VIANDE_CAT)
      )
        return false;
      if (type === 'pack' && i.type !== 'pack') return false;
      if (cat && i.categorie !== cat) return false;
      return true;
    });
  }, [items, type, cat]);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <TypeFilter value={type} onChange={onChangeType} />
        {visibleCategories.length > 0 && (
          <CategoryFilter
            categories={visibleCategories}
            value={cat}
            onChange={setCat}
          />
        )}
      </div>
      <ItemGrid items={filtered} />
    </div>
  );
}

'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CatalogueItem } from '@/lib/types';
import ItemGrid from '@/components/ItemGrid';
import TypeFilter from '@/components/TypeFilter';
import CategoryFilter from '@/components/CategoryFilter';

type TypeValue = 'tous' | 'viande' | 'produit' | 'pack';
const VIANDE_CAT = 'Viande fraîche';

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

  const filtered = useMemo(() => {
    return items.filter((i) => {
      if (type === 'viande' && i.categorie !== VIANDE_CAT) return false;
      if (type === 'produit' && (i.type !== 'produit' || i.categorie === VIANDE_CAT)) return false;
      if (type === 'pack' && i.type !== 'pack') return false;
      if (cat && i.categorie !== cat) return false;
      return true;
    });
  }, [items, type, cat]);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-6">
        <TypeFilter value={type} onChange={setType} />
        <CategoryFilter categories={categories} value={cat} onChange={setCat} />
      </div>
      <ItemGrid items={filtered} />
    </div>
  );
}

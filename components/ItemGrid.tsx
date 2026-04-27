import type { CatalogueItem } from '@/lib/types';
import ProductCard from './ProductCard';
import PackCard from './PackCard';

export default function ItemGrid({ items }: { items: CatalogueItem[] }) {
  if (items.length === 0) {
    return (
      <div className="py-16 text-center text-kb-olive">
        <p className="font-serif text-2xl text-kb-ink mb-1">Aucun article</p>
        <p className="text-sm">Essayez un autre filtre.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((item) =>
        item.type === 'pack' ? (
          <PackCard key={item.id} item={item} preview={3} />
        ) : (
          <ProductCard key={item.id} item={item} />
        ),
      )}
    </div>
  );
}

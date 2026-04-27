import Image from 'next/image';
import Link from 'next/link';
import type { CatalogueItem } from '@/lib/types';
import { formatFcfa } from '@/lib/cart';

export default function ProductCard({ item }: { item: CatalogueItem }) {
  return (
    <Link
      href={`/article/${item.slug}`}
      className="group flex flex-col bg-white rounded-card border border-cream-border shadow-card hover:shadow-pack hover:-translate-y-0.5 transition-all"
    >
      <div className="relative aspect-square overflow-hidden rounded-t-card bg-cream-dark/30">
        <Image
          src={item.image_url}
          alt={item.nom}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-[1.02] transition-transform"
        />
        {item.livraison_gratuite && (
          <span className="absolute top-2 left-2 bg-kb-green text-cream text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full">
            Livraison gratuite
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-kb-ink leading-snug line-clamp-2 min-h-[2.6em]">
          {item.nom}
        </h3>
        <span className="text-[11px] uppercase tracking-wider text-kb-olive">
          {item.categorie}
        </span>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="font-serif text-lg font-bold text-kb-green tnum">
            {formatFcfa(item.prix_fcfa)}
          </span>
          <span className="text-xs text-kb-olive">/ {item.unite}</span>
        </div>
      </div>
    </Link>
  );
}

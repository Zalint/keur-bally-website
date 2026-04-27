import Image from 'next/image';
import Link from 'next/link';
import type { CatalogueItem } from '@/lib/types';
import { formatFcfa } from '@/lib/cart';

export default function PackCard({
  item,
  preview = 0,
}: {
  item: CatalogueItem;
  preview?: number;
}) {
  const previewLines = preview > 0 ? item.composition.slice(0, preview) : [];
  return (
    <Link
      href={`/article/${item.slug}`}
      className="group relative flex flex-col bg-white rounded-card border-2 border-kb-green/15 shadow-pack hover:shadow-[0_12px_36px_rgba(27,94,32,0.18)] hover:-translate-y-0.5 transition-all overflow-hidden"
    >
      {/* Bandeau bordeaux */}
      <div className="h-2 bg-kb-bordeaux" aria-hidden />

      <div className="relative aspect-[4/5] bg-cream-dark/40">
        <Image
          src={item.image_url}
          alt={item.nom}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-[1.02] transition-transform"
        />
        <span className="absolute top-3 left-3 bg-kb-gold text-white text-[10px] font-bold uppercase tracking-[0.18em] px-2.5 py-1 rounded-sm shadow">
          Pack
        </span>
        {item.livraison_gratuite && (
          <span className="absolute bottom-3 right-3 bg-cream text-kb-green text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border border-kb-green/20">
            Livraison gratuite
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-serif italic text-xl font-semibold text-kb-ink leading-tight">
          {item.nom}
        </h3>
        {previewLines.length > 0 && (
          <ul className="text-xs text-kb-olive space-y-0.5 list-disc pl-4">
            {previewLines.map((l, i) => (
              <li key={i} className="line-clamp-1">
                {l.replace(/\(ou équivalent\)/i, '').trim()}
              </li>
            ))}
            {item.composition.length > previewLines.length && (
              <li className="list-none italic text-kb-olive/80">
                + {item.composition.length - previewLines.length} autres produits
              </li>
            )}
          </ul>
        )}
        <div className="mt-2 flex items-baseline justify-between">
          <span className="font-serif text-2xl font-bold text-kb-green tnum">
            {formatFcfa(item.prix_fcfa)}
          </span>
          <span className="text-xs uppercase tracking-wider text-kb-bordeaux font-semibold">
            Voir le pack →
          </span>
        </div>
      </div>
    </Link>
  );
}

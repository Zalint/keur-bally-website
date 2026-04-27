import Image from 'next/image';
import Link from 'next/link';
import type { CatalogueItem } from '@/lib/types';
import { formatFcfa } from '@/lib/cart';

export default function ViandeSection({ items }: { items: CatalogueItem[] }) {
  if (items.length === 0) return null;
  const featured = items.slice(0, 4);

  return (
    <section className="relative bg-kb-bordeaux text-cream overflow-hidden">
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 80% 20%, #FAF6E9 0%, transparent 50%)',
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-8 md:grid-cols-[1fr,1.4fr] items-end">
          <div>
            <span className="inline-block text-xs uppercase tracking-[0.25em] text-kb-gold font-semibold mb-3">
              Origine locale
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-[1.1]">
              Viande fraîche,{' '}
              <em className="not-italic font-serif italic text-kb-gold">
                100% locale.
              </em>
            </h2>
            <p className="mt-4 text-cream/85 leading-relaxed max-w-md">
              Bœuf, poulet et abats issus d&apos;élevages locaux. Découpe le
              jour même, pesée précise, livraison rapide à Dakar.
            </p>
            <Link
              href="/catalogue?cat=Viande%20fra%C3%AEche"
              className="inline-flex mt-6 h-11 items-center px-5 bg-cream text-kb-bordeaux font-semibold rounded-card hover:bg-cream-dark"
            >
              Voir nos viandes
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featured.map((item) => (
              <Link
                key={item.id}
                href={`/article/${item.slug}`}
                className="group bg-cream text-kb-ink rounded-card overflow-hidden hover:shadow-pack transition-shadow"
              >
                <div className="relative aspect-square bg-cream-dark/30">
                  <Image
                    src={item.image_url}
                    alt={item.nom}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-[1.03] transition-transform"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold leading-snug line-clamp-1">
                    {item.nom}
                  </h3>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-serif text-base font-bold text-kb-green tnum">
                      {formatFcfa(item.prix_fcfa)}
                    </span>
                    <span className="text-[11px] text-kb-olive">/ {item.unite}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

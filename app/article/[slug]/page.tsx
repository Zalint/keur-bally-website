import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllItems, getItemBySlug } from '@/lib/sheets';
import { formatFcfa } from '@/lib/cart';
import AddToCartButton from '@/components/AddToCartButton';
import PackComposition from '@/components/PackComposition';
import SubstitutionNotice from '@/components/SubstitutionNotice';
import ProductCard from '@/components/ProductCard';
import PackCard from '@/components/PackCard';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';

export const revalidate = 3600;

export async function generateStaticParams() {
  const items = await getAllItems();
  return items.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const item = await getItemBySlug(params.slug);
  if (!item) return { title: 'Article introuvable' };
  return {
    title: item.nom,
    description: item.description.slice(0, 160) || `${item.nom} — ${formatFcfa(item.prix_fcfa)}`,
    openGraph: {
      title: item.nom,
      description: item.description.slice(0, 160),
      images: item.image_url ? [item.image_url] : [],
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const item = await getItemBySlug(params.slug);
  if (!item) notFound();

  const all = await getAllItems();
  const related = all
    .filter(
      (i) =>
        i.disponible &&
        i.id !== item.id &&
        (item.type === 'pack' ? i.type === 'pack' : i.categorie === item.categorie),
    )
    .slice(0, item.type === 'pack' ? 2 : 3);

  const images = [item.image_url, item.image_url_2, item.image_url_3].filter(
    Boolean,
  ) as string[];

  // JSON-LD Product
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.nom,
    description: item.description,
    image: images,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'XOF',
      price: item.prix_fcfa,
      availability: item.disponible
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <div className="mx-auto max-w-6xl px-4 py-8 pb-32 md:pb-8">
        <Link
          href={item.type === 'pack' ? '/packs' : '/catalogue'}
          className="text-sm text-kb-olive hover:text-kb-bordeaux"
        >
          ← {item.type === 'pack' ? 'Tous les packs' : 'Catalogue'}
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {/* Galerie */}
          <div>
            <div className="relative aspect-square rounded-card overflow-hidden bg-cream-dark/30">
              <Image
                src={images[0]}
                alt={item.nom}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
              {item.type === 'pack' && (
                <span className="absolute top-4 left-4 bg-kb-gold text-white text-xs font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm shadow">
                  Pack
                </span>
              )}
              {!item.disponible && (
                <span className="absolute top-4 right-4 bg-kb-bordeaux text-cream text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                  Indisponible
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {images.slice(1).map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-card overflow-hidden bg-cream-dark/30 border border-cream-border"
                  >
                    <Image src={src} alt={`${item.nom} ${i + 2}`} fill sizes="200px" className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Détails */}
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-kb-bordeaux font-semibold">
              {item.categorie}
            </span>
            <h1
              className={`mt-1 font-serif font-semibold text-kb-ink leading-tight ${
                item.type === 'pack' ? 'text-4xl italic' : 'text-3xl'
              }`}
            >
              {item.nom}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-kb-green tnum">
                {formatFcfa(item.prix_fcfa)}
              </span>
              <span className="text-sm text-kb-olive">/ {item.unite}</span>
            </div>

            {item.livraison_gratuite && (
              <div className="mt-3 inline-flex items-center gap-2 bg-kb-green-soft text-kb-green text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-kb-green" aria-hidden />
                Livraison gratuite
              </div>
            )}

            {item.description && (
              <p className="mt-5 text-kb-ink/85 leading-relaxed">{item.description}</p>
            )}

            {item.type === 'pack' && (
              <div className="mt-6">
                <h2 className="font-serif text-xl text-kb-ink mb-3">Composition</h2>
                <PackComposition lines={item.composition} />
                {item.note && (
                  <div className="mt-4 rounded-card bg-cream-dark/50 border border-cream-border p-4 text-sm italic text-kb-ink/85">
                    {item.note}
                  </div>
                )}
                <div className="mt-5">
                  <SubstitutionNotice />
                </div>
              </div>
            )}

            {/* Ajout panier desktop */}
            <div className="hidden md:block mt-8">
              <AddToCartButton item={item} />
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl text-kb-ink mb-5">
              {item.type === 'pack' ? 'Voir aussi' : 'Vous aimerez aussi'}
            </h2>
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              {related.map((r) =>
                r.type === 'pack' ? (
                  <PackCard key={r.id} item={r} />
                ) : (
                  <ProductCard key={r.id} item={r} />
                ),
              )}
            </div>
          </section>
        )}
      </div>

      {/* CTA sticky mobile */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-cream/95 backdrop-blur border-t border-cream-border p-3 shadow-pack">
        <AddToCartButton item={item} variant="sticky" />
      </div>

      <WhatsAppFloatingButton />
    </>
  );
}

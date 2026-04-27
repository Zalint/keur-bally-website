import Link from 'next/link';
import Hero from '@/components/Hero';
import PackCard from '@/components/PackCard';
import ViandeSection from '@/components/ViandeSection';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';
import { getPacks, getCategories, getAvailableItems } from '@/lib/sheets';

export const revalidate = 3600;

export default async function HomePage() {
  const [packs, categories, items] = await Promise.all([
    getPacks(),
    getCategories(),
    getAvailableItems(),
  ]);
  const featuredPacks = packs.slice(0, 3);
  const viandeItems = items.filter((i) => i.categorie === 'Viande fraîche');

  return (
    <>
      <Hero />

      {/* Section Packs */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-kb-bordeaux font-semibold">
              Notre offre signature
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-kb-ink mt-1">
              Nos packs
            </h2>
          </div>
          <Link
            href="/packs"
            className="hidden sm:inline text-sm font-semibold text-kb-green hover:text-kb-green-dark"
          >
            Voir tous les packs →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPacks.map((p) => (
            <PackCard key={p.id} item={p} preview={3} />
          ))}
        </div>
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/packs"
            className="inline-block text-sm font-semibold text-kb-green"
          >
            Voir tous les packs →
          </Link>
        </div>
      </section>

      {/* Viande fraîche — mise en exergue */}
      <ViandeSection items={viandeItems} />

      {/* Catégories */}
      <section className="bg-cream-dark/40 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-serif text-3xl font-semibold text-kb-ink mb-6">
            Nos rayons
          </h2>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.slice(0, 8).map((c) => (
              <Link
                key={c}
                href={`/catalogue?cat=${encodeURIComponent(c)}`}
                className="bg-white rounded-card p-5 border border-cream-border hover:border-kb-green/40 hover:shadow-card transition-all"
              >
                <span className="font-serif text-lg text-kb-ink">{c}</span>
                <span className="block mt-1 text-xs text-kb-olive">Découvrir →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="font-serif text-3xl font-semibold text-kb-ink mb-8 text-center">
          Comment ça marche
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              n: '1',
              t: 'Choisissez',
              d: 'Parcourez le catalogue et nos packs, ajoutez au panier.',
            },
            {
              n: '2',
              t: 'Commandez sur WhatsApp',
              d: 'Un clic, votre commande s\'envoie avec tous les détails.',
            },
            {
              n: '3',
              t: 'Recevez',
              d: 'On confirme l\'adresse, le créneau, et on vous livre à Dakar.',
            },
          ].map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-kb-green text-cream font-serif text-2xl font-bold flex items-center justify-center mb-4">
                {s.n}
              </div>
              <h3 className="font-serif text-xl text-kb-ink mb-1">{s.t}</h3>
              <p className="text-sm text-kb-olive max-w-xs mx-auto">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pourquoi Keur Bally */}
      <section className="bg-kb-green text-cream py-14">
        <div className="mx-auto max-w-6xl px-4 grid gap-8 md:grid-cols-3 text-center md:text-left">
          {[
            { t: 'Qualité', d: 'Marques de confiance, fraîcheur garantie.' },
            { t: 'Prix justes', d: 'Le bon rapport, sans mauvaises surprises.' },
            { t: 'Livraison rapide', d: 'À Dakar et banlieue, depuis Liberté 5.' },
          ].map((b) => (
            <div key={b.t}>
              <h3 className="font-serif italic text-2xl">{b.t}</h3>
              <p className="mt-1 text-cream/85 text-sm">{b.d}</p>
            </div>
          ))}
        </div>
      </section>

      <WhatsAppFloatingButton />
    </>
  );
}

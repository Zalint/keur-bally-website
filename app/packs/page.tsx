import type { Metadata } from 'next';
import PackCard from '@/components/PackCard';
import WhatsAppFloatingButton from '@/components/WhatsAppFloatingButton';
import { getPacks } from '@/lib/items';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Nos packs',
  description:
    "Packs prêts à l'emploi : Pack Premium, Pack Essentiel. Livraison à Dakar.",
};

export default async function PacksPage() {
  const packs = await getPacks();
  return (
    <>
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-10">
        <span className="text-xs uppercase tracking-[0.2em] text-kb-bordeaux font-semibold">
          Offre signature
        </span>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-kb-ink mt-1">
          Nos packs
        </h1>
        <p className="mt-2 text-kb-olive text-sm max-w-prose">
          Des paniers tout prêts, à prix fixe, pour bien remplir le mois ou
          accueillir vos invités. Composition donnée à titre indicatif —
          substituables si besoin.
        </p>
        <div className="grid gap-5 mt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {packs.map((p) => (
            <PackCard key={p.id} item={p} preview={4} />
          ))}
        </div>
      </div>
      <WhatsAppFloatingButton />
    </>
  );
}

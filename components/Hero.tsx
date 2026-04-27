import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative bg-cream overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #1B5E20 0%, transparent 40%), radial-gradient(circle at 80% 70%, #7B1F2F 0%, transparent 35%)',
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <span className="inline-block text-xs uppercase tracking-[0.2em] text-kb-bordeaux font-semibold mb-4">
            Mini-Market · Liberté 5
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-kb-ink leading-[1.1]">
            Votre épicerie de quartier,{' '}
            <em className="text-kb-green not-italic font-serif italic">livrée à Dakar.</em>
          </h1>
          <p className="mt-5 text-base text-kb-olive leading-relaxed max-w-md">
            Riz, huile, viande fraîche, packs prêts à recevoir. Choisissez,
            commandez sur WhatsApp, on s&apos;occupe du reste.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/packs"
              className="inline-flex h-12 items-center px-6 bg-kb-bordeaux text-cream font-semibold rounded-card hover:bg-kb-bordeaux-dark"
            >
              Voir les packs
            </Link>
            <Link
              href="/catalogue"
              className="inline-flex h-12 items-center px-6 border-2 border-kb-green text-kb-green font-semibold rounded-card hover:bg-kb-green hover:text-cream"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/5] max-w-sm justify-self-center md:justify-self-end">
          <div className="absolute inset-0 bg-kb-green rounded-card -rotate-3" aria-hidden />
          <div className="absolute inset-0 bg-kb-bordeaux rounded-card rotate-2" aria-hidden />
          <div className="relative w-full h-full rounded-card bg-white border-4 border-cream flex items-center justify-center shadow-pack">
            <div className="text-center px-8">
              <span className="block font-serif text-7xl font-bold text-kb-green">
                KB
              </span>
              <span className="block mt-3 font-serif italic text-xl text-kb-bordeaux">
                Keur Bally
              </span>
              <span className="block mt-1 text-xs uppercase tracking-[0.25em] text-kb-olive">
                Mini-Market
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

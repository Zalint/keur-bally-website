import Link from 'next/link';

const NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'Keur Bally';
const LOCATION =
  process.env.NEXT_PUBLIC_BUSINESS_LOCATION ?? 'Rond-point Liberté 5, Dakar';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-cream-border bg-cream-dark/40">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3 text-sm">
        <div>
          <div className="font-serif text-lg font-semibold text-kb-green">{NAME}</div>
          <p className="mt-2 text-kb-olive">{LOCATION}</p>
        </div>

        <nav className="flex flex-col gap-2">
          <span className="font-medium text-kb-ink">Boutique</span>
          <Link href="/catalogue" className="text-kb-olive hover:text-kb-bordeaux">
            Catalogue
          </Link>
          <Link href="/packs" className="text-kb-olive hover:text-kb-bordeaux">
            Nos packs
          </Link>
        </nav>

        <nav className="flex flex-col gap-2">
          <span className="font-medium text-kb-ink">Aide</span>
          <Link href="/comment-commander" className="text-kb-olive hover:text-kb-bordeaux">
            Comment commander
          </Link>
          <Link href="/contact" className="text-kb-olive hover:text-kb-bordeaux">
            Contact
          </Link>
        </nav>
      </div>
      <div className="border-t border-cream-border py-4 text-center text-xs text-kb-olive">
        © {new Date().getFullYear()} {NAME}. Tous droits réservés.
      </div>
    </footer>
  );
}

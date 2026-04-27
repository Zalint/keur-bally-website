import Link from 'next/link';
import Image from 'next/image';
import CartIcon from './CartIcon';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-cream-border">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-keurbally.png"
            alt="Keur Bally"
            width={48}
            height={48}
            priority
            className="h-12 w-auto"
          />
          <span className="font-serif text-xl font-semibold text-kb-green leading-tight">
            Keur Bally
            <span className="block text-[11px] font-sans tracking-wider uppercase text-kb-olive">
              Boucherie · Mini-Market
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <Link href="/catalogue" className="hover:text-kb-bordeaux">
            Catalogue
          </Link>
          <Link href="/packs" className="hover:text-kb-bordeaux">
            Packs
          </Link>
          <Link href="/comment-commander" className="hover:text-kb-bordeaux">
            Commander
          </Link>
          <Link href="/contact" className="hover:text-kb-bordeaux">
            Contact
          </Link>
        </nav>

        <CartIcon />
      </div>
    </header>
  );
}

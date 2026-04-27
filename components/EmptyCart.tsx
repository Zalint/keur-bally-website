import Link from 'next/link';

export default function EmptyCart() {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto w-20 h-20 rounded-full bg-cream-dark flex items-center justify-center mb-6">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-10 h-10 text-kb-green"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4h2l1.7 11.4a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6"
          />
          <circle cx="9" cy="20" r="1.3" />
          <circle cx="17" cy="20" r="1.3" />
        </svg>
      </div>
      <h2 className="font-serif text-2xl text-kb-ink">Votre panier est vide</h2>
      <p className="mt-2 text-sm text-kb-olive">
        Ajoutez des produits ou un pack pour commander.
      </p>
      <Link
        href="/catalogue"
        className="inline-flex mt-6 h-12 items-center px-6 bg-kb-green text-cream font-semibold rounded-card hover:bg-kb-green-dark"
      >
        Voir le catalogue
      </Link>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';

export default function CartIcon() {
  const { totalQuantite, isHydrated } = useCart();
  const showBadge = isHydrated && totalQuantite > 0;

  return (
    <Link
      href="/panier"
      aria-label={`Panier (${totalQuantite} article${totalQuantite > 1 ? 's' : ''})`}
      className="relative inline-flex items-center justify-center w-11 h-11 rounded-full hover:bg-cream-dark transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="w-6 h-6 text-kb-green"
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
      {showBadge && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 rounded-full bg-kb-bordeaux text-cream text-[11px] font-semibold flex items-center justify-center tnum">
          {totalQuantite}
        </span>
      )}
    </Link>
  );
}

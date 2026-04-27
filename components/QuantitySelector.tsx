'use client';

import { stepFor } from '@/lib/cart';

export default function QuantitySelector({
  unite,
  quantite,
  onChange,
  disabled = false,
}: {
  unite: string;
  quantite: number;
  onChange: (q: number) => void;
  disabled?: boolean;
}) {
  const step = stepFor(unite);
  const isKg = unite.toLowerCase() === 'kg';
  const display = isKg && quantite < 1
    ? `${Math.round(quantite * 1000)} g`
    : `${quantite}${isKg ? ' kg' : ''}`;

  return (
    <div className="inline-flex items-stretch rounded-card border border-cream-border bg-white">
      <button
        type="button"
        onClick={() => onChange(+(quantite - step).toFixed(2))}
        disabled={disabled}
        className="w-10 text-xl text-kb-green disabled:text-kb-olive/40"
        aria-label="Diminuer la quantité"
      >
        −
      </button>
      <div className="px-3 self-center min-w-[50px] text-center font-semibold tnum text-sm">
        {display}
      </div>
      <button
        type="button"
        onClick={() => onChange(+(quantite + step).toFixed(2))}
        disabled={disabled}
        className="w-10 text-xl text-kb-green disabled:text-kb-olive/40"
        aria-label="Augmenter la quantité"
      >
        +
      </button>
    </div>
  );
}

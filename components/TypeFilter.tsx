'use client';

type FilterValue = 'tous' | 'produit' | 'pack';

export default function TypeFilter({
  value,
  onChange,
}: {
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  const opts: { v: FilterValue; label: string }[] = [
    { v: 'tous', label: 'Tous' },
    { v: 'produit', label: 'Produits' },
    { v: 'pack', label: 'Packs' },
  ];
  return (
    <div className="inline-flex bg-white border border-cream-border rounded-full p-1 shadow-card">
      {opts.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          className={`px-4 h-9 rounded-full text-sm font-medium transition-colors ${
            value === o.v
              ? 'bg-kb-green text-cream'
              : 'text-kb-olive hover:text-kb-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

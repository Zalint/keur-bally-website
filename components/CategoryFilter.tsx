'use client';

export default function CategoryFilter({
  categories,
  value,
  onChange,
}: {
  categories: string[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="overflow-x-auto scrollbar-none -mx-4 px-4">
      <div className="flex gap-2 w-max">
        <Chip active={value === null} onClick={() => onChange(null)}>
          Toutes
        </Chip>
        {categories.map((c) => (
          <Chip key={c} active={value === c} onClick={() => onChange(c)}>
            {c}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap h-9 px-4 rounded-full text-sm font-medium border transition-colors ${
        active
          ? 'bg-kb-bordeaux text-cream border-kb-bordeaux'
          : 'bg-white text-kb-olive border-cream-border hover:border-kb-green/40 hover:text-kb-ink'
      }`}
    >
      {children}
    </button>
  );
}

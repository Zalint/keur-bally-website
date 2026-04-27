'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function OrdersFilters({
  periodes,
  statuses,
  currentPeriode,
  currentStatus,
  currentQuery,
}: {
  periodes: { key: string; label: string }[];
  statuses: string[];
  currentPeriode: string;
  currentStatus: string;
  currentQuery: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(currentQuery);

  const set = (key: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    router.push(`/admin/commandes?${sp.toString()}`);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    set('q', q);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex bg-white border border-cream-border rounded-full p-1">
        {periodes.map((p) => (
          <button
            key={p.key}
            onClick={() => set('p', p.key)}
            className={`px-3 h-8 rounded-full text-sm ${
              currentPeriode === p.key
                ? 'bg-kb-green text-cream'
                : 'text-kb-olive hover:text-kb-ink'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <select
        value={currentStatus}
        onChange={(e) => set('s', e.target.value)}
        className="h-8 px-2 rounded-full border border-cream-border bg-white text-sm"
      >
        <option value="">Tous les statuts</option>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <form onSubmit={onSearchSubmit} className="flex-1 min-w-[200px]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher (réf, nom, tél)…"
          className="w-full h-8 px-3 rounded-full border border-cream-border bg-white text-sm"
        />
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInAction } from './actions';

function sanitizeCallback(raw: string | null | undefined): string {
  if (!raw) return '/admin';
  // 1) ne garder que des chemins relatifs internes
  // 2) supprimer les éventuels .html injectés par un service worker fantôme
  try {
    const u = raw.startsWith('http')
      ? new URL(raw)
      : new URL(raw, 'http://placeholder');
    let path = u.pathname.replace(/\.html$/, '');
    if (!path.startsWith('/')) path = '/' + path;
    if (!path.startsWith('/admin')) return '/admin';
    return path + (u.search || '');
  } catch {
    return '/admin';
  }
}

export default function LoginForm({
  error: initialError,
  callbackUrl,
}: {
  error?: string;
  callbackUrl?: string;
}) {
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const params = useSearchParams();

  // Désinscrit tout service worker fantôme qui aurait été enregistré par
  // une ancienne version statique de l'app. À mettre côté client uniquement.
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
    }
  }, []);

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const res = await signInAction(formData);
      if (res?.error) {
        setError(res.error);
        return;
      }
      const target = sanitizeCallback(callbackUrl ?? params.get('callbackUrl'));
      router.push(target);
      router.refresh();
    });
  };

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-kb-ink mb-1" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          disabled={pending}
          className="w-full h-11 px-3 rounded-card border border-cream-border focus:border-kb-green focus:outline-none focus:ring-1 focus:ring-kb-green"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-kb-ink mb-1" htmlFor="password">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
          className="w-full h-11 px-3 rounded-card border border-cream-border focus:border-kb-green focus:outline-none focus:ring-1 focus:ring-kb-green"
        />
      </div>

      {error && (
        <p className="text-sm text-kb-bordeaux bg-kb-bordeaux/10 px-3 py-2 rounded-card">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full h-11 bg-kb-green text-cream rounded-card font-semibold hover:bg-kb-green/90 disabled:opacity-50"
      >
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Session } from 'next-auth';
import { signOutAction } from './login/actions';

const navItems = [
  { href: '/admin', label: 'Catalogue', exact: true },
  { href: '/admin/commandes', label: 'Commandes' },
  { href: '/admin/produits/nouveau', label: 'Nouveau produit' },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', ownerOnly: true },
  { href: '/admin/profil', label: 'Mon profil' },
];

export default function AdminShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isOwner = session.user?.role === 'OWNER';

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-kb-green text-cream sticky top-0 z-30 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-serif text-lg font-semibold">
            Keur Bally · Admin
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline opacity-80">
              {session.user?.nom} ({session.user?.role})
            </span>
            <form action={signOutAction}>
              <button className="hover:underline" type="submit">
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl px-4 flex gap-1 overflow-x-auto">
          {navItems
            .filter((item) => !item.ownerOnly || isOwner)
            .map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 ${
                    active
                      ? 'border-cream font-semibold'
                      : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}

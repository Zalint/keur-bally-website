import LoginForm from './LoginForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Connexion admin',
  robots: { index: false },
};

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { error?: string; callbackUrl?: string };
}) {
  console.log('[admin/login] page render', {
    error: searchParams?.error,
    callbackUrl: searchParams?.callbackUrl,
    ts: new Date().toISOString(),
  });
  return (
    <main className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm bg-white rounded-card shadow-card p-8 border border-cream-border">
        <h1 className="font-serif text-2xl font-semibold text-kb-green mb-1">
          Espace admin
        </h1>
        <p className="text-sm text-kb-olive mb-6">Keur Bally — gestion catalogue</p>
        <LoginForm
          error={searchParams?.error}
          callbackUrl={searchParams?.callbackUrl}
        />
      </div>
    </main>
  );
}

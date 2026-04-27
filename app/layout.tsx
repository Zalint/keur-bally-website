import type { Metadata, Viewport } from 'next';
import { Inter, Fraunces } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/contexts/CartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://keurbally.com';
const NAME = process.env.NEXT_PUBLIC_BUSINESS_NAME ?? 'Keur Bally';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${NAME} — Mini-Market à Dakar`,
    template: `%s · ${NAME}`,
  },
  description:
    "Épicerie, produits frais, viande et packs livrés à Dakar. Commandez en quelques clics sur WhatsApp.",
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: NAME,
    title: `${NAME} — Mini-Market à Dakar`,
    description:
      'Épicerie, produits frais, viande et packs livrés à Dakar. Commande WhatsApp.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1B5E20',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

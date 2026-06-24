import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Cormorant_Garamond, Dancing_Script } from 'next/font/google';
import './globals.css';
import { MeadowStateProvider } from '@/context/meadow-state';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dancing = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-dancing',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'The Meadow',
  description: 'A Living Storybook Journey',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${playfair.variable} ${cormorant.variable} ${dancing.variable}`}>
      <body className="h-full">
        <MeadowStateProvider>
          {children}
        </MeadowStateProvider>
      </body>
    </html>
  );
}

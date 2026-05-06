
import './globals.css';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import { Providers } from '@/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Wordstowellness',
  description: 'Therapeutic letters and wellness platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
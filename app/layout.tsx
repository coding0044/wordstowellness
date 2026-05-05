
import './globals.css';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import { Providers } from '@/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Auth System',
  description: 'Complete authentication system with Next.js and MongoDB',
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
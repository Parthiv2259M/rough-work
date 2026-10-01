import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'StayCastle | Luxury Hotel Booking',
  description: 'Find, compare, and book premium hotel stays with maps, pricing, and secure checkout.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-100 text-slate-900 antialiased">
        <Suspense fallback={<div className="sr-only">Loading...</div>}>
          <Header />
        </Suspense>
        <main>{children}</main>
      </body>
    </html>
  );
}

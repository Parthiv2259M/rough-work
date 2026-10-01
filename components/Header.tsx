import Link from 'next/link';
import { MapPin, Sparkles, WalletCards } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/hotels', label: 'Hotels' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/booking', label: 'Booking' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
      <div className="container-shell flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-900">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-cyan-500/30">
            <Sparkles className="h-5 w-5" />
          </span>
          StayCastle
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-brand-600">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-sm font-semibold">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 md:flex">
            <MapPin className="h-4 w-4 text-brand-600" />
            12 destinations
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-white shadow-lg shadow-slate-400/30">
            <WalletCards className="h-4 w-4" />
            Book now
          </button>
        </div>
      </div>
    </header>
  );
}

import Link from 'next/link';
import { ArrowRight, CalendarDays, MapPin, Search, Star } from 'lucide-react';
import SearchBar from '@/components/SearchBar';

export default function HeroSection() {
  return (
    <section className="gradient-hero border-b border-slate-200">
      <div className="container-shell grid gap-10 py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
            <Star className="h-4 w-4 fill-brand-600 text-brand-600" />
            Trusted by 120k travelers worldwide
          </div>

          <h1 className="max-w-xl text-balance text-4xl font-black tracking-tight text-slate-900 md:text-6xl">
            Discover stays that feel like home.
          </h1>

          <p className="mt-5 max-w-lg text-lg text-slate-600">
            Compare boutique hotels, luxury resorts, and city escapes with live pricing, map view, and secure checkout.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/hotels" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-600/30 transition hover:bg-brand-700">
              Explore stays
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/booking" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
              <CalendarDays className="h-4 w-4" />
              Instant booking
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-600" /> 120+ cities</span>
            <span className="inline-flex items-center gap-2"><Search className="h-4 w-4 text-brand-600" /> Smart filters</span>
          </div>
        </div>

        <div className="glass-panel p-4">
          <div className="overflow-hidden rounded-2xl bg-slate-900 p-6 text-white">
            <div className="flex items-center justify-between text-sm text-slate-200">
              <span>Weekend escape</span>
              <span className="rounded-full bg-white/10 px-2 py-1">4.9/5</span>
            </div>
            <div className="mt-8 space-y-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Featured stay</div>
                <div className="mt-3 text-2xl font-bold">Azure Cove Resort</div>
                <div className="mt-2 text-slate-200">Bali, Indonesia</div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-slate-300">From</div>
                  <div className="mt-2 text-2xl font-bold">$189</div>
                </div>
                <div className="rounded-xl bg-white/5 p-3">
                  <div className="text-slate-300">Nights</div>
                  <div className="mt-2 text-2xl font-bold">3</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-shell pb-10">
        <SearchBar />
      </div>
    </section>
  );
}

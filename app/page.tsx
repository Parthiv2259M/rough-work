import Link from 'next/link';
import { ArrowRight, BedDouble, Map, ShieldCheck, Sparkles } from 'lucide-react';
import { featuredHotels } from '@/data/hotels';
import HotelCard from '@/components/HotelCard';
import StatsBar from '@/components/StatsBar';
import HeroSection from '@/components/HeroSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />

      <section className="container-shell py-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Featured stays</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Trending destinations this week</h2>
          </div>
          <Link href="/hotels" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            View all hotels <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </section>

      <section className="container-shell py-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            { icon: BedDouble, title: 'Curated stays', description: 'Designer homes, resorts, and chic city retreats with verified reviews.' },
            { icon: Map, title: 'Map-first search', description: 'Find properties by city, coastline, or nearest attractions in minutes.' },
            { icon: ShieldCheck, title: 'Secure payments', description: 'Trusted checkout experience powered by Stripe-ready architecture.' },
          ].map((feature) => (
            <div key={feature.title} className="glass-panel p-6">
              <div className="mb-5 inline-flex rounded-2xl bg-brand-50 p-3 text-brand-600">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell pb-20">
        <div className="glass-panel p-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Ready to travel?</p>
              <h3 className="mt-2 text-3xl font-black text-slate-900">Start planning your next memorable stay</h3>
            </div>
            <Link href="/booking" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700">
              Book a stay <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

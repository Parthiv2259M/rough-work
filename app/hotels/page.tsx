import Link from 'next/link';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import HotelCard from '@/components/HotelCard';
import { hotels } from '@/data/hotels';

export default function HotelsPage() {
  return (
    <section className="container-shell py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
            <ArrowLeft className="h-4 w-4" /> Back home
          </Link>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-900">Find your perfect hotel</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {['Beachfront', 'City escape', 'Mountain hideaway'].map((label) => (
          <div key={label} className="glass-panel px-4 py-3 text-sm font-medium text-slate-700">
            {label}
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} />
        ))}
      </div>
    </section>
  );
}

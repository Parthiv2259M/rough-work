import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Star, Wifi, CarFront, Coffee, ShieldCheck } from 'lucide-react';
import { hotels } from '@/data/hotels';

export default function HotelCard({ hotel }: { hotel: (typeof hotels)[number] }) {
  return (
    <article className="card-hover glass-panel overflow-hidden">
      <div className="relative h-56 w-full overflow-hidden">
        <Image src={hotel.image} alt={hotel.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{hotel.category}</p>
            <h3 className="mt-2 text-xl font-bold text-slate-900">{hotel.name}</h3>
          </div>
          <div className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
            ★ {hotel.rating}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-brand-600" />
          {hotel.location}
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
          {hotel.amenities.slice(0, 3).map((amenity) => (
            <span key={amenity} className="rounded-full bg-slate-100 px-2 py-1">{amenity}</span>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <div>
            <div className="text-slate-500">From</div>
            <div className="text-2xl font-black text-slate-900">${hotel.price}</div>
          </div>
          <Link href={`/hotel/${hotel.id}`} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
            View deal
          </Link>
        </div>
      </div>
    </article>
  );
}

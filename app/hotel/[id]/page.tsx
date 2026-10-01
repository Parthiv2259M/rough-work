import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, BedDouble, Check, MapPin, Star, Wifi, Wine, Waves } from 'lucide-react';
import HotelGallery from '@/components/HotelGallery';
import MapSection from '@/components/MapSection';
import BookingSummary from '@/components/BookingSummary';
import { getHotelById } from '@/lib/hotel';
import { notFound } from 'next/navigation';

export default function HotelDetailPage({ params }: { params: { id: string } }) {
  const hotel = getHotelById(params.id);

  if (!hotel) {
    notFound();
  }

  return (
    <section className="container-shell py-12">
      <Link href="/hotels" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Back to results
      </Link>

      <div className="mt-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-soft">
        <div className="relative h-[420px] w-full">
          <Image src={hotel.image} alt={hotel.name} fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/10 to-slate-900/20" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              {hotel.rating} · {hotel.reviewCount} reviews
            </div>
            <h1 className="text-4xl font-black tracking-tight">{hotel.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-200">
              <MapPin className="h-4 w-4" />
              {hotel.location}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-8">
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-black text-slate-900">Stay overview</h2>
            <p className="mt-4 text-slate-600">{hotel.description}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {hotel.features.map((feature) => (
                <span key={feature} className="rounded-full bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-700">
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-2xl font-black text-slate-900">Amenities</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {hotel.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-slate-700">
                  <Check className="h-4 w-4 text-emerald-600" />
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-2xl font-black text-slate-900">Gallery</h3>
            <div className="mt-6">
              <HotelGallery gallery={hotel.gallery} name={hotel.name} />
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-2xl font-black text-slate-900">Additional perks</h3>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                { icon: BedDouble, label: 'Room comfort' },
                { icon: Wifi, label: 'Fast WiFi' },
                { icon: Waves, label: 'Pool access' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="rounded-2xl bg-slate-50 p-4 text-center">
                  <Icon className="mx-auto h-6 w-6 text-brand-600" />
                  <div className="mt-3 text-sm font-semibold text-slate-700">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <BookingSummary hotelName={hotel.name} price={hotel.price} nights={3} />
          <MapSection latitude={hotel.coordinates.lat} longitude={hotel.coordinates.lng} city={hotel.city} />
        </div>
      </div>
    </section>
  );
}
